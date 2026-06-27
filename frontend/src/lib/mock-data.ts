import type {
  ChartPoint,
  Contract,
  ContractExtract,
  ContractFile,
  OntologyNode,
  PayForecastNode,
  PayrollDue,
  ShiftProof,
  ShiftProofAnalysis,
  Staff,
  StoreStats,
  StoreTodo,
  Task,
  UploadItem,
  WorkerDocument,
} from "./types";

export const BRAND = {
  name: "Alba-Chain",
  nameKo: "알바체인",
  tagline:
    "사장님에겐 대충 찍어 올리면 끝, 알바생에겐 캡처 한 장으로 추가 수당까지",
  value:
    "비정형 데이터(사진·캡처·텍스트)를 VLM으로 분석해 [근로계약–업무–근태–급여] 온톨로지로 연결",
};

export const sampleContractText = `민지야 이번주 토요일부터 홀 알바 시작해줘.
시급 만원삼백이고 주 20시간 정도, 수목금 오후 5시부터 10시까지야.
3월 1일부터 시작하고 급여는 매월 10일에 줘.
강남 2호점에서 일하면 돼.`;

export const extractedFromPdf: ContractExtract = {
  staffId: "s1",
  workerName: "김민지",
  role: "홀 서빙",
  hourlyWage: 10300,
  weeklyHours: 20,
  workDays: "수, 목, 금",
  workHours: "17:00 – 22:00",
  startDate: "2026-03-01",
  storeName: "강남 2호점",
  payDay: "매월 10일",
};

export const extractedFromText: ContractExtract = {
  workerName: "이준호",
  role: "홀 서빙",
  hourlyWage: 10300,
  weeklyHours: 20,
  workDays: "수, 목, 금",
  workHours: "17:00 – 22:00",
  startDate: "2026-03-01",
  storeName: "강남 2호점",
  payDay: "매월 10일",
};

export const contracts: Contract[] = [
  {
    id: "c1",
    workerName: "김민지",
    role: "홀 서빙",
    hourlyWage: 10300,
    weeklyHours: 20,
    startDate: "2026-03-01",
    status: "imported",
    source: "upload",
  },
  {
    id: "c2",
    workerName: "박서연",
    role: "주방 보조",
    hourlyWage: 11000,
    weeklyHours: 25,
    startDate: "2026-06-15",
    status: "signed",
    source: "generated",
  },
];

export const ontologyChain = [
  { id: "contract", label: "근로계약", icon: "📄" },
  { id: "task", label: "업무", icon: "📋" },
  { id: "attendance", label: "근태", icon: "⏱" },
  { id: "payroll", label: "급여", icon: "💰" },
];

export const payForecastBase: PayForecastNode[] = [
  { id: "base", label: "기본급 (예상)", amount: 824000, type: "base" },
  { id: "holiday", label: "주휴수당", amount: 41200, type: "weekly_holiday" },
  { id: "substitute", label: "대타·연장", amount: 0, type: "substitute" },
  { id: "tax", label: "원천징수 (3.3%)", amount: -28546, type: "tax" },
  { id: "net", label: "실수령 예상", amount: 836654, type: "net" },
];

export const payForecastAfterShift: PayForecastNode[] = [
  { id: "base", label: "기본급 (예상)", amount: 824000, type: "base" },
  { id: "holiday", label: "주휴수당", amount: 41200, type: "weekly_holiday" },
  { id: "substitute", label: "대타·연장 (+6/28)", amount: 51500, type: "substitute" },
  { id: "tax", label: "원천징수 (3.3%)", amount: -30246, type: "tax" },
  { id: "net", label: "실수령 예상", amount: 886454, type: "net" },
];

export const shiftProofAnalysis: ShiftProofAnalysis = {
  eventType: "substitute",
  requestedAt: "2026-06-27 14:32",
  workDate: "2026-06-28 (토)",
  startTime: "12:00",
  endTime: "18:00",
  hours: 6,
  confidence: 0.94,
  chatSummary:
    "사장님이 토요일 12–6시 대타 요청. 알바생이 '네 가능해요'로 수락.",
  mappedContractNode: "김민지 · 단시간 근로계약 (홀)",
  ontologyPath: [
    "근로계약서",
    "연장·대타 근무 이벤트",
    "6/28 근태 노드",
    "급여 예측 그래프",
  ],
};

export const shiftProofs: ShiftProof[] = [
  {
    id: "sp1",
    workerName: "김민지",
    status: "mapped",
    analysis: shiftProofAnalysis,
    payDelta: 51500,
  },
];

