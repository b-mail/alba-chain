"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Clock, TrendingUp, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { BarChart } from "@/components/charts/bar-chart";
import { LineAreaChart } from "@/components/charts/line-area-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  payrollDueList,
  realtimePayrollByHour,
  staffList,
  weeklyPayrollTrend,
} from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

const statusMeta: Record<
  string,
  { label: string; dot: string; variant: "success" | "warning" | "secondary" }
> = {
  working: { label: "근무중", dot: "bg-accent-500", variant: "success" },
  break: { label: "휴게중", dot: "bg-amber-500", variant: "warning" },
  off: { label: "퇴근", dot: "bg-slate-300", variant: "secondary" },
};

export default function OwnerDashboardPage() {
  const working = staffList.filter((s) => s.status !== "off");
  const baseAccrued = staffList.reduce((sum, s) => sum + s.accruedPayToday, 0);
  const dueTotal = payrollDueList
    .filter((p) => p.status !== "paid")
    .reduce((sum, p) => sum + p.netPay, 0);

  const [liveAccrued, setLiveAccrued] = useState(baseAccrued);

  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const activeCount = staffList.filter((s) => s.status === "working").length;
    const perTick = (activeCount * 10300) / 3600; // 초당 누적(원)
    const timer = setInterval(() => {
      setLiveAccrued((prev) => prev + perTick);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AppShell role="owner" title="대시보드">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="gradient-brand border-transparent py-0 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Activity className="h-4 w-4" />
              실시간 누적 인건비
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {formatCurrency(Math.round(liveAccrued))}
            </p>
            <p className="mt-1 text-xs text-white/70">
              {todayLabel} 발생분 · 초당 갱신
            </p>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              근무 중
            </div>
            <p className="mt-2 text-2xl font-bold">
              {working.length}
              <span className="text-base text-muted-foreground">
                {" "}
                / {staffList.length}명
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">현재 근무 인원</p>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              지급 대기
            </div>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(dueTotal)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              이번 주 정산 예정 급여
            </p>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              주간 인건비
            </div>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(
                weeklyPayrollTrend.reduce((s, d) => s + d.value, 0),
              )}
            </p>
            <p className="mt-1 text-xs text-accent-600">지난주 대비 +8%</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>실시간 급여 발생 추이</CardTitle>
            <CardDescription>오늘 시간대별 누적 인건비 (원)</CardDescription>
          </CardHeader>
          <CardContent>
            <LineAreaChart data={realtimePayrollByHour} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>주간 인건비</CardTitle>
            <CardDescription>요일별 지급액</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={weeklyPayrollTrend} highlightLast />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>실시간 근무 현황</CardTitle>
            <CardDescription>현재 근무 중인 아르바이트생</CardDescription>
          </div>
          <Link href="/owner/staff">
            <Button variant="ghost" size="sm">
              전체 보기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {staffList.map((s) => {
              const meta = statusMeta[s.status];
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-border p-4"
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full font-bold text-white",
                      s.avatarColor,
                    )}
                  >
                    {s.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{s.name}</p>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs",
                          s.status === "working"
                            ? "text-accent-600"
                            : "text-muted-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            meta.dot,
                            s.status === "working" && "animate-pulse",
                          )}
                        />
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.role} · {s.clockIn ? `${s.clockIn} 출근` : "미출근"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">오늘 발생</p>
                    <p className="font-bold tabular-nums">
                      {formatCurrency(s.accruedPayToday)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
