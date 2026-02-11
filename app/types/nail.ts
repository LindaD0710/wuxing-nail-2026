export type NailRecommendationResult = {
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
  reportIntro?: string;
  patternBrief?: string[];
  monthNailIntro?: string;
  recommendations?: {
    element: string;
    colorNames: string;
    symbolMeaning: string;
    styleSuggest: string;
  }[];
  designBalanceTip?: string;
  avoidGuide?: string;
};

export const WUXING_LABELS = ["木", "火", "土", "金", "水"] as const;
export const WUXING_COLORS = [
  "rgb(101, 163, 101)",   // 木 绿
  "rgb(220, 100, 90)",    // 火 红
  "rgb(180, 150, 120)",   // 土 土黄
  "rgb(200, 170, 120)",   // 金 金
  "rgb(100, 150, 200)",   // 水 蓝
] as const;
