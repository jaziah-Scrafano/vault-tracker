import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("inventory_items")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json({
        connected: true,
        message:
          "Vault Tracker reached Supabase. The inventory_items table does not exist yet.",
        databaseResponse: error.message,
      });
    }

    return NextResponse.json({
      connected: true,
      message: "Vault Tracker is connected to Supabase.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        message:
          error instanceof Error
            ? error.message
            : "Supabase connection failed.",
      },
      {
        status: 500,
      }
    );
  }
}
