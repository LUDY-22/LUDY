
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export enum PaymentMethod {
  CASH = 'Dinheiro',
  TRANSFER = 'Transferência',
  CARD = 'Multicaixa'
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'DAMAGE';
  quantity: number;
  date: string;
  reason: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  profit: number;
  date: string;
  sellerId: string;
  sellerName: string;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  change: number;
}

export interface Damage {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  date: string;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: 'SALE' | 'DAMAGE' | 'PURCHASE' | 'OTHER';
  date: string;
}

export interface AppState {
  users: User[];
  products: Product[];
  sales: Sale[];
  damages: Damage[];
  transactions: Transaction[];
  movements: StockMovement[];
  currentUser: User | null;
}
