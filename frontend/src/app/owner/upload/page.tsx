"use client";

import { useState } from "react";
import { Camera, FileText, Mic, Sparkles, Upload } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadItems } from "@/lib/mock-data";

const uploadTypes = [
  {
    id: "photo",
    icon: Camera,
    label: "사진",
    desc: "체크리스트·현장 사진",
    color: "bg-violet-100 text-violet-700",
  },
  {
    id: "voice",
    icon: Mic,
    label: "음성",
    desc: "SOP 설명·구두 지시",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "note",
    icon: FileText,
    label: "메모",
    desc: "마감 절차·특이사항",
    color: "bg-amber-100 text-amber-700",
  },
];

export default function OwnerUploadPage() {
  const [dragging, setDragging] = useState(false);

  return (
    <AppShell
      role="owner"
      title="업로드 허브"
      subtitle="대충 찍어 올리면 AI가 업무·SOP·온톨로지로 자동 변환합니다"
    >
      <div
        className={`mb-8 rounded-3xl border-2 border-dashed p-12 text-center transition ${
          dragging
            ? "border-brand-500 bg-brand-50"
            : "border-border bg-white"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
      >
        <div className="mx-auto mb-4 inline-flex rounded-2xl gradient-brand p-4 text-white">
          <Upload className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">여기에 드래그하거나 클릭해서 업로드</h2>
        <p className="mt-2 text-sm text-muted">
          JPG, PNG, MP3, TXT · 최대 50MB
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {uploadTypes.map(({ icon: Icon, label, color }) => (
            <Button key={label} variant="secondary" size="sm">
              <span className={`rounded-lg p-1 ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
              {label} 올리기
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
        <Sparkles className="h-4 w-4 shrink-0" />
        <span>
          AI가 업로드 내용을 분석해 <strong>구역 → 업무 → SOP</strong> 온톨로지
          트리에 자동 매핑합니다. 불확실한 항목만 검토 요청됩니다.
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>업로드 처리 현황</CardTitle>
          <CardDescription>자동 매핑 결과와 검토가 필요한 항목</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-3 font-medium">유형</th>
                <th className="pb-3 font-medium">내용</th>
                <th className="pb-3 font-medium">매핑</th>
                <th className="pb-3 font-medium">상태</th>
                <th className="pb-3 font-medium">시간</th>
              </tr>
            </thead>
            <tbody>
              {uploadItems.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="py-4 capitalize">{item.type}</td>
                  <td className="py-4 font-medium">{item.label}</td>
                  <td className="py-4">
                    {item.mappedTasks > 0 ? `${item.mappedTasks}개 업무` : "-"}
                  </td>
                  <td className="py-4">
                    <Badge
                      variant={
                        item.status === "mapped"
                          ? "success"
                          : item.status === "processing"
                            ? "brand"
                            : "warning"
                      }
                    >
                      {item.status === "mapped"
                        ? "완료"
                        : item.status === "processing"
                          ? "처리중"
                          : "검토 필요"}
                    </Badge>
                  </td>
                  <td className="py-4 text-muted">{item.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
