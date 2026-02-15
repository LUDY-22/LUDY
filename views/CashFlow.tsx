
import React from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Download
} from 'lucide-react';
import { AppState, TransactionType, UserRole } from '../types';
import { formatCurrency } from '../utils/format';

interface Props {
  db: AppState;
}

const CashFlow: React.FC<Props> = ({ db }) => {
  const isAdmin = db.currentUser?.role === UserRole.ADMIN;
  
  if (!isAdmin) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 italic font-black text-2xl">!</div>
        <h3 className="text-xl font-black text-gray-900 uppercase">Acesso Restrito</h3>
        <p className="text-gray-400 font-medium mt-2">Apenas administradores podem visualizar o fluxo de caixa.</p>
      </div>
    );
  }

  const transactions = [...db.transactions].reverse();
  const income = db.transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
  const expense = db.transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Fluxo de Caixa</h2>
          <p className="text-gray-500 font-medium text-sm italic">Movimentações financeiras em AOA.</p>
        </div>
        <button className="flex items-center space-x-2 bg-white text-gray-600 px-5 py-3 rounded-2xl border border-gray-100 shadow-sm font-black uppercase text-[10px] tracking-widest hover:bg-gray-50">
          <Download size={16} /><span>Relatório em PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm">
          <div className="flex items-center space-x-3 text-emerald-600 mb-4"><ArrowUpCircle size={28}/><span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Entradas</span></div>
          <h3 className="text-3xl font-black text-gray-900">{formatCurrency(income)}</h3>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-red-50 shadow-sm">
          <div className="flex items-center space-x-3 text-red-500 mb-4"><ArrowDownCircle size={28}/><span className="text-[10px] font-black uppercase tracking-widest text-red-500/60">Saídas</span></div>
          <h3 className="text-3xl font-black text-gray-900">{formatCurrency(expense)}</h3>
        </div>
        <div className="bg-[#064e3b] p-8 rounded-3xl shadow-xl text-white">
          <div className="flex items-center space-x-3 text-emerald-400 mb-4"><Wallet size={28}/><span className="text-[10px] font-black uppercase tracking-widest opacity-60">Saldo Atual</span></div>
          <h3 className="text-3xl font-black">{formatCurrency(balance)}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center"><h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Histórico de Tesouraria</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr><th className="px-8 py-5">Data</th><th className="px-8 py-5">Descrição</th><th className="px-8 py-5 text-right">Montante</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold text-gray-900 text-sm">{new Date(t.date).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(t.date).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium uppercase text-gray-700">{t.description}</td>
                  <td className={`px-8 py-5 text-right font-black text-sm ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
