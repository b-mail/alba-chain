import Link from "next/link";
import {
  ArrowRight,
  Camera,
  FileSignature,
  Link2,
  MessageSquare,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/mock-data";
import { OntologyChainView } from "@/components/agents/ontology-chain";

export default function RoleSelectPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="px-6 py-10 text-center">
        <p className="text-sm font-bold tracking-widest text-brand-600">
          {BRAND.name}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight lg:text-4xl">
          {BRAND.nameKo}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">{BRAND.tagline}</p>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">{BRAND.value}</p>
      </header>

      <div className="mx-auto mb-8 max-w-3xl px-6">
        <OntologyChainView activeIndex={3} />
      </div>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-12">
        <p className="text-center text-sm font-semibold text-muted">
          역할을 선택하세요
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/owner/dashboard" className="group">
            <div className="relative h-full overflow-hidden rounded-3xl border-2 border-transparent bg-white p-8 shadow-lg transition hover:border-brand-500 hover:shadow-xl">
              <div className="gradient-brand absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl" />
              <div className="relative">
                <div className="mb-5 inline-flex rounded-2xl gradient-brand p-4 text-white">
                  <Store className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">사장님</h2>
                <p className="mt-2 text-muted">대충 찍어 올리면 끝나는 매장 자동화</p>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-brand-600" />
                    근로계약서 Agent · PDF/줄글
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-brand-600" />
                    대타·추가근무 Agent
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-600" />
                    VLM → 온톨로지 자동 연결
                  </li>
                </ul>
                <div className="mt-8 flex items-center gap-2 font-semibold text-brand-600">
                  사장님 콘솔
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/worker/dashboard" className="group">
            <div className="relative h-full overflow-hidden rounded-3xl border-2 border-transparent bg-white p-8 shadow-lg transition hover:border-accent-500 hover:shadow-xl">
              <div className="gradient-accent absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl" />
              <div className="relative">
                <div className="mb-5 inline-flex rounded-2xl gradient-accent p-4 text-white">
                  <Wallet className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">알바생</h2>
                <p className="mt-2 text-muted">캡처 한 장으로 추가 수당까지</p>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-accent-600" />
                    실수령액 · 주휴 · 3.3% 예측
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-accent-600" />
                    대타 톡 증빙 → 급여 자동 반영
                  </li>
                  <li className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-accent-600" />
                    매장 할일 · 캡처 보너스
                  </li>
                </ul>
                <div className="mt-8 flex items-center gap-2 font-semibold text-accent-600">
                  알바생 앱
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
