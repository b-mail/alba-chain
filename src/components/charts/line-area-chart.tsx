import { cn } from "@/lib/utils";
import type { ChartPoint } from "@/lib/types";

type LineAreaChartProps = {
  data: ChartPoint[];
  height?: number;
  className?: string;
};

export function LineAreaChart({
  data,
  height = 180,
  className,
}: LineAreaChartProps) {
  if (data.length === 0) return null;

  const width = 600;
  const padX = 8;
  const padY = 16;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padX + (i * (width - padX * 2)) / (data.length - 1 || 1);
    const y =
      padY + (1 - (d.value - min) / range) * (height - padY * 2);
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - padY} ` +
    `L ${points[0].x.toFixed(1)} ${height - padY} Z`;

  const last = points[points.length - 1];

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        style={{ height }}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#4f46e5"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r={3} fill="#4f46e5" />
        ))}
        <circle cx={last.x} cy={last.y} r={6} fill="#4f46e5" opacity={0.25} />
      </svg>
      <div className="mt-2 flex justify-between px-1 text-[11px] text-muted-foreground">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
