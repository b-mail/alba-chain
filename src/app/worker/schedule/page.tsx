import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { weeklySchedule } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const today = "수";

export default function WorkerSchedulePage() {
  return (
    <AppShell role="worker" title="스케줄" subtitle="이번 주 근무 일정">
      <Card className="mb-5 gradient-brand border-0 p-5 text-white">
        <p className="text-sm text-white/80">다음 근무</p>
        <p className="mt-1 text-xl font-bold">오늘 10:00 – 15:00</p>
        <p className="text-sm text-white/80">홀 · 강남 2호점</p>
      </Card>

      <div className="space-y-2">
        {weeklySchedule.map(({ day, shift, zone }) => {
          const isToday = day === today;
          const isOff = shift === "휴무";
          return (
            <Card
              key={day}
              className={cn(
                "flex items-center justify-between p-4",
                isToday && "border-brand-500 bg-brand-50",
              )}
            >
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                    isToday
                      ? "gradient-brand text-white"
                      : "bg-surface-muted text-muted",
                  )}
                >
                  {day}
                </span>
                <div>
                  <p className="font-semibold">{shift}</p>
                  <p className="text-xs text-muted">{zone}</p>
                </div>
              </div>
              {isToday && <Badge variant="brand">오늘</Badge>}
              {isOff && <Badge variant="default">휴무</Badge>}
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
