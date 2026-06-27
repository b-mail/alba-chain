import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { workerTasks } from "@/lib/mock-data";
import type { TaskStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Camera } from "lucide-react";

const statusConfig: Record<
  TaskStatus,
  { label: string; variant: "default" | "warning" | "success" | "danger" }
> = {
  pending: { label: "대기", variant: "default" },
  submitted: { label: "검토중", variant: "warning" },
  verified: { label: "완료", variant: "success" },
  rejected: { label: "반려", variant: "danger" },
};

export default function WorkerTasksPage() {
  return (
    <AppShell role="worker" title="업무 목록" subtitle="오늘 할 일과 캡처 가이드">
      <div className="space-y-3">
        {workerTasks.map((task) => {
          const status = statusConfig[task.status];
          return (
            <Card key={task.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{task.title}</p>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {task.zone} · {task.sop}
                  </p>
                  {task.dueTime && (
                    <p className="mt-1 text-xs font-medium text-brand-600">
                      {task.dueTime}까지
                    </p>
                  )}
                  <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-xs text-muted">
                    📷 {task.captureHint}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-bold text-accent-600">
                    +{formatCurrency(task.bonus)}
                  </p>
                  {task.status === "pending" && (
                    <Link href="/worker/capture">
                      <Button size="sm" className="mt-2" variant="accent">
                        <Camera className="h-4 w-4" />
                        캡처
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
