/**
 * 灵感指尖·五行开运美甲 - TypeScript 测算逻辑（Vercel 可用）
 * 从 Python bazi_nail_logic 移植，使用 lunar-javascript
 */

import { Solar, Lunar } from "lunar-javascript";

const TIAN_GAN = "甲乙丙丁戊己庚辛壬癸";
const DI_ZHI = "子丑寅卯辰巳午未申酉戌亥";
const GAN_TO_WUXING = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const ZHI_TO_WUXING = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
const WUXING_NAMES = ["木", "火", "土", "金", "水"];

const MONTH_GAN_ZHI_2026: Record<number, string> = {
  1: "辛丑", 2: "庚寅", 3: "辛卯", 4: "壬辰", 5: "癸巳", 6: "甲午",
  7: "乙未", 8: "丙申", 9: "丁酉", 10: "戊戌", 11: "己亥", 12: "庚子",
};

const LIU_YUE_2026: Record<number, { season: string; wuxing: number; theme: string; bias: number[]; colors?: string }> = {
  1: { season: "冬", wuxing: 4, theme: "冬日暖意、静谧温柔", bias: [4, 2], colors: "深蓝色、磨砂质感、暖咖色" },
  2: { season: "春", wuxing: 0, theme: "春日生机、万物复苏", bias: [0], colors: "绿色系、花卉元素" },
  3: { season: "春", wuxing: 0, theme: "春日生机、万物复苏", bias: [0], colors: "绿色系、花卉元素" },
  4: { season: "春", wuxing: 0, theme: "春日生机、万物复苏", bias: [0], colors: "绿色系、花卉元素" },
  5: { season: "夏", wuxing: 1, theme: "清凉降温、夏日多巴胺", bias: [4, 3], colors: "水/金元素平衡暑气" },
  6: { season: "夏", wuxing: 1, theme: "清凉降温、夏日多巴胺", bias: [4, 3], colors: "水/金元素平衡暑气" },
  7: { season: "夏", wuxing: 1, theme: "清凉降温、夏日多巴胺", bias: [4, 3], colors: "水/金元素平衡暑气" },
  8: { season: "秋", wuxing: 3, theme: "职场气场、清冷感", bias: [3], colors: "金属感、高级白" },
  9: { season: "秋", wuxing: 3, theme: "职场气场、清冷感", bias: [3], colors: "金属感、高级白" },
  10: { season: "秋", wuxing: 3, theme: "职场气场、清冷感", bias: [3], colors: "金属感、高级白" },
  11: { season: "冬", wuxing: 4, theme: "冬日暖意、静谧温柔", bias: [4, 2], colors: "深蓝色、磨砂质感、暖咖色" },
  12: { season: "冬", wuxing: 4, theme: "冬日暖意、静谧温柔", bias: [4, 2], colors: "深蓝色、磨砂质感、暖咖色" },
};

const WU_KE_WO: Record<number, number> = { 0: 3, 1: 4, 2: 0, 3: 1, 4: 2 };

