import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { earnings } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Flame, TrendingUp } from "lucide-react";

export default function WorkerEarningsPage() {
  const totalBonus = earnings.reduce((sum, e) => sum + e.bonus, 0);
  const pendingBonus = earnings
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + e.bonus, 0);

  return (
    <AppShell role="worker" title="수당 · 보너스" subtitle="캡처로 받은 추가 수당">
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Card className="gap-1 p-4">
          <p className="text-xs text-muted">이번 주 보너스</p>
          <p className="text-xl font-bold text-accent-600">
            {formatCurrency(totalBonus)}
          </p>
        </Card>
        <Card className="gap-1 p-4">
          <p className="text-xs text-muted">정산 대기</p>
          <p className="text-xl font-bold">{formatCurrency(pendingBonus)}</p>
        </Card>
      </div>

      <Card className="mb-5 flex flex-row items-center gap-3 bg-amber-50 p-4">
        <Flame className="h-8 w-8 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold">5일 연속 캡처 스트릭</p>
          <p className="text-xs text-muted">다음 보너스 +10% (2일 남음)</p>
        </div>
      </Card>

      <Card className="mb-5 flex flex-row items-center gap-3 p-4">
        <TrendingUp className="h-8 w-8 shrink-0 text-brand-600" />
        <div>
          <p className="text-sm font-semibold">지난주 대비 +18%</p>
          <p className="text-xs text-muted">캡처 보너스 증가</p>
        </div>
      </Card>

      <h2 className="mb-3 font-bold">내역</h2>
      <div className="space-y-3">
        {earnings.map((entry) => (
          <Card key={entry.id} className="gap-0 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{entry.task}</p>
                <p className="text-xs text-muted">{entry.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent-600">
                  +{formatCurrency(entry.bonus)}
                </p>
                <Badge variant={entry.status === "paid" ? "success" : "warning"}>
                  {entry.status === "paid" ? "지급완료" : "대기"}
                </Badge>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">
              기본 {formatCurrency(entry.basePay)} + 보너스{" "}
              {formatCurrency(entry.bonus)}
            </p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
