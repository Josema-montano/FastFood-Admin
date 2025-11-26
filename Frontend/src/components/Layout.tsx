import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  ShoppingBag,
  CreditCard,
  Users,
  Package,
  ClipboardList,
  BarChart3,
  LogOut,
  Menu
} from "lucide-react";
import { Usuario } from "../types";

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userStr));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-brand-background font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0c0f14] text-white flex flex-col shadow-xl sticky top-0 h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-8 bg-[#0a0c10] border-b border-gray-800">
          <div className="bg-amber-500 rounded-lg p-2 shadow-lg">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">Valdis Burguer</h1>
            <p className="text-xs text-gray-400">Manager</p>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
          <p className="text-sm font-medium text-white">{user.nombre}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold mt-1 inline-block
            ${['Administrador', 'administrador'].includes(user.rol) ? 'bg-purple-900 text-purple-200' :
              ['Cocina', 'cocina'].includes(user.rol) ? 'bg-orange-900 text-orange-200' :
              'bg-green-900 text-green-200'}`}>
            {user.rol}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-1">
            
            {/* Common for All (or mostly all) */}
            <li>
              <NavLink to="/dashboard" className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${isActive ? "bg-amber-500 text-black shadow-md" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
              }>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </NavLink>
            </li>

            {/* Mesero & Admin */}
            {(['Mesero', 'mesero'].includes(user.rol) || ['Administrador', 'administrador'].includes(user.rol)) && (
              <>
                <li>
                  <NavLink to="/pos" className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${isActive ? "bg-amber-500 text-black shadow-md" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
                  }>
                    <ShoppingBag size={20} />
                    <span>Nuevo Pedido</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/pedidos" className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${isActive ? "bg-amber-500 text-black shadow-md" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
                  }>
                    <ClipboardList size={20} />
                    <span>Mis Pedidos</span>
                  </NavLink>
                </li>
              </>
            )}

            {/* Cocina & Admin */}
            {(['Cocina', 'cocina'].includes(user.rol) || ['Administrador', 'administrador'].includes(user.rol)) && (
              <li>
                <NavLink to="/cocina" className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${isActive ? "bg-amber-500 text-black shadow-md" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
                }>
                  <ChefHat size={20} />
                  <span>Cocina</span>
                </NavLink>
              </li>
            )}

            {/* Admin Only */}
            {['Administrador', 'administrador'].includes(user.rol) && (
              <>
                <div className="my-4 border-t border-gray-800 mx-2"></div>
                <div className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Administración</div>
                
                <li>
                  <NavLink to="/productos" className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${isActive ? "bg-amber-500 text-black shadow-md" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
                  }>
                    <Menu size={20} />
                    <span>Productos</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/inventario" className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${isActive ? "bg-amber-500 text-black shadow-md" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
                  }>
                    <Package size={20} />
                    <span>Inventario</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/usuarios" className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${isActive ? "bg-amber-500 text-black shadow-md" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
                  }>
                    <Users size={20} />
                    <span>Usuarios</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/reportes" className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${isActive ? "bg-amber-500 text-black shadow-md" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
                  }>
                    <BarChart3 size={20} />
                    <span>Reportes</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/pagos" className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${isActive ? "bg-amber-500 text-black shadow-md" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
                  }>
                    <CreditCard size={20} />
                    <span>Pagos</span>
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition font-medium text-sm"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
