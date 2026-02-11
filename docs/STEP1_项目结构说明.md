# Step 1：项目结构说明

## 一、项目目录结构

```
五行美甲/
├── app/                    # Next.js App Router
│   ├── globals.css         # 全局样式（Tailwind + 莫兰迪/冰透色变量）
│   ├── layout.tsx          # 根布局
│   └── page.tsx             # 首页（Step 3 将拆为输入页与结果页）
├── python/                  # 后端计算逻辑
│   ├── requirements.txt     # Python 依赖
│   └── bazi_nail_logic.py   # 八字 + 喜用神 + 流年月运 + 美甲推荐 核心逻辑
├── docs/
│   └── STEP1_项目结构说明.md
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts       # 莫兰迪/冰透色、字体扩展
├── tsconfig.json
└── .gitignore
```

## 二、Python 依赖清单

| 依赖 | 用途 |
|------|------|
| `lunar-python` (≥1.9.0) | 农历、公历互转，八字四柱（年柱/月柱/日柱/时柱）、干支、节气 |

安装方式（建议在虚拟环境中）：

```bash
cd python
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

若 PyPI 上包名为 `lunar_python`，可改为：`pip install lunar_python`。

## 三、后端计算逻辑原型概览

### 3.1 输入

- **NailRecommendationInput**
  - `birth_year`, `birth_month`, `birth_day`：出生年月日（必填）
  - `birth_hour`：出生时辰（可选；缺省或“不清楚”时按 **12 时** 处理）
  - `use_lunar`：`true` 表示输入为农历，否则为公历
  - `current_month`：访问月份（可选；缺省为系统当前月，用于月度运势）

### 3.2 逻辑链

1. **八字排盘**  
   使用 `lunar-python` 将出生时间转为八字四柱（年柱、月柱、日柱、时柱），每柱一天干一地支。

2. **五行统计与日主**  
   - 天干地支按固定表映射到五行（金木水火土），统计八字中五行的数量与占比（供雷达图）。
   - 日主 = 日柱天干，日主五行用于后续身强身弱与喜用神。

3. **身强 / 身弱（简化）**  
   - 依据：日主五行在八字中的占比 + 是否得月令（月支是否同五行或生日主）。
   - 得令且占比高 → 身强；否则 → 身弱。

4. **喜用神（简化）**  
   - 身强：喜克我、我生、我克（官杀、食伤、财）→ 对应五行列表。  
   - 身弱：喜生我、同我（印、比劫）→ 对应五行列表。

5. **动态时空**  
   - **2026 丙午年**：火旺，在加权时对「水、金」给予中和流年的加分（水克火、金泄火）。  
   - **当前月干支**：按 2026 年月柱表（或后续用节气精确取月）得到当月干支，其五行作为「月度运势」加分。

6. **综合判定与推荐**  
   - 对五行做加权得分：喜用神权重最高 + 流年中和（水、金）+ 当月干支五行加持。  
   - 按得分排序，取前 2 个五行作为推荐色系依据，并生成简短美甲方案描述（Step 3 可接入情绪化文案库）。

### 3.3 输出

- **NailRecommendationOutput**（供前端或 API 返回）
  - `baziStr`：四柱字符串，如 `["丙午","庚寅","甲子","戊辰"]`
  - `dayMaster` / `dayMasterWuxing`：日主天干与五行
  - `shenQiang`：身强 / 身弱
  - `wuxingCounts` / `wuxingRatios`：五行数量与占比（雷达图）
  - `xiyongShen`：喜用神五行名列表
  - `currentMonthGanzhi`：当月月柱
  - `monthLuckKeyword`：月度开运词（示例文案）
  - `colorScores`：五行加权得分
  - `recommendedElements`：推荐五行/色系
  - `nailDescription`：美甲方案文字描述（示例）

### 3.4 与前端对接方式（后续 Step 2/3）

- **方式 A**：Next.js API Route 内用 `child_process` 或 `execSync` 调用 Python 脚本，传入 JSON，接收 JSON。
- **方式 B**：单独起 FastAPI/Flask 服务，Next.js 通过 `fetch` 请求该服务。
- **方式 C**：将核心算法用 TypeScript 重写（若希望无 Python 运行时）。

当前 Step 1 已提供：`run_from_dict(params)`，接收字典、返回可 JSON 序列化的结果字典，便于上述任一种方式调用。

## 四、Tailwind 与风格约定

- **配色**：`tailwind.config.ts` 中已扩展 `morandi.*`（奶油、石色、鼠尾草、尘、雾、腮红、陶）与 `ice.*`（冰蓝、薄荷、薰衣草、蜜桃），用于小红书式极简高级感。
- **字体**：预留 `font-sans` / `font-serif` 变量，可接入 Noto Sans SC / Noto Serif SC 以增强呼吸感。

## 五、下一步（Step 2 & 3）

- **Step 2**：完善 Python 计算逻辑（节气换月、更精细的喜用神规则、与 2026/当月 的加权公式），并与 Next.js 打通（API 或子进程）。
- **Step 3**：构建前端输入表单（公历/农历切换、日期选择、不清楚时辰的默认方案）与结果页（能量雷达图、月度开运词、美甲方案描述），并接入情绪化文案库。
