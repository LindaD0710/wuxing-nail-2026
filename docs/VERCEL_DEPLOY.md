# Vercel 部署指南

## 1. 连接 GitHub 仓库

1. 打开 [vercel.com](https://vercel.com)，登录你的 GitHub 账号
2. 点击 **Add New… → Project**
3. 在列表中找到 **wuxing-nail-2026**（或 `LindaD0710/wuxing-nail-2026`），点击 **Import**
4. 确认项目名为 `wuxing-nail-2026`，框架选择 **Next.js**（一般会自动识别）

---

## 2. 配置环境变量

在 **Environment Variables** 中添加：

| Name | Value | 说明 |
|------|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase 项目 URL | 如 `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | 你的 Supabase service_role 密钥 | 在 Supabase → Project Settings → API 中获取 |

可在 **Settings → Environment Variables** 中为 Production、Preview、Development 分别配置。

---

## 3. 部署

点击 **Deploy**，等待构建完成。

---

## 4. 测算接口

测算接口 `/api/nail-recommendation` 已改为 TypeScript 实现（使用 `lunar-javascript`），直接运行在 Vercel 的 Node.js 环境中，无额外配置。
