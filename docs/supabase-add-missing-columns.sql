-- 若表已存在但缺少新列，在 Supabase SQL Editor 中执行此脚本补全

alter table public.nail_redemption_codes add column if not exists note text;
alter table public.nail_redemption_codes add column if not exists used_at timestamptz;
alter table public.nail_redemption_codes add column if not exists user_id text;
alter table public.nail_redemption_codes add column if not exists calculations_remaining int;
alter table public.nail_redemption_codes add column if not exists expires_at timestamptz;

-- 补全注释
comment on table public.nail_redemption_codes is '五行美甲：兑换码表，生成与管理在同表';
comment on column public.nail_redemption_codes.code is '兑换码';
comment on column public.nail_redemption_codes.note is '备注，如「批量生成」';
comment on column public.nail_redemption_codes.used_at is 'NULL=未使用，有值=已兑换';
comment on column public.nail_redemption_codes.user_id is '兑换者（前端匿名 uuid）';
comment on column public.nail_redemption_codes.calculations_remaining is '剩余测算次数，兑换时为 3';
comment on column public.nail_redemption_codes.expires_at is '额度过期时间，兑换时为 +90 天';
