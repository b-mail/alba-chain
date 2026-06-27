"use client";

import { useRouter } from "next/navigation";
import { Download, Eye, FileText, Plus, Upload, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { contractFiles } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusMeta: Record<
  string,
  { label: string; variant: "success" | "warning" | "secondary" }
> = {
  signed: { label: "체결 완료", variant: "success" },
  sent: { label: "서명 대기", variant: "warning" },
  draft: { label: "작성중", variant: "secondary" },
};

const sourceMeta: Record<
  string,
  { label: string; icon: typeof Upload; color: string }
> = {
  upload: { label: "PDF 업로드", icon: Upload, color: "text-brand-600 bg-brand-100" },
  generated: {
    label: "Agent 생성",
    icon: UserPlus,
    color: "text-accent-600 bg-accent-100",
  },
};

export default function OwnerContractsPage() {
  const router = useRouter();

  const signed = contractFiles.filter((c) => c.status === "signed").length;
  const pending = contractFiles.filter((c) => c.status !== "signed").length;

  return (
    <AppShell role="owner" title="계약서 관리">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <Badge variant="success">체결 {signed}건</Badge>
          <Badge variant="warning">대기 {pending}건</Badge>
        </div>
        <Button onClick={() => router.push("/owner/agents/contract")}>
          <Plus className="h-4 w-4" />
          계약서 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>계약서 원본</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contractFiles.map((c) => {
            const status = statusMeta[c.status];
            const source = sourceMeta[c.source];
            const SourceIcon = source.icon;
            return (
              <div
                key={c.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <FileText className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{c.workerName}</p>
                    <span className="text-sm text-muted-foreground">
                      {c.role}
                    </span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {c.fileName} · {c.fileSize} · {c.period}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
                        source.color,
                      )}
                    >
                      <SourceIcon className="h-3 w-3" />
                      {source.label}
                    </span>
                    {c.signedDate && (
                      <span className="text-[11px] text-muted-foreground">
                        서명일 {c.signedDate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="secondary">
                    <Eye className="h-4 w-4" />
                    열람
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                    원본
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </AppShell>
  );
}
