"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { storeTodos } from "@/lib/mock-data";
import type { TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Camera, RefreshCw } from "lucide-react";

const statusConfig: Record<
  TaskStatus,
  { label: string; variant: "default" | "warning" | "success" | "danger" }
> = {
  pending: { label: "대기", variant: "default" },
  submitted: { label: "검토중", variant: "warning" },
  verified: { label: "완료", variant: "success" },
  rejected: { label: "반려", variant: "danger" },
};

const priorityConfig = {
  high: { label: "긴급", variant: "danger" as const },
  normal: { label: "보통", variant: "default" as const },
  low: { label: "낮음", variant: "default" as const },
};

export default function WorkerTodosPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("방금 전");

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdate("방금 전");
    }, 800);
  };

  const pending = storeTodos.filter((t) => t.status === "pending");
  const newCount = storeTodos.filter((t) => t.isNew).length;

  return (
    <AppShell
      role="worker"
      title="매장 할일"
      subtitle={`실시간 · ${lastUpdate} 업데이트`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="brand">{pending.length}건 남음</Badge>
          {newCount > 0 && (
            <Badge variant="success">NEW {newCount}</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          새로고침
        </Button>
      </div>

      <div className="space-y-3">
        {storeTodos.map((todo) => {
          const status = statusConfig[todo.status];
          const priority = priorityConfig[todo.priority];
          return (
            <Card
              key={todo.id}
              className={cn(
                "p-4 transition",
                todo.isNew && "border-accent-400 bg-accent-50/30",
                todo.priority === "high" &&
                  todo.status === "pending" &&
                  "border-l-4 border-l-red-400",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{todo.title}</p>
                    {todo.isNew && (
                      <Badge variant="success">NEW</Badge>
                    )}
                    {todo.priority === "high" && todo.status === "pending" && (
                      <Badge variant={priority.variant}>{priority.label}</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {todo.zone} · {todo.dueTime}까지
                  </p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              {todo.status === "pending" && (
                <Link href="/worker/capture">
                  <Button size="sm" className="mt-3 w-full" variant="accent">
                    <Camera className="h-4 w-4" />
                    캡처로 완료하기
                  </Button>
                </Link>
              )}
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
