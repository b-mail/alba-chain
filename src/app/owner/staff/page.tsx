"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload, UserPlus, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export default function OwnerStaffPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const go = (flow: "upload" | "new") => {
    setOpen(false);
    router.push(`/owner/agents/contract?flow=${flow}`);
  };

  return (
    <AppShell role="owner" title="아르바이트 관리">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          총 {staffList.length}명 · 근무중{" "}
          {staffList.filter((s) => s.status === "working").length}명
        </p>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          등록하기
        </Button>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">이름</TableHead>
                <TableHead>담당</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">시급</TableHead>
                <TableHead className="text-right">주 근무</TableHead>
                <TableHead className="text-right">오늘의 급여</TableHead>
                <TableHead>계약</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>입사일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((s) => {
                const meta = statusMeta[s.status];
                return (
                  <TableRow key={s.id}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white",
                            s.avatarColor,
                          )}
                        >
                          {s.name[0]}
                        </div>
                        <span className="font-semibold">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.role}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-sm",
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
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(s.hourlyWage)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {s.weeklyHours}시간
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(s.accruedPayToday)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          s.contractStatus === "signed" ? "success" : "warning"
                        }
                      >
                        {s.contractStatus === "signed" ? "체결" : "대기"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.phone}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.startedAt}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setOpen(false)}
        >
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>아르바이트생 등록</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  등록 방식을 선택하세요
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => go("upload")}
                className="group rounded-2xl border-2 border-border p-5 text-left transition hover:border-brand-500 hover:bg-brand-50/40"
              >
                <div className="mb-3 inline-flex rounded-xl bg-brand-100 p-3 text-brand-600">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="font-bold">기존 아르바이트생</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  근로계약서 PDF를 업로드하면 정보를 추출해 등록합니다.
                </p>
                <span className="mt-3 inline-flex text-sm font-semibold text-brand-600">
                  계약서 업로드 →
                </span>
              </button>

              <button
                type="button"
                onClick={() => go("new")}
                className="group rounded-2xl border-2 border-border p-5 text-left transition hover:border-accent-500 hover:bg-accent-50/40"
              >
                <div className="mb-3 inline-flex rounded-xl bg-accent-100 p-3 text-accent-600">
                  <UserPlus className="h-6 w-6" />
                </div>
                <p className="font-bold">신규 아르바이트생</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  줄글로 입력하면 계약서를 생성해 알바생에게 전송합니다.
                </p>
                <span className="mt-3 inline-flex text-sm font-semibold text-accent-600">
                  줄글로 생성 →
                </span>
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
