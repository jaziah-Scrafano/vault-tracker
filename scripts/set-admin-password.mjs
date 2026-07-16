import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const secretKey =
  process.env.SUPABASE_SECRET_KEY;

const userId =
  "3366eb39-551b-45e2-9995-2323ed22f16e";

const email =
  "scrafanokj@gmail.com";

const password = process.argv[2];

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is missing."
  );
}

if (!publishableKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing."
  );
}

if (!secretKey) {
  throw new Error(
    "SUPABASE_SECRET_KEY is missing."
  );
}

if (!password || password.length < 8) {
  throw new Error(
    "Enter a password with at least 8 characters."
  );
}

const adminClient = createClient(
  supabaseUrl,
  secretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const publicClient = createClient(
  supabaseUrl,
  publishableKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

console.log("Updating password...");

const {
  data: updatedUser,
  error: updateError,
} = await adminClient.auth.admin.updateUserById(
  userId,
  {
    password,
    email_confirm: true,
  }
);

if (updateError) {
  throw new Error(
    `Password update failed: ${updateError.message}`
  );
}

console.log(
  `Updated user: ${updatedUser.user.email}`
);

console.log("Testing password login...");

const {
  data: loginData,
  error: loginError,
} = await publicClient.auth.signInWithPassword({
  email,
  password,
});

if (loginError) {
  throw new Error(
    `Password was updated, but login test failed: ${loginError.message}`
  );
}

console.log(
  `Login test successful for ${loginData.user.email}`
);

await publicClient.auth.signOut();
