import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Step = { id: string; label: string };

type AgentStepperProps = {
  steps: Step[];
  currentStep: number;
  className?: string;
};

export function AgentStepper({ steps, currentStep, className }: AgentStepperProps) {
  return (
    <ol className={cn("flex flex-wrap gap-2", className)}>
      {steps.map((step, index) => {
        const done = index < currentStep;
        const active = index === currentStep;
        return (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
              done && "bg-accent-100 text-accent-600",
              active && "gradient-brand text-white shadow-md",
              !done && !active && "bg-surface-muted text-muted",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                done && "bg-accent-500 text-white",
                active && "bg-white/20",
                !done && !active && "bg-white",
              )}
            >
              {done ? <Check className="h-3 w-3" /> : index + 1}
            </span>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