const BALANCE_RESOLVE_COPY: Record<string, string> = {
  "火,金": "本月火气正旺，容易压住你的金气。指尖不妨留一抹「香槟金」或冰透裸色，像给心情镀一层保护膜，既化解燥气，又让贵人与机会更愿意靠近。",
  "火,水": "火旺的月份里，你的水性能量容易被蒸腾。一点「冰透海盐蓝」或雾霾蓝，能悄悄把燥意压下去，在重要场合先稳住心神，判断力也会更清晰。",
  "火,木": "火势渐起，木气易被带旺却也可能过燥。用草木绿、抹茶色小面积点缀即可，既接住春日生机，又不至于心浮气躁，刚刚好。",
  "火,土": "火旺土焦，这个月更需要一点「大地感」来收住火气。裸色、燕麦色、陶土色能给你稳稳的底气，在变动里守住自己的节奏。",
  "金,木": "金气当令，木性容易被克制。指尖一点橄榄绿或抹茶色，像在秋风里留一颗种子，既平衡金木，又为接下来的机会蓄力。",
  "金,火": "金火相克的月份，喜火的你不必硬刚。小面积豆沙红、枫叶红或冰透琥珀，既提气场又不过旺，职场与桃花都能兼顾。",
  "金,土": "金旺土相，用裸色、暖杏色或陶土色来「生金」又稳场，既显高级又不抢戏，适合需要低调发力的场合。",
  "木,土": "木气生发，土性易被疏泄。一点裸色、燕麦色或暖咖能把你拉回地面，在机遇面前更稳、更笃定。",
  "木,金": "木旺的月份，金气容易被耗。香槟金、碎钻银或高级白小面积点缀，既化解木的过散，又提升气场与决断力。",
  "水,火": "水势当令，火气容易被压。若你喜火，小面积豆沙红、琥珀或枫叶红能为你留住暖意与表现力，又不与当月能量硬碰。",
  "水,土": "水旺土湿，用暖咖、陶土色或大地色系来制水稳局，在变动中守住底气与贵人缘。",
  "土,水": "土气厚重，水性能量易被掩住。一点冰透蓝、雾霾蓝或浅灰蓝，能悄悄疏通情绪与思路，让判断和沟通都更顺。",
  "土,木": "土旺的月份，木气需要一点空间。草木绿、抹茶色小面积点缀，既不被土压住，又能带出生机与贵人运。",
};

const DAY_MASTER_SYMBOL: Record<string, string> = {
  甲: "甲木为栋梁之木，正直向上，有担当。",
  乙: "乙木为花草之木，柔韧细腻，善变通。",
  丙: "丙火为太阳之火，热情外放，有感染力。",
  丁: "丁火为灯烛之火，温和持久，内心明亮。",
  戊: "戊土为城墙之土，厚重稳健，可依靠。",
  己: "己土为田园之土，包容滋养，温和务实。",
  庚: "庚金为剑戟之金，刚毅果断，有决断力。",
  辛: "辛金为珠玉之金，精致内敛，追求完美。",
  壬: "壬水为江河之水，智慧流动，适应力强。",
  癸: "癸水为雨露之水，细腻敏感，善于体察。",
};

const ZHI_MONTH_DESC: Record<string, string> = {
  寅: "寅月", 卯: "卯月", 辰: "辰月", 巳: "巳月", 午: "午月", 未: "未月",
  申: "申月", 酉: "酉月", 戌: "戌月", 亥: "亥月", 子: "子月", 丑: "丑月",
};

const WUXING_COLOR_POOL: Record<string, string[]> = {
  水: ["深蓝", "墨蓝", "克莱因蓝", "冰透海盐蓝", "雾霾蓝", "灰蓝", "浅蓝"],
  木: ["翡翠绿", "森林绿", "薄荷绿", "草木绿", "抹茶色", "橄榄绿", "豆绿"],
  火: ["豆沙红", "枫叶红", "冰透琥珀", "酒红", "玫红", "橘调红"],
  土: ["裸色", "燕麦色", "陶土色", "暖咖", "大地色", "米杏色", "焦糖色"],
  金: ["香槟金", "银色亮片", "高级白", "碎钻银", "裸杏色", "珍珠白", "细闪金"],
};

const WUXING_STYLE_POOL: Record<string, Record<string, string>> = {
  水: { 春: "水墨晕染、流动线条、清透渐变", 夏: "极光猫眼、冰透感、细闪", 秋: "磨砂深蓝、法式勾边", 冬: "深色磨砂、哑光蓝、层次晕染" },
  木: { 春: "手绘植物、花卉元素、清新绿", 夏: "薄荷绿跳色、法式留白", 秋: "橄榄绿磨砂、金边点缀", 冬: "深绿渐变、细线勾边" },
  火: { 春: "小面积红、细线勾边", 夏: "冰透红、渐变、避免全手浓红", 秋: "豆沙红、枫叶红局部", 冬: "酒红、暖调红点缀" },
  土: { 春: "裸色打底、浅咖点缀", 夏: "燕麦色、清透裸", 秋: "陶土色、大地色法式", 冬: "暖咖磨砂、金箔点缀" },
  金: { 春: "香槟金点缀、银色勾边", 夏: "细闪、贝壳片、清透金", 秋: "金属感法式、高级白", 冬: "金箔、珍珠白、猫眼" },
};

