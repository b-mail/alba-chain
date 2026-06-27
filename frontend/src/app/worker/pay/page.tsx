"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PayForecastGraph } from "@/components/agents/pay-forecast-graph";
import {
  MIN_WAGE_2026,
  payForecastAfterShift,
  payForecastBase,
  workerProfile,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Building2, Calculator } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function WorkerPayPage() {
  const [hoursPerWeek, setHoursPerWeek] = useState(workerProfile.weeklyHours);
  const [hourlyWage, setHourlyWage] = useState(workerProfile.hourlyWage);
  const [weeks, setWeeks] = useState(4);
  const [includeShift, setIncludeShift] = useState(false);

  const weeklyPay = hourlyWage * hoursPerWeek;
  const monthlyEstimate = weeklyPay * weeks;
  const holidayPay = Math.round(monthlyEstimate / 40);
  const taxEstimate = Math.round((monthlyEstimate + holidayPay) * 0.033);
  const netEstimate = monthlyEstimate + holidayPay - taxEstimate;

  const graphNodes = includeShift ? payForecastAfterShift : payForecastBase;

  return (
    <AppShell
      role="worker"
      title="급여 예측"
      subtitle="주휴수당 · 3.3% 세금 · 대타 반영 실수령액"
    >
      <div className="mb-4 flex gap-2">
        <Button
          size="sm"
          variant={!includeShift ? "primary" : "secondary"}
          onClick={() => setIncludeShift(false)}
        >
          기본 예측
        </Button>
        <Button
          size="sm"
          variant={includeShift ? "accent" : "secondary"}
          onClick={() => setIncludeShift(true)}
        >
          대타 반영 (+6/28)
        </Button>
      </div>

      <PayForecastGraph nodes={graphNodes} highlightId={includeShift ? "substitute" : undefined} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-600" />
            시급 · 월급 미리 계산
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="wage">시급</Label>
              <Input
                id="wage"
                type="number"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="hours">주 근무 (h)</Label>
              <Input
                id="hours"
                type="number"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              />
            </div>
          </div>
          {hourlyWage < MIN_WAGE_2026 && (
            <p className="mt-2 text-xs text-red-500">
              최저시급 {formatCurrency(MIN_WAGE_2026)} 미만
            </p>
          )}
          <div className="mt-4 space-y-2 rounded-xl bg-surface-muted p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">월 예상 (세전)</span>
              <span>{formatCurrency(monthlyEstimate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">주휴수당</span>
              <span className="text-accent-600">+{formatCurrency(holidayPay)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">원천징수 3.3%</span>
              <span className="text-red-500">−{formatCurrency(taxEstimate)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-bold">
              <span>실수령 예상</span>
              <span className="text-accent-600">{formatCurrency(netEstimate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            급여 계좌 변경
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" className="w-full">
            계좌 정보 수정
          </Button>
        </CardContent>
      </Card>

      <Link href="/worker/shift" className="mt-4 block">
        <Button variant="accent" className="w-full">
          대타·추가근무 증빙 등록
        </Button>
      </Link>
    </AppShell>
  );
}
