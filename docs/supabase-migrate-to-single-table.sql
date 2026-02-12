-- 从双表迁移到单表：在 Supabase SQL Editor 中执行
-- 会删除 nail_redemption_grants，并重建 nail_redemption_codes 为单表结构

drop table if exists public.nail_redemption_grants;
drop table if exists public.nail_redemption_codes;

create table public.nail_redemption_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_at timestamptz not null default now(),
  note text,
  used_at timestamptz,
  user_id text,
  calculations_remaining int,
  expires_at timestamptz
);

comment on table public.nail_redemption_codes is '五行美甲：兑换码表，生成与管理在同表';
comment on column public.nail_redemption_codes.used_at is 'NULL=未使用，有值=已兑换';
