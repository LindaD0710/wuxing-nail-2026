"use client";

const CX = 50;
const CY = 50;
const R = 38;

function pentagramPoints() {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (90 + i * 72) * (Math.PI / 180);
    points.push({
      x: CX + R * Math.cos(angle),
      y: CY - R * Math.sin(angle),
    });
  }
  return points;
}

export default function PerceivingOverlay() {
  const pts = pentagramPoints();
  const starPath = [
    `M ${pts[0].x} ${pts[0].y}`,
    `L ${pts[2].x} ${pts[2].y}`,
    `L ${pts[4].x} ${pts[4].y}`,
    `L ${pts[1].x} ${pts[1].y}`,
    `L ${pts[3].x} ${pts[3].y}`,
    "Z",
  ].join(" ");

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-mystic-cream/95 backdrop-blur-sm"
      aria-live="polite"
      aria-label="正在测算"
    >
      <div className="relative w-[120px] h-[120px]">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full pentagram-rotate"
          aria-hidden
        >
          <defs>
            <linearGradient id="star-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(157, 139, 184)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(123, 107, 158)" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <path
            d={starPath}
            fill="none"
            stroke="url(#star-glow)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              className="dot-pulse"
              fill="rgb(157, 139, 184)"
              opacity="0.9"
            />
          ))}
        </svg>
      </div>
      <p className="mt-6 text-mystic-mid text-sm tracking-widest animate-pulse">
        正在感知你的五行能量...
      </p>
    </div>
  );
}
