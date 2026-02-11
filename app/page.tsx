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
    return (
      <main className="min-h-screen result-page-bg text-stone-800 overflow-y-auto flex flex-col pb-[env(safe-area-inset-bottom,0)]">
        <h1 className="animate-fade-in-up text-lg sm:text-xl font-serif text-mystic-mid text-center py-4 tracking-[0.3em] shrink-0">
          2026开运美甲
        </h1>

        {/* 向下滑动：能量底色 → 美甲方案 */}
        <div className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 pb-8">
          {/* 卡片 1：能量底色 */}
          <section
            className="animate-fade-in-up animate-fade-in-up-delay-1 mb-8"
            aria-label="能量底色"
          >
            <h2 className="font-serif text-mystic-mid text-base mb-4 tracking-widest">
              能量底色
            </h2>
            {result.reportIntro && (
              <p className="text-stone-700 text-sm leading-[1.6] text-justify mb-4">
                {result.reportIntro}
              </p>
            )}
            {result.patternBrief && result.patternBrief.length > 0 && (
              <ul className="space-y-2 text-stone-600 text-sm leading-[1.6] text-justify list-disc list-inside mb-4">
                {result.patternBrief.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
            <p className="text-morandi-dust text-xs mb-1">您的八字</p>
            <p className="text-base tracking-[0.25em] text-morandi-clay font-serif break-all mb-4">
              {result.baziStr.join(" ")}
            </p>
            <div className="flex justify-center my-6">
              <WuxingRadar ratios={result.wuxingRatios} />
            </div>
            {result.monthNailIntro && (
              <div className="rounded-xl bg-ice-lavender/40 border border-morandi-stone/50 px-4 py-3">
                <p className="text-stone-700 text-sm leading-[1.6] text-justify">
                  {result.monthNailIntro}
                </p>
                <p className="text-morandi-dust text-xs mt-2">
                  推荐五行：{result.recommendedElements?.join("、") ?? result.xiyongShen.join("、")}
                </p>
              </div>
            )}
          </section>

          {/* 卡片 2：美甲方案 */}
          <section
            className="animate-fade-in-up animate-fade-in-up-delay-2"
            aria-label="美甲方案"
          >
            <h2 className="font-serif text-mystic-mid text-base mb-4 tracking-widest">
              美甲方案
            </h2>

            {result.recommendations && result.recommendations.length > 0 ? (
              <div className="space-y-5">
                {result.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="pl-3 border-l-2 border-morandi-sage/50 space-y-2"
                  >
                    <p className="text-morandi-clay font-medium text-sm">
                      推荐色系：{rec.colorNames}
                    </p>
                    <p className="text-stone-500 text-xs">
                      五行属性：{rec.element}
                    </p>
                    <p className="text-stone-600 text-sm leading-[1.6] text-justify">
                      {rec.symbolMeaning}
                    </p>
                    <p className="font-serif font-bold text-base text-morandi-clay leading-[1.6] mt-2">
                      建议款式：{rec.styleSuggest}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              result.nailCopyByElement?.filter((x) => x.copy).length > 0 && (
                <ul className="space-y-3">
                  {result.nailCopyByElement
                    .filter((x) => x.copy)
                    .map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-stone-600 leading-[1.6] text-justify pl-3 border-l-2 border-morandi-sage/60"
                      >
                        <span className="text-morandi-clay font-medium">{item.element} ·</span> {item.copy}
                      </li>
                    ))}
                </ul>
              )
            )}

            {result.designBalanceTip && (
              <div className="mt-5 rounded-xl bg-ice-mint/40 border border-morandi-stone/50 px-4 py-3">
                <h3 className="font-serif text-morandi-clay text-sm mb-2">
                  设计建议
                </h3>
                <p className="text-stone-700 text-sm leading-[1.6] text-justify">
                  {result.designBalanceTip}
                </p>
              </div>
            )}

            {result.avoidGuide && (
              <div className="mt-5">
                <h3 className="font-serif text-morandi-clay text-sm mb-2">
                  避坑指南
                </h3>
                <p className="text-stone-600 text-sm leading-[1.6] text-justify">
                  {result.avoidGuide}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setView("form");
                setResult(null);
              }}
              className="w-full min-h-[var(--touch-min)] py-3.5 rounded-xl border border-morandi-dust/80 text-morandi-dust text-sm hover:bg-morandi-stone/40 active:opacity-80 transition touch-manipulation mt-6"
            >
              再测一次
            </button>
          </section>
        </div>
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
          <h1 className="font-serif text-2xl sm:text-3xl text-center mb-3 tracking-[0.15em] sm:tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-b from-stone-700 via-stone-600 to-stone-700">
            2026 · 灵感指尖
          </h1>
          <p className="text-stone-500/80 text-[11px] sm:text-xs mb-7 sm:mb-9 text-center max-w-xs sm:max-w-sm tracking-[0.12em] leading-relaxed">
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
              <label className="block text-stone-500/70 text-[11px] mb-1.5 tracking-[0.14em] leading-relaxed" htmlFor="birth-date">
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
                  className="input-underline pl-3 pr-0 py-3 text-base sm:text-sm min-h-[var(--touch-min)] sm:min-h-0 [color-scheme:light]"
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
              <label className="block text-stone-500/70 text-[11px] mb-1.5 tracking-[0.14em] leading-relaxed" htmlFor="birth-time">
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
                  className="input-underline pl-3 pr-0 py-3 text-base sm:text-sm min-h-[var(--touch-min)] sm:min-h-0"
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
