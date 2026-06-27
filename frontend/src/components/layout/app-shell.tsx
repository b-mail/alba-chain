"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Camera,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/mock-data";

const ownerNavSections = [
  {
    label: "메뉴",
    items: [
      { href: "/owner/dashboard", label: "대시보드", icon: LayoutDashboard },
      { href: "/owner/staff", label: "아르바이트 관리", icon: Users },
      { href: "/owner/payroll", label: "급여 관리", icon: Wallet },
      { href: "/owner/contracts", label: "계약서 관리", icon: FileText },
    ],
  },
];

const workerNav = [
  { href: "/worker/dashboard", label: "홈", icon: LayoutDashboard },
  { href: "/worker/todos", label: "할일", icon: ClipboardList },
  { href: "/worker/capture", label: "캡처", icon: Camera, fab: true },
  { href: "/worker/pay", label: "급여", icon: Wallet },
  { href: "/worker/documents", label: "서류", icon: FileText },
];

type AppShellProps = {
  role: "owner" | "worker";
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AppShell({ role, title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();

  if (role === "worker") {
    return (
      <div className="mx-auto min-h-screen max-w-lg bg-background pb-24">
        <header className="sticky top-0 z-20 border-b border-border bg-card/90 px-5 py-4 backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {BRAND.nameKo}
          </p>
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </header>
        <main className="px-5 py-5">{children}</main>
        <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-lg -translate-x-1/2 border-t border-border bg-card/95 px-2 py-2 backdrop-blur-md">
          <div className="flex justify-around">
            {workerNav.map(({ href, label, icon: Icon, fab }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition",
                    active && !fab
                      ? "text-foreground"
                      : !fab
                        ? "text-muted-foreground hover:text-foreground"
                        : "",
                    fab &&
                      "relative -mt-6 rounded-2xl gradient-accent px-4 py-3 text-white shadow-lg shadow-accent-500/30",
                  )}
                >
                  <Icon className={cn("h-5 w-5", fab && "h-6 w-6")} />
                  <span className={fab ? "font-bold" : ""}>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-card lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground">
            A
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold">{BRAND.name}</p>
            <p className="text-xs text-muted-foreground">강남 2호점</p>
          </div>
        </div>

        <nav className="flex-1 space-y-6 px-3 py-2">
          {ownerNavSections.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                        active
                          ? "bg-secondary font-semibold text-foreground"
                          : "font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            역할 선택
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* 상단 바 */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-6 py-3 backdrop-blur-md lg:px-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="무엇이든 검색하세요"
              className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary">
              <Bell className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary">
              <HelpCircle className="h-4 w-4" />
            </button>
            <span className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white">
              사장
            </span>
          </div>
        </div>

        {/* 콘텐츠 */}
        <main className="flex-1 px-6 py-7 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
