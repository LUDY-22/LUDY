
import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Printer,
  User as UserIcon,
  X,
  History,
  CreditCard,
  Banknote,
  Repeat,
  CloudSync
} from 'lucide-react';
import { AppState, Product, Sale, SaleItem, TransactionType, PaymentMethod, UserRole } from '../types';
import { cloudUpdateStock, cloudAddTransaction } from '../storage';
import { formatCurrency } from '../utils/format';

interface Props {
  db: AppState;
  setDb: (newDb: AppState) => Promise<void>;
}

const Sales: React.FC<Props> = ({ db, setDb }) => {
  const isAdmin = db.currentUser?.role === UserRole.ADMIN;
  const [viewMode, setViewMode] = useState<'terminal' | 'history'>('terminal');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [amountReceived, setAmountReceived] = useState<number>(0);
  
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return db.products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [db.products, searchTerm]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(`Produto esgotado no servidor!`);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("Limite de stock atingido!");
          return prev;
        }
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, productName: product.name, quantity: 1, price: product.sellPrice }];
    });
    setSearchTerm('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = db.products.find(p => p.id === productId);
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartProfit = cart.reduce((sum, item) => {
    const product = db.products.find(p => p.id === item.productId);
    return sum + ((item.price - (product?.buyPrice || 0)) * item.quantity);
  }, 0);

  const change = Math.max(0, amountReceived - cartTotal);

  const finalizeSale = async () => {
    if (cart.length === 0 || isProcessing) return;
    if (paymentMethod === PaymentMethod.CASH && amountReceived < cartTotal) {
      alert("Valor insuficiente!");
      return;
    }

    setIsProcessing(true);
    const newSale: Sale = {
      id: `SALE-${Date.now()}`,
      items: cart,
      total: cartTotal,
      profit: cartProfit,
      date: new Date().toISOString(),
      sellerId: db.currentUser?.id || '0',
      sellerName: db.currentUser?.name || 'Operador',
      paymentMethod,
      amountReceived: paymentMethod === PaymentMethod.CASH ? amountReceived : cartTotal,
      change: paymentMethod === PaymentMethod.CASH ? change : 0
    };

    let newDb = { ...db };
    newDb.sales = [...newDb.sales, newSale];
    cart.forEach(item => {
      newDb = cloudUpdateStock(newDb, item.productId, -item.quantity, 'OUT', `Venda Online #${newSale.id.slice(-6)}`);
    });
    newDb = cloudAddTransaction(newDb, cartTotal, TransactionType.INCOME, 'SALE', `Receita Venda Online #${newSale.id.slice(-6)}`);

    await setDb(newDb);
    setLastSale(newSale);
    setCart([]);
    setShowCheckout(false);
    setAmountReceived(0);
    setIsProcessing(false);
  };

  const historySales = db.sales.filter(s => {
    const isToday = s.date.startsWith(filterDate);
    const isOwner = isAdmin || s.sellerId === db.currentUser?.id;
    return isToday && isOwner;
  }).reverse();

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit no-print">
        <button onClick={() => setViewMode('terminal')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'terminal' ? 'bg-[#064e3b] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
          <div className="flex items-center space-x-2"><ShoppingCart size={16} /><span>Terminal Online</span></div>
        </button>
        <button onClick={() => setViewMode('history')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'history' ? 'bg-[#064e3b] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
          <div className="flex items-center space-x-2"><History size={16} /><span>Histórico Cloud</span></div>
        </button>
      </div>

      {viewMode === 'terminal' ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          <div className="flex-1 flex flex-col space-y-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative">
              <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Pesquisar artigo..." 
                className="w-full pl-16 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-lg font-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {filteredProducts.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 max-h-80 overflow-y-auto no-scrollbar">
                  {filteredProducts.map(p => (
                    <button key={p.id} onClick={() => addToCart(p)} className="w-full flex items-center justify-between p-5 hover:bg-emerald-50 border-b last:border-0 text-left">
                      <div>
                        <p className="font-black text-gray-900">{p.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Stock Remoto: {p.stock}</p>
                      </div>
                      <p className="font-black text-emerald-600">{formatCurrency(p.sellPrice)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center font-black uppercase text-[10px] tracking-widest text-gray-400">
                <span>Carrinho Digital</span>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase">Sincronizado</span>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar">
                {cart.map(item => (
                  <div key={item.productId} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex-1">
                      <p className="font-black text-gray-800 text-sm">{item.productName}</p>
                      <p className="text-[10px] font-bold text-emerald-600">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-gray-50 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-1.5 hover:text-red-500"><Minus size={14} /></button>
                        <span className="w-8 text-center font-black text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-1.5 hover:text-emerald-500"><Plus size={14} /></button>
                      </div>
                      <p className="font-black text-gray-900 text-sm min-w-[100px] text-right">{formatCurrency(item.price * item.quantity)}</p>
                      <button onClick={() => setCart(c => c.filter(i => i.productId !== item.productId))} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && <div className="h-full flex flex-col items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-20">Aguardando Produtos</div>}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96 flex flex-col">
            <div className="bg-[#064e3b] text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col h-full border border-emerald-900/50">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-2 opacity-80">Subtotal Online</p>
              <h2 className="text-4xl font-black tracking-tighter mb-8 leading-tight">{formatCurrency(cartTotal)}</h2>
              
              <div className="space-y-4 flex-1">
                <div className="flex justify-between items-center py-4 border-b border-emerald-800/50">
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest opacity-60">Ponto de Venda</span>
                  <span className="font-bold text-sm">Online (Web)</span>
                </div>
              </div>

              <button 
                disabled={cart.length === 0 || isProcessing}
                onClick={() => setShowCheckout(true)}
                className="w-full py-6 bg-emerald-400 text-emerald-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-400/20 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center space-x-2"
              >
                {isProcessing ? <CloudSync className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                <span>{isProcessing ? 'Sincronizando...' : 'Concluir Venda'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-6">
            <div className="flex-1">
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Relatório do Servidor</label>
               <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-sm" />
            </div>
            <div className="flex-1 bg-emerald-50 p-6 rounded-3xl text-center border border-emerald-100">
               <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Faturamento Geral</p>
               <p className="text-2xl font-black text-emerald-900 leading-none">{formatCurrency(historySales.reduce((s,v) => s+v.total, 0))}</p>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <tr><th className="px-8 py-6">ID Transação</th><th className="px-8 py-6">Operador</th><th className="px-8 py-6 text-right">Montante Final</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {historySales.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5">
                       <p className="font-black text-gray-900 text-sm">#{s.id.slice(-8)}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(s.date).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-8 py-5">
                       <span className="px-3 py-1 bg-gray-100 rounded-lg text-[9px] font-black uppercase text-gray-600">{s.sellerName}</span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-emerald-700 text-sm">{formatCurrency(s.total)}</td>
                  </tr>
                ))}
                {historySales.length === 0 && (
                  <tr><td colSpan={3} className="py-24 text-center text-gray-300 italic text-sm">Nenhum registo online para esta data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Checkout Modal Online */}
      {showCheckout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="bg-[#064e3b] p-8 text-white flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tighter">Liquidamento Cloud</h3>
              <button onClick={() => setShowCheckout(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Valor a Liquidar</p>
                <p className="text-5xl font-black text-gray-900 tracking-tighter">{formatCurrency(cartTotal)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{id: PaymentMethod.CASH, icon: <Banknote size={24}/>, l: 'Cash'}, {id: PaymentMethod.TRANSFER, icon: <Repeat size={24}/>, l: 'IBAN'}, {id: PaymentMethod.CARD, icon: <CreditCard size={24}/>, l: 'TPA'}].map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id as PaymentMethod)} className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all active:scale-95 ${paymentMethod === m.id ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-inner' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                    {m.icon}<span className="text-[9px] font-black uppercase mt-2 tracking-widest">{m.l}</span>
                  </button>
                ))}
              </div>
              {paymentMethod === PaymentMethod.CASH && (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <input type="number" autoFocus className="w-full p-6 bg-gray-100 rounded-[1.5rem] text-4xl font-black text-center focus:ring-2 focus:ring-emerald-500" placeholder="0" value={amountReceived || ''} onChange={e => setAmountReceived(parseFloat(e.target.value) || 0)} />
                  <div className="bg-amber-50 p-5 rounded-[1.5rem] flex justify-between items-center border border-amber-100"><span className="text-[10px] font-black uppercase text-amber-700 tracking-widest">Troco em AOA</span><span className="text-2xl font-black text-amber-900">{formatCurrency(change)}</span></div>
                </div>
              )}
              <button onClick={finalizeSale} disabled={isProcessing} className="w-full py-6 bg-[#064e3b] text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20 active:scale-95 flex items-center justify-center space-x-3">
                 {isProcessing ? <CloudSync size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                 <span>{isProcessing ? 'Enviando ao Servidor...' : 'Confirmar e Enviar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sucesso Digital */}
      {lastSale && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg no-print">
          <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl border-4 border-emerald-500/10">
            <div className="p-12 text-center bg-[#064e3b] text-white">
              <div className="w-24 h-24 bg-emerald-400/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-400/20"><CheckCircle2 size={56} className="text-emerald-400" /></div>
              <h3 className="text-3xl font-black uppercase tracking-tighter">Venda Online!</h3>
              <p className="text-emerald-300 text-[10px] font-black uppercase mt-2 tracking-[0.2em] opacity-80">Sincronizado com Sucesso</p>
            </div>
            <div className="p-10 space-y-6">
              <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest"><span>Referência Digital</span><span className="text-gray-900 font-mono">#{lastSale.id.slice(-8)}</span></div>
              <div className="border-y-2 border-dashed border-gray-100 py-6 space-y-3">
                {lastSale.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-bold uppercase"><span className="text-gray-500">{i.quantity}x {i.productName}</span><span className="text-gray-900">{formatCurrency(i.price * i.quantity)}</span></div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2"><span className="text-sm font-black uppercase">Total Liquidado</span><span className="text-2xl font-black text-[#064e3b]">{formatCurrency(lastSale.total)}</span></div>
              <div className="flex flex-col space-y-3 pt-6">
                <button onClick={() => window.print()} className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-100"><Printer size={16} className="inline mr-2" />Gerar Comprovativo</button>
                <button onClick={() => setLastSale(null)} className="w-full py-5 bg-[#064e3b] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20">Finalizar Fluxo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
