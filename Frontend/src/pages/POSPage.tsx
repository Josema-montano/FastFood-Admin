import React, { useEffect, useState } from 'react';
import api, { BACKEND_ORIGIN } from '../config/api';
import { Producto, Inventario } from '../types';
import { ShoppingCart, Plus, Minus, Trash2, ChefHat } from 'lucide-react';

const POSPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  // inventarios retenidos para posible futura lógica (ej. mostrar stock)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Todos');
  const [carrito, setCarrito] = useState<{ producto: Producto; cantidad: number }[]>([]);
  const [mesa, setMesa] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      const [prodResp, invResp] = await Promise.all([
        api.get<Producto[]>('/productos'),
        api.get<Inventario[]>('/inventarios')
      ]);
      const inventarioIds = new Set(invResp.data.map(i => i.productoId));
      setInventarios(invResp.data);
      const activosConInventario = prodResp.data.filter(p => p.activo && inventarioIds.has(p.id));
      setProductos(activosConInventario);
      console.log('Productos activos con inventario:', activosConInventario.map(p=>p.nombre));
    } catch (error) {
      console.error('Error cargando datos POS:', error);
    }
  };

  const resolveImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('/')) return `${BACKEND_ORIGIN}${url}`;
    return url;
  };

  // Eliminado fetchProductos; se usa fetchDatos combinado

  const categorias = ['Todos', ...Array.from(new Set(productos.map(p => p.categoria)))];
  const productosFiltrados = categoriaSeleccionada === 'Todos' 
    ? productos 
    : productos.filter(p => p.categoria === categoriaSeleccionada);

  const addToCart = (producto: Producto) => {
    setCarrito(prev => {
      const existing = prev.find(item => item.producto.id === producto.id);
      if (existing) {
        return prev.map(item => 
          item.producto.id === producto.id 
            ? { ...item, cantidad: item.cantidad + 1 } 
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const removeFromCart = (productoId: number) => {
    setCarrito(prev => prev.filter(item => item.producto.id !== productoId));
  };

  const updateQuantity = (productoId: number, delta: number) => {
    setCarrito(prev => prev.map(item => {
      if (item.producto.id === productoId) {
        const newQuantity = Math.max(1, item.cantidad + delta);
        return { ...item, cantidad: newQuantity };
      }
      return item;
    }));
  };

  const total = carrito.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);

  const handleEnviarPedido = async () => {
    if (!mesa) {
      alert('Por favor ingrese el número de mesa');
      return;
    }
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setLoading(true);
    try {
      const nuevoPedido = {
        mesa: mesa.trim(),
        // estado omitido para permitir valor por defecto backend (CREADO/PENDIENTE)
        total,
        detalles: carrito.map(item => ({
          productoId: item.producto.id,
          cantidad: item.cantidad
        }))
      };
      console.log('Enviando pedido:', nuevoPedido);
      const resp = await api.post('/pedidos', nuevoPedido);
      console.log('Respuesta creación pedido:', resp.data);
      alert('Pedido enviado a cocina exitosamente');
      setCarrito([]);
      setMesa('');
    } catch (error) {
      console.error('Error creando pedido:', error);
        const backendMsg = (error as any)?.response?.data?.mensaje || (error as any)?.response?.data?.message || JSON.stringify((error as any)?.response?.data || {});
      alert(`Error al enviar el pedido: ${backendMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Panel Izquierdo - Productos */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                categoriaSeleccionada === cat 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'bg-zinc-900 text-gray-300 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2">
          {productosFiltrados.map(producto => {
            const img = resolveImageUrl(producto.imagenUrl);
            return (
              <button
                key={producto.id}
                onClick={() => addToCart(producto)}
                className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-amber-500/30 transition flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 mb-3 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                  {img ? (
                    <img src={img} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-500 group-hover:text-amber-500 transition">
                      {producto.nombre.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-100 mb-1 line-clamp-1">{producto.nombre}</h3>
                <p className="text-amber-500 font-bold">Bs.{producto.precio.toFixed(2)}</p>
                <p className="text-xs mt-1 text-gray-400">
                  Stock: {inventarios.find(i=>i.productoId===producto.id)?.stock ?? '—'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Derecho - Carrito */}
      <div className="w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 bg-zinc-800 border-b border-zinc-700">
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <ShoppingCart size={24} />
            Nuevo Pedido
          </h2>
        </div>

        <div className="p-4 border-b border-zinc-800">
          <label className="block text-sm font-medium text-gray-300 mb-1">Mesa</label>
          <input
            type="text"
            value={mesa}
            onChange={(e) => setMesa(e.target.value)}
            placeholder="Ej: Mesa 5"
            className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {carrito.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No hay productos en el pedido</p>
            </div>
          ) : (
            carrito.map(item => (
              <div key={item.producto.id} className="flex items-center justify-between bg-zinc-800 p-3 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-100">{item.producto.nombre}</h4>
                  <p className="text-sm text-gray-400">Bs.{item.producto.precio.toFixed(2)} x {item.cantidad}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-700">
                    <button 
                      onClick={() => updateQuantity(item.producto.id, -1)}
                      className="p-1 hover:bg-zinc-700 rounded-l-lg text-gray-300"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-gray-100">{item.cantidad}</span>
                    <button 
                      onClick={() => updateQuantity(item.producto.id, 1)}
                      className="p-1 hover:bg-zinc-700 rounded-r-lg text-gray-300"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.producto.id)}
                    className="text-red-400 hover:bg-red-500/10 p-1 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-zinc-800 border-t border-zinc-700">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-300">Total</span>
            <span className="text-2xl font-bold text-gray-100">Bs.{total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleEnviarPedido}
            disabled={loading || carrito.length === 0}
            className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Enviando...' : (
              <>
                <ChefHat size={20} />
                Enviar a Cocina
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
