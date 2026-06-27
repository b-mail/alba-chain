"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  FileText,
  Phone,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { staffList } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

const statusMeta: Record<
  string,
  { label: string; dot: string; variant: "success" | "warning" | "secondary" }
> = {
  working: { label: "근무중", dot: "bg-accent-500", variant: "success" },
  break: { label: "휴게중", dot: "bg-amber-500", variant: "warning" },
  off: { label: "퇴근", dot: "bg-slate-300", variant: "secondary" },
};

export default function StaffDetailPage() {
  const params = useParams<{ id: string }>();
  const staff = staffList.find((s) => s.id === params.id);

  if (!staff) {
    return (
      <AppShell role="owner" title="아르바이트 상세">
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">
            해당 아르바이트생을 찾을 수 없습니다.
          </p>
          <Link href="/owner/staff" className="mt-4 inline-block">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              아르바이트 관리로
            </Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  const meta = statusMeta[staff.status];
  const monthlyEstimate = staff.hourlyWage * staff.weeklyHours * 4;

  const workInfo = [
    {
      icon: Wallet,
      label: "시급",
      value: formatCurrency(staff.hourlyWage),
    },
    {
      icon: Clock,
      label: "주 근무",
      value: `${staff.weeklyHours}시간`,
    },
    {
      icon: Clock,
      label: "오늘 근무 시간",
      value: `${staff.workedHoursToday}시간`,
    },
    {
      icon: Wallet,
      label: "오늘의 급여",
      value: formatCurrency(staff.accruedPayToday),
    },
  ];

  return (
    <AppShell role="owner" title="아르바이트 상세">
      <Link
        href="/owner/staff"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        아르바이트 관리
      </Link>

      {/* 프로필 헤더 */}
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-4 p-6">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white",
              staff.avatarColor,
            )}
          >
            {staff.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold">{staff.name}</h2>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm",
                  staff.status === "working"
                    ? "text-accent-600"
                    : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    meta.dot,
                    staff.status === "working" && "animate-pulse",
                  )}
                />
                {meta.label}
              </span>
            </div>
            <p className="mt-1 text-muted-foreground">
              {staff.role} ·{" "}
              {staff.clockIn ? `${staff.clockIn} 출근` : "오늘 미출근"}
            </p>
          </div>
          <Badge variant={staff.contractStatus === "signed" ? "success" : "warning"}>
            {staff.contractStatus === "signed" ? "계약 체결" : "계약 대기"}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 근무 정보 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>근무 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {workInfo.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-border p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-bold tabular-nums">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl bg-secondary p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">월 예상 급여 (세전)</span>
                <span className="font-bold tabular-nums">
                  {formatCurrency(monthlyEstimate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">연락처</p>
                <p className="font-medium">{staff.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">입사일</p>
                <p className="font-medium">{staff.startedAt}</p>
              </div>
            </div>
            <Link href="/owner/contracts" className="block">
              <Button variant="secondary" className="w-full">
                <FileText className="h-4 w-4" />
                근로계약서 보기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
