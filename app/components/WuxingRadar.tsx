"use client";

import { useMemo } from "react";
import { WUXING_LABELS } from "@/app/types/nail";

const RADIUS = 80;
const CX = 100;
const CY = 100;

function getPentagonPoints(ratios: number[]) {
  const angles = [90, 90 - 72, 90 - 144, 90 - 216, 90 - 288].map(
    (d) => (d * Math.PI) / 180
  );
  return angles.map((a, i) => {
    const r = RADIUS * (0.25 + 0.75 * (ratios[i] ?? 0));
    return {
      x: CX + r * Math.cos(a),
      y: CY - r * Math.sin(a),
    };
  });
}

export default function WuxingRadar({
  ratios,
  className = "",
}: {
  ratios: number[];
  className?: string;
}) {
  const norm = useMemo(() => {
    const sum = ratios.reduce((a, b) => a + b, 0) || 1;
    return ratios.map((r) => Math.min(1, r / sum * 2));
  }, [ratios]);

  const points = useMemo(() => getPentagonPoints(norm), [norm]);
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const axisPoints = useMemo(() => {
    const angles = [90, 90 - 72, 90 - 144, 90 - 216, 90 - 288].map(
      (d) => (d * Math.PI) / 180
    );
    return angles.map((a) => ({
      x: CX + RADIUS * Math.cos(a),
      y: CY - RADIUS * Math.sin(a),
    }));
  }, []);

  return (
    <figure className={className}>
      <svg
        viewBox="0 0 200 200"
        className="w-full max-w-[200px] sm:max-w-[240px] mx-auto"
        aria-label="五行能量雷达图"
        role="img"
      >
        <defs>
          {/* 香槟金径向渐变：中心亮、边缘淡，静奢能量场 */}
          <radialGradient
            id="radar-glow"
            cx="50%"
            cy="50%"
            r="70%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="rgba(232, 204, 158, 0.7)" />
            <stop offset="45%" stopColor="rgba(210, 186, 140, 0.4)" />
            <stop offset="100%" stopColor="rgba(166, 137, 92, 0.08)" />
          </radialGradient>
        </defs>
        {/* 背景网格：更细的轴线（暖金调） */}
        {axisPoints.map((p, i) => (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
              stroke="rgba(182, 150, 102, 0.25)"
            strokeWidth="0.3"
          />
        ))}
        {/* 背景五边形：细线 */}
        <polygon
          points={axisPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="rgba(182, 150, 102, 0.3)"
          strokeWidth="0.38"
        />
        {/* 数据填充：紫色径向渐变，光泽力场感 */}
        <polygon
          points={polygonPoints}
          fill="url(#radar-glow)"
          stroke="rgba(166, 137, 92, 0.45)"
          strokeWidth="0.6"
        />
        {/* 顶点标签：统一复古铜棕色 */}
        {axisPoints.map((p, i) => (
          <text
            key={i}
            x={p.x * 0.95 + CX * 0.05}
            y={p.y * 0.95 + CY * 0.05}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] font-medium"
            style={{ fontSize: "11px", fill: "#8B5E3C" }}
          >
            {WUXING_LABELS[i]}
          </text>
        ))}
      </svg>
      <figcaption
        className="font-label text-center text-[10px] mt-0 tracking-[0.2em]"
        style={{ color: "#8B5E3C" }}
      >
        五行能量分布
      </figcaption>
    </figure>
  );
}
