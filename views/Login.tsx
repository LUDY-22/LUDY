
import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../types';

interface Props {
  onLogin: (user: UserType) => void;
  users: UserType[];
}

const Login: React.FC<Props> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciais inválidas. Verifique os seus dados.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 overflow-hidden">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-10 duration-700">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-[#064e3b] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-900/40 border-4 border-emerald-400/20">
            <ShieldCheck size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">LUVIEL <span className="text-[#064e3b]">Fluxo</span></h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-3 bg-emerald-100 text-emerald-800 px-4 py-1 rounded-full w-fit mx-auto">Gestão 100% Offline • Angola</p>
        </div>

        {/* Form Container */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200 border border-gray-100 relative">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nome de Utilizador</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-14 pr-4 py-5 bg-gray-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-[#064e3b] text-lg font-black transition-all placeholder:text-gray-200"
                  placeholder="utilizador"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Palavra-passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-14 pr-4 py-5 bg-gray-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-[#064e3b] text-lg font-black transition-all placeholder:text-gray-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl text-center animate-pulse border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full flex items-center justify-center space-x-3 bg-[#064e3b] hover:bg-emerald-800 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-emerald-900/30 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
              Luviel Fluxo Angola • v1.1.0 Offline<br/>
              <span className="text-emerald-600">Sistema Seguro e Local</span>
            </p>
          </div>
        </div>

        {/* Demo Accounts (For easier testing) */}
        <div className="mt-8 flex justify-center space-x-4 opacity-40 hover:opacity-100 transition-opacity">
           <div className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-center">
             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Admin</p>
             <p className="text-[10px] font-bold text-gray-600">admin / 123</p>
           </div>
           <div className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-center">
             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Vendedor</p>
             <p className="text-[10px] font-bold text-gray-600">venda / 123</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