export const storeTodos: StoreTodo[] = [
  {
    id: "st1",
    title: "테이블 4번 정리",
    zone: "홀",
    priority: "high",
    dueTime: "11:30",
    status: "pending",
    isNew: true,
  },
  {
    id: "st2",
    title: "냉장고 온도 기록",
    zone: "주방",
    priority: "normal",
    dueTime: "16:00",
    status: "pending",
  },
];

export const workerDocuments: WorkerDocument[] = [
  {
    id: "d1",
    title: "근로계약서 (2026.03~)",
    type: "contract",
    updatedAt: "2026-03-01",
    status: "available",
  },
  {
    id: "d2",
    title: "6월 급여명세서",
    type: "payslip",
    updatedAt: "2026-06-10",
    status: "available",
  },
];

export const MIN_WAGE_2026 = 10320;

export const workerProfile = {
  name: "김민지",
  hourlyWage: 10300,
  weeklyHours: 20,
  storeName: "강남 2호점",
};

export const storeStats: StoreStats = {
  automationRate: 0.87,
  verifiedCaptures: 142,
  pendingReviews: 3,
  bonusPaid: 284000,
  activeWorkers: 6,
};

export const ontologyNodes: OntologyNode[] = [
  { id: "node-contract", label: "근로계약", category: "contract", children: ["node-attendance"] },
  { id: "node-attendance", label: "근태", category: "attendance", children: ["node-payroll"] },
  { id: "node-payroll", label: "급여", category: "payroll" },
  { id: "zone-hall", label: "홀", category: "zone", children: ["task-table"] },
  { id: "task-table", label: "테이블 정리", category: "task", autoMapped: true },
];

export const uploadItems: UploadItem[] = [
  {
    id: "u1",
    type: "photo",
    label: "개점 체크리스트",
    mappedTasks: 8,
    status: "mapped",
    createdAt: "오늘 08:12",
  },
];

export const workerTasks: Task[] = [
  {
    id: "wt1",
    title: "테이블 4번 정리",
    zone: "홀",
    sop: "테이블 정리 SOP",
    bonus: 2000,
    status: "pending",
    dueTime: "11:30",
    captureHint: "정리된 테이블 전체",
    priority: "high",
  },
  {
    id: "wt2",
    title: "냉장고 온도 기록",
    zone: "주방",
    sop: "HACCP",
    bonus: 1500,
    status: "pending",
    dueTime: "16:00",
    captureHint: "온도계 디스플레이",
    priority: "normal",
  },
];

export const weeklySchedule = [
  { day: "수", shift: "10:00–15:00", zone: "홀" },
  { day: "목", shift: "17:00–22:00", zone: "홀" },
];

export const workers = [
  {
    id: "w1",
    name: "김민지",
    role: "홀",
    shift: "오전",
    bonusThisWeek: 42000,
    captureStreak: 5,
    avatarColor: "bg-violet-500",
  },
];

export const attendanceRecords = [
  {
    id: "a1",
    workerName: "김민지",
    date: "6/27",
    clockIn: "09:58",
    clockOut: null as string | null,
    hours: 0,
    status: "working" as const,
  },
  {
    id: "a2",
    workerName: "박준호",
    date: "6/27",
    clockIn: "14:05",
    clockOut: null as string | null,
    hours: 0,
    status: "late" as const,
  },
];

export const payrollItems = [
  {
    id: "p1",
    workerName: "김민지",
    basePay: 525300,
    bonus: 42000,
    tax: 28400,
    netPay: 538900,
    status: "ready" as const,
    period: "6월 4주차",
  },
];

export const taxSummary = {
  period: "2026년 6월",
  totalWages: 2450000,
  incomeTax: 124500,
  localTax: 12450,
  insurance: 89000,
  filingStatus: "pending" as const,
  dueDate: "2026-07-10",
};

export const earnings = [
  {
    id: "e1",
    date: "6/27",
    task: "냉장고 온도 기록",
    basePay: 10300,
    bonus: 1500,
    status: "paid" as const,
  },
  {
    id: "e2",
    date: "6/26",
    task: "조리대 소독",
    basePay: 10300,
    bonus: 3000,
    status: "pending" as const,
  },
];

