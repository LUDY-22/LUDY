
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, History, ArrowDown, ArrowUp, X } from 'lucide-react';
import { AppState, Product, StockMovement, UserRole } from '../types';
import { formatCurrency } from '../utils/format';

interface Props {
  db: AppState;
  setDb: (update: AppState | ((prev: AppState) => AppState)) => Promise<void>;
}

const Products: React.FC<Props> = ({ db, setDb }) => {
  const isAdmin = db.currentUser?.role === UserRole.ADMIN;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);

  const filteredProducts = db.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    const formData = new FormData(e.currentTarget);
    const productData: Partial<Product> = {
      name: formData.get('name') as string,
      code: formData.get('code') as string || `P-${Date.now().toString().slice(-6)}`,
      category: formData.get('category') as string,
      buyPrice: parseFloat(formData.get('buyPrice') as string),
      sellPrice: parseFloat(formData.get('sellPrice') as string),
      stock: parseInt(formData.get('stock') as string),
      minStock: parseInt(formData.get('minStock') as string),
    };

    if (editingProduct) {
      setDb(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === editingProduct.id ? { ...p, ...productData } as Product : p)
      }));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        ...productData as Product
      };
      setDb(prev => ({
        ...prev,
        products: [...prev.products, newProduct]
      }));
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      setDb(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id)
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Catálogo de Produtos</h2>
          <p className="text-gray-500 font-medium">Gestão de inventário sincronizada na nuvem.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="flex items-center justify-center space-x-2 bg-[#064e3b] text-white px-6 py-3 rounded-xl hover:bg-emerald-800 transition-all font-bold shadow-lg"
          >
            <Plus size={20} />
            <span>Novo Produto</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou código..." 
              className="pl-10 pr-4 py-3 w-full bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>Online: <strong>{filteredProducts.length}</strong> itens</span>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                {isAdmin && <th className="px-6 py-4">Custo</th>}
                <th className="px-6 py-4">Venda</th>
                <th className="px-6 py-4">Saldo Cloud</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{p.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{p.code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                      {p.category}
                    </span>
                  </td>
                  {isAdmin && <td className="px-6 py-4 text-gray-500 font-medium">{formatCurrency(p.buyPrice)}</td>}
                  <td className="px-6 py-4 font-black text-emerald-700">{formatCurrency(p.sellPrice)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-black ${p.stock <= p.minStock ? 'text-red-500' : 'text-gray-900'}`}>
                        {p.stock}
                      </span>
                      {p.stock <= p.minStock && (
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter animate-pulse">REPOR</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {isAdmin && (
                        <button 
                          onClick={() => setShowHistory(p.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Histórico"
                        >
                          <History size={18} />
                        </button>
                      )}
                      {isAdmin ? (
                        <>
                          <button 
                            onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}
                            className="p-2 text-gray-400 hover:text-amber-600 transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => deleteProduct(p.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300 uppercase italic">Apenas Leitura</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Package size={64} className="mb-4 opacity-10" />
              <p className="font-medium text-sm">Nenhum produto encontrado no servidor.</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-[#064e3b] p-8 text-white flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tighter">{editingProduct ? 'Editar Artigo' : 'Novo Artigo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Designação</label>
                  <input required name="name" defaultValue={editingProduct?.name} type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="Nome do produto" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Código</label>
                  <input name="code" defaultValue={editingProduct?.code} type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="Auto" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Categoria</label>
                  <input required name="category" defaultValue={editingProduct?.category} type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="Bebidas, Comida..." />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Custo (Kz)</label>
                  <input required name="buyPrice" defaultValue={editingProduct?.buyPrice} step="0.01" type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold text-blue-600" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Venda (Kz)</label>
                  <input required name="sellPrice" defaultValue={editingProduct?.sellPrice} step="0.01" type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-600" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Inicial</label>
                  <input required name="stock" defaultValue={editingProduct?.stock || 0} type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Mínimo</label>
                  <input required name="minStock" defaultValue={editingProduct?.minStock || 5} type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                </div>
              </div>
              <div className="pt-6 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 px-6 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-4 px-6 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">Guardar na Nuvem</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isAdmin && showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-8 text-white flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Histórico Cloud</h3>
                <p className="text-sm font-medium opacity-80">{db.products.find(p => p.id === showHistory)?.name}</p>
              </div>
              <button onClick={() => setShowHistory(null)}><X size={24} /></button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                {db.movements.filter(m => m.productId === showHistory).reverse().map(move => (
                  <div key={move.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-xl ${move.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {move.type === 'IN' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 uppercase text-xs">{move.type === 'IN' ? 'Entrada' : 'Saída'}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{move.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black ${move.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {move.type === 'IN' ? '+' : '-'}{move.quantity}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">{new Date(move.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
