"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Printer, Send, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { payrollDueList, staffList } from "@/lib/mock-data";
import type { PayrollDue } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

const attendanceMeta: Record<
  string,
  { label: string; dot: string }
> = {
  working: { label: "근무중", dot: "bg-accent-500" },
  break: { label: "휴게중", dot: "bg-amber-500" },
  off: { label: "퇴근", dot: "bg-slate-300" },
};

const dueMeta: Record<
  string,
  { label: string; variant: "warning" | "brand" | "success" }
> = {
  due: { label: "지급 필요", variant: "warning" },
  scheduled: { label: "예약됨", variant: "brand" },
  paid: { label: "지급완료", variant: "success" },
};

const STORE_NAME = "강남 2호점";

export default function OwnerPayrollPage() {
  const [paidIds, setPaidIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<PayrollDue | null>(null);

  const isPaid = (item: { id: string; status: string }) =>
    item.status === "paid" || paidIds.includes(item.id);

  const dueItems = payrollDueList.filter((p) => !isPaid(p));
  const dueTotal = dueItems.reduce((sum, p) => sum + p.netPay, 0);

  const payOne = (id: string) => setPaidIds((prev) => [...prev, id]);
  const payAll = () => setPaidIds(payrollDueList.map((p) => p.id));

  const hourlyWageOf = (name: string) =>
    staffList.find((s) => s.name === name)?.hourlyWage ?? 0;

  return (
    <AppShell role="owner" title="급여 관리">
      <Card className="mb-6 gradient-brand border-transparent py-0 text-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm text-white/80">지급해야 할 급여</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(dueTotal)}</p>
          </div>
          <Button
            variant="secondary"
            className="bg-white text-brand-700 hover:bg-white/90"
            onClick={payAll}
            disabled={dueItems.length === 0}
          >
            {dueItems.length === 0 ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                전원 지급 완료
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                전원 일괄 송금
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6 py-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-600" />
            실시간 근태 현황
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">이름</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>출근</TableHead>
                <TableHead className="text-right">오늘 근무 시간</TableHead>
                <TableHead className="text-right">시급</TableHead>
                <TableHead className="pr-5 text-right">오늘의 급여</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((s) => {
                const meta = attendanceMeta[s.status];
                return (
                  <TableRow key={s.id}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white",
                            s.avatarColor,
                          )}
                        >
                          {s.name[0]}
                        </div>
                        <span className="font-medium">{s.name}</span>
                      </div>
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
                    <TableCell className="text-muted-foreground">
                      {s.clockIn ?? "미출근"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {s.workedHoursToday}h
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(s.hourlyWage)}
                    </TableCell>
                    <TableCell className="pr-5 text-right font-semibold tabular-nums">
                      {formatCurrency(s.accruedPayToday)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle>지급 대상 급여</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">알바생</TableHead>
                <TableHead>정산 주기</TableHead>
                <TableHead className="text-right">근무</TableHead>
                <TableHead className="text-right">기본급</TableHead>
                <TableHead className="text-right">보너스</TableHead>
                <TableHead className="text-right">공제</TableHead>
                <TableHead className="text-right">실수령</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="pr-5 text-right">송금</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollDueList.map((p) => {
                const paid = isPaid(p);
                const meta = paid ? dueMeta.paid : dueMeta[p.status];
                return (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(p)}
                  >
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white",
                            p.avatarColor,
                          )}
                        >
                          {p.workerName[0]}
                        </div>
                        <span className="font-medium underline-offset-2 hover:underline">
                          {p.workerName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.period}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.workedHours}h
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(p.basePay)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-accent-600">
                      +{formatCurrency(p.bonus)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-red-500">
                      −{formatCurrency(p.tax)}
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums">
                      {formatCurrency(p.netPay)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </TableCell>
                    <TableCell
                      className="pr-5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {paid ? (
                        <Button size="sm" variant="secondary" disabled>
                          <CheckCircle2 className="h-4 w-4" />
                          완료
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={() => payOne(p.id)}
                        >
                          <Send className="h-4 w-4" />
                          송금
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected && (
        <PayslipModal
          item={selected}
          paid={isPaid(selected)}
          hourlyWage={hourlyWageOf(selected.workerName)}
          storeName={STORE_NAME}
          onPay={() => {
            payOne(selected.id);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </AppShell>
  );
}

function PayslipModal({
  item,
  paid,
  hourlyWage,
  storeName,
  onPay,
  onClose,
}: {
  item: PayrollDue;
  paid: boolean;
  hourlyWage: number;
  storeName: string;
  onPay: () => void;
  onClose: () => void;
}) {
  const gross = item.basePay + item.bonus;
  const localTax = Math.round(item.tax / 11);
  const incomeTax = item.tax - localTax;

  const rows = [
    { label: "기본급", sub: `시급 ${formatCurrency(hourlyWage)} × ${item.workedHours}h`, value: item.basePay },
    { label: "캡처 보너스", sub: "업무 검증 수당", value: item.bonus },
  ];
  const deductions = [
    { label: "소득세 (3%)", value: incomeTax },
    { label: "지방소득세 (0.3%)", value: localTax },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md py-0"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex-row items-start justify-between border-b px-6 pt-6 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              급여 명세서
            </p>
            <CardTitle className="mt-1 text-xl">{item.workerName}</CardTitle>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {storeName} · {item.period}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="px-6 py-5">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold">지급 항목</span>
            <span className="text-muted-foreground">마감 {item.dueDate}</span>
          </div>
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.sub}</p>
                </div>
                <span className="tabular-nums">{formatCurrency(r.value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
              <span>지급 합계</span>
              <span className="tabular-nums">{formatCurrency(gross)}</span>
            </div>
          </div>

          <p className="mt-5 mb-3 text-sm font-semibold">공제 항목</p>
          <div className="space-y-2">
            {deductions.map((d) => (
              <div
                key={d.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{d.label}</span>
                <span className="tabular-nums text-red-500">
                  −{formatCurrency(d.value)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
              <span>공제 합계</span>
              <span className="tabular-nums text-red-500">
                −{formatCurrency(item.tax)}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl gradient-brand px-4 py-4 text-white">
            <span className="text-sm text-white/80">실지급액</span>
            <span className="text-2xl font-bold tabular-nums">
              {formatCurrency(item.netPay)}
            </span>
          </div>
        </CardContent>

        <div className="flex gap-2 border-t px-6 py-4">
          <Button variant="secondary" className="flex-1">
            <Printer className="h-4 w-4" />
            명세서 출력
          </Button>
          {paid ? (
            <Button variant="secondary" className="flex-1" disabled>
              <CheckCircle2 className="h-4 w-4" />
              지급 완료
            </Button>
          ) : (
            <Button
              variant="accent"
              className="flex-1"
              onClick={() => {
                onPay();
                onClose();
              }}
            >
              <Send className="h-4 w-4" />
              송금하기
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
