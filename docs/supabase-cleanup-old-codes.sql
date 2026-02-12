-- 在 Supabase Dashboard -> SQL Editor 中执行
-- 删除之前误插入到 public.redemption_codes 的那 100 个随机码（10 位大写字母+数字）
-- 这样 redemption_codes 只保留你另一个项目的数据，避免混乱

-- 仅删除「10 位、且只含 0-9 与 A-F」的码（即当时批量脚本生成的格式）
delete from public.redemption_codes
where length(code) = 10
  and code ~ '^[A-F0-9]{10}$';

-- 执行后可在 Table Editor 打开 redemption_codes 核对条数是否少了 100 条
