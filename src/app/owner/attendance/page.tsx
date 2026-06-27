import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { attendanceRecords } from "@/lib/mock-data";
import { Calendar, Download } from "lucide-react";

const statusConfig = {
  working: { label: "근무중", variant: "brand" as const },
  completed: { label: "퇴근", variant: "success" as const },
  late: { label: "지각", variant: "warning" as const },
  absent: { label: "결근", variant: "danger" as const },
};

export default function OwnerAttendancePage() {
  const working = attendanceRecords.filter((r) => r.status === "working").length;
  const late = attendanceRecords.filter((r) => r.status === "late").length;

  return (
    <AppShell
      role="owner"
      title="근태 관리"
      subtitle="출퇴근 기록을 웹에서 확인하고 급여 계산에 자동 반영"
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Button>
          <Calendar className="h-4 w-4" />
          이번 주 근태표
        </Button>
        <Button variant="secondary">
          <Download className="h-4 w-4" />
          엑셀 내보내기
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="현재 근무중" value={`${working}명`} accent />
        <StatCard label="오늘 지각" value={`${late}건`} hint="자동 알림 발송됨" />
        <StatCard label="이번 주 총 근무" value="142.5h" hint="급여 산정 연동" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>오늘 · 어제 근태</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-3 font-medium">알바생</th>
                <th className="pb-3 font-medium">날짜</th>
                <th className="pb-3 font-medium">출근</th>
                <th className="pb-3 font-medium">퇴근</th>
                <th className="pb-3 font-medium">근무시간</th>
                <th className="pb-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => {
                const status = statusConfig[record.status];
                return (
                  <tr key={record.id} className="border-b border-border/60">
                    <td className="py-4 font-medium">{record.workerName}</td>
                    <td className="py-4">{record.date}</td>
                    <td className="py-4">{record.clockIn}</td>
                    <td className="py-4">{record.clockOut ?? "-"}</td>
                    <td className="py-4">
                      {record.hours > 0 ? `${record.hours}h` : "-"}
                    </td>
                    <td className="py-4">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6 bg-surface-muted">
        <p className="text-sm text-muted">
          💡 알바생이 앱에서 출퇴근 버튼을 누르거나, 매장 QR을 스캔하면
          근태가 자동 기록되고 <strong>급여 · 송금</strong> 화면에 반영됩니다.
        </p>
      </Card>
    </AppShell>
  );
}