const NAIL_COPY_BY_WUXING: Record<string, string> = {
  水: "你本月需要一点「冰透克莱因蓝」或雾霾蓝来平复内心火气，这抹蓝色能为你带来冷静的判断力，助你避开职场口舌，在重要决策前先稳住心神。",
  金: "一抹「香槟金」或裸杏色能为你收敛 2026 年的燥气，既显高级又不抢戏，适合需要低调发力的场合，让贵人更愿意靠近。",
  木: "草木绿、橄榄绿或抹茶色能唤醒你的生机与贵人缘，尤其利事业机遇与人际，指尖一点绿，仿佛把二月萌发的能量戴在身上。",
  火: "若命局喜火，可小面积用「豆沙红」「枫叶红」或冰透琥珀，为气场加分而不至于过旺，适合需要表现力与桃花的人。",
  土: "裸色、燕麦色、陶土色能给你稳稳的底气，适合想稳中求进的月份，既不张扬又显质感，利守成与积累。",
};

interface BaziPillar {
  gan: string;
  zhi: string;
}

interface BaziResult {
  year: BaziPillar;
  month: BaziPillar;
  day: BaziPillar;
  hour: BaziPillar;
}

function pillarWuxingGan(gan: string): number {
  const idx = TIAN_GAN.includes(gan) ? TIAN_GAN.indexOf(gan) : 0;
  return GAN_TO_WUXING[idx];
}

function pillarWuxingZhi(zhi: string): number {
  const idx = DI_ZHI.includes(zhi) ? DI_ZHI.indexOf(zhi) : 0;
  return ZHI_TO_WUXING[idx];
}

function pillarToStr(p: BaziPillar): string {
  return p.gan + p.zhi;
}

function countWuxing(bazi: BaziResult): number[] {
  const counts = [0, 0, 0, 0, 0];
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
  for (const p of pillars) {
    counts[pillarWuxingGan(p.gan)] += 1;
    counts[pillarWuxingZhi(p.zhi)] += 1;
  }
  return counts;
}

function monthStrength(dayWuxing: number, monthZhi: string): number {
  const zhiToWu: Record<string, number> = { 寅: 0, 卯: 0, 辰: 2, 巳: 1, 午: 1, 未: 2, 申: 3, 酉: 3, 戌: 2, 亥: 4, 子: 4, 丑: 2 };
  const monthWu = zhiToWu[monthZhi] ?? 2;
  if (dayWuxing === monthWu) return 1.2;
  const shengWo: Record<number, number[]> = { 0: [4], 1: [0], 2: [1], 3: [2], 4: [3] };
  if ((shengWo[dayWuxing] ?? []).includes(monthWu)) return 1.0;
  return 0.6;
}

function inferShenQiang(bazi: BaziResult): "强" | "弱" {
  const counts = countWuxing(bazi);
  const dayWu = pillarWuxingGan(bazi.day.gan);
  const ms = monthStrength(dayWu, bazi.month.zhi);
  const total = counts.reduce((a, b) => a + b, 0);
  const ratio = total > 0 ? counts[dayWu] / total : 0;
  const score = ratio * 10 + ms;
  return score >= 2.5 ? "强" : "弱";
}

function getXiyongShen(bazi: BaziResult, shenQiang: "强" | "弱"): number[] {
  const dayWu = pillarWuxingGan(bazi.day.gan);
  const shengWo: Record<number, number[]> = { 0: [4], 1: [0], 2: [1], 3: [2], 4: [3] };
  const woSheng: Record<number, number[]> = { 0: [1], 1: [2], 2: [3], 3: [4], 4: [0] };
  const woKe: Record<number, number[]> = { 0: [2], 1: [3], 2: [4], 3: [0], 4: [1] };
  const keWo: Record<number, number[]> = { 0: [3], 1: [4], 2: [0], 3: [1], 4: [2] };
  let prefer: number[];
  if (shenQiang === "强") {
    prefer = [...(keWo[dayWu] ?? []), ...(woSheng[dayWu] ?? []), ...(woKe[dayWu] ?? [])];
  } else {
    prefer = [...(shengWo[dayWu] ?? []), dayWu];
  }
  return Array.from(new Set(prefer));
}

