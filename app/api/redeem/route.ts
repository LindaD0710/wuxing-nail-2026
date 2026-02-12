import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const GRANT_DAYS = 90;
const GRANT_COUNT = 3;

export async function POST(request: NextRequest) {
  let body: { code?: string; user_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "请求体须为 JSON，包含 code 与 user_id。" },
      { status: 400 }
    );
  }

  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const user_id = typeof body?.user_id === "string" ? body.user_id.trim() : "";

  if (!code) {
    return NextResponse.json(
      { error: "请输入兑换码。" },
      { status: 400 }
    );
  }
  if (!user_id) {
    return NextResponse.json(
      { error: "缺少用户标识，请刷新页面后重试。" },
      { status: 400 }
    );
  }

  const { data: row, error: fetchErr } = await getSupabaseAdmin()
    .from("nail_redemption_codes")
    .select("id")
    .eq("code", code)
    .is("used_at", null)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json(
      { error: "兑换服务暂时异常，请稍后重试。" },
      { status: 500 }
    );
  }
  if (!row) {
    return NextResponse.json(
      { error: "兑换码无效或已被使用。" },
      { status: 400 }
    );
  }

  const now = new Date();
  const expires_at = new Date(now);
  expires_at.setDate(expires_at.getDate() + GRANT_DAYS);

  const { error: updateErr } = await getSupabaseAdmin()
    .from("nail_redemption_codes")
    .update({
      used_at: now.toISOString(),
      user_id,
      calculations_remaining: GRANT_COUNT,
      expires_at: expires_at.toISOString(),
    })
    .eq("id", row.id);

  if (updateErr) {
    return NextResponse.json(
      { error: "兑换失败，请稍后重试。" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    calculations_remaining: GRANT_COUNT,
    expires_at: expires_at.toISOString(),
  });
}
