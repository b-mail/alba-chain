import { cn, formatCurrency } from "@/lib/utils";
import type { ContractExtract } from "@/lib/types";

type ExtractedFieldsProps = {
  data: ContractExtract;
  title?: string;
  className?: string;
};

export function ExtractedFieldsPanel({
  data,
  title = "추출된 근로계약 정보",
  className,
}: ExtractedFieldsProps) {
  const fields: { label: string; value: string }[] = [
    { label: "근로자", value: data.workerName },
    { label: "업무", value: data.role },
    { label: "시급", value: formatCurrency(data.hourlyWage) },
    { label: "주 근로시간", value: `${data.weeklyHours}시간` },
    { label: "근무 요일", value: data.workDays },
    { label: "근무 시간", value: data.workHours },
    { label: "시작일", value: data.startDate },
    { label: "매장", value: data.storeName },
    { label: "급여 지급일", value: data.payDay },
  ];

  return (
    <div className={cn("rounded-2xl border border-brand-200 bg-brand-50/40 p-5", className)}>
      <p className="mb-4 text-sm font-bold text-brand-800">{title}</p>
      <dl className="grid gap-3 sm:grid-cols-2">
        {fields.map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-white px-4 py-3">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-0.5 font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
