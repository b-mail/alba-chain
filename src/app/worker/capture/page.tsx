"use client";

import { useState } from "react";
import { Camera, CheckCircle2, ImagePlus, RotateCcw, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { workerTasks } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

type CaptureStep = "select" | "preview" | "analyzing" | "done";

export default function WorkerCapturePage() {
  const [step, setStep] = useState<CaptureStep>("select");
  const [selectedTask, setSelectedTask] = useState(workerTasks[0]);

  const handleCapture = () => {
    setStep("preview");
  };

  const handleSubmit = () => {
    setStep("analyzing");
    setTimeout(() => setStep("done"), 1800);
  };

  return (
    <AppShell
      role="worker"
      title="원샷 캡처"
      subtitle="업무 완료 사진 한 장으로 AI 검증 · 보너스"
    >
      {step === "select" && (
        <>
          <p className="mb-3 text-sm font-medium text-muted">업무 선택</p>
          <div className="mb-6 space-y-2">
            {workerTasks
              .filter((t) => t.status !== "verified")
              .map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedTask(task)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedTask.id === task.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-border bg-white"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-semibold">{task.title}</span>
                    <Badge variant="success">+{formatCurrency(task.bonus)}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">{task.captureHint}</p>
                </button>
              ))}
          </div>

          <div className="rounded-3xl border-2 border-dashed border-brand-300 bg-brand-50/50 p-10 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-full gradient-accent p-5 text-white shadow-lg">
              <Camera className="h-10 w-10" />
            </div>
            <p className="font-bold">카메라로 촬영하거나 갤러리에서 선택</p>
            <p className="mt-1 text-sm text-muted">{selectedTask.captureHint}</p>
            <div className="mt-6 flex gap-3">
              <Button className="flex-1" variant="accent" onClick={handleCapture}>
                <Camera className="h-5 w-5" />
                촬영
              </Button>
              <Button className="flex-1" variant="secondary" onClick={handleCapture}>
                <ImagePlus className="h-5 w-5" />
                앨범
              </Button>
            </div>
          </div>
        </>
      )}

      {step === "preview" && (
        <div>
          <div className="mb-4 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200">
            <div className="flex h-full items-center justify-center text-muted">
              <Camera className="h-16 w-16 opacity-30" />
            </div>
          </div>
          <Card className="mb-4 p-4">
            <p className="font-semibold">{selectedTask.title}</p>
            <p className="text-sm text-muted">{selectedTask.zone}</p>
          </Card>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setStep("select")}>
              <RotateCcw className="h-4 w-4" />
              다시 찍기
            </Button>
            <Button className="flex-1" variant="accent" onClick={handleSubmit}>
              제출하기
            </Button>
          </div>
        </div>
      )}

      {step === "analyzing" && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 inline-flex animate-pulse rounded-full bg-brand-100 p-6 text-brand-600">
            <Sparkles className="h-10 w-10" />
          </div>
          <p className="text-lg font-bold">AI가 캡처를 검증 중...</p>
          <p className="mt-2 text-sm text-muted">
            온톨로지 SOP와 비교해 업무 완료 여부를 확인합니다
          </p>
        </div>
      )}

      {step === "done" && (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-accent-100 p-6 text-accent-600">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <p className="text-2xl font-bold">검증 완료!</p>
          <p className="mt-2 text-lg text-accent-600">
            +{formatCurrency(selectedTask.bonus)} 보너스 적립
          </p>
          <p className="mt-1 text-sm text-muted">5일 연속 캡처 스트릭 유지 🔥</p>
          <Button className="mt-8 w-full" onClick={() => setStep("select")}>
            다른 업무 캡처하기
          </Button>
        </div>
      )}
    </AppShell>
  );
}
