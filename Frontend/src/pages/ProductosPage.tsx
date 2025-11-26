import React, { useEffect, useState } from "react";
import api from "../config/api";
import { Producto } from "../types";
import { Package, Plus, Edit, Trash2, Search, Filter, Upload } from "lucide-react";
import { BACKEND_ORIGIN } from "../config/api";

const ProductosPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: "",
    descripcion: "",
    precio: 0,
    categoria: "",
    activo: true,
    stockMinimo: 5,
    imagenUrl: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const response = await api.get<Producto[]>('/productos');
      setProductos(response.data);
    } catch (error) {
      console.error("Error fetching productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string; // data:mime;base64,XXXX
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editando && formData.id) {
        await api.put(`/productos/${formData.id}`, formData);
        if (imageFile) {
          const fd = new FormData();
          fd.append('archivo', imageFile);
          await api.post(`/productos/${formData.id}/imagen`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
      } else {
        let img64 = imageBase64;
        if (!img64 && imageFile) {
          img64 = await fileToBase64(imageFile);
          setImageBase64(img64);
        }
        const payload: any = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: formData.precio,
          categoria: formData.categoria,
          activo: formData.activo,
          stockMinimo: formData.stockMinimo,
        };
        if (img64) payload.imagenBase64 = img64;
        await api.post('/productos/con-imagen-base64', payload);
      }
      setModalOpen(false);
      fetchProductos();
      resetForm();
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('Error guardando producto');
    }
  };

  const handleEdit = (producto: Producto) => {
    setFormData({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria: producto.categoria,
      activo: producto.activo,
      stockMinimo: producto.stockMinimo,
      imagenUrl: producto.imagenUrl || ''
    });
    setEditando(true);
    setModalOpen(true);
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      fetchProductos();
    } catch (e) {
      console.error('Error eliminando producto:', e);
      alert('Error eliminando producto');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      precio: 0,
      categoria: "",
      activo: true,
      stockMinimo: 5,
      imagenUrl: ""
    });
    setEditando(false);
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
  };

  const handleImageUpload = async (productoId: number, file: File) => {
    try {
      const form = new FormData();
      form.append('archivo', file);
      await api.post(`/productos/${productoId}/imagen`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchProductos();
    } catch (e:any) {
      console.error('Error subiendo imagen:', e);
      alert(e.response?.data?.mensaje || 'Error subiendo imagen');
    }
  };

  const resolveImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('/')) return `${BACKEND_ORIGIN}${url}`;
    return url;
  };

  const filteredProductos = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Productos</h1>
          <p className="text-gray-400 mt-1">Gestiona el menú y catálogo de productos</p>
        </div>
        <button 
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="bg-amber-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-700 transition shadow-lg"
        >
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl mb-6 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o categoría..." 
            className="w-full pl-10 pr-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button className="p-2 text-gray-400 hover:bg-zinc-800 rounded-lg">
          <Filter size={20} />
        </button>
      </div>

      {/* Grid de Productos */}
      {loading && <div className="text-gray-400 mb-4">Cargando productos...</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProductos.map((producto) => (
          <div key={producto.id} className="bg-zinc-900 rounded-xl border border-zinc-800 hover:border-amber-500/30 transition overflow-hidden group">
            <div className="h-48 bg-zinc-800 relative overflow-hidden">
              {producto.imagenUrl ? (
                <img src={resolveImageUrl(producto.imagenUrl)} alt={producto.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <Package size={48} />
                </div>
              )}
              <div className="absolute bottom-2 left-2 flex gap-2">
                <label className="cursor-pointer bg-zinc-900/90 backdrop-blur px-2 py-1 rounded text-xs font-medium shadow flex items-center gap-1 text-gray-300 hover:text-amber-500">
                  <Upload size={14} />
                  <span>Imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageUpload(producto.id, f);
                      e.target.value='';
                    }}
                  />
                </label>
              </div>
              <div className="absolute top-2 right-2 bg-zinc-900/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm text-gray-300">
                {producto.categoria}
              </div>
              {!producto.activo && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold border-2 border-white px-4 py-1 rounded transform -rotate-12">INACTIVO</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-100 leading-tight">{producto.nombre}</h3>
                <span className="font-bold text-amber-500 text-lg">Bs.{producto.precio.toFixed(2)}</span>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{producto.descripcion}</p>
              
              <div className="flex gap-2 pt-4 border-t border-zinc-800">
                <button 
                  onClick={() => handleEdit(producto)}
                  className="flex-1 py-2 bg-zinc-800 text-gray-300 rounded-lg font-medium hover:bg-zinc-700 transition flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(producto.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Formulario */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-800 bg-zinc-800">
              <h2 className="text-xl font-bold text-gray-100">{editando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:outline-none"
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Precio</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:outline-none"
                    value={formData.precio}
                    onChange={e => setFormData({...formData, precio: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:outline-none"
                    value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                <textarea 
                  className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:outline-none"
                  rows={3}
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Imagen (opcional)</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-zinc-800 rounded overflow-hidden flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : formData.imagenUrl ? (
                      <img src={resolveImageUrl(formData.imagenUrl)} alt="actual" className="w-full h-full object-cover" />
                    ) : <Package size={32} className="text-gray-600" />}
                  </div>
                  <label className="cursor-pointer bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition flex items-center gap-2">
                    <Upload size={16} /> {editando ? 'Cambiar' : 'Seleccionar'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setImageFile(f);
                        e.target.value='';
                      }}
                    />
                  </label>
                  {imageFile && (
                    <button type="button" onClick={() => setImageFile(null)} className="text-xs text-red-400 hover:underline">Quitar</button>
                  )}
                </div>
                {imageFile && !editando && <p className="text-xs text-gray-400 mt-1">Se enviará en JSON como Base64.</p>}
                {imageFile && editando && <p className="text-xs text-gray-400 mt-1">Se subirá al guardar (endpoint de imagen separado).</p>}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="activo"
                  checked={formData.activo}
                  onChange={e => setFormData({...formData, activo: e.target.checked})}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                />
                <label htmlFor="activo" className="text-sm font-medium text-gray-300">Producto Activo</label>
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 text-gray-300 font-bold rounded-lg hover:bg-zinc-700 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosPage;
