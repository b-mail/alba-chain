import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { storeStats } from "@/lib/mock-data";
import { formatCurrency, formatPercent } from "@/lib/utils";

const weeklyData = [
  { day: "월", captures: 18, bonus: 36000 },
  { day: "화", captures: 22, bonus: 44000 },
  { day: "수", captures: 25, bonus: 50000 },
  { day: "목", captures: 20, bonus: 40000 },
  { day: "금", captures: 28, bonus: 56000 },
  { day: "토", captures: 15, bonus: 30000 },
  { day: "일", captures: 14, bonus: 28000 },
];

const maxCaptures = Math.max(...weeklyData.map((d) => d.captures));

export default function OwnerReportsPage() {
  return (
    <AppShell
      role="owner"
      title="리포트"
      subtitle="자동화 효과·캡처 검증·보너스 지출 분석"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="주간 자동화율"
          value={formatPercent(storeStats.automationRate)}
          trend={0.05}
        />
        <StatCard
          label="캡처 검증률"
          value="94%"
          hint="AI 자동 승인"
        />
        <StatCard
          label="평균 검토 시간"
          value="12분"
          hint="수동 개입 건"
        />
        <StatCard
          label="주간 보너스 지출"
          value={formatCurrency(storeStats.bonusPaid)}
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>주간 캡처 · 보너스 추이</CardTitle>
        </CardHeader>
        <div className="flex h-48 items-end gap-3 px-2">
          {weeklyData.map(({ day, captures, bonus }) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg gradient-brand transition-all"
                style={{ height: `${(captures / maxCaptures) * 100}%`, minHeight: 8 }}
                title={`${captures}건 · ${formatCurrency(bonus)}`}
              />
              <span className="text-xs font-medium text-muted">{day}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>구역별 업무 분포</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {[
              { zone: "홀", percent: 42 },
              { zone: "주방", percent: 38 },
              { zone: "카운터", percent: 20 },
            ].map(({ zone, percent }) => (
              <div key={zone}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{zone}</span>
                  <span className="text-muted">{percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full gradient-brand"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROI 요약</CardTitle>
          </CardHeader>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between rounded-xl bg-accent-50 px-4 py-3">
              <span>수동 체크리스트 절감</span>
              <span className="font-bold text-accent-600">약 8.5시간/주</span>
            </li>
            <li className="flex justify-between rounded-xl bg-surface-muted px-4 py-3">
              <span>매니저 검토 부담 감소</span>
              <span className="font-bold">-62%</span>
            </li>
            <li className="flex justify-between rounded-xl bg-brand-50 px-4 py-3">
              <span>알바생 이탈률 (추정)</span>
              <span className="font-bold text-brand-700">-18%</span>
            </li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
