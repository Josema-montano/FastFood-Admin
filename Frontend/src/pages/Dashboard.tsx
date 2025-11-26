import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { Pedido, EstadoPedido, Usuario, Inventario, Producto } from '../types';
import { ChefHat, ShoppingBag, Users, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let currentUser: Usuario | null = null;
    if (userStr) {
      currentUser = JSON.parse(userStr);
      setUser(currentUser);
    }
    fetchData(currentUser);
  }, []);

  const fetchData = async (currentUser?: Usuario | null) => {
    const usuario = currentUser || user;
    try {
      let endpoint = '/pedidos';
      
      if (usuario) {
        if (['Mesero', 'mesero'].includes(usuario.rol)) {
          endpoint = '/pedidos/mis';
        } else if (['Cocina', 'cocina'].includes(usuario.rol)) {
          endpoint = '/pedidos/cocina';
        }
      }

      const [pedResp, invResp, prodResp] = await Promise.all([
        api.get<Pedido[]>(endpoint),
        api.get<Inventario[]>('/inventarios'),
        api.get<Producto[]>('/productos')
      ]);
      setPedidos(pedResp.data);
      setInventarios(invResp.data);
      setProductos(prodResp.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-300">Cargando...</div>;

  const pedidosPendientes = pedidos.filter(p => p.estado === EstadoPedido.PENDIENTE).length;
  const pedidosEnCocina = pedidos.filter(p => p.estado === EstadoPedido.EN_PREPARACION).length;
  const pedidosListos = pedidos.filter(p => p.estado === EstadoPedido.LISTO).length;
  const bajos = inventarios.filter(i => i.stock < i.stockMinimo);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">
          Hola, {user?.nombre || 'Usuario'}
        </h1>
        <p className="text-gray-400">Resumen de actividad del restaurante</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900/50 backdrop-blur p-6 rounded-2xl border border-zinc-800/50 hover:border-amber-500/30 transition-all">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">PEDIDOS PENDIENTES</p>
              <h3 className="text-4xl font-bold text-amber-500">{pedidosPendientes}</h3>
            </div>
            <div className="bg-amber-500 p-3 rounded-2xl">
              <Clock size={24} className="text-black" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm">
            <span className="text-emerald-400">↗</span>
            <span className="font-semibold">+12%</span>
            <span className="text-gray-500">vs última semana</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur p-6 rounded-2xl border border-zinc-800/50 hover:border-amber-500/30 transition-all">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">EN COCINA</p>
              <h3 className="text-4xl font-bold text-amber-500">{pedidosEnCocina}</h3>
            </div>
            <div className="bg-amber-500 p-3 rounded-2xl">
              <ChefHat size={24} className="text-black" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm">
            <span className="text-emerald-400">↗</span>
            <span className="font-semibold">+8%</span>
            <span className="text-gray-500">vs última semana</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur p-6 rounded-2xl border border-zinc-800/50 hover:border-amber-500/30 transition-all">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">PEDIDOS LISTOS</p>
              <h3 className="text-4xl font-bold text-amber-500">{pedidosListos}</h3>
            </div>
            <div className="bg-amber-500 p-3 rounded-2xl">
              <ShoppingBag size={24} className="text-black" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm">
            <span className="text-emerald-400">↗</span>
            <span className="font-semibold">+15%</span>
            <span className="text-gray-500">vs última semana</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur p-6 rounded-2xl border border-zinc-800/50 hover:border-amber-500/30 transition-all">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">PERSONAL ACTIVO</p>
              <h3 className="text-4xl font-bold text-amber-500">Activo</h3>
            </div>
            <div className="bg-amber-500 p-3 rounded-2xl">
              <Users size={24} className="text-black" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm">
            <span className="text-emerald-400">↗</span>
            <span className="font-semibold">Creciendo</span>
            <span className="text-gray-500">vs última semana</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold text-gray-100 mb-4">Accesos Rápidos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/pos" className="group relative overflow-hidden p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition h-40">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity duration-300"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80')",
            }}
          ></div>
          <div className="relative z-20">
            <div className="flex justify-between items-center mb-4">
              <ShoppingBag size={32} className="opacity-90" />
              <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0" />
            </div>
            <h3 className="text-xl font-bold mb-1">Nuevo Pedido</h3>
            <p className="text-gray-200 text-sm">Crear orden para mesa</p>
          </div>
        </Link>

        <Link to="/cocina" className="group relative overflow-hidden p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition h-40">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity duration-300"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80')",
            }}
          ></div>
          <div className="relative z-20">
            <div className="flex justify-between items-center mb-4">
              <ChefHat size={32} className="opacity-90" />
              <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0" />
            </div>
            <h3 className="text-xl font-bold mb-1">Vista Cocina</h3>
            <p className="text-gray-200 text-sm">Gestionar preparación</p>
          </div>
        </Link>

        <Link to="/pedidos" className="group relative overflow-hidden p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition h-40">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity duration-300"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80')",
            }}
          ></div>
          <div className="relative z-20">
            <div className="flex justify-between items-center mb-4">
              <Clock size={32} className="opacity-90" />
              <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0" />
            </div>
            <h3 className="text-xl font-bold mb-1">Ver Pedidos</h3>
            <p className="text-gray-200 text-sm">Estado de órdenes</p>
          </div>
        </Link>
      </div>

      {/* Alertas Bajo Stock */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-red-500 rounded" /> Alertas de Bajo Stock
        </h2>
        <div className="bg-zinc-900 rounded-xl border border-red-500/30 overflow-hidden">
          {bajos.length === 0 ? (
            <div className="p-6 text-sm text-gray-400">No hay productos con bajo stock.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-red-900/30 text-red-400">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Producto</th>
                  <th className="px-4 py-3 text-left font-semibold">Stock Actual</th>
                  <th className="px-4 py-3 text-left font-semibold">Mínimo</th>
                  <th className="px-4 py-3 text-left font-semibold">Unidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {bajos.map(inv => {
                  const nombre = inv.producto?.nombre || productos.find(p=>p.id===inv.productoId)?.nombre || 'Sin nombre';
                  return (
                  <tr key={inv.id} className="hover:bg-red-900/10">
                    <td className="px-4 py-2 font-medium text-gray-100 flex items-center gap-2">
                      {nombre}
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">BAJO</span>
                    </td>
                    <td className="px-4 py-2 font-bold text-red-400">{inv.stock}</td>
                    <td className="px-4 py-2 text-gray-300">{inv.stockMinimo}</td>
                    <td className="px-4 py-2 text-gray-400">{inv.unidad}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {bajos.length > 0 && (
            <div className="px-4 py-3 bg-red-900/20 text-xs text-red-400 flex justify-between items-center">
              <span>{bajos.length} producto(s) requieren reposición.</span>
              <Link to="/inventario" className="text-red-400 font-semibold hover:underline">Ir a Inventario →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
