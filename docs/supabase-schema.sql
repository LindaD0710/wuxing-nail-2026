-- 五行美甲：兑换码单表管理（生成 + 使用状态在同一表）
-- 在 Supabase Dashboard -> SQL Editor 中执行

-- 若之前用过双表结构，先删除旧表（会丢失已有数据，请先备份）
-- drop table if exists public.nail_redemption_grants;
-- drop table if exists public.nail_redemption_codes;

create table if not exists public.nail_redemption_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_at timestamptz not null default now(),
  note text,
  -- 以下为兑换后填写：used_at 非空表示已使用
  used_at timestamptz,
  user_id text,
  calculations_remaining int,
  expires_at timestamptz
);

comment on table public.nail_redemption_codes is '五行美甲：兑换码表，生成与管理在同表';
comment on column public.nail_redemption_codes.code is '兑换码';
comment on column public.nail_redemption_codes.note is '备注，如「批量生成」';
comment on column public.nail_redemption_codes.used_at is 'NULL=未使用，有值=已兑换';
comment on column public.nail_redemption_codes.user_id is '兑换者（前端匿名 uuid）';
comment on column public.nail_redemption_codes.calculations_remaining is '剩余测算次数，兑换时为 3';
comment on column public.nail_redemption_codes.expires_at is '额度过期时间，兑换时为 +90 天';
