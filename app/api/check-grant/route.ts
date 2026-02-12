import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  let body: { user_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "请求体须为 JSON，包含 user_id。" },
      { status: 400 }
    );
  }

  const user_id = typeof body?.user_id === "string" ? body.user_id.trim() : "";
  if (!user_id) {
    return NextResponse.json(
      { calculations_remaining: 0, expires_at: null, valid: false }
    );
  }

  const now = new Date().toISOString();
  const { data: row } = await getSupabaseAdmin()
    .from("nail_redemption_codes")
    .select("calculations_remaining, expires_at")
    .eq("user_id", user_id)
    .not("used_at", "is", null)
    .gt("calculations_remaining", 0)
    .gt("expires_at", now)
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({
      calculations_remaining: 0,
      expires_at: null,
      valid: false,
    });
  }

  return NextResponse.json({
    calculations_remaining: row.calculations_remaining,
    expires_at: row.expires_at,
    valid: true,
  });
}
