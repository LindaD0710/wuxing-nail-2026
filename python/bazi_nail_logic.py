# -*- coding: utf-8 -*-
"""
灵感指尖·五行开运美甲 - 核心计算逻辑原型

功能：
1. 根据出生年月日时（支持公历/农历）计算八字、日主强度、五行损益、喜用神
2. 结合 2026 丙午年（旺火年）与当前访问月份的干支能量进行加权
3. 输出美甲色系推荐（供前端展示与文案库调用）

依赖：lunar-python
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Literal, Optional, Tuple
from datetime import datetime


# ---------- 常量：天干地支与五行 ----------
TIAN_GAN = "甲乙丙丁戊己庚辛壬癸"  # 0-9
DI_ZHI = "子丑寅卯辰巳午未申酉戌亥"  # 0-11

# 天干 -> 五行（木火土金水 = 0,1,2,3,4）
GAN_TO_WUXING = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]  # 甲乙木 丙丁火 戊己土 庚辛金 壬癸水
# 地支 -> 五行（含藏干简化为本气）
ZHI_TO_WUXING = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4]  # 子水 丑土 寅木 卯木 辰土 巳火 午火 未土 申金 酉金 戌土 亥水

WUXING_NAMES = ["木", "火", "土", "金", "水"]

# 2026 丙午年：丙=火 午=火，流年火极旺
LIU_NIAN_2026 = {"gan": "丙", "zhi": "午", "wuxing": 1}  # 火

# 2026 年各月（按节气换月）的月柱干支 - 公历月份对应约略月柱，实际应以节气为准
MONTH_GAN_ZHI_2026 = {
    1: "辛丑", 2: "庚寅", 3: "辛卯", 4: "壬辰", 5: "癸巳", 6: "甲午",
    7: "乙未", 8: "丙申", 9: "丁酉", 10: "戊戌", 11: "己亥", 12: "庚子",
}

# ---------- 「五行 x 2026流月」美甲文案逻辑表（字典结构）----------
# 参考：2026 丙午年极火之年；按访问月份 current_month 做二次加权与冲突化解

# 2026 流年基调：喜火/木 vs 忌火 的总体策略（0木 1火 2土 3金 4水）
LIU_NIAN_2026_BASE = {
    "theme": "极火之年，能量热烈、奔放、燥动",
    "xi_huo_mu": {
        "desc": "喜火/木者乘势而上，色彩可更明亮、大胆",
        "bias": [0, 1],  # 木、火
    },
    "ji_huo": {
        "desc": "忌火（火多）者重在降温与平稳，多用冷色调（水）或大地色（土）化解火气",
        "bias": [2, 4],  # 土、水
    },
}

# 2026 流月动态：按公历月份取当月「季节主五行」与文案侧重（Monthly Bias）
# 春季 2-4 木旺 / 夏季 5-7 火旺 / 秋季 8-10 金旺 / 冬季 11-1 水旺
LIU_YUE_2026 = {
    1: {"season": "冬", "wuxing": 4, "theme": "冬日暖意、静谧温柔", "bias": [4, 2], "colors": "深蓝色、磨砂质感、暖咖色"},
    2: {"season": "春", "wuxing": 0, "theme": "春日生机、万物复苏", "bias": [0], "colors": "绿色系、花卉元素"},
    3: {"season": "春", "wuxing": 0, "theme": "春日生机、万物复苏", "bias": [0], "colors": "绿色系、花卉元素"},
    4: {"season": "春", "wuxing": 0, "theme": "春日生机、万物复苏", "bias": [0], "colors": "绿色系、花卉元素"},
    5: {"season": "夏", "wuxing": 1, "theme": "清凉降温、夏日多巴胺", "bias": [4, 3], "colors": "水/金元素平衡暑气"},
    6: {"season": "夏", "wuxing": 1, "theme": "清凉降温、夏日多巴胺", "bias": [4, 3], "colors": "水/金元素平衡暑气"},
    7: {"season": "夏", "wuxing": 1, "theme": "清凉降温、夏日多巴胺", "bias": [4, 3], "colors": "水/金元素平衡暑气"},
    8: {"season": "秋", "wuxing": 3, "theme": "职场气场、清冷感", "bias": [3], "colors": "金属感、高级白"},
    9: {"season": "秋", "wuxing": 3, "theme": "职场气场、清冷感", "bias": [3], "colors": "金属感、高级白"},
    10: {"season": "秋", "wuxing": 3, "theme": "职场气场、清冷感", "bias": [3], "colors": "金属感、高级白"},
    11: {"season": "冬", "wuxing": 4, "theme": "冬日暖意、静谧温柔", "bias": [4, 2], "colors": "深蓝色、磨砂质感、暖咖色"},
    12: {"season": "冬", "wuxing": 4, "theme": "冬日暖意、静谧温柔", "bias": [4, 2], "colors": "深蓝色、磨砂质感、暖咖色"},
}

# 五行相克：克我者。月五行克喜用 = 冲突（喜用被压制，需化解）
# 即 火克金、金克木、木克土、土克水、水克火 -> KE_WO[我] = 克我的那个
WU_KE_WO = {0: 3, 1: 4, 2: 0, 3: 1, 4: 2}  # 金克木 水克火 木克土 火克金 土克水

def _month_dominates_xiyong(month_wuxing: int, xiyong_list: List[int]) -> bool:
    """当月主五行是否克任一喜用（月克喜用 = 冲突，需平衡化解）"""
    for x in xiyong_list:
        if WU_KE_WO.get(x) == month_wuxing:
            return True
    return False

# 冲突时的「平衡 / 化解」文案（小红书风格）：(当月五行名, 喜用五行名) -> 文案
# 当月火旺克喜用金、当月金旺克喜用木 等
BALANCE_RESOLVE_COPY = {
    ("火", "金"): "本月火气正旺，容易压住你的金气。指尖不妨留一抹「香槟金」或冰透裸色，像给心情镀一层保护膜，既化解燥气，又让贵人与机会更愿意靠近。",
    ("火", "水"): "火旺的月份里，你的水性能量容易被蒸腾。一点「冰透海盐蓝」或雾霾蓝，能悄悄把燥意压下去，在重要场合先稳住心神，判断力也会更清晰。",
    ("火", "木"): "火势渐起，木气易被带旺却也可能过燥。用草木绿、抹茶色小面积点缀即可，既接住春日生机，又不至于心浮气躁，刚刚好。",
    ("火", "土"): "火旺土焦，这个月更需要一点「大地感」来收住火气。裸色、燕麦色、陶土色能给你稳稳的底气，在变动里守住自己的节奏。",
    ("金", "木"): "金气当令，木性容易被克制。指尖一点橄榄绿或抹茶色，像在秋风里留一颗种子，既平衡金木，又为接下来的机会蓄力。",
    ("金", "火"): "金火相克的月份，喜火的你不必硬刚。小面积豆沙红、枫叶红或冰透琥珀，既提气场又不过旺，职场与桃花都能兼顾。",
    ("金", "土"): "金旺土相，用裸色、暖杏色或陶土色来「生金」又稳场，既显高级又不抢戏，适合需要低调发力的场合。",
    ("木", "土"): "木气生发，土性易被疏泄。一点裸色、燕麦色或暖咖能把你拉回地面，在机遇面前更稳、更笃定。",
    ("木", "金"): "木旺的月份，金气容易被耗。香槟金、碎钻银或高级白小面积点缀，既化解木的过散，又提升气场与决断力。",
    ("水", "火"): "水势当令，火气容易被压。若你喜火，小面积豆沙红、琥珀或枫叶红能为你留住暖意与表现力，又不与当月能量硬碰。",
    ("水", "土"): "水旺土湿，用暖咖、陶土色或大地色系来制水稳局，在变动中守住底气与贵人缘。",
    ("土", "水"): "土气厚重，水性能量易被掩住。一点冰透蓝、雾霾蓝或浅灰蓝，能悄悄疏通情绪与思路，让判断和沟通都更顺。",
    ("土", "木"): "土旺的月份，木气需要一点空间。草木绿、抹茶色小面积点缀，既不被土压住，又能带出生机与贵人运。",
}

# 当月与喜用「相生或同气」时的顺势文案（非冲突，可作补充）
HARMONY_COPY = {
    ("春", "木"): "春日木气正旺，与你喜用同频。一抹草木绿或抹茶色，把生机戴在指尖，事业与人际都会更顺。",
    ("夏", "火"): "盛夏火气十足，喜火的你可以大胆用豆沙红、枫叶红或冰透琥珀，乘势而上，气场全开。",
    ("秋", "金"): "金秋与你喜用相合，香槟金、高级白或碎钻银都能为职场与桃花加分，清冷又高级。",
    ("冬", "水"): "冬日水象当令，冰透蓝、雾霾蓝或磨砂深蓝都能为你稳住心神、增强判断，又显白显气质。",
}

# ---------- 优化版长文案：日主象征、月令、推荐色系/款式、避坑 ----------
# 十天干日主象征（剑戟之金、灯烛之火等）
DAY_MASTER_SYMBOL = {
    "甲": "甲木为栋梁之木，正直向上，有担当。",
    "乙": "乙木为花草之木，柔韧细腻，善变通。",
    "丙": "丙火为太阳之火，热情外放，有感染力。",
    "丁": "丁火为灯烛之火，温和持久，内心明亮。",
    "戊": "戊土为城墙之土，厚重稳健，可依靠。",
    "己": "己土为田园之土，包容滋养，温和务实。",
    "庚": "庚金为剑戟之金，刚毅果断，有决断力。",
    "辛": "辛金为珠玉之金，精致内敛，追求完美。",
    "壬": "壬水为江河之水，智慧流动，适应力强。",
    "癸": "癸水为雨露之水，细腻敏感，善于体察。",
}

# 月支 -> 月令简述（生于X月）
ZHI_MONTH_DESC = {
    "寅": "寅月", "卯": "卯月", "辰": "辰月", "巳": "巳月", "午": "午月", "未": "未月",
    "申": "申月", "酉": "酉月", "戌": "戌月", "亥": "亥月", "子": "子月", "丑": "丑月",
}

# 五行 -> 色系名称池（多条可选，按用户与当月组合选用）
WUXING_COLOR_POOL = {
    "水": ["深蓝", "墨蓝", "克莱因蓝", "冰透海盐蓝", "雾霾蓝", "灰蓝", "浅蓝"],
    "木": ["翡翠绿", "森林绿", "薄荷绿", "草木绿", "抹茶色", "橄榄绿", "豆绿"],
    "火": ["豆沙红", "枫叶红", "冰透琥珀", "酒红", "玫红", "橘调红"],
    "土": ["裸色", "燕麦色", "陶土色", "暖咖", "大地色", "米杏色", "焦糖色"],
    "金": ["香槟金", "银色亮片", "高级白", "碎钻银", "裸杏色", "珍珠白", "细闪金"],
}

# 五行 -> 款式池（按季节可选用不同侧重）
WUXING_STYLE_POOL = {
    "水": {
        "春": "水墨晕染、流动线条、清透渐变",
        "夏": "极光猫眼、冰透感、细闪",
        "秋": "磨砂深蓝、法式勾边",
        "冬": "深色磨砂、哑光蓝、层次晕染",
    },
    "木": {
        "春": "手绘植物、花卉元素、清新绿",
        "夏": "薄荷绿跳色、法式留白",
        "秋": "橄榄绿磨砂、金边点缀",
        "冬": "深绿渐变、细线勾边",
    },
    "火": {
        "春": "小面积红、细线勾边",
        "夏": "冰透红、渐变、避免全手浓红",
        "秋": "豆沙红、枫叶红局部",
        "冬": "酒红、暖调红点缀",
    },
    "土": {
        "春": "裸色打底、浅咖点缀",
        "夏": "燕麦色、清透裸",
        "秋": "陶土色、大地色法式",
        "冬": "暖咖磨砂、金箔点缀",
    },
    "金": {
        "春": "香槟金点缀、银色勾边",
        "夏": "细闪、贝壳片、清透金",
        "秋": "金属感法式、高级白",
        "冬": "金箔、珍珠白、猫眼",
    },
}


@dataclass
class BaziPillar:
    """单柱：天干 + 地支"""
    gan: str
    zhi: str

    def wuxing_gan(self) -> int:
        idx = TIAN_GAN.index(self.gan) if self.gan in TIAN_GAN else 0
        return GAN_TO_WUXING[idx]

    def wuxing_zhi(self) -> int:
        idx = DI_ZHI.index(self.zhi) if self.zhi in DI_ZHI else 0
        return ZHI_TO_WUXING[idx]

    def to_str(self) -> str:
        return f"{self.gan}{self.zhi}"


@dataclass
class BaziResult:
    """八字四柱"""
    year: BaziPillar
    month: BaziPillar
    day: BaziPillar
    hour: BaziPillar

    def day_master_gan(self) -> str:
        """日主 = 日柱天干"""
        return self.day.gan

    def day_master_wuxing(self) -> int:
        """日主五行"""
        return self.day.wuxing_gan()

    def to_list(self) -> List[BaziPillar]:
        return [self.year, self.month, self.day, self.hour]


def _count_wuxing(bazi: BaziResult) -> List[int]:
    """统计八字中金木水火土各自数量（天干+地支均计）"""
    counts = [0, 0, 0, 0, 0]
    for pillar in bazi.to_list():
        counts[pillar.wuxing_gan()] += 1
        counts[pillar.wuxing_zhi()] += 1
    return counts


def _month_strength(day_wuxing: int, month_zhi: str) -> float:
    """
    月令对日主的得令程度（简化）：
    寅卯月木旺，巳午月火旺，申酉月金旺，亥子月水旺，辰戌丑未土旺。
    得令则身强，失令则身弱；同五行=得令。
    """
    zhi_to_wu = {"寅": 0, "卯": 0, "辰": 2, "巳": 1, "午": 1, "未": 2, "申": 3, "酉": 3, "戌": 2, "亥": 4, "子": 4, "丑": 2}
    month_wu = zhi_to_wu.get(month_zhi, 2)
    if day_wuxing == month_wu:
        return 1.2  # 得令
    # 生我：月令生日主 -> 得生
    sheng_wo = {0: [4], 1: [0], 2: [1], 3: [2], 4: [3]}  # 水生木 木生火 火生土 土生金 金生水
    if month_wu in sheng_wo.get(day_wuxing, []):
        return 1.0
    return 0.6  # 失令或克


def _infer_shen_qiang(bazi: BaziResult) -> Literal["强", "弱"]:
    """
    身强/身弱（简化判定）：
    看日主五行在八字中的占比 + 月令是否得令。
    """
    counts = _count_wuxing(bazi)
    day_wu = bazi.day_master_wuxing()
    month_zhi = bazi.month.zhi
    ms = _month_strength(day_wu, month_zhi)
    total = sum(counts)
    ratio = counts[day_wu] / total if total else 0
    # 得令且占比不低 -> 身强；失令或占比低 -> 身弱
    score = ratio * 10 + ms
    return "强" if score >= 2.5 else "弱"


def _get_xiyong_shen(bazi: BaziResult, shen_qiang: Literal["强", "弱"]) -> List[int]:
    """
    喜用神：身强喜克泄耗（官杀、食伤、财），身弱喜生扶（印、比劫）。
    此处简化为「五行」维度：身强则喜克我、我生、我克；身弱则喜生我、同我。
    返回喜用神对应的五行下标列表，按优先级排序。
    """
    day_wu = bazi.day_master_wuxing()
    # 五行关系：0木 1火 2土 3金 4水
    # 生我(印)、同我(比劫)、我生(食伤)、我克(财)、克我(官杀)
    sheng_wo = {0: [4], 1: [0], 2: [1], 3: [2], 4: [3]}
    tong_wo = [day_wu]
    wo_sheng = {0: [1], 1: [2], 2: [3], 3: [4], 4: [0]}
    wo_ke = {0: [2], 1: [3], 2: [4], 3: [0], 4: [1]}
    ke_wo = {0: [3], 1: [4], 2: [0], 3: [1], 4: [2]}

    if shen_qiang == "强":
        # 喜克、泄、耗
        prefer = list(ke_wo.get(day_wu, [])) + list(wo_sheng.get(day_wu, [])) + list(wo_ke.get(day_wu, []))
    else:
        # 喜生、扶
        prefer = list(sheng_wo.get(day_wu, [])) + list(tong_wo)
    return list(dict.fromkeys(prefer))  # 去序保顺序


def _current_month_ganzhi(month: int) -> str:
    """
    当前访问月份对应的 2026 年月柱。
    优先用 lunar-python 按节气取当月月柱（以该月 15 日八字月柱为准）；失败则用查表。
    """
    try:
        from lunar_python import Solar
        solar = Solar.fromYmdHms(2026, month, 15, 12, 0, 0)
        lunar = solar.getLunar()
        eight_char = lunar.getEightChar()
        m = eight_char.getMonth()
        if m and len(str(m)) >= 2:
            s = m if isinstance(m, str) else "".join(str(x) for x in m)
            return s[:2]
    except Exception:
        pass
    return MONTH_GAN_ZHI_2026.get(month, "庚寅")


def _month_ganzhi_to_wuxing(ganzhi: str) -> List[int]:
    """月柱干支 -> 主要五行（用于月度能量）"""
    if len(ganzhi) != 2:
        return []
    g, z = ganzhi[0], ganzhi[1]
    gi = TIAN_GAN.index(g) if g in TIAN_GAN else 0
    zi = DI_ZHI.index(z) if z in DI_ZHI else 0
    return [GAN_TO_WUXING[gi], ZHI_TO_WUXING[zi]]


def _weighted_color_scores(
    xiyong: List[int],
    liu_nian_wuxing: int,
    month_wuxing: List[int],
    current_month: int,
) -> List[float]:
    """
    综合判定：喜用神 + 流年能量中和 + 当前月(current_month)二次加权。
    - 喜用神：权重最高
    - 2026 火旺：水、金中和流年
    - 当月干支五行：月度运势加持
    - 流月逻辑表 LIU_YUE_2026：当月季节主五行与 bias 二次加权
    - 若当月主五行克喜用（冲突）：对「能化解当月」的五行加分
    """
    scores = [0.0, 0.0, 0.0, 0.0, 0.0]
    for i in xiyong:
        scores[i] += 1.5
    scores[4] += 0.8
    scores[3] += 0.4
    for w in month_wuxing:
        scores[w] += 0.5
    yue = LIU_YUE_2026.get(current_month, LIU_YUE_2026.get(2))
    if yue:
        month_dominant = yue["wuxing"]
        for b in yue.get("bias", []):
            scores[b] += 0.6
        if _month_dominates_xiyong(month_dominant, xiyong):
            ke_yue = {1: [4], 4: [2], 2: [0], 0: [3], 3: [1]}
            for w in ke_yue.get(month_dominant, []):
                scores[w] += 0.9
    return scores


def _pillar_from_char(eight_char, method: str, default: str = "戊子") -> BaziPillar:
    """从 EightChar 的 getYear/getMonth/getDay/getTime 取干支，兼容返回 str 或两元组。"""
    getter = getattr(eight_char, method, None)
    if not getter:
        g, z = default[0], default[1]
        return BaziPillar(g, z)
    val = getter()
    if not val:
        g, z = default[0], default[1]
        return BaziPillar(g, z)
    s = val if isinstance(val, str) else "".join(str(x) for x in val)
    if len(s) >= 2:
        return BaziPillar(s[0], s[1])
    return BaziPillar(default[0], default[1])


def get_bazi_from_solar(year: int, month: int, day: int, hour: int = 0) -> BaziResult:
    """
    由公历年月日时得到八字四柱。
    使用 lunar-python：公历 -> 农历 -> 八字（EightChar）。
    """
    try:
        from lunar_python import Solar
        solar = Solar.fromYmdHms(year, month, day, hour or 12, 0, 0)
        lunar = solar.getLunar()
        eight_char = lunar.getEightChar()
        return BaziResult(
            year=_pillar_from_char(eight_char, "getYear", "丙午"),
            month=_pillar_from_char(eight_char, "getMonth", "庚寅"),
            day=_pillar_from_char(eight_char, "getDay", "甲子"),
            hour=_pillar_from_char(eight_char, "getTime", "戊子"),
        )
    except ImportError:
        try:
            from lunar import Solar
            solar = Solar.fromYmdHms(year, month, day, hour or 12, 0, 0)
            lunar = solar.getLunar()
            eight_char = lunar.getEightChar()
            return BaziResult(
                year=_pillar_from_char(eight_char, "getYear", "丙午"),
                month=_pillar_from_char(eight_char, "getMonth", "庚寅"),
                day=_pillar_from_char(eight_char, "getDay", "甲子"),
                hour=_pillar_from_char(eight_char, "getTime", "戊子"),
            )
        except Exception as e2:
            raise RuntimeError(f"八字排盘失败，请安装 lunar-python: pip install lunar-python。{e2}") from e2
    except Exception as e:
        raise RuntimeError(f"八字排盘失败，请确认 lunar-python 已安装且 API 一致: {e}") from e


def get_bazi_from_lunar(year: int, month: int, day: int, hour: int = 0) -> BaziResult:
    """由农历年月日时得到八字。"""
    try:
        from lunar_python import Lunar
        lunar = Lunar.fromYmdHms(year, month, day, hour or 12, 0, 0)
        eight_char = lunar.getEightChar()
        return BaziResult(
            year=_pillar_from_char(eight_char, "getYear", "丙午"),
            month=_pillar_from_char(eight_char, "getMonth", "庚寅"),
            day=_pillar_from_char(eight_char, "getDay", "甲子"),
            hour=_pillar_from_char(eight_char, "getTime", "戊子"),
        )
    except ImportError:
        try:
            from lunar import Lunar
            lunar = Lunar.fromYmdHms(year, month, day, hour or 12, 0, 0)
            eight_char = lunar.getEightChar()
            return BaziResult(
                year=_pillar_from_char(eight_char, "getYear", "丙午"),
                month=_pillar_from_char(eight_char, "getMonth", "庚寅"),
                day=_pillar_from_char(eight_char, "getDay", "甲子"),
                hour=_pillar_from_char(eight_char, "getTime", "戊子"),
            )
        except Exception as e2:
            raise RuntimeError(f"农历八字排盘失败: {e2}") from e2
    except Exception as e:
        raise RuntimeError(f"农历八字排盘失败: {e}") from e


@dataclass
class NailRecommendationInput:
    """前端传入的计算入参"""
    birth_year: int
    birth_month: int
    birth_day: int
    birth_hour: Optional[int] = None  # None 表示「不清楚出生时间」，默认午时 12
    use_lunar: bool = False
    current_month: Optional[int] = None  # 访问月份，默认用系统当前月


@dataclass
class NailRecommendationOutput:
    """返回给前端的完整结果"""
    bazi_str: List[str]
    day_master: str
    day_master_wuxing: str
    shen_qiang: Literal["强", "弱"]
    wuxing_counts: List[int]
    wuxing_ratios: List[float]
    xiyong_shen: List[str]
    current_month_ganzhi: str
    month_luck_keyword: str
    color_scores: List[float]
    recommended_elements: List[str]
    nail_description: str
    nail_copy_by_element: List[dict]
    # 优化版长文案（参考格式）
    report_intro: str  # 根据你的出生时间...日主为X。X为剑戟之金...
    pattern_brief: List[str]  # 命理格局简析 三条
    month_nail_intro: str  # 本月运势与美甲建议 总述
    recommendations: List[dict]  # [{ element, colorNames, symbolMeaning, styleSuggest }]
    design_balance_tip: str  # 设计建议：平衡与能量
    avoid_guide: str  # 避坑指南


def _month_luck_keyword(month: int, month_ganzhi: str, yue_theme: Optional[str] = None) -> str:
    """月度开运词：优先用流月逻辑表 LIU_YUE_2026 的 theme，保持小红书风格"""
    if yue_theme:
        return f"{month}月{month_ganzhi}·{yue_theme}"
    fallback = {
        1: "正月·寒冬藏秀，宜静养与规划",
        2: "二月·草木萌发，利事业机遇",
        3: "三月·春暖花开，利人际与桃花",
        4: "四月·阳气渐盛，利进取与表达",
        5: "五月·火旺土相，宜稳中求进",
        6: "六月·盛夏繁茂，利合作与收获",
        7: "七月·金气初生，利决断与收尾",
        8: "八月·秋高气爽，利学习与远行",
        9: "九月·土旺金相，宜守成与积累",
        10: "十月·水气渐起，利思考与复盘",
        11: "冬月·藏纳之时，宜休养与内省",
        12: "腊月·辞旧迎新，利总结与祈福",
    }
    return fallback.get(month, "当月·顺应天时，从容前行")


def _get_balance_copy_for_month(
    current_month: int, xiyong: List[int], month_dominant_wuxing: int
) -> Tuple[bool, List[dict]]:
    """
    若当月主五行克喜用（冲突），返回 (True, 平衡/化解文案列表)；否则 (False, [])。
    文案为小红书风格，体现「平衡」与「化解」。
    """
    if not _month_dominates_xiyong(month_dominant_wuxing, xiyong):
        return False, []
    month_name = WUXING_NAMES[month_dominant_wuxing]
    out = []
    for xi in xiyong:
        xi_name = WUXING_NAMES[xi]
        key = (month_name, xi_name)
        copy = BALANCE_RESOLVE_COPY.get(key)
        if copy:
            out.append({"element": xi_name, "copy": copy, "is_balance": True})
    return True, out


# ---------- 情绪化文案库：五行 -> 美甲色与情绪价值 ----------
NAIL_COPY_BY_WUXING = {
    "水": "你本月需要一点「冰透克莱因蓝」或雾霾蓝来平复内心火气，这抹蓝色能为你带来冷静的判断力，助你避开职场口舌，在重要决策前先稳住心神。",
    "金": "一抹「香槟金」或裸杏色能为你收敛 2026 年的燥气，既显高级又不抢戏，适合需要低调发力的场合，让贵人更愿意靠近。",
    "木": "草木绿、橄榄绿或抹茶色能唤醒你的生机与贵人缘，尤其利事业机遇与人际，指尖一点绿，仿佛把二月萌发的能量戴在身上。",
    "火": "若命局喜火，可小面积用「豆沙红」「枫叶红」或冰透琥珀，为气场加分而不至于过旺，适合需要表现力与桃花的人。",
    "土": "裸色、燕麦色、陶土色能给你稳稳的底气，适合想稳中求进的月份，既不张扬又显质感，利守成与积累。",
}


def _nail_description_from_elements(elements: List[str], xiyong: List[str]) -> str:
    """根据推荐五行生成美甲方案描述（情绪化文案）"""
    if not elements:
        return "建议选择与您喜用神相合的冰透色系，既显气质又助运势。"
    parts = []
    for el in elements[:2]:
        copy = NAIL_COPY_BY_WUXING.get(el)
        if copy:
            parts.append(copy)
    if not parts:
        el = "、".join(elements)
        return f"本月推荐以「{el}」为基调的美甲，色系与您的喜用神及流年、月运相合，可选用冰透或莫兰迪质感，既衬肤色又添开运气场。"
    return " ".join(parts)


def _pick_colors_for_element(element: str, season: str, month_dominant_idx: int) -> str:
    """按五行 + 季节/当月取 2～4 个色系名，适配用户而非固定句。"""
    pool = WUXING_COLOR_POOL.get(element, [])
    if not pool:
        return ""
    # 季节偏好：夏偏清透(前段)、冬偏深/暖(后段)、春秋折中
    if season == "夏" and len(pool) >= 4:
        return "、".join(pool[2:5])  # 如冰透、雾霾、灰蓝
    if season == "冬" and len(pool) >= 4:
        return "、".join(pool[0:3])   # 如深蓝、墨蓝、克莱因蓝
    return "、".join(pool[:4])


def _style_suggest_for(element: str, season: str) -> str:
    """按五行 + 季节取建议款式，适配当月。"""
    by_el = WUXING_STYLE_POOL.get(element, {})
    s = season if season else "春"
    return by_el.get(s, by_el.get("春", "法式、磨砂或细闪点缀，贴合当季气质。"))


def _symbol_meaning_for(
    day_wuxing_idx: int,
    rec_element: str,
    month_dominant_idx: int,
    season: str,
    is_conflict: bool,
    xiyong_names: List[str],
) -> str:
    """
    根据日主五行、推荐元素、当月主五行、是否冲突，生成该条推荐的象征意义（适配用户）。
    """
    day_name = WUXING_NAMES[day_wuxing_idx]
    month_name = WUXING_NAMES[month_dominant_idx] if 0 <= month_dominant_idx < 5 else ""
    # 日主生推荐 -> 泄秀/发挥
    sheng_wo_out = {0: [1], 1: [2], 2: [3], 3: [4], 4: [0]}
    rec_idx = WUXING_NAMES.index(rec_element) if rec_element in WUXING_NAMES else -1
    if rec_idx < 0:
        return f"{rec_element}为你的喜用之一，用对应色系能调和命局、利运势。"
    if day_wuxing_idx in sheng_wo_out and rec_idx in sheng_wo_out.get(day_wuxing_idx, []):
        return f"日主{day_name}生{rec_element}，泄秀发挥。用{rec_element}色系能缓解压力、利思路与表达，本月更顺遂。"
    # 推荐生日主 -> 得生/贵人
    sheng_wo_in = {0: [4], 1: [0], 2: [1], 3: [2], 4: [3]}
    if rec_idx in sheng_wo_in.get(day_wuxing_idx, []):
        return f"{rec_element}生{day_name}，为印星加持。用{rec_element}色系能稳心神、增贵人缘，利学习与决策。"
    # 推荐为日主之财（日主克推荐）
    wo_ke = {0: [2], 1: [3], 2: [4], 3: [0], 4: [1]}
    if rec_idx in wo_ke.get(day_wuxing_idx, []):
        return f"{rec_element}为日主之财，本月{rec_element}气当令时更利求财与人际；色系呼应财星，助把握机会。"
    # 推荐克日主 -> 官杀，压力与机会
    if WU_KE_WO.get(day_wuxing_idx) == rec_idx:
        return f"本月{month_name}气较旺，{rec_element}色系可小面积使用，既接住事业机会又不过压，平衡为佳。"
    # 同五行
    if day_wuxing_idx == rec_idx:
        return f"与日主同属{rec_element}，守护本源。用{rec_element}色系增强自信与决断力，利气场。"
    if is_conflict:
        return f"本月流月与喜用略有相克，用{rec_element}色系可通关平衡、化解压力，利求财与人际。"
    return f"{rec_element}为你的喜用，用对应色系能调和命局、贴合本月能量，利运势。"


def _design_balance_tip_for(
    recommended: List[str],
    season: str,
    month_dominant_idx: int,
    is_conflict: bool,
) -> str:
    """根据用户推荐五行、季节、当月主五行，生成设计建议（配色与注意），不照抄固定句。"""
    fire_wuxing = 1
    year_fire = LIU_NIAN_2026["wuxing"] == fire_wuxing
    month_fire = month_dominant_idx == fire_wuxing
    parts = []
    if year_fire or month_fire:
        parts.append("2026 年为丙午火旺之年，当前月又带火气时，过多正红色易让情绪急躁。")
    # 用用户实际推荐五行组搭配句
    if len(recommended) >= 2:
        a, b = recommended[0], recommended[1]
        colors_a = WUXING_COLOR_POOL.get(a, [])
        colors_b = WUXING_COLOR_POOL.get(b, [])
        ca = colors_a[0] if colors_a else a + "色"
        cb = colors_b[0] if colors_b else b + "色"
        parts.append(f"建议采用「{a}{b}相生」的配色，例如 {ca} 为基底、{cb} 点缀或做晕染，既平衡又利运势。")
    elif len(recommended) == 1:
        r = recommended[0]
        colors = WUXING_COLOR_POOL.get(r, [])
        c = colors[0] if colors else r + "色"
        parts.append(f"本月以{r}色系为主即可，如 {c} 打底再搭配细闪或法式边，既显气质又贴合喜用。")
    if season == "冬":
        parts.append("当前冬月水气当令，可适当用深色或磨砂质感、暖咖点缀，平衡冷暖。")
    if is_conflict:
        parts.append("本月流月与喜用略有相克，配色上以「通关」「平衡」为主，避免与当月旺相硬碰。")
    return " ".join(parts) if parts else "配色上以你喜用五行对应的色系为主，兼顾当季与当月能量即可。"


def _avoid_guide_for(
    day_gan: str,
    day_wuxing_name: str,
    xiyong: List[int],
    recommended: List[str],
    yue: dict,
) -> str:
    """根据日主、喜用、推荐、当月，生成避坑指南（只写与用户相关的）。"""
    parts = []
    # 金日主：土多金埋
    if day_wuxing_name == "金":
        parts.append("避免大面积的土黄色或咖啡色（土多金埋，易觉思路不清晰、效率低下）。")
    # 流年/当月火旺，且用户并非以火为主推或火非喜用前排时，提醒少用整手正红
    fire_idx = 1
    year_fire = LIU_NIAN_2026["wuxing"] == fire_idx
    month_fire = yue.get("wuxing") == fire_idx
    if (year_fire or month_fire) and (fire_idx not in xiyong or "火" not in recommended[:2]):
        parts.append("避免整手正红或橙红（本年本月火气已足，过多烈火易情绪急躁、睡眠不稳）。")
    # 当月旺的五行若克用户喜用，可提醒少用该五行大面积色
    month_dom = yue.get("wuxing", -1)
    if month_dom >= 0 and _month_dominates_xiyong(month_dom, xiyong):
        w_name = WUXING_NAMES[month_dom]
        avoid_colors = {"火": "正红、橙红", "土": "土黄、咖啡", "金": "大面积金属色", "木": "全手浓绿", "水": "全手深蓝黑"}
        color_desc = avoid_colors.get(w_name, "")
        if color_desc:
            parts.append(f"本月{w_name}气较旺且克你喜用，建议避免大面积的{color_desc}，以免加重相克。")
    # 材质：按日主
    if day_gan in ("庚", "辛"):
        parts.append("材质上建议增加光泽感（如猫眼、贝壳片、细闪），金日主喜光，能增强贵人运。")
    else:
        parts.append("材质上可选用猫眼、极光或磨砂质感，既显高级又利气场。")
    return " ".join(parts)


def _build_report_sections(
    bazi: BaziResult,
    shen_qiang: Literal["强", "弱"],
    xiyong: List[int],
    current_month: int,
    month_ganzhi: str,
    yue_cfg: Optional[dict],
    recommended: List[str],
    is_conflict: bool,
) -> Tuple[str, List[str], str, List[dict], str, str]:
    """
    生成优化版长文案：所有句子均根据用户日主、喜用、当月、推荐五行动态生成，不照抄固定参考句。
    """
    day_gan = bazi.day_master_gan()
    day_wuxing_idx = bazi.day_master_wuxing()
    day_wuxing_name = WUXING_NAMES[day_wuxing_idx]
    month_zhi = bazi.month.zhi
    month_desc = ZHI_MONTH_DESC.get(month_zhi, month_zhi + "月")
    yue = yue_cfg or {}
    season = yue.get("season", "春")
    month_dominant = yue.get("wuxing", 0)

    symbol = DAY_MASTER_SYMBOL.get(day_gan, f"{day_gan}{day_wuxing_name}，与你命局相合。")
    report_intro = f"根据你的出生时间和当前的干支能量，你的八字日主（核心能量）为 {day_gan}{day_wuxing_name}。{symbol}"

    xiyong_str = "、".join(WUXING_NAMES[i] for i in xiyong)
    shen_desc = "身强之格" if shen_qiang == "强" else "身弱之格"
    pattern_brief = [
        f"日主：{day_gan}{day_wuxing_name}（生于{month_desc}，{shen_desc}）。",
        f"五行喜忌：{shen_desc}，最喜 {xiyong_str} 来调和命局。",
        f"当前月份：2026年{current_month}月为 {month_ganzhi}月（{yue.get('theme', '当月能量')}）。",
    ]

    if is_conflict:
        month_nail_intro = (
            f"本月{month_ganzhi}与你的喜用略有相克，美甲设计逻辑应以「通关」和「平衡」为主，"
            "用对色系既能化解流月压力，又能稳住气场、利求财与人际。"
        )
    else:
        month_nail_intro = (
            f"本月{month_ganzhi}（{yue.get('theme', '')}），与你的喜用相呼应。"
            "美甲建议以「顺势」和「生旺」为主，用色系加持本月运势。"
        )

    xiyong_names = [WUXING_NAMES[i] for i in xiyong]
    recommendations = []
    for el in recommended[:3]:
        color_names = _pick_colors_for_element(el, season, month_dominant)
        symbol_meaning = _symbol_meaning_for(
            day_wuxing_idx, el, month_dominant, season, is_conflict, xiyong_names
        )
        style_suggest = _style_suggest_for(el, season)
        recommendations.append({
            "element": el,
            "colorNames": color_names,
            "symbolMeaning": symbol_meaning,
            "styleSuggest": style_suggest,
        })

    design_balance_tip = _design_balance_tip_for(
        recommended, season, month_dominant, is_conflict
    )
    avoid_guide = _avoid_guide_for(
        day_gan, day_wuxing_name, xiyong, recommended, yue
    )
    return report_intro, pattern_brief, month_nail_intro, recommendations, design_balance_tip, avoid_guide


def compute_nail_recommendation(inp: NailRecommendationInput) -> NailRecommendationOutput:
    """
    核心计算入口：精准测算 + 动态时空结合 + 综合判定。

    逻辑链：
    1. 出生时间 -> 八字（lunar-python）
    2. 八字 -> 五行统计、日主、身强身弱、喜用神
    3. 2026 丙午年 + 当前月干支 -> 流年与月度能量
    4. 喜用神 + 流年中和 + 月度加持 -> 加权得分 -> 推荐色系与美甲方案
    """
    hour = inp.birth_hour if inp.birth_hour is not None else 12
    if inp.use_lunar:
        bazi = get_bazi_from_lunar(inp.birth_year, inp.birth_month, inp.birth_day, hour)
    else:
        bazi = get_bazi_from_solar(inp.birth_year, inp.birth_month, inp.birth_day, hour)

    shen_qiang = _infer_shen_qiang(bazi)
    xiyong = _get_xiyong_shen(bazi, shen_qiang)
    counts = _count_wuxing(bazi)
    total = sum(counts) or 1
    ratios = [c / total for c in counts]

    now = datetime.now()
    current_month = inp.current_month if inp.current_month is not None else now.month
    month_ganzhi = _current_month_ganzhi(current_month)
    month_wuxing = _month_ganzhi_to_wuxing(month_ganzhi)
    yue_cfg = LIU_YUE_2026.get(current_month, LIU_YUE_2026.get(2))
    month_dominant = yue_cfg["wuxing"] if yue_cfg else 0
    yue_theme = yue_cfg.get("theme", "") if yue_cfg else ""

    color_scores = _weighted_color_scores(
        xiyong, LIU_NIAN_2026["wuxing"], month_wuxing, current_month
    )
    indexed = [(i, s) for i, s in enumerate(color_scores)]
    indexed.sort(key=lambda x: -x[1])
    recommended = [WUXING_NAMES[i] for i, _ in indexed[:2] if color_scores[i] > 0]

    is_conflict, balance_list = _get_balance_copy_for_month(
        current_month, xiyong, month_dominant
    )
    nail_copy_by_element = []
    if is_conflict and balance_list:
        for item in balance_list[:2]:
            nail_copy_by_element.append({"element": item["element"], "copy": item["copy"]})
    seen = {item["element"] for item in nail_copy_by_element}
    for el in recommended:
        if el in seen:
            continue
        copy = NAIL_COPY_BY_WUXING.get(el, "")
        if copy:
            nail_copy_by_element.append({"element": el, "copy": copy})
            seen.add(el)

    nail_desc = _nail_description_from_elements(recommended, [WUXING_NAMES[i] for i in xiyong])
    if is_conflict and balance_list:
        balance_lead = "本月流月与你的喜用略有相克，指尖用对颜色能平衡化解、稳住气场。"
        nail_desc = balance_lead + " " + nail_desc

    report_intro, pattern_brief, month_nail_intro, recommendations, design_balance_tip, avoid_guide = _build_report_sections(
        bazi, shen_qiang, xiyong, current_month, month_ganzhi, yue_cfg,
        recommended, is_conflict,
    )

    return NailRecommendationOutput(
        bazi_str=[p.to_str() for p in bazi.to_list()],
        day_master=bazi.day_master_gan(),
        day_master_wuxing=WUXING_NAMES[bazi.day_master_wuxing()],
        shen_qiang=shen_qiang,
        wuxing_counts=counts,
        wuxing_ratios=ratios,
        xiyong_shen=[WUXING_NAMES[i] for i in xiyong],
        current_month_ganzhi=month_ganzhi,
        month_luck_keyword=_month_luck_keyword(current_month, month_ganzhi, yue_theme),
        color_scores=color_scores,
        recommended_elements=recommended,
        nail_description=nail_desc,
        nail_copy_by_element=nail_copy_by_element,
        report_intro=report_intro,
        pattern_brief=pattern_brief,
        month_nail_intro=month_nail_intro,
        recommendations=recommendations,
        design_balance_tip=design_balance_tip,
        avoid_guide=avoid_guide,
    )


# ---------- 供 Next.js API 或子进程调用的简易接口 ----------
def run_from_dict(params: dict) -> dict:
    """
    接收前端 JSON：birth_year, birth_month, birth_day, birth_hour?, use_lunar?, current_month?
    返回可 JSON 序列化的结果字典。
    """
    inp = NailRecommendationInput(
        birth_year=int(params["birth_year"]),
        birth_month=int(params["birth_month"]),
        birth_day=int(params["birth_day"]),
        birth_hour=params.get("birth_hour"),
        use_lunar=bool(params.get("use_lunar", False)),
        current_month=params.get("current_month"),
    )
    out = compute_nail_recommendation(inp)
    return {
        "baziStr": out.bazi_str,
        "dayMaster": out.day_master,
        "dayMasterWuxing": out.day_master_wuxing,
        "shenQiang": out.shen_qiang,
        "wuxingCounts": out.wuxing_counts,
        "wuxingRatios": out.wuxing_ratios,
        "xiyongShen": out.xiyong_shen,
        "currentMonthGanzhi": out.current_month_ganzhi,
        "monthLuckKeyword": out.month_luck_keyword,
        "colorScores": out.color_scores,
        "recommendedElements": out.recommended_elements,
        "nailDescription": out.nail_description,
        "nailCopyByElement": out.nail_copy_by_element,
        "reportIntro": out.report_intro,
        "patternBrief": out.pattern_brief,
        "monthNailIntro": out.month_nail_intro,
        "recommendations": out.recommendations,
        "designBalanceTip": out.design_balance_tip,
        "avoidGuide": out.avoid_guide,
    }
