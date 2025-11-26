import React, { useEffect, useState } from "react";
import axios from "axios";
// import { ClienteDTO } from "../types/index";
// import { CLIENTES_API_URL } from "../config/api";
import { CircleUser, User } from "lucide-react";

// Página no utilizada - tipos temporales
type ClienteDTO = any;
const CLIENTES_API_URL = '';

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteDTO[]>([]);
  const [formData, setFormData] = useState<ClienteDTO>({
    nombres: "",
    apellidos: "",
    documento: "",
    telefono: "",
    email: "",
    direccion: "",
  });
  const [editando, setEditando] = useState<boolean>(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [mostrarModal, setMostrarModal] = useState<boolean>(false);

  useEffect(() => {
    listarClientes();
  }, []);

  const listarClientes = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ClienteDTO[]>(CLIENTES_API_URL);
      setClientes(response.data || []);
    } catch (error: any) {
      console.error("Error al cargar clientes:", error);
      // Si es 404, simplemente no hay datos
      if (error.response?.status === 404) {
        setClientes([]);
      } else {
        alert("Error al conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Siempre enviar todos los campos como string
      let payload: any = {
        nombres: formData.nombres || "",
        apellidos: formData.apellidos || "",
        documento: formData.documento || "",
        telefono: formData.telefono || "",
        email: formData.email || "",
        direccion: formData.direccion || "",
      };
      if (editando && idEditando) {
        payload = { ...payload, id: idEditando };
        await axios.put(`${CLIENTES_API_URL}/${idEditando}`, payload);
        alert("Cliente actualizado exitosamente");
      } else {
        await axios.post(CLIENTES_API_URL, payload);
        alert("Cliente creado exitosamente");
      }

      setFormData({
        nombres: "",
        apellidos: "",
        documento: "",
        telefono: "",
        email: "",
        direccion: "",
      });
      setEditando(false);
      setIdEditando(null);
      listarClientes();
    } catch (error: any) {
      alert(error.response?.data?.mensaje || "Error al guardar el cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente: ClienteDTO) => {
    setFormData(cliente);
    setEditando(true);
    setIdEditando(cliente.id || null);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;

    setLoading(true);
    try {
      await axios.delete(`${CLIENTES_API_URL}/${id}`);
      alert("Cliente eliminado exitosamente");
      listarClientes();
    } catch (error) {
      alert("Error al eliminar el cliente");
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setIdEditando(null);
    setFormData({
      nombres: "",
      apellidos: "",
      documento: "",
      telefono: "",
      email: "",
      direccion: "",
    });
  };

  return (
    <div className="max-w-full w-full min-h-screen bg-[#F6F6F6] font-inter pb-16">
      {/* Header blanco con barra de búsqueda y usuario */}
      <div className="w-full bg-white px-8 py-6 flex items-center justify-between border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <User className="text-blue-600 w-6 h-6" />
            Clientes
          </h1>
          <p className="text-gray-500 text-sm">Gestión de clientes registrados</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <input type="text" placeholder="Buscar cliente..." className="bg-gray-100 rounded-full px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 w-48" value={search} onChange={e => setSearch(e.target.value)} />
            <span className="absolute right-3 top-2 text-gray-400"><svg width="20" height="20" fill="none" stroke="currentColor"><circle cx="9" cy="9" r="7" strokeWidth="2"/><path d="M15 15L19 19" strokeWidth="2"/></svg></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Administrador</span>
            <CircleUser className="text-gray-400" size={32} />
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 px-8 mt-8">
        <div className="bg-gray-900 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <User className="text-white w-6 h-6" />
            <span className="text-base font-semibold">Total</span>
          </div>
          <div className="text-3xl font-extrabold mb-1">{clientes.length}</div>
          <div className="text-xs text-gray-300">Registrados</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base font-semibold text-gray-700">Con Email</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mb-1">{clientes.filter(c => c.email).length}</div>
          <div className="text-xs text-gray-500">Email registrado</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base font-semibold text-gray-700">Con Teléfono</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mb-1">{clientes.filter(c => c.telefono).length}</div>
          <div className="text-xs text-gray-500">Teléfono registrado</div>
        </div>
      </div>

      {/* Botón para abrir modal de registro */}
      <div className="px-8 mt-8">
        <button
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => { setEditando(false); setFormData({ nombres: '', apellidos: '', documento: '', telefono: '', email: '', direccion: '' }); setMostrarModal(true); }}
        >
          Registrar nuevo cliente
        </button>
      </div>

      {/* Modal de registro/edición */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg border border-gray-100 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setMostrarModal(false)}>
              <svg width="24" height="24" fill="none" stroke="currentColor"><path d="M6 6L18 18M6 18L18 6" strokeWidth="2"/></svg>
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{editando ? "Editar Cliente" : "Nuevo Cliente"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                  <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                  <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                  <input type="text" name="documento" value={formData.documento} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition" disabled={loading}>{editando ? "Actualizar" : "Registrar"}</button>
                <button type="button" className="bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-lg shadow hover:bg-gray-300 transition" onClick={() => { setMostrarModal(false); cancelarEdicion(); }} disabled={loading}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de clientes */}
      <div className="px-8 mt-8">
        <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Listado de Clientes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Nombres</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Apellidos</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Documento</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Teléfono</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Dirección</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.filter(c => {
                  const term = search.toLowerCase();
                  return (
                    (c.nombres ?? "").toLowerCase().includes(term) ||
                    (c.apellidos ?? "").toLowerCase().includes(term) ||
                    (c.documento ?? "").toLowerCase().includes(term) ||
                    (c.telefono ?? "").toLowerCase().includes(term) ||
                    (c.email ?? "").toLowerCase().includes(term) ||
                    (c.direccion ?? "").toLowerCase().includes(term)
                  );
                }).map((cliente, index) => (
                  <tr key={cliente.id} className={index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}>
                    <td className="px-4 py-2 text-gray-800">{cliente.nombres}</td>
                    <td className="px-4 py-2 text-gray-800">{cliente.apellidos}</td>
                    <td className="px-4 py-2 text-gray-800">{cliente.documento}</td>
                    <td className="px-4 py-2 text-gray-800">{cliente.telefono}</td>
                    <td className="px-4 py-2 text-gray-800">{cliente.email}</td>
                    <td className="px-4 py-2 text-gray-800">{cliente.direccion}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button className="bg-gray-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50 transition" onClick={() => { handleEdit(cliente); setMostrarModal(true); }} disabled={loading}>Editar</button>
                      <button className="bg-gray-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-50 transition" onClick={() => handleDelete(cliente.id)} disabled={loading}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


export default ClientesPage;
