"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Database,
  FileText,
  Loader2,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";
import { ContractPdfPreview } from "@/components/agents/contract-pdf-preview";
import { ExtractedFieldsPanel } from "@/components/agents/extracted-fields";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  extractedFromPdf,
  extractedFromText,
  sampleContractText,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Flow = "upload" | "new";

function ContractAgentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flow: Flow = searchParams.get("flow") === "new" ? "new" : "upload";

  const [textInput, setTextInput] = useState(sampleContractText);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const loadFile = () => {
    setFileLoading(true);
    setTimeout(() => {
      setFileLoading(false);
      setFileSelected(true);
    }, 3000);
  };

  const runPipeline = () => {
    setProcessing(true);
    setDone(false);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 2600);
  };

  const reset = () => {
    setProcessing(false);
    setDone(false);
  };

  const clearFile = () => {
    setFileSelected(false);
    setFileLoading(false);
    reset();
  };

  const extracted = flow === "upload" ? extractedFromPdf : extractedFromText;

  return (
    <AppShell role="owner" title="근로계약서">
      <h2 className="mb-6 text-lg font-bold">
        {flow === "upload"
          ? "근로계약서를 업로드 해주세요"
          : "알바 정보를 입력해 주세요"}
      </h2>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 입력 영역 */}
        <div className="space-y-6">
          {flow === "upload" ? (
            <Card>
              <CardHeader>
                <CardTitle>근로계약서 PDF 업로드</CardTitle>
              </CardHeader>
              <CardContent>
                {fileLoading ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
                    <p className="mt-4 text-lg font-semibold">업로드 중 . . .</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      김민지_근로계약서.pdf
                    </p>
                  </div>
                ) : !fileSelected ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={loadFile}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") loadFile();
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      loadFile();
                    }}
                    className={cn(
                      "flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed p-10 text-center transition",
                      dragOver
                        ? "border-brand-500 bg-brand-50"
                        : "border-border hover:border-brand-400 hover:bg-secondary",
                    )}
                  >
                    <Upload className="h-10 w-10 text-brand-600" />
                    <p className="mt-3 font-semibold">
                      PDF 파일을 여기에 놓으세요
                    </p>
                    <p className="text-sm text-muted-foreground">
                      스캔·사진 PDF도 OK · 클릭하여 선택
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ContractPdfPreview
                      data={extractedFromPdf}
                      fileName="김민지_근로계약서.pdf"
                      fileSize="2.4 MB"
                    />
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={runPipeline}
                        disabled={processing || done}
                      >
                        <Upload className="h-4 w-4" />
                        업로드
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={clearFile}
                        disabled={processing}
                      >
                        다른 파일
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>알바 정보 줄글 입력</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={8}
                />
                <Button
                  className="mt-4"
                  onClick={runPipeline}
                  disabled={processing}
                >
                  <Sparkles className="h-4 w-4" />
                  계약서 생성
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Agent 동작 영역 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Agent</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 대기 */}
              {!processing && !done && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <FileText className="h-7 w-7" />
                  </div>
                  <p className="mt-4 font-semibold">Agent 대기 중</p>
                </div>
              )}

              {/* 동작 중 */}
              {processing && (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
                  <p className="mt-4 text-lg font-semibold">분석중 . . .</p>
                </div>
              )}

              {/* 완료 */}
              {done && (
                <div className="space-y-5">
                  <div className="flex flex-col items-center rounded-2xl bg-accent-50/60 py-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-600">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <p className="mt-3 font-bold text-accent-800">
                      {flow === "upload"
                        ? "분석 완료 · 등록되었습니다"
                        : "계약서 생성 · 전송 완료"}
                    </p>
                    <p className="mt-1 text-sm text-accent-700">
                      {flow === "upload"
                        ? "근로계약 정보가 추출되어 저장되었습니다."
                        : "근로계약서가 알바생에게 전송되었습니다."}
                    </p>
                  </div>

                  <ExtractedFieldsPanel
                    data={extracted}
                    title="추출된 근로계약 정보"
                  />

                  <div className="flex gap-2">
                    {flow === "upload" ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/owner/staff/${extracted.staffId ?? "s1"}`)
                        }
                      >
                        <Database className="h-4 w-4" />
                        등록 내역
                      </Button>
                    ) : (
                      <Button size="sm" variant="accent">
                        <Send className="h-4 w-4" />
                        전송 내역
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={reset}>
                      다시하기
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

export default function ContractAgentPage() {
  return (
    <Suspense fallback={null}>
      <ContractAgentInner />
    </Suspense>
  );
}