function monthDominatesXiyong(monthWuxing: number, xiyong: number[]): boolean {
  for (const x of xiyong) {
    if (WU_KE_WO[x] === monthWuxing) return true;
  }
  return false;
}

function currentMonthGanzhi(month: number): string {
  try {
    const solar = Solar.fromYmdHms(2026, month, 15, 12, 0, 0);
    const lunar = solar.getLunar();
    const eight = lunar.getEightChar();
    const m = eight.getMonth();
    if (m && String(m).length >= 2) return String(m).slice(0, 2);
  } catch {}
  return MONTH_GAN_ZHI_2026[month] ?? "庚寅";
}

function monthGanzhiToWuxing(ganzhi: string): number[] {
  if (ganzhi.length !== 2) return [];
  const g = ganzhi[0], z = ganzhi[1];
  const gi = TIAN_GAN.includes(g) ? TIAN_GAN.indexOf(g) : 0;
  const zi = DI_ZHI.includes(z) ? DI_ZHI.indexOf(z) : 0;
  return [GAN_TO_WUXING[gi], ZHI_TO_WUXING[zi]];
}

function weightedColorScores(
  xiyong: number[],
  monthWuxing: number[],
  currentMonth: number
): number[] {
  const scores = [0, 0, 0, 0, 0].map(() => 0);
  for (const i of xiyong) scores[i] += 1.5;
  scores[4] += 0.8;
  scores[3] += 0.4;
  for (const w of monthWuxing) scores[w] += 0.5;
  const yue = LIU_YUE_2026[currentMonth] ?? LIU_YUE_2026[2];
  if (yue) {
    const monthDominant = yue.wuxing;
    for (const b of yue.bias) scores[b] += 0.6;
    if (monthDominatesXiyong(monthDominant, xiyong)) {
      const keYue: Record<number, number[]> = { 1: [4], 4: [2], 2: [0], 0: [3], 3: [1] };
      for (const w of keYue[monthDominant] ?? []) scores[w] += 0.9;
    }
  }
  return scores;
}

function getBaziFromSolar(year: number, month: number, day: number, hour: number): BaziResult {
  const h = hour || 12;
  const solar = Solar.fromYmdHms(year, month, day, h, 0, 0);
  const lunar = solar.getLunar();
  const eight = lunar.getEightChar();
  const y = eight.getYear() ?? "丙午";
  const m = eight.getMonth() ?? "庚寅";
  const d = eight.getDay() ?? "甲子";
  const t = eight.getTime() ?? "戊子";
  return {
    year: { gan: String(y)[0], zhi: String(y)[1] },
    month: { gan: String(m)[0], zhi: String(m)[1] },
    day: { gan: String(d)[0], zhi: String(d)[1] },
    hour: { gan: String(t)[0], zhi: String(t)[1] },
  };
}

function getBaziFromLunar(year: number, month: number, day: number, hour: number): BaziResult {
  const h = hour || 12;
  const lunar = Lunar.fromYmdHms(year, month, day, h, 0, 0);
  const eight = lunar.getEightChar();
  const y = eight.getYear() ?? "丙午";
  const m = eight.getMonth() ?? "庚寅";
  const d = eight.getDay() ?? "甲子";
  const t = eight.getTime() ?? "戊子";
  return {
    year: { gan: String(y)[0], zhi: String(y)[1] },
    month: { gan: String(m)[0], zhi: String(m)[1] },
    day: { gan: String(d)[0], zhi: String(d)[1] },
    hour: { gan: String(t)[0], zhi: String(t)[1] },
  };
}

