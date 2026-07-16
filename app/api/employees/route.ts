import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type EmployeeRole = "admin" | "manager" | "employee";

type CreateEmployeeBody = {
  fullName?: unknown;
  username?: unknown;
  password?: unknown;
  role?: unknown;
};

const ALLOWED_ROLES: EmployeeRole[] = [
  "admin",
  "manager",
  "employee",
];

const INTERNAL_EMAIL_DOMAIN = "vaulttracker.local";

/**
 * GET /api/employees
 *
 * Lists employees for the authenticated admin's store.
 */
export async function GET() {
  try {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
      return authorization.response;
    }

    const adminClient = createAdminClient();

    const { data: profiles, error: profilesError } =
      await adminClient
        .from("profiles")
        .select(
          `
            id,
            store_id,
            username,
            full_name,
            role,
            active,
            created_at,
            updated_at
          `
        )
        .eq("store_id", authorization.storeId)
        .order("full_name", {
          ascending: true,
        });

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    const {
      data: { users },
      error: usersError,
    } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (usersError) {
      throw new Error(usersError.message);
    }

    const usersById = new Map(
      users.map((user) => [user.id, user])
    );

    const employees = (profiles ?? []).map((profile) => {
      const authUser = usersById.get(profile.id);

      return {
        id: profile.id,
        username:
          profile.username ??
          getUsernameFromEmail(authUser?.email ?? ""),
        fullName: profile.full_name ?? "",
        role: profile.role as EmployeeRole,
        active: profile.active,
        email: authUser?.email ?? "",
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        lastSignInAt: authUser?.last_sign_in_at ?? null,
      };
    });

    return NextResponse.json({
      employees,
    });
  } catch (error) {
    console.error("GET /api/employees failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load employees.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST /api/employees
 *
 * Creates an Auth user and assigns that user to the
 * authenticated admin's Broad St Buds store.
 */
export async function POST(request: Request) {
  let createdUserId: string | null = null;

  try {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
      return authorization.response;
    }

    const body =
      (await request.json()) as CreateEmployeeBody;

    const fullName = cleanText(body.fullName);
    const username = normalizeUsername(body.username);
    const password = cleanText(body.password);
    const role = cleanRole(body.role);

    const validationError = validateEmployeeInput({
      fullName,
      username,
      password,
      role,
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

    const adminClient = createAdminClient();

    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        {
          error: "That username is already in use.",
        },
        {
          status: 409,
        }
      );
    }

    const internalEmail =
      `${username}@${INTERNAL_EMAIL_DOMAIN}`;

    const {
      data: createdUserData,
      error: createUserError,
    } = await adminClient.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        username,
      },
      app_metadata: {
        vault_tracker_role: role,
      },
    });

    if (createUserError) {
      if (
        createUserError.message
          .toLowerCase()
          .includes("already")
      ) {
        return NextResponse.json(
          {
            error:
              "That username already has a login account.",
          },
          {
            status: 409,
          }
        );
      }

      throw new Error(createUserError.message);
    }

    if (!createdUserData.user) {
      throw new Error(
        "Supabase did not return the newly created user."
      );
    }

    createdUserId = createdUserData.user.id;

    /*
     * Upsert instead of relying only on the Auth trigger.
     * This also handles the case where the trigger has not
     * finished before this request continues.
     */
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: createdUserId,
          store_id: authorization.storeId,
          username,
          full_name: fullName,
          role,
          active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

    if (profileError) {
      /*
       * Avoid leaving an orphaned Auth account when profile
       * setup fails.
       */
      await adminClient.auth.admin.deleteUser(
        createdUserId
      );

      createdUserId = null;

      if (
        profileError.message
          .toLowerCase()
          .includes("duplicate")
      ) {
        return NextResponse.json(
          {
            error: "That username is already in use.",
          },
          {
            status: 409,
          }
        );
      }

      throw new Error(profileError.message);
    }

    return NextResponse.json(
      {
        employee: {
          id: createdUserId,
          username,
          fullName,
          role,
          active: true,
          email: internalEmail,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/employees failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create employee.",
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

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("store_id, role, active")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Your employee profile was not found.",
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

function validateEmployeeInput({
  fullName,
  username,
  password,
  role,
}: {
  fullName: string;
  username: string;
  password: string;
  role: EmployeeRole | null;
}): string | null {
  if (fullName.length < 2) {
    return "Enter the employee's full name.";
  }

  if (fullName.length > 100) {
    return "The full name is too long.";
  }

  if (!username) {
    return "Enter a username.";
  }

  if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
    return (
      "Username must be 3–30 characters and can only " +
      "contain lowercase letters, numbers, periods, " +
      "underscores, and hyphens."
    );
  }

  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  if (password.length > 72) {
    return "Password cannot exceed 72 characters.";
  }

  if (!role) {
    return "Choose a valid employee role.";
  }

  return null;
}

function cleanText(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeUsername(value: unknown): string {
  return cleanText(value)
    .toLowerCase()
    .replace(/\s+/g, "");
}

function cleanRole(
  value: unknown
): EmployeeRole | null {
  const role = cleanText(value) as EmployeeRole;

  return ALLOWED_ROLES.includes(role)
    ? role
    : null;
}

function getUsernameFromEmail(
  email: string
): string {
  return email.split("@")[0] ?? "";
}