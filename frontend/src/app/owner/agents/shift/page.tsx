import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { OntologyChainView } from "@/components/agents/ontology-chain";
import { PayForecastGraph } from "@/components/agents/pay-forecast-graph";
import { shiftProofs, payForecastAfterShift } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Check, X } from "lucide-react";

export default function OwnerShiftAgentPage() {
  const proof = shiftProofs[0];

  return (
    <AppShell
      role="owner"
      title="대타 · 추가근무 Agent"
      subtitle="알바생 증빙 VLM 분석 · 온톨로지 매핑 · 급여 그래프 연동"
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>검토 대기 · VLM 매핑 완료</CardTitle>
        </CardHeader>
        {proof.analysis && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold">{proof.workerName}</span>
              <Badge variant="warning">대타 근무</Badge>
              <Badge variant="brand">
                신뢰도 {Math.round(proof.analysis.confidence * 100)}%
              </Badge>
            </div>
            <p className="text-sm text-muted">{proof.analysis.chatSummary}</p>
            <dl className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-muted p-3">
                <dt className="text-xs text-muted">근무일</dt>
                <dd className="font-semibold">{proof.analysis.workDate}</dd>
              </div>
              <div className="rounded-xl bg-surface-muted p-3">
                <dt className="text-xs text-muted">시간</dt>
                <dd className="font-semibold">
                  {proof.analysis.startTime} – {proof.analysis.endTime}
                </dd>
              </div>
              <div className="rounded-xl bg-surface-muted p-3">
                <dt className="text-xs text-muted">예상 추가 급여</dt>
                <dd className="font-semibold text-accent-600">
                  +{formatCurrency(proof.payDelta ?? 0)}
                </dd>
              </div>
            </dl>
            <OntologyChainView activeIndex={3} path={proof.analysis.ontologyPath} />
            <div className="flex gap-3">
              <Button variant="accent">
                <Check className="h-4 w-4" />
                승인 · 급여 반영
              </Button>
              <Button variant="secondary">
                <X className="h-4 w-4" />
                반려
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>알바생 급여 그래프 (승인 시)</CardTitle>
        </CardHeader>
        <PayForecastGraph nodes={payForecastAfterShift} highlightId="substitute" />
      </Card>
    </AppShell>
  );
}
