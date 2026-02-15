
import React from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign,
  ArrowUpRight,
  ShoppingCart,
  Users as UsersIcon
} from 'lucide-react';
import { AppState, TransactionType, UserRole } from '../types';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency } from '../utils/format';

interface Props {
  db: AppState;
}

const Dashboard: React.FC<Props> = ({ db }) => {
  const isAdmin = db.currentUser?.role === UserRole.ADMIN;

  const today = new Date().toISOString().split('T')[0];
  const todaySales = db.sales.filter(s => s.date.startsWith(today));
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const todayProfit = todaySales.reduce((sum, s) => sum + s.profit, 0);
  
  const lowStockProducts = db.products.filter(p => p.stock <= p.minStock);
  const balance = db.transactions.reduce((acc, t) => 
    t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount, 0
  );

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const daySales = db.sales.filter(s => s.date.startsWith(dateStr));
    return {
      name: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      revenue: daySales.reduce((sum, s) => sum + s.total, 0),
    };
  }).reverse();

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Faturamento Hoje" 
          value={formatCurrency(todayRevenue)} 
          subText={`${todaySales.length} vendas online`}
          icon={<ShoppingCart className="text-blue-600" size={24} />}
          color="bg-blue-50"
        />
        
        {isAdmin ? (
          <>
            <MetricCard 
              title="Lucro Líquido" 
              value={formatCurrency(todayProfit)} 
              subText="Sincronizado agora"
              icon={<TrendingUp className="text-emerald-600" size={24} />}
              color="bg-emerald-50"
            />
            <MetricCard 
              title="Tesouraria Central" 
              value={formatCurrency(balance)} 
              subText="Total em nuvem"
              icon={<DollarSign className="text-amber-600" size={24} />}
              color="bg-amber-50"
            />
          </>
        ) : (
          <MetricCard 
            title="Minha Performance" 
            value={`${todaySales.filter(s => s.sellerId === db.currentUser?.id).length}`} 
            subText="Vendas registadas hoje"
            icon={<UsersIcon className="text-emerald-600" size={24} />}
            color="bg-emerald-50"
          />
        )}

        <MetricCard 
          title="Stock Crítico" 
          value={lowStockProducts.length.toString()} 
          subText="Requer atenção"
          icon={<AlertTriangle className="text-red-600" size={24} />}
          color="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-tighter">Performance de Vendas (7 Dias)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(val: number) => [formatCurrency(val), 'Receita']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#064e3b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-tighter">Alertas de Reposição</h3>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                  <span className="font-bold text-gray-800">{p.name}</span>
                  <div className="text-right">
                    <p className="font-black text-red-600">{p.stock} unidades</p>
                    <p className="text-[10px] font-bold text-red-400 uppercase">Mínimo: {p.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-300">
              <Package size={48} className="mb-4 opacity-10" />
              <p className="font-bold uppercase tracking-widest text-xs">Inventário em conformidade</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ title: string; value: string; subText: string; icon: React.ReactNode; color: string }> = ({ title, value, subText, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-xl font-black text-gray-900 tracking-tighter">{value}</h3>
      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{subText}</p>
    </div>
    <div className={`p-4 rounded-2xl ${color} shadow-sm border border-white/10`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
