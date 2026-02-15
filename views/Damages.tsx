
import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, Calendar, Package, X } from 'lucide-react';
import { AppState, Damage, TransactionType, UserRole } from '../types';
// Corrected imported function names to match storage.ts
import { cloudUpdateStock, cloudAddTransaction } from '../storage';
import { formatCurrency } from '../utils/format';

interface Props {
  db: AppState;
  setDb: React.Dispatch<React.SetStateAction<AppState>>;
}

const Damages: React.FC<Props> = ({ db, setDb }) => {
  const isAdmin = db.currentUser?.role === UserRole.ADMIN;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRegisterDamage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productId = formData.get('productId') as string;
    const qty = parseInt(formData.get('quantity') as string);
    const reason = formData.get('reason') as string;

    const product = db.products.find(p => p.id === productId);
    if (!product) return;

    if (qty > product.stock) {
      alert('Quantidade superior ao estoque disponível!');
      return;
    }

    const damage: Damage = {
      id: Date.now().toString(),
      productId,
      productName: product.name,
      quantity: qty,
      reason,
      date: new Date().toISOString()
    };

    const lossValue = product.buyPrice * qty;

    let newDb = { ...db };
    newDb.damages = [...newDb.damages, damage];
    // Use the corrected function names cloudUpdateStock and cloudAddTransaction
    newDb = cloudUpdateStock(newDb, productId, -qty, 'DAMAGE', `Avaria: ${reason}`);
    newDb = cloudAddTransaction(newDb, lossValue, TransactionType.EXPENSE, 'DAMAGE', `Perda: ${product.name} (${qty} un)`);

    setDb(newDb);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 flex items-center space-x-2">
            <AlertTriangle className="text-red-500" />
            <span>Registo de Avarias</span>
          </h2>
          <p className="text-gray-500 font-medium">Controlo de perdas, danos e quebras de stock.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-200"
        >
          <Plus size={20} />
          <span>Lançar Ocorrência</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics - Only show financial impact to Admin */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-50 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total de Perdas (Custo)</p>
            {isAdmin ? (
              <h3 className="text-3xl font-black text-red-600 leading-none">
                {formatCurrency(db.damages.reduce((sum, d) => {
                  const p = db.products.find(prod => prod.id === d.productId);
                  return sum + (p ? p.buyPrice * d.quantity : 0);
                }, 0))}
              </h3>
            ) : (
              <h3 className="text-3xl font-black text-gray-300 leading-none uppercase tracking-tighter">Confidencial</h3>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
            {db.damages.length} registos no histórico
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Ocorrências Recentes</h3>
            <span className="text-[9px] font-black bg-red-100 text-red-600 px-3 py-1 rounded-full uppercase">Crítico</span>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-5">Produto</th>
                  <th className="px-6 py-5 text-center">Qtd</th>
                  <th className="px-6 py-5">Motivo</th>
                  <th className="px-6 py-5 text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {db.damages.slice().reverse().map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 text-sm uppercase">{d.productName}</td>
                    <td className="px-6 py-4 text-center">
                       <span className="px-3 py-1 bg-red-50 text-red-600 font-black rounded-lg text-xs">-{d.quantity}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500 italic">"{d.reason}"</td>
                    <td className="px-6 py-4 text-right text-[10px] font-bold text-gray-400">{new Date(d.date).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
                {db.damages.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-24 text-center text-gray-300 italic text-sm">Nenhuma quebra registada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Damage Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-red-600 p-8 text-white flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tighter">Lançar Quebra</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            <form onSubmit={handleRegisterDamage} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Artigo com Defeito</label>
                <select required name="productId" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-500 font-bold">
                  <option value="">Escolha um produto...</option>
                  {db.products.filter(p => p.stock > 0).map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Disp: {p.stock})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantidade</label>
                  <input required name="quantity" type="number" min="1" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-500 font-bold" placeholder="1" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Data do Evento</label>
                  <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-500 font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descrição da Ocorrência</label>
                <textarea required name="reason" rows={3} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-500 font-medium" placeholder="Explique o motivo da quebra ou dano..." />
              </div>
              <div className="pt-6 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 px-6 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-4 px-6 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-200">Confirmar Saída</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Damages;
