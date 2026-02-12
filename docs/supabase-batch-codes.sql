-- 在 Supabase Dashboard -> SQL Editor 中执行，批量生成 100 个随机兑换码
-- 每码 10 位大写字母+数字，note 可填「批量生成」便于管理

insert into public.nail_redemption_codes (code, note)
select
  upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 10)),
  '批量生成'
from generate_series(1, 100)
on conflict (code) do nothing;
