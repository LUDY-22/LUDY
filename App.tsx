
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  DollarSign, 
  BarChart3, 
  Users as UsersIcon, 
  LogOut,
  Menu,
  X,
  Wifi,
  Loader2,
  UserCircle
} from 'lucide-react';
import { loadData, saveData, onRemoteUpdate } from './storage';
import { AppState, User, UserRole } from './types';

// Views
import Dashboard from './views/Dashboard';
import Products from './views/Products';
import Sales from './views/Sales';
import Damages from './views/Damages';
import CashFlow from './views/CashFlow';
import Reports from './views/Reports';
import Users from './views/Users';
import Login from './views/Login';
import Profile from './views/Profile';

const RestrictedView = () => (
  <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl shadow-sm border border-gray-100 m-4">
    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
      <AlertTriangle size={40} />
    </div>
    <h2 className="text-2xl font-black text-gray-900 mb-2">Acesso Restrito</h2>
    <p className="text-gray-500 max-w-md">Esta secção é restrita apenas ao administrador.</p>
    <Link to="/" className="mt-8 px-8 py-3 bg-[#064e3b] text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform">Voltar ao Início</Link>
  </div>
);

const App: React.FC = () => {
  const [db, setDb] = useState<AppState | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchLatest = useCallback(async () => {
    const data = await loadData();
    setDb(prev => {
      if (!prev) return data;
      return { ...data, currentUser: prev.currentUser };
    });
  }, []);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  useEffect(() => {
    onRemoteUpdate(() => {
      setIsSyncing(true);
      fetchLatest().finally(() => {
        setTimeout(() => setIsSyncing(false), 800);
      });
    });
  }, [fetchLatest]);

  const syncToCloud = async (update: AppState | ((prev: AppState) => AppState)) => {
    if (!db) return;
    setIsSyncing(true);
    const nextState = typeof update === 'function' ? update(db) : update;
    await saveData(nextState);
    setDb(nextState);
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleLogout = () => {
    if (db) syncToCloud({ ...db, currentUser: null });
  };

  if (!db) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#064e3b] text-white">
        <Loader2 size={48} className="animate-spin mb-4 text-emerald-400" />
        <p className="font-black uppercase tracking-[0.3em] text-[10px]">Carregando LUVIEL...</p>
      </div>
    );
  }

  if (!db.currentUser) {
    return <Login onLogin={(user) => syncToCloud({ ...db, currentUser: user })} users={db.users} />;
  }

  const isAdmin = db.currentUser?.role === UserRole.ADMIN;

  return (
    <HashRouter>
      <div className="flex h-screen bg-gray-100 overflow-hidden select-none">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#064e3b] text-white transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
          <div className="safe-top flex items-center justify-between p-6 border-b border-emerald-800">
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-white">LUVIEL FLUXO</span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-emerald-400 font-black">Sistema Comercial</span>
            </div>
            <button className="lg:hidden p-2 -mr-2" onClick={() => setSidebarOpen(false)}><X size={24} /></button>
          </div>

          <nav className="flex-1 mt-6 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
            <SidebarLink to="/" icon={<LayoutDashboard size={22} />} label="Dashboard" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/vendas" icon={<ShoppingCart size={22} />} label="Vendas" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/estoque" icon={<Package size={22} />} label="Stock" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/danos" icon={<AlertTriangle size={22} />} label="Danos" onClick={() => setSidebarOpen(false)} />
            {isAdmin && (
              <>
                <div className="px-4 py-4 mt-2">
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Gestão Admin</span>
                </div>
                <SidebarLink to="/caixa" icon={<DollarSign size={22} />} label="Fluxo de Caixa" onClick={() => setSidebarOpen(false)} />
                <SidebarLink to="/relatorios" icon={<BarChart3 size={22} />} label="Relatórios" onClick={() => setSidebarOpen(false)} />
                <SidebarLink to="/usuarios" icon={<UsersIcon size={22} />} label="Usuários" onClick={() => setSidebarOpen(false)} />
              </>
            )}
            <div className="pt-6 mt-6 border-t border-emerald-800/50">
               <SidebarLink to="/perfil" icon={<UserCircle size={22} />} label="Meu Perfil" onClick={() => setSidebarOpen(false)} />
            </div>
          </nav>

          <div className="p-6 border-t border-emerald-800 bg-[#043d2e] safe-bottom">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center font-black text-lg text-white shadow-inner">{db.currentUser.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate text-white uppercase tracking-tight">{db.currentUser.name}</p>
                <p className="text-[9px] text-emerald-400 uppercase font-black tracking-widest opacity-70">{db.currentUser.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-red-900/30 hover:bg-red-900/50 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-red-200 border border-red-900/20 active:scale-95">
              <LogOut size={16} /><span>Encerrar Sessão</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-6 shrink-0 safe-top">
            <div className="flex items-center">
              <button className="lg:hidden p-3 -ml-3 text-gray-800 bg-gray-50 rounded-2xl mr-4" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
              <div className="flex flex-col">
                 <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Sincronizado</span>
                 </div>
                 {isSyncing && (
                   <span className="text-[9px] font-bold text-blue-500 uppercase">A carregar dados...</span>
                 )}
              </div>
            </div>
            <div className="flex items-center space-x-3 text-right">
              <div className="hidden sm:block">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Conexão Local</p>
                <div className="flex items-center justify-end text-emerald-600 font-black text-[11px]">
                  <Wifi size={14} className="mr-1"/> ACTIVA
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto no-scrollbar bg-gray-50">
            <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-24 lg:pb-10">
              <Routes>
                <Route path="/" element={<div className="page-enter"><Dashboard db={db} /></div>} />
                <Route path="/vendas" element={<div className="page-enter"><Sales db={db} setDb={syncToCloud} /></div>} />
                <Route path="/estoque" element={<div className="page-enter"><Products db={db} setDb={syncToCloud} /></div>} />
                <Route path="/danos" element={<div className="page-enter"><Damages db={db} setDb={syncToCloud} /></div>} />
                <Route path="/caixa" element={isAdmin ? <div className="page-enter"><CashFlow db={db} /></div> : <RestrictedView />} />
                <Route path="/relatorios" element={isAdmin ? <div className="page-enter"><Reports db={db} /></div> : <RestrictedView />} />
                <Route path="/usuarios" element={isAdmin ? <div className="page-enter"><Users db={db} setDb={syncToCloud} /></div> : <RestrictedView />} />
                <Route path="/perfil" element={<div className="page-enter"><Profile db={db} setDb={syncToCloud} /></div>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <Link to={to} onClick={onClick} className={`flex items-center space-x-4 py-4 px-5 rounded-2xl transition-all active:scale-95 ${isActive ? 'bg-emerald-800 text-white shadow-xl shadow-emerald-950/20' : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white opacity-80'}`}>
      <span className={`${isActive ? 'text-emerald-400' : 'text-inherit'}`}>{icon}</span>
      <span className="font-black text-sm uppercase tracking-tight">{label}</span>
    </Link>
  );
};

export default App;