function monthLuckKeyword(month: number, monthGanzhi: string, yueTheme?: string): string {
  if (yueTheme) return `${month}月${monthGanzhi}·${yueTheme}`;
  const fallback: Record<number, string> = {
    1: "正月·寒冬藏秀，宜静养与规划", 2: "二月·草木萌发，利事业机遇",
    3: "三月·春暖花开，利人际与桃花", 4: "四月·阳气渐盛，利进取与表达",
    5: "五月·火旺土相，宜稳中求进", 6: "六月·盛夏繁茂，利合作与收获",
    7: "七月·金气初生，利决断与收尾", 8: "八月·秋高气爽，利学习与远行",
    9: "九月·土旺金相，宜守成与积累", 10: "十月·水气渐起，利思考与复盘",
    11: "冬月·藏纳之时，宜休养与内省", 12: "腊月·辞旧迎新，利总结与祈福",
  };
  return fallback[month] ?? "当月·顺应天时，从容前行";
}

function getBalanceCopyForMonth(
  currentMonth: number,
  xiyong: number[],
  monthDominantWuxing: number
): [boolean, { element: string; copy: string }[]] {
  if (!monthDominatesXiyong(monthDominantWuxing, xiyong)) return [false, []];
  const monthName = WUXING_NAMES[monthDominantWuxing];
  const out: { element: string; copy: string }[] = [];
  for (const xi of xiyong) {
    const xiName = WUXING_NAMES[xi];
    const key = `${monthName},${xiName}`;
    const copy = BALANCE_RESOLVE_COPY[key];
    if (copy) out.push({ element: xiName, copy });
  }
  return [true, out];
}

function nailDescriptionFromElements(elements: string[], xiyong: string[]): string {
  if (elements.length === 0) return "建议选择与您喜用神相合的冰透色系，既显气质又助运势。";
  const parts: string[] = [];
  for (const el of elements.slice(0, 2)) {
    const copy = NAIL_COPY_BY_WUXING[el];
    if (copy) parts.push(copy);
  }
  if (parts.length === 0) return `本月推荐以「${elements.join("、")}」为基调的美甲，色系与您的喜用神及流年、月运相合，可选用冰透或莫兰迪质感，既衬肤色又添开运气场。`;
  return parts.join(" ");
}

function pickColorsForElement(element: string, season: string): string {
  const pool = WUXING_COLOR_POOL[element] ?? [];
  if (pool.length === 0) return "";
  if (season === "夏" && pool.length >= 4) return pool.slice(2, 5).join("、");
  if (season === "冬" && pool.length >= 4) return pool.slice(0, 3).join("、");
  return pool.slice(0, 4).join("、");
}

function styleSuggestFor(element: string, season: string): string {
  const byEl = WUXING_STYLE_POOL[element];
  const s = season || "春";
  return byEl?.[s] ?? byEl?.["春"] ?? "法式、磨砂或细闪点缀，贴合当季气质。";
}

function symbolMeaningFor(
  dayWuxingIdx: number,
  recElement: string,
  monthDominantIdx: number,
  season: string,
  isConflict: boolean
): string {
  const dayName = WUXING_NAMES[dayWuxingIdx];
  const monthName = monthDominantIdx >= 0 && monthDominantIdx < 5 ? WUXING_NAMES[monthDominantIdx] : "";
  const recIdx = WUXING_NAMES.indexOf(recElement);
  if (recIdx < 0) return `${recElement}为你的喜用之一，用对应色系能调和命局、利运势。`;
  const shengWoOut: Record<number, number[]> = { 0: [1], 1: [2], 2: [3], 3: [4], 4: [0] };
  if ((shengWoOut[dayWuxingIdx] ?? []).includes(recIdx)) return `日主${dayName}生${recElement}，泄秀发挥。用${recElement}色系能缓解压力、利思路与表达，本月更顺遂。`;
  const shengWoIn: Record<number, number[]> = { 0: [4], 1: [0], 2: [1], 3: [2], 4: [3] };
  if ((shengWoIn[dayWuxingIdx] ?? []).includes(recIdx)) return `${recElement}生${dayName}，为印星加持。用${recElement}色系能稳心神、增贵人缘，利学习与决策。`;
  const woKe: Record<number, number[]> = { 0: [2], 1: [3], 2: [4], 3: [0], 4: [1] };
  if ((woKe[dayWuxingIdx] ?? []).includes(recIdx)) return `${recElement}为日主之财，本月${recElement}气当令时更利求财与人际；色系呼应财星，助把握机会。`;
  if (WU_KE_WO[dayWuxingIdx] === recIdx) return `本月${monthName}气较旺，${recElement}色系可小面积使用，既接住事业机会又不过压，平衡为佳。`;
  if (dayWuxingIdx === recIdx) return `与日主同属${recElement}，守护本源。用${recElement}色系增强自信与决断力，利气场。`;
  if (isConflict) return `本月流月与喜用略有相克，用${recElement}色系可通关平衡、化解压力，利求财与人际。`;
  return `${recElement}为你的喜用，用对应色系能调和命局、贴合本月能量，利运势。`;
}

