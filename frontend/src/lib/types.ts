export type UserRole = "owner" | "worker";

export type TaskStatus = "pending" | "submitted" | "verified" | "rejected";

export type ContractExtract = {
  staffId?: string;
  workerName: string;
  role: string;
  hourlyWage: number;
  weeklyHours: number;
  workDays: string;
  workHours: string;
  startDate: string;
  endDate?: string;
  storeName: string;
  payDay: string;
};

export type OntologyLink = {
  from: string;
  to: string;
  label: string;
};

export type PayForecastNode = {
  id: string;
  label: string;
  amount: number;
  type: "base" | "weekly_holiday" | "overtime" | "substitute" | "tax" | "net";
};

export type ShiftProofAnalysis = {
  eventType: "substitute" | "overtime";
  requestedAt: string;
  workDate: string;
  startTime: string;
  endTime: string;
  hours: number;
  confidence: number;
  chatSummary: string;
  mappedContractNode: string;
  ontologyPath: string[];
};

export type ShiftProof = {
  id: string;
  workerName: string;
  status: "analyzing" | "mapped" | "approved" | "rejected";
  analysis?: ShiftProofAnalysis;
  payDelta?: number;
};

export type Contract = {
  id: string;
  workerName: string;
  role: string;
  hourlyWage: number;
  weeklyHours: number;
  startDate: string;
  status: "draft" | "sent" | "signed" | "imported";
  source: "upload" | "generated";
};

export type StoreTodo = {
  id: string;
  title: string;
  zone: string;
  priority: "high" | "normal" | "low";
  dueTime: string;
  status: TaskStatus;
  isNew?: boolean;
};

export type WorkerDocument = {
  id: string;
  title: string;
  type: "contract" | "payslip" | "tax" | "guide";
  updatedAt: string;
  status: "available" | "updated";
};

export type BankAccount = {
  bank: string;
  accountNumber: string;
  holder: string;
};

export type OntologyNode = {
  id: string;
  label: string;
  category: "zone" | "task" | "sop" | "equipment" | "contract" | "attendance" | "payroll";
  children?: string[];
  autoMapped?: boolean;
};

export type Task = {
  id: string;
  title: string;
  zone: string;
  sop: string;
  bonus: number;
  status: TaskStatus;
  dueTime?: string;
  captureHint: string;
  priority?: "high" | "normal" | "low";
};

export type UploadItem = {
  id: string;
  type: "photo" | "voice" | "note";
  label: string;
  mappedTasks: number;
  status: "processing" | "mapped" | "needs_review";
  createdAt: string;
};

export type StoreStats = {
  automationRate: number;
  verifiedCaptures: number;
  pendingReviews: number;
  bonusPaid: number;
  activeWorkers: number;
};

export type StaffStatus = "working" | "break" | "off";

export type Staff = {
  id: string;
  name: string;
  role: string;
  hourlyWage: number;
  weeklyHours: number;
  status: StaffStatus;
  clockIn?: string;
  workedHoursToday: number;
  accruedPayToday: number;
  avatarColor: string;
  contractStatus: "signed" | "pending";
  phone: string;
  startedAt: string;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type PayrollDue = {
  id: string;
  workerName: string;
  avatarColor: string;
  period: string;
  workedHours: number;
  basePay: number;
  bonus: number;
  tax: number;
  netPay: number;
  status: "due" | "scheduled" | "paid";
  dueDate: string;
};

export type ContractFile = {
  id: string;
  workerName: string;
  role: string;
  fileName: string;
  fileSize: string;
  source: "upload" | "generated";
  status: "signed" | "sent" | "draft";
  signedDate?: string;
  period: string;
};
