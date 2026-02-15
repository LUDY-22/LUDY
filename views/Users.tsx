
import React, { useState } from 'react';
import { Plus, UserPlus, Shield, User as UserIcon, Trash2, X } from 'lucide-react';
import { AppState, User, UserRole } from '../types';

interface Props {
  db: AppState;
  setDb: (update: AppState | ((prev: AppState) => AppState)) => Promise<void>;
}

const Users: React.FC<Props> = ({ db, setDb }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: User = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as UserRole
    };

    setDb(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    setIsModalOpen(false);
  };

  const removeUser = (id: string) => {
    if (id === '1') {
      alert('O administrador principal não pode ser removido.');
      return;
    }
    if (window.confirm('Excluir este colaborador do sistema online?')) {
      setDb(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== id)
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Equipa Cloud</h2>
          <p className="text-gray-500 font-medium">Controlo de acessos sincronizado em tempo real.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-[#064e3b] text-white px-6 py-3 rounded-xl hover:bg-emerald-800 transition-all font-black uppercase text-xs tracking-widest shadow-lg"
        >
          <UserPlus size={20} />
          <span>Novo Colaborador</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {db.users.map(user => (
          <div key={user.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${user.role === UserRole.ADMIN ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
              <UserIcon size={40} />
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">{user.name}</h3>
            <p className="text-[10px] text-gray-400 mb-4 font-black uppercase tracking-widest">@{user.username}</p>
            
            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-8 ${
              user.role === UserRole.ADMIN ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {user.role}
            </span>

            <div className="w-full pt-6 border-t border-gray-50">
              <button 
                disabled={user.id === '1'}
                onClick={() => removeUser(user.id)}
                className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:text-red-700 transition-colors flex items-center justify-center space-x-2 w-full disabled:opacity-20"
              >
                <Trash2 size={16} />
                <span>Bloquear Acesso</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in">
            <div className="bg-[#064e3b] p-8 text-white flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tighter">Novo Membro</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nome Completo</label>
                <input required name="name" type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="Nome do funcionário" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Utilizador / Login</label>
                <input required name="username" type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="login.cloud" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Palavra-passe</label>
                <input required name="password" type="password" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="****" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Perfil de Acesso</label>
                <select required name="role" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold">
                  <option value={UserRole.EMPLOYEE}>Vendedor (Limitado)</option>
                  <option value={UserRole.ADMIN}>Administrador (Total)</option>
                </select>
              </div>
              <div className="pt-6 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-colors shadow-lg">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