function designBalanceTipFor(
  recommended: string[],
  season: string,
  monthDominantIdx: number,
  isConflict: boolean
): string {
  const parts: string[] = [];
  if (monthDominantIdx === 1) parts.push("2026 年为丙午火旺之年，当前月又带火气时，过多正红色易让情绪急躁。");
  if (recommended.length >= 2) {
    const [a, b] = recommended;
    const ca = WUXING_COLOR_POOL[a]?.[0] ?? a + "色";
    const cb = WUXING_COLOR_POOL[b]?.[0] ?? b + "色";
    parts.push(`建议采用「${a}${b}相生」的配色，例如 ${ca} 为基底、${cb} 点缀或做晕染，既平衡又利运势。`);
  } else if (recommended.length === 1) {
    const r = recommended[0];
    const c = WUXING_COLOR_POOL[r]?.[0] ?? r + "色";
    parts.push(`本月以${r}色系为主即可，如 ${c} 打底再搭配细闪或法式边，既显气质又贴合喜用。`);
  }
  if (season === "冬") parts.push("当前冬月水气当令，可适当用深色或磨砂质感、暖咖点缀，平衡冷暖。");
  if (isConflict) parts.push("本月流月与喜用略有相克，配色上以「通关」「平衡」为主，避免与当月旺相硬碰。");
  return parts.length > 0 ? parts.join(" ") : "配色上以你喜用五行对应的色系为主，兼顾当季与当月能量即可。";
}

function avoidGuideFor(
  dayGan: string,
  dayWuxingName: string,
  xiyong: number[],
  recommended: string[],
  yue: { wuxing?: number }
): string {
  const parts: string[] = [];
  if (dayWuxingName === "金") parts.push("避免大面积的土黄色或咖啡色（土多金埋，易觉思路不清晰、效率低下）。");
  const fireIdx = 1;
  const monthFire = yue.wuxing === fireIdx;
  if (monthFire && (!xiyong.includes(fireIdx) || !recommended.slice(0, 2).includes("火"))) {
    parts.push("避免整手正红或橙红（本年本月火气已足，过多烈火易情绪急躁、睡眠不稳）。");
  }
  const monthDom = yue.wuxing ?? -1;
  if (monthDom >= 0 && monthDominatesXiyong(monthDom, xiyong)) {
    const wName = WUXING_NAMES[monthDom];
    const avoidColors: Record<string, string> = { 火: "正红、橙红", 土: "土黄、咖啡", 金: "大面积金属色", 木: "全手浓绿", 水: "全手深蓝黑" };
    const colorDesc = avoidColors[wName] ?? "";
    if (colorDesc) parts.push(`本月${wName}气较旺且克你喜用，建议避免大面积的${colorDesc}，以免加重相克。`);
  }
  if (["庚", "辛"].includes(dayGan)) parts.push("材质上建议增加光泽感（如猫眼、贝壳片、细闪），金日主喜光，能增强贵人运。");
  else parts.push("材质上可选用猫眼、极光或磨砂质感，既显高级又利气场。");
  return parts.join(" ");
}

