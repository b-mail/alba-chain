import { cn, formatCurrency } from "@/lib/utils";
import type { ChartPoint } from "@/lib/types";

type BarChartProps = {
  data: ChartPoint[];
  height?: number;
  className?: string;
  highlightLast?: boolean;
};

export function BarChart({
  data,
  height = 160,
  className,
  highlightLast = false,
}: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          return (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className={cn(
                    "w-full rounded-t-lg transition-all",
                    highlightLast && isLast
                      ? "gradient-accent"
                      : "gradient-brand",
                  )}
                  style={{ height: `${(d.value / max) * 100}%`, minHeight: 6 }}
                  title={formatCurrency(d.value)}
                />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
