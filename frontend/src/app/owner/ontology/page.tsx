import { AppShell } from "@/components/layout/app-shell";
import { OntologyChainView } from "@/components/agents/ontology-chain";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { contracts, ontologyNodes } from "@/lib/mock-data";

export default function OwnerOntologyPage() {
  const coreNodes = ontologyNodes.filter((n) =>
    ["contract", "attendance", "payroll"].includes(n.category),
  );

  return (
    <AppShell
      role="owner"
      title="온톨로지"
      subtitle="[근로계약 – 업무 – 근태 – 급여] 지식 그래프"
    >
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>핵심 체인</CardTitle>
        </CardHeader>
        <OntologyChainView activeIndex={3} />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {coreNodes.map((node) => (
          <Card key={node.id} className="p-5">
            <div className="flex items-center justify-between">
              <p className="font-bold">{node.label}</p>
              <Badge variant="brand">{node.category}</Badge>
            </div>
            {node.children && (
              <p className="mt-2 text-sm text-muted">
                연결 → {node.children.join(", ")}
              </p>
            )}
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>등록된 계약 노드</CardTitle>
        </CardHeader>
        <div className="space-y-2">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3"
            >
              <span className="font-medium">
                {c.workerName} · {c.role}
              </span>
              <Badge variant={c.source === "upload" ? "success" : "brand"}>
                {c.source === "upload" ? "PDF 추출" : "Agent 생성"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