export interface NailRecommendationInput {
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour?: number | null;
  use_lunar?: boolean;
  current_month?: number | null;
}

export interface NailRecommendationOutput {
  baziStr: string[];
  dayMaster: string;
  dayMasterWuxing: string;
  shenQiang: "强" | "弱";
  wuxingCounts: number[];
  wuxingRatios: number[];
  xiyongShen: string[];
  currentMonthGanzhi: string;
  monthLuckKeyword: string;
  colorScores: number[];
  recommendedElements: string[];
  nailDescription: string;
  nailCopyByElement: { element: string; copy: string }[];
  reportIntro: string;
  patternBrief: string[];
  monthNailIntro: string;
  recommendations: { element: string; colorNames: string; symbolMeaning: string; styleSuggest: string }[];
  designBalanceTip: string;
  avoidGuide: string;
}

export function computeNailRecommendation(inp: NailRecommendationInput): NailRecommendationOutput {
  const hour = inp.birth_hour ?? 12;
  const bazi = inp.use_lunar
    ? getBaziFromLunar(inp.birth_year, inp.birth_month, inp.birth_day, hour)
    : getBaziFromSolar(inp.birth_year, inp.birth_month, inp.birth_day, hour);

  const shenQiang = inferShenQiang(bazi);
  const xiyong = getXiyongShen(bazi, shenQiang);
  const counts = countWuxing(bazi);
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const ratios = counts.map((c) => c / total);

  const now = new Date();
  const currentMonth = inp.current_month ?? now.getMonth() + 1;
  const monthGanzhi = currentMonthGanzhi(currentMonth);
  const monthWuxing = monthGanzhiToWuxing(monthGanzhi);
  const yueCfg = LIU_YUE_2026[currentMonth] ?? LIU_YUE_2026[2];
  const monthDominant = yueCfg?.wuxing ?? 0;
  const yueTheme = yueCfg?.theme ?? "";

  const colorScores = weightedColorScores(xiyong, monthWuxing, currentMonth);
  const indexed = colorScores.map((s, i) => [i, s] as [number, number]);
  indexed.sort((a, b) => b[1] - a[1]);
  const recommended = indexed
    .filter(([i]) => colorScores[i] > 0)
    .slice(0, 2)
    .map(([i]) => WUXING_NAMES[i]);

  const [isConflict, balanceList] = getBalanceCopyForMonth(currentMonth, xiyong, monthDominant);
  const nailCopyByElement: { element: string; copy: string }[] = [];
  if (isConflict && balanceList.length > 0) {
    for (const item of balanceList.slice(0, 2)) nailCopyByElement.push({ element: item.element, copy: item.copy });
  }
  const seen = new Set(nailCopyByElement.map((x) => x.element));
  for (const el of recommended) {
    if (seen.has(el)) continue;
    const copy = NAIL_COPY_BY_WUXING[el];
    if (copy) {
      nailCopyByElement.push({ element: el, copy });
      seen.add(el);
    }
  }

  const xiyongNames = xiyong.map((i) => WUXING_NAMES[i]);
  let nailDesc = nailDescriptionFromElements(recommended, xiyongNames);
  if (isConflict && balanceList.length > 0) {
    nailDesc = "本月流月与你的喜用略有相克，指尖用对颜色能平衡化解、稳住气场。 " + nailDesc;
  }

  const dayGan = bazi.day.gan;
  const dayWuxingIdx = pillarWuxingGan(bazi.day.gan);
  const dayWuxingName = WUXING_NAMES[dayWuxingIdx];
  const monthZhi = bazi.month.zhi;
  const monthDesc = ZHI_MONTH_DESC[monthZhi] ?? monthZhi + "月";
  const season = yueCfg?.season ?? "春";

  const symbol = DAY_MASTER_SYMBOL[dayGan] ?? `${dayGan}${dayWuxingName}，与你命局相合。`;
  const reportIntro = `根据你的出生时间和当前的干支能量，你的八字日主（核心能量）为 ${dayGan}${dayWuxingName}。${symbol}`;

  const xiyongStr = xiyong.map((i) => WUXING_NAMES[i]).join("、");
  const shenDesc = shenQiang === "强" ? "身强之格" : "身弱之格";
  const patternBrief = [
    `日主：${dayGan}${dayWuxingName}（生于${monthDesc}，${shenDesc}）。`,
    `五行喜忌：${shenDesc}，最喜 ${xiyongStr} 来调和命局。`,
    `当前月份：2026年${currentMonth}月为 ${monthGanzhi}月（${yueCfg?.theme ?? "当月能量"}）。`,
  ];

  const monthNailIntro = isConflict
    ? `本月${monthGanzhi}与你的喜用略有相克，美甲设计逻辑应以「通关」和「平衡」为主，用对色系既能化解流月压力，又能稳住气场、利求财与人际。`
    : `本月${monthGanzhi}（${yueCfg?.theme ?? ""}），与你的喜用相呼应。美甲建议以「顺势」和「生旺」为主，用色系加持本月运势。`;

  const recommendations: { element: string; colorNames: string; symbolMeaning: string; styleSuggest: string }[] = [];
  for (const el of recommended.slice(0, 3)) {
    const colorNames = pickColorsForElement(el, season);
    const symbolMeaning = symbolMeaningFor(dayWuxingIdx, el, monthDominant, season, isConflict);
    const styleSuggest = styleSuggestFor(el, season);
    recommendations.push({ element: el, colorNames, symbolMeaning, styleSuggest });
  }

  const designBalanceTip = designBalanceTipFor(recommended, season, monthDominant, isConflict);
  const avoidGuide = avoidGuideFor(dayGan, dayWuxingName, xiyong, recommended, yueCfg ?? {});

  return {
    baziStr: [bazi.year, bazi.month, bazi.day, bazi.hour].map(pillarToStr),
    dayMaster: dayGan,
    dayMasterWuxing: dayWuxingName,
    shenQiang,
    wuxingCounts: counts,
    wuxingRatios: ratios,
    xiyongShen: xiyongNames,
    currentMonthGanzhi: monthGanzhi,
    monthLuckKeyword: monthLuckKeyword(currentMonth, monthGanzhi, yueTheme),
    colorScores,
    recommendedElements: recommended,
    nailDescription: nailDesc,
    nailCopyByElement,
    reportIntro,
    patternBrief,
    monthNailIntro,
    recommendations,
    designBalanceTip,
    avoidGuide,
  };
}

