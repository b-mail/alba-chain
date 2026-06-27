import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { workerDocuments } from "@/lib/mock-data";
import type { WorkerDocument } from "@/lib/types";
import { Download, Eye, FileSignature, FileText, Receipt } from "lucide-react";

const typeConfig: Record<
  WorkerDocument["type"],
  { icon: typeof FileText; label: string; color: string }
> = {
  contract: {
    icon: FileSignature,
    label: "근로계약서",
    color: "text-brand-600 bg-brand-50",
  },
  payslip: {
    icon: Receipt,
    label: "급여명세서",
    color: "text-accent-600 bg-accent-50",
  },
  tax: {
    icon: FileText,
    label: "세금",
    color: "text-amber-600 bg-amber-50",
  },
  guide: {
    icon: FileText,
    label: "가이드",
    color: "text-slate-600 bg-slate-100",
  },
};

export default function WorkerDocumentsPage() {
  return (
    <AppShell role="worker" title="내 서류">
      <Card className="mb-5 border-brand-200 bg-brand-50/50 p-4">
        <p className="text-sm text-brand-800">
          생성, 등록한 근로계약서와 급여명세서가 자동으로 등록됩니다.
        </p>
      </Card>

      <div className="space-y-3">
        {workerDocuments.map((doc) => {
          const config = typeConfig[doc.type];
          const Icon = config.icon;
          return (
            <Card key={doc.id} className="p-4">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{doc.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {config.label} · {doc.updatedAt}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="secondary">
                      <Eye className="h-4 w-4" />
                      열람
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
