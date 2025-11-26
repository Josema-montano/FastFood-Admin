import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { Pago } from '../types';
import { CreditCard, Plus, RefreshCcw, CalendarDays } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Estado removido de la vista; se omite badge.

const PagosPage: React.FC = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [pedidoId, setPedidoId] = useState('');
  const [monto, setMonto] = useState<number>(0);
  const [metodo, setMetodo] = useState('Efectivo');
  const [guardando, setGuardando] = useState(false);
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [aplicandoFechas, setAplicandoFechas] = useState(false);

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const resp = await api.get<Pago[]>('/pagos');
      setPagos(resp.data);
    } catch (e) {
      console.error('Error obteniendo pagos:', e);
    } finally {
      setLoading(false);
    }
  };

  // Eliminados filtros por estado: asumimos API retorna sólo pagos completados.

  const normalizarFecha = (d: string, end?: boolean) => {
    // Asume input type="date" => YYYY-MM-DD; agregamos hora inicio/fin
    if (!d) return '';
    return end ? `${d}T23:59:59` : `${d}T00:00:00`;
  };

  const fetchPagosPorFechas = async () => {
    if (!fechaInicio || !fechaFin) return;
    if (fechaInicio > fechaFin) {
      alert('Fecha inicio no puede ser mayor que fecha fin');
      return;
    }
    const inicioISO = normalizarFecha(fechaInicio);
    const finISO = normalizarFecha(fechaFin, true);
    setAplicandoFechas(true);
    setLoading(true);
    try {
      const resp = await api.get<Pago[]>('/pagos/por-fechas', { params: { fechaInicio: inicioISO, fechaFin: finISO } });
      setPagos(resp.data);
    } catch (e) {
      console.error('Error filtrando por fechas (API):', e);
      // Fallback filtrado local si falla
      try {
        const baseResp = await api.get<Pago[]>('/pagos');
        const inicio = new Date(inicioISO).getTime();
        const fin = new Date(finISO).getTime();
        const filtrados = baseResp.data.filter(p => {
          const t = new Date(p.fecha).getTime();
            return t >= inicio && t <= fin;
        });
        setPagos(filtrados);
        alert('Filtro fechas aplicado localmente (API falló)');
      } catch (e2) {
        console.error('Fallback local falló:', e2);
        alert('No se pudo aplicar el filtro de fechas');
      }
    } finally {
      setAplicandoFechas(false);
      setLoading(false);
    }
  };

  useEffect(() => { fetchPagos(); }, []);

  // Dado que sólo se listan pagos completados (o la API no envía estado), sumamos todos.
  const totalPagado = pagos.reduce((sum,p)=>sum+p.monto,0);

  // Agrupar pagos por método
  const pagosPorMetodo = pagos.reduce((acc, p) => {
    const metodoKey = p.metodo || 'Otro';
    acc[metodoKey] = (acc[metodoKey] || 0) + p.monto;
    return acc;
  }, {} as Record<string, number>);

  const metodos = Object.keys(pagosPorMetodo);
  const montosPorMetodo = Object.values(pagosPorMetodo);

  const chartData = {
    labels: metodos,
    datasets: [{
      data: montosPorMetodo,
      backgroundColor: [
        'rgba(251, 191, 36, 0.8)',  // amber
        'rgba(34, 197, 94, 0.8)',   // green
        'rgba(59, 130, 246, 0.8)',  // blue
        'rgba(168, 85, 247, 0.8)',  // purple
        'rgba(239, 68, 68, 0.8)',   // red
      ],
      borderColor: [
        'rgba(251, 191, 36, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(209, 213, 219)',
          font: { size: 12 },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = montosPorMetodo.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: Bs.${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
  };

  const handleCrearPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedidoId || monto <= 0) {
      alert('Pedido y monto válidos requeridos');
      return;
    }
    setGuardando(true);
    try {
      const payload = { pedidoId, monto, metodo }; // estado se asume por backend
      await api.post('/pagos', payload);
      setFormOpen(false);
      setPedidoId('');
      setMonto(0);
      setMetodo('Efectivo');
      fetchPagos();
    } catch (e: any) {
      console.error('Error creando pago:', e);
      alert(e?.response?.data?.mensaje || 'Error creando pago');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-2"><CreditCard size={32}/> Pagos</h1>
          <p className="text-gray-400 mt-1">Gestión y registro de pagos de pedidos</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={fetchPagos} className="px-4 py-2 rounded-lg bg-zinc-800 text-gray-300 font-medium hover:bg-zinc-700 flex items-center gap-2"><RefreshCcw size={16}/>Todos</button>
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-gray-400"/>
            <input type="date" value={fechaInicio} onChange={e=>setFechaInicio(e.target.value)} className="border border-zinc-700 bg-zinc-800 text-gray-100 rounded px-2 py-1 text-sm" />
            <span className="text-gray-400 text-sm">→</span>
            <input type="date" value={fechaFin} onChange={e=>setFechaFin(e.target.value)} className="border border-zinc-700 bg-zinc-800 text-gray-100 rounded px-2 py-1 text-sm" />
            <button disabled={!fechaInicio||!fechaFin||aplicandoFechas} onClick={fetchPagosPorFechas} className="px-3 py-2 rounded bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-40">{aplicandoFechas?'Filtrando...':'Filtrar'}</button>
            { (fechaInicio||fechaFin) && <button onClick={()=>{setFechaInicio(''); setFechaFin(''); fetchPagos();}} className="text-xs text-gray-400 hover:underline">Reset</button> }
          </div>
          <button onClick={()=>setFormOpen(o=>!o)} className="ml-auto px-4 py-2 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 flex items-center gap-2"><Plus size={16}/>{formOpen?'Cerrar':'Nuevo Pago'}</button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow p-4 flex flex-col">
          <span className="text-xs font-bold text-gray-400 tracking-wide">TOTAL COBRADO</span>
          <span className="text-2xl font-bold text-green-400">Bs.{totalPagado.toFixed(2)}</span>
        </div>
        <div className="text-sm text-gray-400">Pagos mostrados: {pagos.length}</div>
        { (fechaInicio && fechaFin) && <div className="text-xs text-gray-500">Rango aplicado {fechaInicio} → {fechaFin}</div> }
      </div>

      {/* Gráfico de métodos de pago */}
      {pagos.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Distribución por Método de Pago</h2>
          <div className="h-80 flex items-center justify-center">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {formOpen && (
        <form onSubmit={handleCrearPago} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">ID Pedido</label>
            <input type="text" required value={pedidoId} onChange={e=>setPedidoId(e.target.value)} className="w-full border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg px-3 py-2" placeholder="UUID / Num" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Monto</label>
            <input type="number" step="0.01" required value={monto} onChange={e=>setMonto(parseFloat(e.target.value))} className="w-full border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Método</label>
            <select value={metodo} onChange={e=>setMetodo(e.target.value)} className="w-full border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg px-3 py-2">
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
            </select>
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button disabled={guardando} type="submit" className="px-6 py-3 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 disabled:opacity-50">{guardando?'Guardando...':'Registrar Pago'}</button>
          </div>
        </form>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Pedido</th>
              <th className="px-4 py-3 text-left">Monto</th>
              <th className="px-4 py-3 text-left">Método</th>
              {/* Columna estado eliminada */}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Cargando pagos...</td></tr>
            ) : pagos.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Sin pagos registrados</td></tr>
            ) : (
              pagos.map(p => (
                <tr key={p.id} className="hover:bg-zinc-800">
                  <td className="px-4 py-3 font-mono text-xs text-gray-300">{new Date(p.fecha).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-300">{p.pedidoId}</td>
                  <td className="px-4 py-3 font-bold text-gray-100">Bs.{p.monto.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-300">{p.metodo}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PagosPage;
