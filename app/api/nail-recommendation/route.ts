import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { runFromDict } from "@/lib/bazi";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "请求体须为 JSON，包含 birth_year, birth_month, birth_day, user_id。" },
      { status: 400 }
    );
  }

  const params = body as Record<string, unknown>;
  const user_id = typeof params?.user_id === "string" ? params.user_id.trim() : "";
  if (!user_id) {
    return NextResponse.json(
      { error: "请先使用兑换码兑换测算次数。" },
      { status: 403 }
    );
  }

  const now = new Date().toISOString();
  const { data: row, error: fetchErr } = await getSupabaseAdmin()
    .from("nail_redemption_codes")
    .select("id, calculations_remaining")
    .eq("user_id", user_id)
    .not("used_at", "is", null)
    .gt("calculations_remaining", 0)
    .gt("expires_at", now)
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchErr || !row) {
    return NextResponse.json(
      { error: "暂无测算次数或已过期，请使用兑换码兑换后再试。" },
      { status: 403 }
    );
  }

  const { error: updateErr } = await getSupabaseAdmin()
    .from("nail_redemption_codes")
    .update({
      calculations_remaining: row.calculations_remaining - 1,
    })
    .eq("id", row.id);

  if (updateErr) {
    return NextResponse.json(
      { error: "扣减次数失败，请稍后重试。" },
      { status: 500 }
    );
  }

  const birth_year = Number(params?.birth_year);
  const birth_month = Number(params?.birth_month);
  const birth_day = Number(params?.birth_day);
  if (
    !Number.isInteger(birth_year) ||
    !Number.isInteger(birth_month) ||
    !Number.isInteger(birth_day)
  ) {
    return NextResponse.json(
      { error: "请提供有效的 birth_year, birth_month, birth_day（整数）。" },
      { status: 400 }
    );
  }

  const payload: Record<string, unknown> = {
    birth_year,
    birth_month,
    birth_day,
    birth_hour:
      params.birth_hour != null && params.birth_hour !== ""
        ? Number(params.birth_hour)
        : null,
    use_lunar: Boolean(params.use_lunar),
    current_month:
      params.current_month != null ? Number(params.current_month) : null,
  };

  try {
    const result = runFromDict(payload);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "八字计算失败", detail: String(err) },
      { status: 500 }
    );
  }
}
