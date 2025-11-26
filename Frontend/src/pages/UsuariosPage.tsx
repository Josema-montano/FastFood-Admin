import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { Usuario } from '../types';
import { User, Trash2, Edit, Plus, X } from 'lucide-react';

const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'Mesero'
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await api.get<Usuario[]>('/usuarios');
      // Ordenar por más reciente primero (asumiendo que el ID es UUID ordenable o usar fecha si existe)
      const sorted = [...response.data].reverse();
      setUsuarios(sorted);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Construir payload según swagger probable: incluir id y omitir password si vacía
        const payload: any = {
          id: editingId,
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          rol: formData.rol
        };
        if (formData.password && formData.password.trim().length > 0) {
          payload.password = formData.password.trim();
        }
        await api.put(`/usuarios/${editingId}`, payload);
      } else {
        // Registro nuevo requiere password obligatoria
        await api.post('/auth/register', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ nombre: '', email: '', password: '', telefono: '', rol: 'Mesero' });
      fetchUsuarios();
    } catch (error: any) {
      console.error('Error guardando usuario:', error);
      const msg = error?.response?.data?.message || 'Error al guardar usuario';
      alert(msg);
    }
  };

  const handleEdit = (user: Usuario) => {
    setEditingId(user.id);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: '', // No forzamos cambio si queda vacío.
      telefono: user.telefono,
      rol: user.rol
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      fetchUsuarios();
    } catch (error) {
      console.error('Error deleting usuario:', error);
    }
  };

  if (loading) return <div className="p-6 text-gray-300">Cargando...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Gestión de Usuarios</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ nombre: '', email: '', password: '', telefono: '', rol: 'Mesero' });
            setShowModal(true);
          }}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-700 transition"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuarios.map((user) => (
          <div key={user.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-amber-500/20 p-3 rounded-full text-amber-500">
                <User size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold
                ${['Administrador', 'administrador'].includes(user.rol) ? 'bg-purple-500/20 text-purple-400' :
                  ['Cocina', 'cocina'].includes(user.rol) ? 'bg-orange-500/20 text-orange-400' :
                  'bg-green-500/20 text-green-400'}`}>
                {user.rol}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-100 mb-1">{user.nombre}</h3>
            <p className="text-gray-400 text-sm mb-4">{user.email}</p>
            
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <span>📞 {user.telefono}</span>
            </div>

            <div className="flex gap-2 pt-4 border-t border-zinc-800">
              <button 
                onClick={() => handleEdit(user)}
                className="flex-1 py-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Edit size={16} /> Editar
              </button>
              <button 
                onClick={() => handleDelete(user.id)}
                className="flex-1 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-8 w-full max-w-md relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-100">
              {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500/40 outline-none"
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500/40 outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500/40 outline-none"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500/40 outline-none"
                  value={formData.telefono}
                  onChange={e => setFormData({...formData, telefono: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rol</label>
                <select
                  className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500/40 outline-none"
                  value={formData.rol}
                  onChange={e => setFormData({...formData, rol: e.target.value})}
                >
                  <option value="Mesero">Mesero</option>
                  <option value="Cocina">Cocina</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition mt-6"
              >
                Guardar Usuario
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPage;
