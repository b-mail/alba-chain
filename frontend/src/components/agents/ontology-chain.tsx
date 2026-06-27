import { cn } from "@/lib/utils";
import { ontologyChain } from "@/lib/mock-data";
import { ArrowRight } from "lucide-react";

type OntologyChainViewProps = {
  activeIndex?: number;
  path?: string[];
  className?: string;
};

export function OntologyChainView({
  activeIndex = -1,
  path,
  className,
}: OntologyChainViewProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {ontologyChain.map((node, i) => (
          <div key={node.id} className="flex items-center gap-2">
            <div
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                i <= activeIndex || activeIndex === -1
                  ? "border-brand-300 bg-brand-50 text-brand-800"
                  : "border-border bg-surface-muted text-muted",
                i === activeIndex && "ring-2 ring-brand-500",
              )}
            >
              <span className="mr-1">{node.icon}</span>
              {node.label}
            </div>
            {i < ontologyChain.length - 1 && (
              <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
            )}
          </div>
        ))}
      </div>
      {path && path.length > 0 && (
        <div className="rounded-xl bg-slate-950 px-4 py-3 text-xs text-slate-300">
          <span className="text-brand-300">온톨로지 매핑 경로 · </span>
          {path.join(" → ")}
        </div>
      )}
    </div>
  );
}
