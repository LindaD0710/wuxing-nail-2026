"use client";

import { useState } from "react";
import type { NailRecommendationResult } from "@/app/types/nail";
import WuxingRadar from "@/app/components/WuxingRadar";
import PerceivingOverlay from "@/app/components/PerceivingOverlay";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const currentDay = new Date().getDate();

export default function Home() {
  const [view, setView] = useState<"form" | "result">("form");
  const [result, setResult] = useState<NailRecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [birthYear, setBirthYear] = useState(1995);
  const [birthMonth, setBirthMonth] = useState(5);
  const [birthDay, setBirthDay] = useState(15);
  const [birthTime, setBirthTime] = useState<string>("");
  const [showConsultModal, setShowConsultModal] = useState(false);

  const getColorSwatchStyle = (label: string): React.CSSProperties => {
    const name = label.trim();
    if (!name) {
      return {
        background: "radial-gradient(circle at 30% 20%, #fff8ec, #d3b27a)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.8), 0 0 8px rgba(180,150,90,0.45)",
      };
    }
    if (name.includes("琥珀")) {
      return {
        background: "radial-gradient(circle at 30% 20%, #ffe9c8, #c88932)",
        boxShadow:
          "0 0 0 1px rgba(255,252,245,0.85), 0 0 8px rgba(180,120,40,0.5)",
      };
    }
    if (name.includes("香槟")) {
      return {
        background: "radial-gradient(circle at 30% 20%, #fff9ea, #e0c58a)",
        boxShadow:
          "0 0 0 1px rgba(255,252,245,0.9), 0 0 8px rgba(190,150,70,0.5)",
      };
    }
    if (name.includes("银") || name.includes("亮片") || name.includes("碎钻")) {
      return {
        background: "radial-gradient(circle at 30% 20%, #fdfdfd, #d0d4de)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.9), 0 0 8px rgba(180,188,210,0.6)",
      };
    }
    if (name.includes("白")) {
      return {
        background: "radial-gradient(circle at 30% 20%, #ffffff, #f0f0f0)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.95), 0 0 8px rgba(210,210,210,0.6)",
      };
    }
    if (name.includes("裸粉") || name.includes("豆沙") || name.includes("粉")) {
      return {
        background: "radial-gradient(circle at 30% 20%, #ffefe9, #d89a8a)",
        boxShadow:
          "0 0 0 1px rgba(255,252,250,0.9), 0 0 8px rgba(196,134,120,0.45)",
      };
    }
    if (name.includes("奶油") || name.includes("米白")) {
      return {
        background: "radial-gradient(circle at 30% 20%, #fffaf0, #e6cfaa)",
        boxShadow:
          "0 0 0 1px rgba(255,252,245,0.9), 0 0 8px rgba(204,170,120,0.4)",
      };
    }
    if (name.includes("焦糖") || name.includes("棕")) {
      return {
        background: "radial-gradient(circle at 30% 20%, #ffe7d2, #9c6234)",
        boxShadow:
          "0 0 0 1px rgba(255,248,240,0.85), 0 0 8px rgba(130,80,44,0.5)",
      };
    }
    if (name.includes("金") || name.includes("铜")) {
      return {
        background: "radial-gradient(circle at 30% 20%, #fff8e3, #c99a3a)",
        boxShadow:
          "0 0 0 1px rgba(255,252,245,0.9), 0 0 8px rgba(190,140,55,0.55)",
      };
    }
    if (
      name.includes("克莱因") ||
      name.includes("深蓝") ||
      name.includes("墨蓝") ||
      name.includes("海盐") ||
      name.includes("蓝")
    ) {
      return {
        background: "radial-gradient(circle at 30% 20%, #e0ecff, #3055b5)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.9), 0 0 8px rgba(70,110,190,0.55)",
      };
    }
    return {
      background: "radial-gradient(circle at 30% 20%, #fff8ec, #d3b27a)",
      boxShadow:
        "0 0 0 1px rgba(255,252,245,0.8), 0 0 8px rgba(184,145,85,0.45)",
    };
  };

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/nail-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birth_year: birthYear,
          birth_month: birthMonth,
          birth_day: birthDay,
          birth_hour: birthTime ? parseInt(birthTime.split(":")[0], 10) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || data?.detail || "请求失败");
        return;
      }
      setResult(data as NailRecommendationResult);
      setView("result");
    } catch (e) {
      setError("网络或服务异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (view === "result" && result) {
    const monthKeywordDisplay =
      (result.monthLuckKeyword?.split("·").slice(-1)[0] || result.monthLuckKeyword || "").trim();

    return (
      <main className="min-h-screen result-page-bg text-mystic-deep overflow-y-auto flex flex-col pb-[env(safe-area-inset-bottom,0)]">
        <h1 className="animate-fade-in-up text-lg sm:text-2xl font-title text-[#8B5E3C] text-center py-4 tracking-[0.1em] sm:tracking-[0.12em] shrink-0">
          2026开运美甲
        </h1>
        <p className="font-sans text-center text-[11px] sm:text-xs text-morandi-dust italic tracking-[0.32em] mb-3">
          —— 你的专属指尖能量报告 ——
        </p>

        {/* 三段卡片：能量罗盘 / 当月运势 / 灵感指尖方案 */}
        <div className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 pb-8 space-y-6">
          {/* 卡片 A：能量罗盘 */}
          <section
            className="animate-fade-in-up animate-fade-in-up-delay-1"
            aria-label="能量罗盘"
          >
            <div className="glass-card rounded-2xl px-5 py-5 sm:px-6 sm:py-6 space-y-3.5">
              <h2 className="font-title text-[#8B5E3C] text-[17px] sm:text-lg tracking-normal leading-tight">
                能量罗盘
              </h2>

              <div className="mt-3 space-y-2">
                <p className="font-label text-[10px] text-[#8B5E3C] tracking-[0.2em] uppercase">
                  您的八字
                </p>
                <p className="numeric-text text-[24px] sm:text-[24px] font-semibold tracking-normal text-[#8B5E3C] break-all leading-[1.6] text-center">
                  {result.baziStr.join(" ")}
                </p>
              </div>

              {result.patternBrief && result.patternBrief.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {result.patternBrief.map((line, i) => {
                    const parts = line.split("：");
                    const hasLabel = parts.length === 2;
                    const label = parts[0];
                    const value = hasLabel ? parts[1] : line;
                    const isEmphasis =
                      i === 0 ||
                      /喜|用神|旺|宜/.test(line);

                    if (hasLabel) {
                      return (
                        <div
                          key={i}
                          className="grid grid-cols-[auto,1fr] gap-x-3 items-baseline"
                        >
                          <span className="font-label text-[10px] tracking-[0.2em] text-[#8B5E3C] uppercase">
                            {label}
                          </span>
                          <span
                            className="font-serif text-[14px] sm:text-[15px] leading-[1.8] text-justify"
                            style={{ color: "#8B5E3C" }}
                          >
                            {value}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <p
                        key={i}
                        className="font-sans text-[13px] leading-[1.8] text-justify"
                        style={{ color: "#8B5E3C" }}
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-center pt-2">
                <WuxingRadar ratios={result.wuxingRatios} />
              </div>
            </div>
          </section>

          {/* 卡片 B：当月运势 */}
          <section
            className="animate-fade-in-up animate-fade-in-up-delay-2"
            aria-label="当月运势与灵感方案"
          >
            <div className="glass-card rounded-2xl px-5 py-5 sm:px-6 sm:py-6 space-y-4">
              <h2 className="font-title text-[#8B5E3C] text-[17px] sm:text-lg tracking-normal leading-tight">
                本月运势与美甲建议
              </h2>
              <p className="numeric-text text-[24px] font-semibold tracking-normal text-[#8B5E3C] leading-[1.6] text-center mt-1.5">
                推荐五行：{" "}
                {(result.recommendedElements?.join("、") ??
                  result.xiyongShen.join("、")) || "—"}
              </p>

              <p className="font-sans text-[#8B5E3C] text-sm leading-[1.8] text-justify">
                这个月的整体氛围是「{monthKeywordDisplay}」，对你来说属于机会和压力并行的阶段：
                一方面会更在意表现和结果，另一方面也容易感到有点紧绷。美甲上优先使用推荐的
                「{(result.recommendedElements?.join("、") ??
                  result.xiyongShen.join("、")) || "—"}」色系，可以一边顺着当月的能量，
                一边柔化锋利感，帮你稳住气场与情绪。
              </p>

              {result.recommendations && result.recommendations.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {result.recommendations.map((rec, i) => {
                    const colors = rec.colorNames
                      ? rec.colorNames.split(/、|，|,|\s+/).filter(Boolean)
                      : [];
                    return (
                      <div
                        key={i}
                        className="space-y-2 rounded-xl border border-morandi-stone/40 px-4 py-3"
                      >
                        {/* 推荐五行：只展示元素本身，如 金 / 水，不显示“推荐五行”四个字 */}
                        <p className="numeric-text text-[20px] font-semibold tracking-normal text-[#8B5E3C] leading-[1.6]">
                          {rec.element}
                        </p>

                        {colors.length > 0 && (
                          <p
                            className="font-serif text-[14px] sm:text-[15px] leading-[1.8]"
                            style={{ color: "#8B5E3C" }}
                          >
                            推荐色系：{rec.colorNames}
                          </p>
                        )}

                        <p
                          className="font-serif text-[14px] sm:text-[15px] leading-[1.8] text-justify"
                          style={{ color: "#8B5E3C" }}
                        >
                          象征意义：{rec.symbolMeaning}
                        </p>
                        <p
                          className="font-serif text-[14px] sm:text-[15px] leading-[1.8] mt-1.5"
                          style={{ color: "#8B5E3C" }}
                        >
                          建议款式：{rec.styleSuggest}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                result.nailCopyByElement?.filter((x) => x.copy).length > 0 && (
                  <ul className="space-y-3 pt-2">
                    {result.nailCopyByElement
                      .filter((x) => x.copy)
                      .map((item, i) => (
                        <li
                          key={i}
                          className="font-sans text-sm leading-[1.8] text-justify pl-3 border-l-2 border-morandi-sage/60"
                          style={{ color: "#8B5E3C" }}
                        >
                          <span className="font-title">
                            {item.element} ·
                          </span>{" "}
                          {item.copy}
                        </li>
                      ))}
                  </ul>
                )
              )}

              {result.designBalanceTip && (
                <div className="pt-2">
                  <p className="font-sans text-sm leading-[1.8] text-justify" style={{ color: "#8B5E3C" }}>
                    {result.designBalanceTip}
                  </p>
                </div>
              )}

              {result.avoidGuide && (
                <div className="mt-24 pt-4">
                  <h3 className="font-title text-[#8B5E3C] text-[17px] sm:text-lg tracking-normal leading-tight mb-1.5">
                    避坑指南
                  </h3>
                  <p className="font-sans text-sm leading-[1.8] text-justify" style={{ color: "#8B5E3C" }}>
                    {result.avoidGuide}
                  </p>
                </div>
              )}

              <div className="pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowConsultModal(true)}
                  className="btn-primary-gradient w-full min-h-[var(--touch-min)] py-3.5 rounded-full text-sm touch-manipulation"
                >
                  预约一对一咨询
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView("form");
                    setResult(null);
                  }}
                  className="w-full text-center text-xs text-morandi-dust underline underline-offset-4 decoration-morandi-dust/70 hover:text-mystic-deep transition"
                >
                  再测一次
                </button>
              </div>
            </div>
          </section>
        </div>
        {showConsultModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
            onClick={() => setShowConsultModal(false)}
          >
            <div
              className="glass-card rounded-2xl max-w-sm w-full px-6 py-6 sm:px-7 sm:py-7 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-title text-[#8B5E3C] text-center text-lg tracking-[0.08em]">
                加微信 · 解锁你的专属开运方案
              </h2>
              <p className="font-sans text-sm leading-[1.8] text-justify" style={{ color: "#8B5E3C" }}>
                扫码添加微信「半夏实验室」，或在微信中搜索「goodluck-lilylily」添加好友，留言「开运美甲 + 生日」，我会为你做一对一的开运色系与款式微调建议。
              </p>
              <div className="flex justify-center">
                <div className="rounded-2xl overflow-hidden bg-white/90 p-2 shadow-md">
                  <img
                    src="/wechat-qr.png"
                    alt="半夏实验室微信二维码"
                    className="block w-40 h-40 object-contain"
                  />
                </div>
              </div>
              <p className="font-sans text-xs text-center" style={{ color: "#8B5E3C" }}>
                小提示：保存二维码图片，在微信中「扫一扫」相册识别也可以添加。
              </p>
              <button
                type="button"
                onClick={() => setShowConsultModal(false)}
                className="w-full text-center text-xs text-morandi-dust underline underline-offset-4 decoration-morandi-dust/70 hover:text-mystic-deep transition pt-1"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="hero-fluid-bg flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10 relative">
      {loading && <PerceivingOverlay />}
      {/* 漂浮模糊光球：极慢速能量流动 */}
      <div className="hero-orbs" aria-hidden>
        {[...Array(3)].map((_, i) => (
          <span key={i} className="hero-orb" style={{ "--orb-i": i } as React.CSSProperties} />
        ))}
      </div>
      {/* 星尘光点：缓慢浮动 + 闪烁，营造神秘能量场 */}
      <div className="hero-stardust" aria-hidden>
        {[...Array(14)].map((_, i) => (
          <span key={i} className="hero-dot" style={{ "--dot-i": i } as React.CSSProperties} />
        ))}
      </div>
      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center relative z-10">
        <div className="w-full glass-card rounded-2xl pt-8 pb-6 px-6 sm:pt-10 sm:pb-8 sm:px-8 flex flex-col items-center">
          <h1 className="font-title text-2xl sm:text-3xl text-center mb-3 tracking-[0.1em] sm:tracking-[0.12em] text-mystic-deep">
            2026 · 灵感指尖
          </h1>
          <p className="font-sans text-mystic-deep/85 text-[11px] sm:text-xs mb-7 sm:mb-9 text-center max-w-xs sm:max-w-sm tracking-[0.05em]">
            输入出生时刻，开启你的本命能量色
          </p>

          <form
            className="w-full space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div>
              <label className="block font-sans text-mystic-deep/90 text-[12px] mb-1.5 tracking-[0.2em] leading-relaxed font-light" htmlFor="birth-date">
                出生日期
              </label>
              <div className="input-wrap-underline">
                <input
                  id="birth-date"
                  type="date"
                  value={`${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`}
                  min="1900-01-01"
                  max={`${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    const [y, m, d] = v.split("-").map(Number);
                    setBirthYear(y);
                    setBirthMonth(m);
                    setBirthDay(d);
                  }}
                  onClick={(e) => {
                    const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
                    el.showPicker?.();
                  }}
                  className="input-underline pl-3 pr-0 py-3 text-base sm:text-sm min-h-[var(--touch-min)] sm:min-h-0 [color-scheme:light] font-serif"
                  aria-label="出生日期，点击后滑动选择年月日"
                />
                <span className="input-underline-glow" aria-hidden />
                <span className="input-icon" aria-hidden>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </span>
              </div>
            </div>

            <div>
              <label className="block font-sans text-mystic-deep/90 text-[12px] mb-1.5 tracking-[0.2em] leading-relaxed font-light" htmlFor="birth-time">
                出生时间（选填，不清楚可留空）
              </label>
              <div className="input-wrap-underline">
                <input
                  id="birth-time"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  onClick={(e) => {
                    const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
                    el.showPicker?.();
                  }}
                  className="input-underline pl-3 pr-0 py-3 text-base sm:text-sm min-h-[var(--touch-min)] sm:min-h-0 font-serif"
                  aria-label="出生时间"
                />
                <span className="input-underline-glow" aria-hidden />
                <span className="input-icon" aria-hidden>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
            </div>

            {error && (
              <p className="text-red-500/90 text-sm leading-relaxed" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
            className="btn-primary-gradient w-full min-h-[var(--touch-min)] py-3.5 rounded-full text-sm touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
            {loading ? "测算中…" : "揭晓我的开运方案"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
