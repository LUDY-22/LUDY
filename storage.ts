
import { AppState, UserRole, User, Product, Sale, Damage, Transaction, StockMovement, TransactionType } from './types';

const STORAGE_KEY = 'luviel_fluxo_cloud_db';
const SYNC_CHANNEL = 'luviel_sync_stream';

const initialData: AppState = {
  users: [
    { id: '1', name: 'Administrador', username: 'admin', password: '123', role: UserRole.ADMIN },
    { id: '2', name: 'Vendedor', username: 'venda', password: '123', role: UserRole.EMPLOYEE }
  ],
  products: [],
  sales: [],
  damages: [],
  transactions: [],
  movements: [],
  currentUser: null
};

// Simulador de Latência de Rede (Mobile/WiFi)
const networkDelay = () => new Promise(resolve => setTimeout(resolve, 400));

// Canal de transmissão para simular sincronização entre instâncias (Admin <-> Vendedor)
const broadcast = new BroadcastChannel(SYNC_CHANNEL);

export const loadData = async (): Promise<AppState> => {
  await networkDelay();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  await saveData(initialData);
  return initialData;
};

export const saveData = async (data: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Notifica outras "instâncias" (dispositivos simulados) que os dados mudaram
  broadcast.postMessage('sync_required');
};

export const onRemoteUpdate = (callback: () => void) => {
  broadcast.onmessage = (event) => {
    if (event.data === 'sync_required') {
      callback();
    }
  };
};

// Métodos de negócio transformados em "Cloud Services"
export const cloudUpdateStock = (data: AppState, productId: string, delta: number, type: StockMovement['type'], reason: string): AppState => {
  const productIndex = data.products.findIndex(p => p.id === productId);
  if (productIndex === -1) return data;

  const updatedProducts = [...data.products];
  updatedProducts[productIndex] = {
    ...updatedProducts[productIndex],
    stock: updatedProducts[productIndex].stock + delta
  };

  const movement: StockMovement = {
    id: `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    productId,
    type,
    quantity: Math.abs(delta),
    date: new Date().toISOString(),
    reason
  };

  return {
    ...data,
    products: updatedProducts,
    movements: [...data.movements, movement]
  };
};

export const cloudAddTransaction = (data: AppState, amount: number, type: TransactionType, category: Transaction['category'], description: string): AppState => {
  const transaction: Transaction = {
    id: `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    amount,
    type,
    category,
    description,
    date: new Date().toISOString()
  };
  return {
    ...data,
    transactions: [...data.transactions, transaction]
  };
};
