import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type EmployeeRole = "admin" | "manager" | "employee";

type UpdateEmployeeBody = {
  fullName?: unknown;
  username?: unknown;
  password?: unknown;
  role?: unknown;
  active?: unknown;
};

const ALLOWED_ROLES: EmployeeRole[] = [
  "admin",
  "manager",
  "employee",
];

const INTERNAL_EMAIL_DOMAIN = "vaulttracker.local";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
      return authorization.response;
    }

    const { id: employeeId } = await context.params;

    if (!employeeId) {
      return NextResponse.json(
        {
          error: "Employee ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      (await request.json()) as UpdateEmployeeBody;

    const adminClient = createAdminClient();

    const {
      data: existingProfile,
      error: profileReadError,
    } = await adminClient
      .from("profiles")
      .select(
        `
          id,
          store_id,
          username,
          full_name,
          role,
          active
        `
      )
      .eq("id", employeeId)
      .eq("store_id", authorization.storeId)
      .single();

    if (profileReadError || !existingProfile) {
      return NextResponse.json(
        {
          error: "Employee was not found.",
        },
        {
          status: 404,
        }
      );
    }

    const nextFullName =
      body.fullName === undefined
        ? existingProfile.full_name ?? ""
        : cleanText(body.fullName);

    const nextUsername =
      body.username === undefined
        ? existingProfile.username ?? ""
        : normalizeUsername(body.username);

    const parsedRole =
      body.role === undefined
        ? (existingProfile.role as EmployeeRole)
        : cleanRole(body.role);

    if (!parsedRole) {
      return NextResponse.json(
        {
          error: "Choose a valid employee role.",
        },
        {
          status: 400,
        }
      );
    }

    const nextRole: EmployeeRole = parsedRole;

    const nextActive =
      body.active === undefined
        ? existingProfile.active
        : cleanBoolean(body.active);

    const password =
      body.password === undefined
        ? ""
        : cleanText(body.password);

    const validationError = validateUpdate({
      fullName: nextFullName,
      username: nextUsername,
      password,
      role: nextRole,
      active: nextActive,
    });

    if (validationError) {
      return NextResponse.json(
        {
          error: validationError,
        },
        {
          status: 400,
        }
      );
    }

    if (
      employeeId === authorization.userId &&
      nextActive === false
    ) {
      return NextResponse.json(
        {
          error: "You cannot disable your own account.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      employeeId === authorization.userId &&
      nextRole !== "admin"
    ) {
      return NextResponse.json(
        {
          error: "You cannot remove your own admin role.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      nextUsername !==
      (existingProfile.username ?? "")
    ) {
      const { data: duplicateUsername } =
        await adminClient
          .from("profiles")
          .select("id")
          .ilike("username", nextUsername)
          .neq("id", employeeId)
          .maybeSingle();

      if (duplicateUsername) {
        return NextResponse.json(
          {
            error: "That username is already in use.",
          },
          {
            status: 409,
          }
        );
      }
    }

    const authUpdates: {
      email?: string;
      password?: string;
      email_confirm?: boolean;
      user_metadata?: {
        full_name: string;
        username: string;
      };
      app_metadata?: {
        vault_tracker_role: EmployeeRole;
      };
      ban_duration?: string;
    } = {
      user_metadata: {
        full_name: nextFullName,
        username: nextUsername,
      },
      app_metadata: {
        vault_tracker_role: nextRole,
      },
      ban_duration: nextActive
        ? "none"
        : "876000h",
    };

    const isInternalUsernameAccount =
      Boolean(existingProfile.username);

    if (
      isInternalUsernameAccount &&
      nextUsername !==
        (existingProfile.username ?? "")
    ) {
      authUpdates.email =
        `${nextUsername}@${INTERNAL_EMAIL_DOMAIN}`;

      authUpdates.email_confirm = true;
    }

    if (password) {
      authUpdates.password = password;
    }

    const {
      data: updatedAuthUser,
      error: authUpdateError,
    } =
      await adminClient.auth.admin.updateUserById(
        employeeId,
        authUpdates
      );

    if (authUpdateError) {
      return NextResponse.json(
        {
          error: authUpdateError.message,
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: updatedProfile,
      error: profileUpdateError,
    } = await adminClient
      .from("profiles")
      .update({
        username: nextUsername,
        full_name: nextFullName,
        role: nextRole,
        active: nextActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", employeeId)
      .eq("store_id", authorization.storeId)
      .select(
        `
          id,
          username,
          full_name,
          role,
          active,
          created_at,
          updated_at
        `
      )
      .single();

    if (profileUpdateError || !updatedProfile) {
      return NextResponse.json(
        {
          error:
            profileUpdateError?.message ??
            "Employee profile could not be updated.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      employee: {
        id: updatedProfile.id,
        username: updatedProfile.username,
        fullName: updatedProfile.full_name,
        role: updatedProfile.role,
        active: updatedProfile.active,
        email:
          updatedAuthUser.user.email ?? "",
        createdAt:
          updatedProfile.created_at,
        updatedAt:
          updatedProfile.updated_at,
        lastSignInAt:
          updatedAuthUser.user.last_sign_in_at ??
          null,
      },
    });
  } catch (error) {
    console.error(
      "PATCH /api/employees/[id] failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update employee.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
      return authorization.response;
    }

    const { id: employeeId } = await context.params;

    if (!employeeId) {
      return NextResponse.json(
        {
          error: "Employee ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (employeeId === authorization.userId) {
      return NextResponse.json(
        {
          error: "You cannot delete your own account.",
        },
        {
          status: 400,
        }
      );
    }

    const adminClient = createAdminClient();

    const {
      data: employeeProfile,
      error: profileError,
    } = await adminClient
      .from("profiles")
      .select("id, store_id, full_name")
      .eq("id", employeeId)
      .eq("store_id", authorization.storeId)
      .single();

    if (profileError || !employeeProfile) {
      return NextResponse.json(
        {
          error: "Employee was not found.",
        },
        {
          status: 404,
        }
      );
    }

    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(
        employeeId
      );

    if (deleteError) {
      return NextResponse.json(
        {
          error: deleteError.message,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
      deletedEmployeeId: employeeId,
    });
  } catch (error) {
    console.error(
      "DELETE /api/employees/[id] failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete employee.",
      },
      {
        status: 500,
      }
    );
  }
}

type AdminAuthorization =
  | {
      ok: true;
      userId: string;
      storeId: string;
    }
  | {
      ok: false;
      response: NextResponse;
    };

async function requireAdmin(): Promise<AdminAuthorization> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "You must be signed in.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("store_id, role, active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Your employee profile was not found.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  if (!profile.active) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Your account is disabled.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  if (profile.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Admin access is required.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  if (!profile.store_id) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Your account is not assigned to a store.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    ok: true,
    userId: user.id,
    storeId: profile.store_id,
  };
}

function validateUpdate({
  fullName,
  username,
  password,
  role,
  active,
}: {
  fullName: string;
  username: string;
  password: string;
  role: EmployeeRole;
  active: boolean | null;
}): string | null {
  if (fullName.length < 2) {
    return "Enter the employee's full name.";
  }

  if (fullName.length > 100) {
    return "The full name is too long.";
  }

  if (
    !/^[a-z0-9._-]{3,30}$/.test(username)
  ) {
    return (
      "Username must be 3–30 characters and can only " +
      "contain lowercase letters, numbers, periods, " +
      "underscores, and hyphens."
    );
  }

  if (
    password &&
    password.length < 8
  ) {
    return "Password must contain at least 8 characters.";
  }

  if (password.length > 72) {
    return "Password cannot exceed 72 characters.";
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return "Choose a valid employee role.";
  }

  if (active === null) {
    return "Active status must be true or false.";
  }

  return null;
}

function cleanText(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeUsername(
  value: unknown
): string {
  return cleanText(value)
    .toLowerCase()
    .replace(/\s+/g, "");
}

function cleanRole(
  value: unknown
): EmployeeRole | null {
  const role =
    cleanText(value) as EmployeeRole;

  return ALLOWED_ROLES.includes(role)
    ? role
    : null;
}

function cleanBoolean(
  value: unknown
): boolean | null {
  return typeof value === "boolean"
    ? value
    : null;
}