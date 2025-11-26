import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { Inventario, Producto } from '../types';
import { AlertTriangle, Save } from 'lucide-react';

const InventarioPage: React.FC = () => {
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [asignando, setAsignando] = useState(false);
  const [nuevoInv, setNuevoInv] = useState<{ productoId: number | null; stock: number; stockMinimo: number; stockMaximo: number; unidad: string }>({
    productoId: null,
    stock: 0,
    stockMinimo: 0,
    stockMaximo: 0,
    unidad: 'Unidad'
  });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{stock: number, stockMinimo: number, stockMaximo: number}>({
    stock: 0, stockMinimo: 0, stockMaximo: 0
  });
  // Campo opcional de ajuste relativo (delta). Si se usa, se suma al stock original.
  const [delta, setDelta] = useState<number>(0);

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      const [invResp, prodResp] = await Promise.all([
        api.get<Inventario[]>('/inventarios'),
        api.get<Producto[]>('/productos')
      ]);
      setInventarios(invResp.data);
      setProductos(prodResp.data);
    } catch (error) {
      console.error('Error cargando datos inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (inv: Inventario) => {
    setEditingId(inv.id);
    setEditForm({
      stock: inv.stock,
      stockMinimo: inv.stockMinimo,
      stockMaximo: inv.stockMaximo
    });
    setDelta(0);
  };

  const handleSave = async (id: string) => {
    try {
      const invOriginal = inventarios.find(i => i.id === id);
      if (!invOriginal) return;
      // Si se especificó delta, aplicar sobre el stock del formulario (que parte del original)
      const nuevoStock = editForm.stock + delta;
      const payload = {
        id, // incluir id porque el backend espera la entidad completa
        productoId: invOriginal.productoId,
        unidad: invOriginal.unidad,
        stock: nuevoStock,
        stockMinimo: editForm.stockMinimo,
        stockMaximo: editForm.stockMaximo
      };
      await api.put(`/inventarios/${id}`, payload);
      setEditingId(null);
      fetchDatos();
    } catch (error: any) {
      console.error('Error actualizando inventario:', error);
      const msg = error?.response?.data?.message || 'No se pudo aplicar el movimiento';
      alert(msg);
    }
  };

  const productosSinInventario = productos.filter(p => !inventarios.some(i => i.productoId === p.id));

  const handleAsignarInventario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoInv.productoId) return;
    try {
      await api.post('/inventarios', {
        productoId: nuevoInv.productoId,
        stock: nuevoInv.stock,
        stockMinimo: nuevoInv.stockMinimo,
        stockMaximo: nuevoInv.stockMaximo,
        unidad: nuevoInv.unidad
      });
      setAsignando(false);
      setNuevoInv({ productoId: null, stock: 0, stockMinimo: 0, stockMaximo: 0, unidad: 'Unidad' });
      fetchDatos();
    } catch (err) {
      console.error('Error asignando inventario:', err);
      alert('Error asignando inventario');
    }
  };

  if (loading) return <div className="p-6 text-gray-300">Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">Inventario</h1>
      
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-800 border-b border-zinc-700">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-300">Producto</th>
              <th className="px-6 py-4 font-semibold text-gray-300">Stock Actual</th>
              <th className="px-6 py-4 font-semibold text-gray-300">Mínimo</th>
              <th className="px-6 py-4 font-semibold text-gray-300">Máximo</th>
              <th className="px-6 py-4 font-semibold text-gray-300">Estado</th>
              <th className="px-6 py-4 font-semibold text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {inventarios.map((inv) => {
              const nombre = inv.producto?.nombre || productos.find(p=>p.id===inv.productoId)?.nombre || 'Sin nombre';
              return (
              <tr key={inv.id} className="hover:bg-zinc-800 transition">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-100">{nombre}</div>
                  <div className="text-xs text-gray-400">{inv.unidad}</div>
                </td>
                
                {editingId === inv.id ? (
                  <>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-400">Stock Absoluto</label>
                        <input 
                          type="number" 
                          className="w-24 border border-zinc-700 bg-zinc-800 text-gray-100 rounded px-2 py-1"
                          value={editForm.stock}
                          onChange={e => setEditForm({...editForm, stock: parseInt(e.target.value || '0')})}
                        />
                        <label className="text-xs font-medium text-gray-400 mt-2">Ajuste (Δ)</label>
                        <input
                          type="number"
                          className="w-24 border border-zinc-700 bg-zinc-800 text-gray-100 rounded px-2 py-1"
                          value={delta}
                          onChange={e => setDelta(parseInt(e.target.value || '0'))}
                        />
                        <div className="text-xs mt-1 text-gray-400">
                          Original: {inv.stock} | Nuevo calculado: {editForm.stock + delta} | Δ total {(editForm.stock + delta) - inv.stock}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        className="w-20 border border-zinc-700 bg-zinc-800 text-gray-100 rounded px-2 py-1"
                        value={editForm.stockMinimo}
                        onChange={e => setEditForm({...editForm, stockMinimo: parseInt(e.target.value)})}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        className="w-20 border border-zinc-700 bg-zinc-800 text-gray-100 rounded px-2 py-1"
                        value={editForm.stockMaximo}
                        onChange={e => setEditForm({...editForm, stockMaximo: parseInt(e.target.value)})}
                      />
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-mono font-bold text-gray-100">{inv.stock}</td>
                    <td className="px-6 py-4 text-gray-300">{inv.stockMinimo}</td>
                    <td className="px-6 py-4 text-gray-300">{inv.stockMaximo}</td>
                  </>
                )}

                <td className="px-6 py-4">
                  {inv.stock <= inv.stockMinimo ? (
                    <span className="flex items-center gap-1 text-red-400 bg-red-500/20 px-2 py-1 rounded-full text-xs font-bold w-fit">
                      <AlertTriangle size={12} /> Bajo Stock
                    </span>
                  ) : (
                    <span className="text-green-400 bg-green-500/20 px-2 py-1 rounded-full text-xs font-bold">OK</span>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  {editingId === inv.id ? (
                    <button 
                      onClick={() => handleSave(inv.id)}
                      className="flex items-center gap-2 text-green-400 hover:bg-green-500/10 px-3 py-1 rounded transition text-sm font-semibold"
                    >
                      <Save size={16} /> Aplicar Movimiento
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleEdit(inv)}
                      className="text-amber-500 hover:bg-amber-500/10 px-3 py-1 rounded transition text-sm font-semibold"
                    >
                      Registrar Movimiento
                    </button>
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-100">Asignar Inventario a Producto</h2>
          <button
            onClick={() => setAsignando(a => !a)}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-amber-600 text-white hover:bg-amber-700"
          >{asignando ? 'Cerrar' : 'Nuevo'}</button>
        </div>
        {asignando && (
          <form onSubmit={handleAsignarInventario} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Producto</label>
              <select
                required
                className="w-full border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg px-3 py-2"
                value={nuevoInv.productoId ?? ''}
                onChange={e => setNuevoInv({ ...nuevoInv, productoId: Number(e.target.value) })}
              >
                <option value="" disabled>Selecciona producto sin inventario</option>
                {productosSinInventario.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              {productosSinInventario.length === 0 && <p className="text-xs text-gray-400 mt-1">Todos los productos ya tienen inventario.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Stock Inicial</label>
              <input type="number" required min={0} className="w-full border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg px-3 py-2" value={nuevoInv.stock} onChange={e=>setNuevoInv({...nuevoInv, stock: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Stock Mínimo</label>
              <input type="number" required min={0} className="w-full border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg px-3 py-2" value={nuevoInv.stockMinimo} onChange={e=>setNuevoInv({...nuevoInv, stockMinimo: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Stock Máximo</label>
              <input type="number" required min={0} className="w-full border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg px-3 py-2" value={nuevoInv.stockMaximo} onChange={e=>setNuevoInv({...nuevoInv, stockMaximo: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Unidad</label>
              <input type="text" required className="w-full border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg px-3 py-2" value={nuevoInv.unidad} onChange={e=>setNuevoInv({...nuevoInv, unidad: e.target.value})} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=>{setAsignando(false);}} className="px-4 py-2 rounded-lg bg-zinc-800 text-gray-300 font-bold hover:bg-zinc-700">Cancelar</button>
              <button type="submit" disabled={!nuevoInv.productoId} className="px-4 py-2 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 disabled:opacity-50">Asignar Inventario</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InventarioPage;
