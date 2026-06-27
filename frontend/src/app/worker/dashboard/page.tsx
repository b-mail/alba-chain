import Link from "next/link";
import {
  Camera,
  ChevronRight,
  FileText,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PayForecastGraph } from "@/components/agents/pay-forecast-graph";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { payForecastBase, storeTodos, workerProfile } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function WorkerDashboardPage() {
  const pendingTodos = storeTodos.filter((t) => t.status === "pending");

  return (
    <AppShell
      role="worker"
      title={`안녕하세요, ${workerProfile.name}님`}
      subtitle={`${workerProfile.storeName} · 시급 ${formatCurrency(workerProfile.hourlyWage)}`}
    >
      <Card className="mb-5 gap-0 p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">이번 달 실수령 예상</p>
          <Link href="/worker/pay" className="text-xs font-medium text-brand-600">
            상세
            <ChevronRight className="inline h-3 w-3" />
          </Link>
        </div>
        <PayForecastGraph nodes={payForecastBase} />
      </Card>

      <div className="mb-5 grid grid-cols-3 gap-2">
        <Link href="/worker/shift">
          <Card className="p-3 text-center">
            <MessageSquare className="mx-auto h-5 w-5 text-amber-600" />
            <p className="mt-1 text-xs font-semibold">대타 증빙</p>
          </Card>
        </Link>
        <Link href="/worker/pay">
          <Card className="p-3 text-center">
            <Wallet className="mx-auto h-5 w-5 text-accent-600" />
            <p className="mt-1 text-xs font-semibold">급여 예측</p>
          </Card>
        </Link>
        <Link href="/worker/documents">
          <Card className="p-3 text-center">
            <FileText className="mx-auto h-5 w-5 text-brand-600" />
            <p className="mt-1 text-xs font-semibold">내 서류</p>
          </Card>
        </Link>
      </div>

      <Link href="/worker/capture">
        <Button size="lg" className="mb-6 w-full" variant="accent">
          <Camera className="h-5 w-5" />
          매장 할일
        </Button>
      </Link>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">매장 할일 {pendingTodos.length}건</h2>
        <Link href="/worker/todos" className="text-sm font-medium text-brand-600">
          실시간
        </Link>
      </div>
      <div className="space-y-3">
        {pendingTodos.map((todo) => (
          <Card key={todo.id} className="p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold">{todo.title}</p>
                <p className="text-xs text-muted">
                  {todo.zone} · {todo.dueTime}
                </p>
              </div>
              {todo.isNew && <Badge variant="success">NEW</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
