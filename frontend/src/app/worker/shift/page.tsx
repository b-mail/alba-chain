"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquare, Sparkles } from "lucide-react";
import { PayForecastGraph } from "@/components/agents/pay-forecast-graph";
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
import { payForecastAfterShift, shiftProofAnalysis } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function WorkerShiftAgentPage() {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const runAnalysis = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 2000);
  };

  const analysis = shiftProofAnalysis;

  return (
    <AppShell role="worker" title="대타 · 추가근무">
      <Card className="mb-5 border-amber-200 bg-amber-50/60 p-4">
        <p className="text-sm text-amber-900">
          카톡으로 받은 대타·연장 요청 스크린샷을 올리면, AI Agent가 맥락과
          시간을 반영하여 실수령액 예측 및 근무시간을 업데이트 합니다.
        </p>
      </Card>

      {!processing && !done && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>대타 근무 증빙 (개인톡)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border-2 border-dashed border-border bg-white p-6">
              <div className="mx-auto max-w-xs rounded-2xl bg-slate-100 p-4">
                <div className="mb-3 text-center text-xs font-bold text-slate-500">
                  사장님 💬
                </div>
                <div className="mb-2 rounded-2xl rounded-tl-sm bg-yellow-300 px-3 py-2 text-sm">
                  민지야 내일 토요일 12시부터 6시 대타 가능해?
                </div>
                <div className="ml-auto w-fit rounded-2xl rounded-tr-sm bg-white px-3 py-2 text-sm shadow-sm">
                  네 가능해요!
                </div>
              </div>
              <Button className="mt-6 w-full" variant="accent" onClick={runAnalysis}>
                <MessageSquare className="h-4 w-4" />
                스크린샷 업로드
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {processing && (
        <Card className="mb-6 gap-0 p-12 text-center">
          <Sparkles className="mx-auto h-10 w-10 animate-pulse text-brand-600" />
          <p className="mt-4 text-lg font-semibold tracking-wide">분석중 . . .</p>
        </Card>
      )}

      {done && (
        <>
          <Card className="mb-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                분석 결과
                <Badge variant="success">
                  신뢰도 {Math.round(analysis.confidence * 100)}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "사건 유형", value: "대타 근무 (연장)" },
                  { label: "근무일", value: analysis.workDate },
                  { label: "시간", value: `${analysis.startTime} – ${analysis.endTime}` },
                  { label: "산정 시간", value: `${analysis.hours}시간` },
                  { label: "요청 시각", value: analysis.requestedAt },
                  { label: "근무 내용", value: analysis.mappedContractNode },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-surface-muted px-4 py-3">
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
                📝 {analysis.chatSummary}
              </p>
            </CardContent>
          </Card>

          <Card className="mb-5">
            <CardHeader>
              <CardTitle>실시간 예상 급여 그래프</CardTitle>
              <CardDescription>주휴수당 · 3.3% 원천징수 자동 반영</CardDescription>
            </CardHeader>
            <CardContent>
              <PayForecastGraph
                nodes={payForecastAfterShift}
                highlightId="substitute"
              />
              <p className="mt-4 text-center text-sm text-accent-600">
                실수령 예상 <strong>{formatCurrency(886454)}</strong>{" "}
                (대타 +{formatCurrency(51500)} 반영)
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent-200 bg-accent-50/40 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-accent-600" />
              <div>
                <p className="font-bold text-accent-800">추가근무 급여 업데이트 완료</p>
                <p className="text-sm text-accent-700">
                  6/28일 추가근무 시간 6h가 업데이트 되었습니다.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
}
