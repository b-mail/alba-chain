import { cn, formatCurrency } from "@/lib/utils";
import type { PayForecastNode } from "@/lib/types";

type PayForecastGraphProps = {
  nodes: PayForecastNode[];
  highlightId?: string;
  className?: string;
};

export function PayForecastGraph({
  nodes,
  highlightId,
  className,
}: PayForecastGraphProps) {
  const net = nodes.find((n) => n.type === "net");

  return (
    <div className={cn("space-y-3", className)}>
      {nodes
        .filter((n) => n.type !== "net")
        .map((node) => (
          <div
            key={node.id}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 transition",
              highlightId === node.id
                ? "border-accent-400 bg-accent-50 shadow-sm"
                : "border-border bg-white",
            )}
          >
            <span className="text-sm font-medium">{node.label}</span>
            <span
              className={cn(
                "font-bold",
                node.amount < 0 ? "text-red-500" : "text-foreground",
                highlightId === node.id && "text-accent-600",
              )}
            >
              {node.amount < 0 ? "−" : "+"}
              {formatCurrency(Math.abs(node.amount))}
            </span>
          </div>
        ))}
      {net && (
        <div className="gradient-brand rounded-2xl p-5 text-white">
          <p className="text-sm text-white/80">{net.label}</p>
          <p className="text-3xl font-bold">{formatCurrency(net.amount)}</p>
        </div>
      )}
    </div>
  );
}
