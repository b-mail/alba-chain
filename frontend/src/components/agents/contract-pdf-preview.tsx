import { FileText } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { ContractExtract } from "@/lib/types";

type ContractPdfPreviewProps = {
  data: ContractExtract;
  fileName: string;
  fileSize?: string;
  className?: string;
};

export function ContractPdfPreview({
  data,
  fileName,
  fileSize,
  className,
}: ContractPdfPreviewProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-secondary",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2.5">
        <FileText className="h-4 w-4 shrink-0 text-red-500" />
        <span className="truncate text-sm font-medium">{fileName}</span>
        {fileSize && (
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {fileSize}
          </span>
        )}
      </div>

      <div className="max-h-[520px] overflow-y-auto p-4">
        <div className="mx-auto max-w-[460px] rounded-sm bg-white p-8 text-[13px] leading-relaxed text-slate-800 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-center text-lg font-bold tracking-wide">
            표준 근로계약서
          </h3>
          <p className="mt-1 text-center text-xs text-slate-400">
            STANDARD LABOR CONTRACT
          </p>

          <div className="mt-6 space-y-1.5">
            <p>
              <span className="text-slate-500">사업주(갑) : </span>
              알바체인 {data.storeName}
            </p>
            <p>
              <span className="text-slate-500">근로자(을) : </span>
              {data.workerName}
            </p>
          </div>

          <p className="mt-5">
            위 당사자는 다음과 같이 근로계약을 체결한다.
          </p>

          <ol className="mt-4 space-y-3">
            <li>
              <p className="font-semibold">1. 근로계약기간</p>
              <p className="mt-0.5 text-slate-600">
                {data.startDate} 부터 (기간의 정함이 없음)
              </p>
            </li>
            <li>
              <p className="font-semibold">2. 근무장소</p>
              <p className="mt-0.5 text-slate-600">{data.storeName}</p>
            </li>
            <li>
              <p className="font-semibold">3. 업무의 내용</p>
              <p className="mt-0.5 text-slate-600">{data.role}</p>
            </li>
            <li>
              <p className="font-semibold">4. 소정근로시간</p>
              <p className="mt-0.5 text-slate-600">
                {data.workHours} (휴게시간 포함) · 주 {data.weeklyHours}시간
              </p>
            </li>
            <li>
              <p className="font-semibold">5. 근무일 / 휴일</p>
              <p className="mt-0.5 text-slate-600">
                매주 {data.workDays} 근무 / 그 외 휴무
              </p>
            </li>
            <li>
              <p className="font-semibold">6. 임금</p>
              <ul className="mt-0.5 space-y-0.5 text-slate-600">
                <li>- 시급 : {formatCurrency(data.hourlyWage)}</li>
                <li>- 임금 지급일 : {data.payDay}</li>
                <li>- 지급방법 : 근로자 명의 예금통장 입금</li>
                <li>- 주휴수당은 근로기준법에 따라 별도 지급</li>
              </ul>
            </li>
            <li>
              <p className="font-semibold">7. 연차유급휴가</p>
              <p className="mt-0.5 text-slate-600">
                근로기준법이 정하는 바에 따라 부여한다.
              </p>
            </li>
            <li>
              <p className="font-semibold">8. 사회보험 적용여부</p>
              <p className="mt-0.5 text-slate-600">
                고용보험 · 산재보험 · 국민연금 · 건강보험 (해당 시 적용)
              </p>
            </li>
            <li>
              <p className="font-semibold">9. 기타</p>
              <p className="mt-0.5 text-slate-600">
                이 계약에 정함이 없는 사항은 근로기준법령에 의한다.
              </p>
            </li>
          </ol>

          <p className="mt-6 text-center text-slate-500">{data.startDate}</p>

          <div className="mt-6 space-y-3 border-t border-dashed border-slate-200 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">(갑) 사업주</span>
              <span>알바체인 {data.storeName} (인)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">(을) 근로자</span>
              <span>{data.workerName} (서명)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
