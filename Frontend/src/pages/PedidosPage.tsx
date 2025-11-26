import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { Pedido, EstadoPedido, EstadoPago, Usuario, mapEstadoDisplay } from '../types';
import { Trash2, Eye, Edit, DollarSign } from 'lucide-react';

const PedidosPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Usuario | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  // Registro local de pedidos con pago completado para habilitar FINALIZADO aunque backend no devuelva pagos.
  const [pedidosConPago, setPedidosConPago] = useState<Set<string>>(new Set());
  // Modal de pago
  const [showPago, setShowPago] = useState(false);
  const [pagoPedido, setPagoPedido] = useState<Pedido | null>(null);
  const [pagoMetodo, setPagoMetodo] = useState<'Efectivo' | 'QR'>('Efectivo');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let currentUser: Usuario | null = null;
    if (userStr) {
      currentUser = JSON.parse(userStr);
      setUser(currentUser);
    }
    fetchPedidos(currentUser);
  }, []);

  const fetchPedidos = async (currentUser?: Usuario | null) => {
    const usuario = currentUser || user;
    let endpoint = '/pedidos';

    try {
      // Si es mesero, intentamos obtener solo sus pedidos
      if (usuario && (usuario.rol === 'Mesero' || (usuario.rol as string) === 'mesero')) {
        endpoint = '/pedidos/mis';
      }

      const response = await api.get<Pedido[]>(endpoint);
      let base = response.data;
      // Ordenar por fecha más reciente primero
      base.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      // Enriquecer con pagos si están ENTREGADOS para habilitar botón Finalizar
      const entregados = base.filter(p=>p.estado === EstadoPedido.ENTREGADO);
      if (entregados.length > 0) {
        try {
          const detalles = await Promise.all(entregados.map(p=>api.get<Pedido>(`/pedidos/${p.id}`)));
          const pagosMap = new Map(detalles.map(r=>[r.data.id, r.data.pagos || []]));
          base = base.map(p => pagosMap.has(p.id) ? { ...p, pagos: pagosMap.get(p.id) } : p);
        } catch(e) {
          console.warn('No se pudieron enriquecer pagos de pedidos ENTREGADOS', e);
        }
      }
      setPedidos(base);
    } catch (error: any) {
      console.error('Error fetching pedidos:', error);
      // Si falla el endpoint específico de usuario con 404, intentamos el general por si acaso
      if (error.response && error.response.status === 404 && endpoint !== '/pedidos') {
         try {
            const response = await api.get<Pedido[]>('/pedidos');
            let base = response.data;
            const entregados = base.filter(p=>p.estado === EstadoPedido.ENTREGADO);
            if (entregados.length > 0) {
              try {
                const detalles = await Promise.all(entregados.map(p=>api.get<Pedido>(`/pedidos/${p.id}`)));
                const pagosMap = new Map(detalles.map(r=>[r.data.id, r.data.pagos || []]));
                base = base.map(p => pagosMap.has(p.id) ? { ...p, pagos: pagosMap.get(p.id) } : p);
              } catch(e) {
                console.warn('No se pudieron enriquecer pagos (fallback)', e);
              }
            }
            setPedidos(base);
         } catch (e) {
            console.error('Fallback fetch failed:', e);
         }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este pedido?')) return;
    try {
      await api.delete(`/pedidos/${id}`);
      fetchPedidos();
    } catch (error) {
      console.error('Error deleting pedido:', error);
    }
  };

  const handleVerDetalles = async (id: string) => {
    setShowDetalles(true);
    setLoadingDetalles(true);
    try {
      const resp = await api.get<Pedido>(`/pedidos/${id}`);
      setSelected(resp.data);
    } catch (e) {
      console.error('Error obteniendo detalles del pedido', e);
      alert('No se pudieron cargar detalles');
      setShowDetalles(false);
    } finally {
      setLoadingDetalles(false);
    }
  };

  const openPagoModal = (pedido: Pedido) => {
    setPagoPedido(pedido);
    setPagoMetodo('Efectivo');
    setShowPago(true);
  };

  const handlePayment = async (pedido: Pedido, metodo: 'Efectivo' | 'QR') => {
    try {
      await api.post(`/pedidos/${pedido.id}/pago`, {
        pedidoId: pedido.id,
        monto: pedido.total,
        metodo
      });
      // Marcar localmente que este pedido ya tiene pago completado
      setPedidosConPago(prev => new Set(prev).add(pedido.id));
      // Agregar un pago simulado al estado local para reflejo inmediato
      setPedidos(prev => prev.map(p => p.id === pedido.id ? { ...p, pagos: [...(p.pagos||[]), { id: 'local', pedidoId: p.id, monto: p.total, metodo, estado: EstadoPago.COMPLETADO, fecha: new Date().toISOString() } ] } : p));
      setShowPago(false);
      setPagoPedido(null);
      fetchPedidos();
    } catch (error: any) {
      console.error('Error registering payment:', error);
      alert(error.response?.data?.mensaje || 'Error registrando pago');
    }
  };

  const handleStatusChange = async (id: string, newStatus: number) => {
    try {
      const pedidoResp = await api.get<Pedido>(`/pedidos/${id}`);
      const actualValor: any = pedidoResp.data.estado;
      const actualStr = typeof actualValor === 'number' ? EstadoPedido[actualValor] : actualValor;
      const nuevoStr = EstadoPedido[newStatus];
      const esValida = puedeTransicionar(actualValor, newStatus as EstadoPedido);
      if (!esValida) {
        alert(`Transición inválida: ${actualStr} -> ${nuevoStr}`);
        setEditingId(null);
        return;
      }
      // Validar pago antes de FINALIZAR
      if (newStatus === EstadoPedido.FINALIZADO) {
        const pagosDetalle = pedidoResp.data.pagos || [];
        const pagosLocal = pedidos.find(p=>p.id===id)?.pagos || [];
        const todos = [...pagosDetalle, ...pagosLocal];
        const tienePago = pedidosConPago.has(id) || todos.some(p => p.estado === EstadoPago.COMPLETADO || String(p.estado).toUpperCase() === 'COMPLETADO');
        if (!tienePago) {
          alert('Debe existir un pago COMPLETADO antes de finalizar el pedido.');
          setEditingId(null);
          return;
        }
      }
      await api.put(`/pedidos/${id}/estado`, null, { params: { estado: nuevoStr } });
      setEditingId(null);
      fetchPedidos();
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.mensaje || 'Error actualizando estado');
      fetchPedidos();
    }
  };

  const puedeTransicionar = (actual: EstadoPedido, nuevo: EstadoPedido) => {
    if (nuevo === EstadoPedido.CANCELADO) {
      // No permitir cancelar si ya está ENTREGADO o FINALIZADO
      return ![EstadoPedido.CANCELADO, EstadoPedido.ENTREGADO, EstadoPedido.FINALIZADO].includes(actual);
    }
    const allowed: { [key: number]: number[] } = {
      [EstadoPedido.CREADO]: [EstadoPedido.EN_PREPARACION],
      [EstadoPedido.EN_PREPARACION]: [EstadoPedido.LISTO],
      [EstadoPedido.LISTO]: [EstadoPedido.ENTREGADO],
      [EstadoPedido.ENTREGADO]: [EstadoPedido.FINALIZADO],
      [EstadoPedido.FINALIZADO]: [],
      [EstadoPedido.CANCELADO]: []
    };
    return allowed[actual]?.includes(nuevo) ?? false;
  };

  if (loading) return <div className="p-6 text-gray-300">Cargando...</div>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Gestión de Pedidos</h1>
        <p className="text-gray-400 mt-1">Administra todos los pedidos del restaurante</p>
      </div>

      {/* Vista móvil - Cards */}
      <div className="lg:hidden space-y-4">
        {pedidos.map((pedido) => {
          const pagos = pedido.pagos || [];
          const habilitado = pedidosConPago.has(pedido.id) || pagos.some(p => p.estado === EstadoPago.COMPLETADO || String(p.estado).toUpperCase() === 'COMPLETADO');
          
          return (
            <div key={pedido.id} className="bg-zinc-900/50 backdrop-blur rounded-2xl border border-zinc-800/50 p-4 space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-gray-100">Mesa {pedido.mesa}</span>
                    {user?.rol === 'Administrador' && (
                      <button 
                        onClick={() => handleDelete(pedido.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" 
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">{pedido.id.substring(0, 8)}...</div>
                  <div className="text-sm text-gray-400 mt-1">{new Date(pedido.fecha).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-500">Bs.{pedido.total.toFixed(2)}</div>
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center gap-2">
                {editingId === pedido.id && user?.rol === 'Administrador' ? (
                  <select 
                    className="flex-1 border border-zinc-700 rounded-lg px-3 py-2 text-sm bg-zinc-800 text-gray-100 focus:ring-2 focus:ring-amber-500/40 outline-none"
                    value={pedido.estado}
                    onChange={(e) => handleStatusChange(pedido.id, parseInt(e.target.value))}
                    onBlur={() => setEditingId(null)}
                    autoFocus
                  >
                    <option value={EstadoPedido.PENDIENTE}>PENDIENTE</option>
                    <option value={EstadoPedido.EN_PREPARACION}>EN PREPARACIÓN</option>
                    <option value={EstadoPedido.LISTO}>LISTO</option>
                    <option value={EstadoPedido.ENTREGADO}>ENTREGADO</option>
                    <option value={EstadoPedido.FINALIZADO}>FINALIZADO</option>
                    <option value={EstadoPedido.CANCELADO}>CANCELADO</option>
                  </select>
                ) : (
                  <>
                    <span className={`flex-1 text-center px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide
                      ${pedido.estado === EstadoPedido.CREADO ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        pedido.estado === EstadoPedido.EN_PREPARACION ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        pedido.estado === EstadoPedido.LISTO ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        pedido.estado === EstadoPedido.ENTREGADO ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
                        pedido.estado === EstadoPedido.FINALIZADO ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                    >
                      {mapEstadoDisplay(pedido.estado)}
                    </span>
                    {user?.rol === 'Administrador' && (
                      <button 
                        onClick={() => setEditingId(pedido.id)}
                        className="p-2 text-gray-500 hover:text-amber-400 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleVerDetalles(pedido.id)} 
                  className="flex-1 min-w-[120px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-semibold" 
                >
                  <Eye size={16} /> Ver Detalles
                </button>
                
                {(user?.rol === 'Administrador' || user?.rol === 'Mesero') && 
                 pedido.estado === EstadoPedido.ENTREGADO && (
                  <button 
                    onClick={() => openPagoModal(pedido)}
                    className="flex-1 min-w-[120px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-semibold" 
                  >
                    <DollarSign size={16} /> Pagar
                  </button>
                )}

                {(user?.rol === 'Administrador' || user?.rol === 'Mesero') && pedido.estado === EstadoPedido.LISTO && (
                  <button
                    onClick={() => handleStatusChange(pedido.id, EstadoPedido.ENTREGADO)}
                    className="flex-1 min-w-[120px] px-4 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm font-semibold"
                  >
                    Entregar
                  </button>
                )}

                {(user?.rol === 'Administrador' || user?.rol === 'Mesero') && pedido.estado === EstadoPedido.ENTREGADO && (
                  habilitado ? (
                    <button
                      onClick={() => handleStatusChange(pedido.id, EstadoPedido.FINALIZADO)}
                      className="flex-1 min-w-[120px] px-4 py-2.5 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-semibold"
                    >
                      Finalizar
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 min-w-[120px] px-4 py-2.5 text-sm font-semibold rounded-lg bg-purple-500/10 text-purple-400 cursor-not-allowed border border-purple-500/30"
                      title="Registrar pago antes de finalizar"
                    >
                      Finalizar
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
        {pedidos.length === 0 && (
          <div className="p-12 text-center text-gray-500 bg-zinc-900/50 backdrop-blur rounded-2xl border border-zinc-800/50">
            No hay pedidos registrados.
          </div>
        )}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden lg:block bg-zinc-900/50 backdrop-blur rounded-2xl border border-zinc-800/50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-800/50 border-b border-zinc-700/50">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-400 text-sm uppercase tracking-wide">ID</th>
              <th className="px-6 py-4 font-semibold text-gray-400 text-sm uppercase tracking-wide">Mesa</th>
              <th className="px-6 py-4 font-semibold text-gray-400 text-sm uppercase tracking-wide">Fecha</th>
              <th className="px-6 py-4 font-semibold text-gray-400 text-sm uppercase tracking-wide">Estado</th>
              <th className="px-6 py-4 font-semibold text-gray-400 text-sm uppercase tracking-wide">Total</th>
              <th className="px-6 py-4 font-semibold text-gray-400 text-sm uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{pedido.id.substring(0, 8)}...</td>
                <td className="px-6 py-4 text-sm text-gray-100 font-bold">{pedido.mesa}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{new Date(pedido.fecha).toLocaleString()}</td>
                <td className="px-6 py-4">
                  {editingId === pedido.id && user?.rol === 'Administrador' ? (
                    <select 
                      className="border border-zinc-700 rounded-lg px-3 py-1.5 text-sm bg-zinc-800 text-gray-100 focus:ring-2 focus:ring-amber-500/40 outline-none"
                      value={pedido.estado}
                      onChange={(e) => handleStatusChange(pedido.id, parseInt(e.target.value))}
                      onBlur={() => setEditingId(null)}
                      autoFocus
                    >
                      <option value={EstadoPedido.PENDIENTE}>PENDIENTE</option>
                      <option value={EstadoPedido.EN_PREPARACION}>EN PREPARACIÓN</option>
                      <option value={EstadoPedido.LISTO}>LISTO</option>
                      <option value={EstadoPedido.ENTREGADO}>ENTREGADO</option>
                      <option value={EstadoPedido.FINALIZADO}>FINALIZADO</option>
                      <option value={EstadoPedido.CANCELADO}>CANCELADO</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide
                        ${pedido.estado === EstadoPedido.CREADO ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          pedido.estado === EstadoPedido.EN_PREPARACION ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          pedido.estado === EstadoPedido.LISTO ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          pedido.estado === EstadoPedido.ENTREGADO ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
                          pedido.estado === EstadoPedido.FINALIZADO ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                      >
                        {mapEstadoDisplay(pedido.estado)}
                      </span>
                      {user?.rol === 'Administrador' && (
                        <button 
                          onClick={() => setEditingId(pedido.id)}
                          className="text-gray-500 hover:text-amber-400 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                    </div>
                  )}  
                </td>
                <td className="px-6 py-4 text-base font-bold text-amber-500">Bs.{pedido.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleVerDetalles(pedido.id)} 
                      className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" 
                      title="Ver Detalles"
                    >
                      <Eye size={18} />
                    </button>
                    
                    {(user?.rol === 'Administrador' || user?.rol === 'Mesero') && 
                     pedido.estado === EstadoPedido.ENTREGADO && (
                      <button 
                        onClick={() => openPagoModal(pedido)}
                        className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" 
                        title="Registrar Pago"
                      >
                        <DollarSign size={18} />
                      </button>
                    )}

                    {(user?.rol === 'Administrador' || user?.rol === 'Mesero') && pedido.estado === EstadoPedido.LISTO && (
                      <button
                        onClick={() => handleStatusChange(pedido.id, EstadoPedido.ENTREGADO)}
                        className="px-3 py-1.5 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-xs font-semibold"
                        title="Marcar Entregado"
                      >
                        Entregar
                      </button>
                    )}

                    {(user?.rol === 'Administrador' || user?.rol === 'Mesero') && pedido.estado === EstadoPedido.ENTREGADO && (
                      (() => {
                        const pagos = pedido.pagos || [];
                        const habilitado = pedidosConPago.has(pedido.id) || pagos.some(p => p.estado === EstadoPago.COMPLETADO || String(p.estado).toUpperCase() === 'COMPLETADO');
                        return habilitado ? (
                        <button
                          onClick={() => handleStatusChange(pedido.id, EstadoPedido.FINALIZADO)}
                          className="px-3 py-1.5 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-xs font-semibold"
                          title="Finalizar Pedido"
                        >
                          Finalizar
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500/10 text-purple-400 cursor-not-allowed border border-purple-500/30"
                          title="Registrar pago antes de finalizar"
                        >
                          Finalizar
                        </button>
                      )
                      })()
                    )}

                    {user?.rol === 'Administrador' && (
                      <button 
                        onClick={() => handleDelete(pedido.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" 
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pedidos.length === 0 && (
          <div className="p-12 text-center text-gray-500">No hay pedidos registrados.</div>
        )}
      </div>
      {showDetalles && selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5 bg-zinc-800/50 border-b border-zinc-700/50">
              <h2 className="text-xl font-bold text-gray-100">Detalles del Pedido</h2>
              <button 
                onClick={()=>{setShowDetalles(false); setSelected(null);}} 
                className="text-gray-400 hover:text-gray-200 text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {loadingDetalles && <div className="text-gray-400">Cargando detalles...</div>}
              {!loadingDetalles && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-zinc-800/30 p-4 rounded-xl border border-zinc-700/30">
                    <div>
                      <span className="font-semibold text-gray-400">Mesa:</span>
                      <span className="ml-2 text-gray-100 font-bold">{selected.mesa}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-400">Fecha:</span>
                      <span className="ml-2 text-gray-100">{new Date(selected.fecha).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-400">Estado:</span>
                      <span className="ml-2 text-gray-100">{mapEstadoDisplay(selected.estado)}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-400">Total:</span>
                      <span className="ml-2 text-amber-500 font-bold text-lg">Bs.{selected.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-300 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                      <div className="w-1 h-4 bg-amber-500 rounded"></div>
                      Productos del Pedido
                    </h3>
                    {selected.detalles && selected.detalles.length > 0 ? (
                      <div className="space-y-2">
                        {selected.detalles.map(d => (
                          <div 
                            key={d.id} 
                            className="flex justify-between items-center p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/30"
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-gray-100">{d.producto?.nombre || d.productoId}</div>
                              <div className="text-xs text-gray-400">
                                {d.cantidad}x Bs.{d.precioUnitario?.toFixed(2) ?? '—'}
                              </div>
                            </div>
                            <div className="font-bold text-amber-500">
                              Bs.{d.subtotal?.toFixed(2) ?? (d.precioUnitario ? (d.precioUnitario * d.cantidad).toFixed(2) : '—')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <div className="text-gray-500 text-sm">Sin detalles.</div>}
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-zinc-700/50">
                    <button
                      onClick={()=>{setShowDetalles(false); setSelected(null);}}
                      className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {showPago && pagoPedido && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 bg-zinc-800/50 border-b border-zinc-700/50">
              <h2 className="text-lg font-bold text-gray-100">Registrar Pago</h2>
              <button 
                onClick={()=>{setShowPago(false); setPagoPedido(null);}} 
                className="text-gray-400 hover:text-gray-200 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-5 space-y-5">
              <div className="text-sm text-gray-300 bg-zinc-800/30 p-4 rounded-xl border border-zinc-700/30">
                ¿Confirmar pago de <span className="font-bold text-amber-500 text-lg">Bs.{pagoPedido.total.toFixed(2)}</span> para mesa <span className="font-bold text-gray-100">{pagoPedido.mesa}</span>?
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-400">Método de Pago:</label>
                <select
                  className="border border-zinc-700 rounded-xl px-4 py-3 text-sm bg-zinc-800 text-gray-100 focus:ring-2 focus:ring-amber-500/40 outline-none"
                  value={pagoMetodo}
                  onChange={(e)=> setPagoMetodo(e.target.value as 'Efectivo' | 'QR')}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="QR">QR / Transferencia</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={()=>{setShowPago(false); setPagoPedido(null);}} 
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-gray-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={()=> handlePayment(pagoPedido, pagoMetodo)} 
                  className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosPage;
