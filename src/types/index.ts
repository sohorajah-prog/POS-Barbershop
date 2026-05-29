export type Role = 'admin' | 'cashier';

export interface User {
  id: string;
  name: string;
  role: Role;
  outletId?: string; // Admin might not have a specific outlet
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  taxRate: number; // Single tax value
}

export interface Shift {
  id: string;
  cashierId: string;
  outletId: string;
  startTime: string;
  endTime?: string;
  startCash: number;
  endCash?: number;
  expectedCash?: number;
  status: 'open' | 'closed';
}

export interface TransactionItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  type: 'service' | 'product';
  kapsterId?: string;
  commissionRate?: number; // Added to calculate commission
}

export interface Transaction {
  id: string;
  date: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  method: string;
  customerName?: string;
}

export interface AppState {
  user: User | null;
  activeOutlet: Outlet | null;
  activeShift: Shift | null;
  login: (user: User, outlet?: Outlet) => void;
  logout: () => void;
  setActiveOutlet: (outlet: Outlet) => void;
  openShift: (shift: Shift) => void;
  closeShift: (endCash: number, expectedCash: number) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
}
