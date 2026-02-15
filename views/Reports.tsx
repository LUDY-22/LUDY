
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { AppState } from '../types';
import { formatCurrency } from '../utils/format';

interface Props {
  db: AppState;
}

const Reports: React.FC<Props> = ({ db }) => {
  // Sales by Category
  const salesByCategory = db.products.reduce((acc, p) => {
    const pSales = db.sales.reduce((sum, s) => {
      const item = s.items.find(i => i.productId === p.id);
      return sum + (item ? item.price * item.quantity : 0);
    }, 0);
    
    const existing = acc.find(a => a.name === p.category);
    if (existing) {
      existing.value += pSales;
    } else {
      acc.push({ name: p.category, value: pSales });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const COLORS = ['#064e3b', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

  // Last 30 days logic (simplified for UI)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split('T')[0];
    const daySales = db.sales.filter(s => s.date.startsWith(dateStr));
    return {
      date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      vendas: daySales.reduce((sum, s) => sum + s.total, 0),
    };
  });

  const totalRevenue = db.sales.reduce((s, v) => s + v.total, 0);
  const totalProfit = db.sales.reduce((s, v) => s + v.profit, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-800">Relatórios Estratégicos</h2>
        <p className="text-gray-500 font-medium">Análise avançada de performance e indicadores do negócio.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400">Volume de Vendas (30 dias)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last30Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(val: number) => [formatCurrency(val), 'Faturamento']}
                />
                <Line type="monotone" dataKey="vendas" stroke="#064e3b" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400">Receita por Categoria</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByCategory.length > 0 ? salesByCategory : [{name: 'Sem dados', value: 1}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                   formatter={(val: number) => formatCurrency(val)} 
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Indicadores de Lucratividade</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 text-center">
          <div className="p-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ticket Médio</p>
            <p className="text-2xl font-black text-gray-900 leading-none">
              {db.sales.length > 0 ? formatCurrency(totalRevenue / db.sales.length) : formatCurrency(0)}
            </p>
          </div>
          <div className="p-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Margem Global</p>
            <p className="text-2xl font-black text-emerald-600 leading-none">
              {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0'}%
            </p>
          </div>
          <div className="p-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Faturamento Acumulado</p>
            <p className="text-2xl font-black text-gray-900 leading-none">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="p-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lucro Total</p>
            <p className="text-2xl font-black text-blue-600 leading-none">{formatCurrency(totalProfit)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
