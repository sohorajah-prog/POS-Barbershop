export type Role = 'admin' | 'cashier';

export interface User {
  id: string;
  name: string;
  role: Role;
  outletId: string;
  password?: string;
}

export interface Kapster {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  commissionType: 'percentage' | 'nominal';
  commissionValue: number; // 30 for 30%, or 15000 for Rp15.000
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone?: string;
  tagline?: string;
  logoUrl?: string;
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
  commissionType?: 'percentage' | 'nominal';
  commissionValue?: number;
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
  login: (user: User) => void;
  logout: () => void;
  setActiveOutlet: (outlet: Outlet) => Promise<void>;
  openShift: (shift: Shift) => Promise<void>;
  closeShift: (endCash: number, expectedCash: number) => Promise<void>;
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  clearAppStore: () => Promise<void>;
  
  systemUsers: User[];
  addUser: (user: User) => void; // user addition is handled in UI for now
  updateUser: (id: string, user: Partial<User>) => void;
  removeUser: (userId: string) => void;
  
  kapsters: Kapster[];
  addKapster: (kapster: Kapster) => Promise<void>;
  updateKapster: (id: string, kapster: Partial<Kapster>) => Promise<void>;
  removeKapster: (id: string) => Promise<void>;

  walkinQueue: any[];
  setWalkinQueue: (queue: any[]) => void;
  
  services: any[];
  setServices: (services: any[]) => void;
  addService: (service: any) => Promise<void>;
  updateService: (id: string, service: Partial<any>) => Promise<void>;
  removeService: (id: string) => Promise<void>;
  
  products: any[];
  setProducts: (products: any[]) => void;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, product: Partial<any>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;

  initDb: () => Promise<void>;
}
