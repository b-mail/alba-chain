import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { taxSummary } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { FileCheck, Sparkles } from "lucide-react";

const filingBadge = {
  pending: { label: "신고 예정", variant: "warning" as const },
  filed: { label: "신고 완료", variant: "brand" as const },
  completed: { label: "납부 완료", variant: "success" as const },
};

export default function OwnerTaxPage() {
  const badge = filingBadge[taxSummary.filingStatus];

  return (
    <AppShell
      role="owner"
      title="세금 자동화"
      subtitle="원천징수 · 지방세 · 4대보험 신고를 자동 처리"
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Button>
          <FileCheck className="h-4 w-4" />
          이번 달 신고 실행
        </Button>
        <Button variant="secondary">신고 내역 다운로드</Button>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-800">
        <Sparkles className="h-4 w-4 shrink-0" />
        <span>
          급여 지급 시 원천징수가 자동 계산되고, 매월 {taxSummary.dueDate}{" "}
         까지 홈택스 연동 신고가 준비됩니다.
        </span>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-bold">{taxSummary.period}</h2>
        <Badge variant={badge.variant}>{badge.label}</Badge>
        <span className="text-sm text-muted">마감 {taxSummary.dueDate}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="총 인건비"
          value={formatCurrency(taxSummary.totalWages)}
        />
        <StatCard
          label="원천징수세"
          value={formatCurrency(taxSummary.incomeTax)}
        />
        <StatCard
          label="지방소득세"
          value={formatCurrency(taxSummary.localTax)}
        />
        <StatCard
          label="4대보험 (사업주)"
          value={formatCurrency(taxSummary.insurance)}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>자동 처리 항목</CardTitle>
            <CardDescription>매월 급여 마감 시 자동 실행</CardDescription>
          </CardHeader>
          <ul className="space-y-3">
            {[
              "근로소득 원천징수영수증 발급",
              "원천세 신고서 (홈택스) 초안 생성",
              "지방소득세 특별징수 신고",
              "알바생 연말정산 자료 축적",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-xl bg-surface-muted px-4 py-3 text-sm"
              >
                <FileCheck className="h-4 w-4 shrink-0 text-accent-600" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>신고 타임라인</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {[
              { step: "급여 마감", date: "6/25", done: true },
              { step: "원천징수 집계", date: "6/26", done: true },
              { step: "홈택스 신고", date: "7/10", done: false },
              { step: "납부 확인", date: "7/10", done: false },
            ].map(({ step, date, done }) => (
              <div key={step} className="flex items-center gap-4">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? "bg-accent-100 text-accent-600"
                      : "bg-surface-muted text-muted"
                  }`}
                >
                  {done ? "✓" : "·"}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{step}</p>
                  <p className="text-xs text-muted">{date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
