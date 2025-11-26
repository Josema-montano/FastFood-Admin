import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { Pedido, EstadoPedido, mapEstadoDisplay } from '../types';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const CocinaPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    try {
      const response = await api.get<Pedido[]>('/pedidos/cocina');
      setPedidos(response.data);
    } catch (error) {
      console.error('Error fetching pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  const puedeTransicionar = (actual: EstadoPedido, nuevo: EstadoPedido) => {
    if (nuevo === EstadoPedido.CANCELADO) return ![EstadoPedido.CANCELADO, EstadoPedido.ENTREGADO, EstadoPedido.FINALIZADO].includes(actual);
    // En cocina no se permite pasar a ENTREGADO ni FINALIZADO, solo hasta LISTO.
    const allowedCocina: { [key: number]: number[] } = {
      [EstadoPedido.CREADO]: [EstadoPedido.EN_PREPARACION],
      [EstadoPedido.EN_PREPARACION]: [EstadoPedido.LISTO],
      [EstadoPedido.LISTO]: [],
      [EstadoPedido.ENTREGADO]: [],
      [EstadoPedido.FINALIZADO]: [],
      [EstadoPedido.CANCELADO]: []
    };
    return allowedCocina[actual]?.includes(nuevo) ?? false;
  };

  const handleEstadoChange = async (id: string, nuevoEstado: EstadoPedido) => {
    try {
      const pedido = pedidos.find(p => p.id === id);
      if (!pedido) return;
      if (!puedeTransicionar(pedido.estado, nuevoEstado)) {
        alert(`Transición inválida: ${mapEstadoDisplay(pedido.estado)} -> ${mapEstadoDisplay(nuevoEstado)}`);
        return;
      }
      await api.put(`/pedidos/${id}/estado`, null, { params: { estado: EstadoPedido[nuevoEstado] } });
      fetchPedidos();
    } catch (error: any) {
      console.error('Error updating estado:', error);
      alert(error.response?.data?.mensaje || 'Error actualizando estado');
    }
  };

  if (loading) return <div className="p-6 text-gray-300">Cargando...</div>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Cocina - Pedidos Pendientes</h1>
        <p className="text-gray-400 mt-1">Gestiona la preparación de pedidos activos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pedidos.map((pedido) => (
          <div 
            key={pedido.id} 
            className="bg-zinc-900/50 backdrop-blur rounded-2xl border border-zinc-800/50 overflow-hidden hover:border-amber-500/30 transition-all"
          >
            {/* Header del Card */}
            <div className="p-5 bg-zinc-800/50 border-b border-zinc-700/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 p-2.5 rounded-xl">
                  <Clock size={20} className="text-black" />
                </div>
                <div>
                  <span className="font-bold text-xl text-gray-100">Mesa: {pedido.mesa}</span>
                  <div className="text-xs text-gray-400">{new Date(pedido.fecha).toLocaleString()}</div>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                pedido.estado === EstadoPedido.CREADO ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                pedido.estado === EstadoPedido.EN_PREPARACION ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                pedido.estado === EstadoPedido.LISTO ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                pedido.estado === EstadoPedido.ENTREGADO ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : 
                pedido.estado === EstadoPedido.FINALIZADO ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {mapEstadoDisplay(pedido.estado)}
              </span>
            </div>

            {/* Contenido del Card */}
            <div className="p-5">
              {pedido.notas && (
                <div className="mb-4 p-3 bg-red-500/10 text-red-300 text-sm rounded-lg border border-red-500/30 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{pedido.notas}</span>
                </div>
              )}

              {/* Lista de productos */}
              <div className="space-y-2.5 mb-5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Items del Pedido</div>
                {pedido.detalles?.map((detalle) => (
                  <div 
                    key={detalle.id} 
                    className="flex justify-between items-center p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/30"
                  >
                    <span className="font-semibold text-gray-100">{detalle.producto?.nombre}</span>
                    <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-bold">
                      {detalle.cantidad}x
                    </span>
                  </div>
                ))}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-2.5 mt-5 pt-4 border-t border-zinc-700/50">
                {pedido.estado === EstadoPedido.CREADO && (
                  <button
                    onClick={() => handleEstadoChange(pedido.id, EstadoPedido.EN_PREPARACION)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-500/20"
                  >
                    <Clock size={18} /> Comenzar Preparación
                  </button>
                )}
                {pedido.estado === EstadoPedido.EN_PREPARACION && (
                  <button
                    onClick={() => handleEstadoChange(pedido.id, EstadoPedido.LISTO)}
                    className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg shadow-green-500/20"
                  >
                    <CheckCircle size={18} /> Marcar como Listo
                  </button>
                )}
                {pedido.estado !== EstadoPedido.CANCELADO && pedido.estado !== EstadoPedido.ENTREGADO && pedido.estado !== EstadoPedido.FINALIZADO && (
                  <button
                    onClick={() => handleEstadoChange(pedido.id, EstadoPedido.CANCELADO)}
                    className="w-full bg-zinc-800 border border-red-500/30 text-red-400 py-2.5 rounded-xl hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    Cancelar Pedido
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {pedidos.length === 0 && (
          <div className="col-span-full">
            <div className="bg-zinc-900/50 backdrop-blur rounded-2xl border border-zinc-800/50 p-12 text-center">
              <div className="bg-zinc-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">Sin Pedidos Pendientes</h3>
              <p className="text-gray-500">No hay pedidos activos en este momento.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CocinaPage;
