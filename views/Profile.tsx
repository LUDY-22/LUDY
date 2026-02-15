
import React, { useState } from 'react';
import { User, Lock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppState, User as UserType } from '../types';

interface Props {
  db: AppState;
  setDb: (update: AppState | ((prev: AppState) => AppState)) => Promise<void>;
}

const Profile: React.FC<Props> = ({ db, setDb }) => {
  const user = db.currentUser;
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState(user?.password || '');
  const [confirmPassword, setConfirmPassword] = useState(user?.password || '');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('As palavras-passe não coincidem.');
      return;
    }

    if (password.length < 3) {
      setStatus('error');
      setMessage('A palavra-passe deve ter pelo menos 3 caracteres.');
      return;
    }

    await setDb(prev => {
      const updatedUsers = prev.users.map(u => 
        u.id === user.id ? { ...u, name, password } : u
      );
      
      return {
        ...prev,
        users: updatedUsers,
        currentUser: { ...user, name, password }
      };
    });

    setStatus('success');
    setMessage('Perfil atualizado com sucesso na nuvem!');
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Minha Conta</h2>
        <p className="text-gray-500 font-medium">Faça a gestão dos seus dados de acesso ao LUVIEL Fluxo.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="bg-[#064e3b] p-10 text-white flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/30 flex items-center justify-center text-3xl font-black shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-widest">{user.name}</h3>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">{user.role} • @{user.username}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {status !== 'idle' && (
            <div className={`p-4 rounded-2xl flex items-center space-x-3 border ${
              status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-600'
            }`}>
              {status === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-xs font-black uppercase tracking-widest">{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Nome de Exibição</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Nova Palavra-passe</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Confirmar Palavra-passe</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              className="w-full flex items-center justify-center space-x-3 bg-[#064e3b] hover:bg-emerald-800 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
            >
              <Save size={18} />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-start space-x-4">
        <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Segurança da Conta</h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            O seu nome de utilizador (<strong>@{user.username}</strong>) é único e não pode ser alterado por motivos de rastreabilidade de vendas. Se precisar de um novo login, contacte o administrador central.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
