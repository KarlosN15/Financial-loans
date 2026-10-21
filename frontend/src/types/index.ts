export type Role = 'USER' | 'ADMIN' | 'AGENT' | 'CASHIER' | 'SUPERVISOR';

export type LoanStatus = 'ACTIVE' | 'ARREARS' | 'COMPLETED';

export type InstallmentStatus = 'PENDING' | 'PAID';

export type PaymentFrequency = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';

export type PaymentMethod = 'CASH' | 'TRANSFER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  plan?: string;
  adminId?: number | null;
  commissionRate?: number;
  branchId?: number | null;
  isTwoFactorEnabled?: boolean;
}

export interface Client {
  id: number;
  userId: number;
  name: string;
  email?: string | null;
  identification?: string | null;
  phone?: string | null;
  address?: string | null;
  guarantorName?: string | null;
  guarantorPhone?: string | null;
  score: number;
  rating: 'EXCELLENT' | 'REGULAR' | 'RISKY';
  cedulaFrontUrl?: string | null;
  cedulaBackUrl?: string | null;
  guarantorDocUrl?: string | null;
  routeId?: number | null;
  route?: Route | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Installment {
  id: number;
  loanId: number;
  number: number;
  dueDate: string;
  amount: number | string;
  capital: number | string;
  interest: number | string;
  balance: number | string;
  paidAmount: number | string;
  status: InstallmentStatus;
}

export interface Loan {
  id: number;
  userId: number;
  clientId: number;
  client: Client;
  amount: number | string;
  interestRate: number | string;
  term: number;
  frequency: PaymentFrequency;
  status: LoanStatus;
  lateFeeType?: string;
  lateFeeValue?: number | string;
  graceDays?: number;
  isRefinanced?: boolean;
  installments?: Installment[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  loanId: number;
  loan?: Loan;
  userId?: number | null;
  user?: User | null;
  clientName?: string | null;
  amount: number | string;
  method: PaymentMethod;
  isInterestOnly: boolean;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  lateFeePaid: number | string;
  agentCommission: number | string;
  date: string;
  createdAt: string;
}

export interface BankAccount {
  id: number;
  userId: number;
  bankName: string;
  accountNumber: string;
  balance: number | string;
  createdAt?: string;
}

export interface CashRegister {
  id: number;
  userId: number;
  status: 'OPEN' | 'CLOSED';
  openingDate: string;
  closingDate?: string | null;
  openingBalance: number | string;
  closingBalance?: number | string | null;
}

export interface Expense {
  id: number;
  userId: number;
  amount: number | string;
  description: string;
  status: 'PAID' | 'PENDING';
  date: string;
}

export interface Route {
  id: number;
  userId: number;
  name: string;
}

export interface Branch {
  id: number;
  userId: number;
  name: string;
  address?: string | null;
}
