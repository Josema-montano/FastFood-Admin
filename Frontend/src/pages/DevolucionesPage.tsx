import React, { useEffect, useState } from "react";
import axios from "axios";
// import { DevolucionDTO, ProductoDTO, ClienteDTO } from "../types";
// import { DEVOLUCIONES_API_URL, PRODUCTOS_API_URL, CLIENTES_API_URL } from "../config/api";
import { RotateCcw, Calendar, MessageSquare } from "lucide-react";

// Página no utilizada - tipos temporales
type DevolucionDTO = any;
type ProductoDTO = any;
type ClienteDTO = any;
const DEVOLUCIONES_API_URL = '';
const PRODUCTOS_API_URL = '';
const CLIENTES_API_URL = '';

const DevolucionesPage: React.FC = () => {
  const [devoluciones, setDevoluciones] = useState<DevolucionDTO[]>([]);
  const [productos, setProductos] = useState<ProductoDTO[]>([]);
  const [clientes, setClientes] = useState<ClienteDTO[]>([]);
  const [formData, setFormData] = useState<DevolucionDTO>({
    productoId: 0,
  clienteId: 0,
    fecha: new Date().toISOString().split("T")[0],
    cantidad: 1,
    motivo: "",
  });
  const [editando, setEditando] = useState<boolean>(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    listarDevoluciones();
    listarProductos();
    listarClientes();
  }, []);

  const listarDevoluciones = async () => {
    setLoading(true);
    try {
      const response = await axios.get<DevolucionDTO[]>(DEVOLUCIONES_API_URL);
      setDevoluciones(response.data || []);
    } catch (error: any) {
      console.error("Error al cargar devoluciones:", error);
      // Si es 404, simplemente no hay datos
      if (error.response?.status === 404) {
        setDevoluciones([]);
      } else {
        alert("Error al conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const listarProductos = async () => {
    try {
      const response = await axios.get<ProductoDTO[]>(PRODUCTOS_API_URL);
      setProductos(response.data || []);
    } catch (error: any) {
      console.error("Error al cargar productos:", error);
      if (error.response?.status === 404) {
        setProductos([]);
      }
    }
  };

  const listarClientes = async () => {
    try {
      const response = await axios.get<ClienteDTO[]>(CLIENTES_API_URL);
      setClientes(response.data || []);
    } catch (error: any) {
      console.error("Error al cargar clientes:", error);
      if (error.response?.status === 404) {
        setClientes([]);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "productoId" || name === "clienteId"
          ? value === ""
            ? name === "clienteId"
              ? undefined
              : 0
            : parseInt(value)
          : name === "cantidad"
          ? parseInt(value) || 1
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editando && idEditando) {
        await axios.put(`${DEVOLUCIONES_API_URL}/${idEditando}`, formData);
        alert("Devolución actualizada exitosamente");
      } else {
        await axios.post(DEVOLUCIONES_API_URL, formData);
        alert("Devolución registrada exitosamente");
      }

      setFormData({
        productoId: 0,
  clienteId: 0,
        fecha: new Date().toISOString().split("T")[0],
        cantidad: 1,
        motivo: "",
      });
      setEditando(false);
      setIdEditando(null);
      listarDevoluciones();
    } catch (error: any) {
      alert(error.response?.data?.mensaje || "Error al registrar la devolución");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (devolucion: DevolucionDTO) => {
    setFormData({
      ...devolucion,
      fecha: devolucion.fecha.split("T")[0],
    });
    setEditando(true);
    setIdEditando(devolucion.id || null);
  };

    // Acciones de edición y eliminación eliminadas por requerimiento

    // Función de cancelar edición eliminada por requerimiento

  const getNombreProducto = (productoId: number) => {
    const producto = productos.find((p) => p.id === productoId);
    return producto ? `${producto.nombre} (${producto.codigo})` : "Desconocido";
  };

  const getNombreCliente = (clienteId?: number) => {
    if (!clienteId) return "Sin cliente";
    const cliente = clientes.find((c) => c.id === clienteId);
  return cliente ? `${cliente.nombres} ${cliente.apellidos}` : "Desconocido";
  };

  return (
    <div className="max-w-full w-full min-h-screen bg-[#F6F6F6] font-inter pb-16">
      {/* Header blanco con icono y usuario */}
      <div className="w-full bg-white px-8 py-6 flex items-center justify-between border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2"><RotateCcw className="w-7 h-7 text-blue-600" /> Devoluciones</h1>
          <p className="text-gray-500 text-sm">Gestión de devoluciones y reclamos</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Administrador</span>
          <RotateCcw className="text-gray-400" size={32} />
        </div>
      </div>
      {/* Cards métricas - estilo unificado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 pt-8 mb-8">
        {/* Card principal oscura */}
        <div className="bg-gray-900 rounded-2xl shadow-lg p-8 text-white flex flex-col justify-between relative col-span-1 md:col-span-1">
          <div className="flex items-center gap-4 mb-2">
            <RotateCcw className="text-white" size={40} />
            <span className="text-lg font-semibold">Total Devoluciones</span>
          </div>
          <div className="text-4xl font-extrabold mb-1">{devoluciones.length}</div>
          <div className="text-xs text-gray-400 mt-2">{devoluciones.length > 1 ? `${devoluciones.length} devoluciones` : `${devoluciones.length} devolución`}</div>
        </div>
        {/* Card secundaria blanca - Motivos distintos */}
        <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 flex flex-col justify-between relative">
          <div className="flex items-center gap-4 mb-2">
            <MessageSquare className="text-[#38BDF8]" size={40} />
            <span className="text-lg font-semibold text-gray-700">Motivos distintos</span>
          </div>
          <div className="text-3xl font-extrabold text-[#38BDF8] mb-1">{[...new Set(devoluciones.map(d => d.motivo))].length}</div>
          <div className="text-xs text-gray-500 mt-2">Motivos registrados</div>
        </div>
        {/* Card secundaria blanca - Productos devueltos */}
        <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 flex flex-col justify-between relative">
          <div className="flex items-center gap-4 mb-2">
            <Calendar className="text-[#38BDF8]" size={40} />
            <span className="text-lg font-semibold text-gray-700">Productos devueltos</span>
          </div>
          <div className="text-3xl font-extrabold text-[#38BDF8] mb-1">{devoluciones.reduce((acc, d) => acc + d.cantidad, 0)}</div>
          <div className="text-xs text-gray-500 mt-2">Total devueltos</div>
        </div>
      </div>

      {/* Formulario eliminado, solo se muestran métricas y el historial */}

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.08)] p-8 border border-[#F0F1F6] mt-4 mx-8">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 font-inter flex items-center gap-2"><RotateCcw className="w-6 h-6 text-blue-600" /> Historial de Devoluciones</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha y hora</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Producto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cliente</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Cantidad</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {devoluciones.map((devolucion) => (
                <tr key={devolucion.id} className={`hover:bg-blue-50 transition`}>
                  <td className="px-6 py-4 text-sm text-gray-900">{
                    (() => {
                      const fecha = new Date(devolucion.fecha);
                      fecha.setHours(fecha.getHours() - 5);
                      return fecha.toLocaleString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
                    })()
                  }</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{getNombreProducto(devolucion.productoId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{getNombreCliente(devolucion.clienteId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">{devolucion.cantidad}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-900">{devolucion.motivo}</td>
                  {/* Columna de acciones eliminada por requerimiento */}
                </tr>
              ))}
              {devoluciones.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 text-lg font-inter">{loading ? "Cargando..." : "No hay devoluciones registradas."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DevolucionesPage;
