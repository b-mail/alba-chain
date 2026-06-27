import { Card, CardContent } from "@/components/ui/card";
import { cn, formatPercent } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  trend?: number;
  accent?: boolean;
};

export function StatCard({
  label,
  value,
  hint,
  trend,
  accent,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "py-0 shadow-sm",
        accent && "gradient-brand border-transparent text-white",
      )}
    >
      <CardContent className="p-5">
        <p
          className={cn(
            "text-sm font-medium",
            accent ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        {(hint || trend !== undefined) && (
          <p
            className={cn(
              "mt-1 text-xs",
              accent ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {trend !== undefined && (
              <span className={trend >= 0 ? "text-accent-400" : "text-red-400"}>
                {trend >= 0 ? "↑" : "↓"} {formatPercent(Math.abs(trend))}{" "}
              </span>
            )}
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