export function runFromDict(params: Record<string, unknown>): Record<string, unknown> {
  const inp: NailRecommendationInput = {
    birth_year: Number(params.birth_year),
    birth_month: Number(params.birth_month),
    birth_day: Number(params.birth_day),
    birth_hour: params.birth_hour != null && params.birth_hour !== "" ? Number(params.birth_hour) : null,
    use_lunar: Boolean(params.use_lunar),
    current_month: params.current_month != null ? Number(params.current_month) : null,
  };
  const out = computeNailRecommendation(inp);
  return {
    baziStr: out.baziStr,
    dayMaster: out.dayMaster,
    dayMasterWuxing: out.dayMasterWuxing,
    shenQiang: out.shenQiang,
    wuxingCounts: out.wuxingCounts,
    wuxingRatios: out.wuxingRatios,
    xiyongShen: out.xiyongShen,
    currentMonthGanzhi: out.currentMonthGanzhi,
    monthLuckKeyword: out.monthLuckKeyword,
    colorScores: out.colorScores,
    recommendedElements: out.recommendedElements,
    nailDescription: out.nailDescription,
    nailCopyByElement: out.nailCopyByElement,
    reportIntro: out.reportIntro,
    patternBrief: out.patternBrief,
    monthNailIntro: out.monthNailIntro,
    recommendations: out.recommendations,
    designBalanceTip: out.designBalanceTip,
    avoidGuide: out.avoidGuide,
  };
}
