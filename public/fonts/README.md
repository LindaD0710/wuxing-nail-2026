# Adobe Garamond Pro（年份「2026」用）

本目录用于放置 **Adobe Garamond Pro** 字体文件（需自行拥有合法授权）。

请将以下两个文件放入 **`public/fonts/`**（与本 README 同级），文件名需一致：

- `AGaramondPro-Semibold.woff2` — 用于「2026」正常
- `AGaramondPro-SemiboldItalic.woff2` — 用于「2026」斜体

若您只有 `.otf` / `.ttf`，可先用 [CloudConvert](https://cloudconvert.com/woff2-converter) 等工具转为 `.woff2`，或在 `app/globals.css` 的 `@font-face` 里把路径和扩展名改为您的实际文件名。

未放置字体文件时，页面会自动使用 EB Garamond（Google Fonts），构建与运行不受影响。