export const staffList: Staff[] = [
  {
    id: "s1",
    name: "김민지",
    role: "홀 서빙",
    hourlyWage: 10300,
    weeklyHours: 20,
    status: "working",
    clockIn: "09:58",
    workedHoursToday: 2.5,
    accruedPayToday: 25750,
    avatarColor: "bg-violet-500",
    contractStatus: "signed",
    phone: "010-1234-5678",
    startedAt: "2026-03-01",
  },
  {
    id: "s2",
    name: "박준호",
    role: "주방 보조",
    hourlyWage: 11000,
    weeklyHours: 25,
    status: "working",
    clockIn: "14:05",
    workedHoursToday: 1.2,
    accruedPayToday: 13200,
    avatarColor: "bg-emerald-500",
    contractStatus: "signed",
    phone: "010-2345-6789",
    startedAt: "2026-06-15",
  },
  {
    id: "s3",
    name: "이서연",
    role: "카운터",
    hourlyWage: 10300,
    weeklyHours: 18,
    status: "break",
    clockIn: "11:00",
    workedHoursToday: 3.0,
    accruedPayToday: 30900,
    avatarColor: "bg-amber-500",
    contractStatus: "signed",
    phone: "010-3456-7890",
    startedAt: "2026-05-02",
  },
  {
    id: "s4",
    name: "최도윤",
    role: "홀 서빙",
    hourlyWage: 10320,
    weeklyHours: 15,
    status: "off",
    workedHoursToday: 0,
    accruedPayToday: 0,
    avatarColor: "bg-sky-500",
    contractStatus: "pending",
    phone: "010-4567-8901",
    startedAt: "2026-06-20",
  },
];

export const realtimePayrollByHour: ChartPoint[] = [
  { label: "09", value: 10300 },
  { label: "10", value: 20600 },
  { label: "11", value: 41200 },
  { label: "12", value: 56650 },
  { label: "13", value: 67000 },
  { label: "14", value: 80200 },
  { label: "15", value: 96000 },
  { label: "16", value: 112850 },
];

export const weeklyPayrollTrend: ChartPoint[] = [
  { label: "월", value: 184000 },
  { label: "화", value: 152000 },
  { label: "수", value: 201000 },
  { label: "목", value: 176000 },
  { label: "금", value: 233000 },
  { label: "토", value: 268000 },
  { label: "일", value: 142000 },
];

export const payrollDueList: PayrollDue[] = [
  {
    id: "pd1",
    workerName: "김민지",
    avatarColor: "bg-violet-500",
    period: "6월 4주차",
    workedHours: 51,
    basePay: 525300,
    bonus: 42000,
    tax: 18721,
    netPay: 548579,
    status: "due",
    dueDate: "2026-06-28",
  },
  {
    id: "pd2",
    workerName: "박준호",
    avatarColor: "bg-emerald-500",
    period: "6월 4주차",
    workedHours: 50,
    basePay: 550000,
    bonus: 38000,
    tax: 19404,
    netPay: 568596,
    status: "due",
    dueDate: "2026-06-28",
  },
  {
    id: "pd3",
    workerName: "이서연",
    avatarColor: "bg-amber-500",
    period: "6월 3주차",
    workedHours: 40,
    basePay: 412000,
    bonus: 51000,
    tax: 15279,
    netPay: 447721,
    status: "scheduled",
    dueDate: "2026-06-30",
  },
  {
    id: "pd4",
    workerName: "최도윤",
    avatarColor: "bg-sky-500",
    period: "6월 3주차",
    workedHours: 30,
    basePay: 309600,
    bonus: 9000,
    tax: 10513,
    netPay: 308087,
    status: "paid",
    dueDate: "2026-06-23",
  },
];

export const contractFiles: ContractFile[] = [
  {
    id: "cf1",
    workerName: "김민지",
    role: "홀 서빙",
    fileName: "김민지_근로계약서_2026.pdf",
    fileSize: "2.4 MB",
    source: "upload",
    status: "signed",
    signedDate: "2026-03-01",
    period: "2026.03.01 ~ 재직중",
  },
  {
    id: "cf2",
    workerName: "박준호",
    role: "주방 보조",
    fileName: "박준호_단시간근로계약서.pdf",
    fileSize: "1.8 MB",
    source: "generated",
    status: "signed",
    signedDate: "2026-06-15",
    period: "2026.06.15 ~ 재직중",
  },
  {
    id: "cf3",
    workerName: "이서연",
    role: "카운터",
    fileName: "이서연_근로계약서.pdf",
    fileSize: "2.1 MB",
    source: "upload",
    status: "signed",
    signedDate: "2026-05-02",
    period: "2026.05.02 ~ 재직중",
  },
  {
    id: "cf4",
    workerName: "최도윤",
    role: "홀 서빙",
    fileName: "최도윤_근로계약서_초안.pdf",
    fileSize: "1.2 MB",
    source: "generated",
    status: "sent",
    period: "2026.06.20 ~ (서명 대기)",
  },
];
