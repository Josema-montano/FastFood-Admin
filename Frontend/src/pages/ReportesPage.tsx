import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { Pedido, EstadoPedido, Producto } from '../types';
import { BarChart3, TrendingUp, DollarSign, Calendar, PieChart, Activity } from 'lucide-react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement, PointElement, LineElement);

const ReportesPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangoDias, setRangoDias] = useState<number>(30);
  const [error, setError] = useState<string|undefined>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pedResp, prodResp] = await Promise.all([
        api.get<Pedido[]>('/pedidos'),
        api.get<Producto[]>('/productos')
      ]);
      setPedidos(pedResp.data);
      setProductos(prodResp.data);
    } catch (e:any) {
      console.error('Error fetching data:', e);
      setError(e?.response?.data?.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-300">Cargando...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;

  // Calculate Stats
  const ahora = Date.now();
  const desde = ahora - rangoDias * 24 * 60 * 60 * 1000;
  const pedidosRango = pedidos.filter(p => new Date(p.fecha).getTime() >= desde);
  const totalVentas = pedidosRango.reduce((sum, p) => sum + p.total, 0);
  const pedidosEntregados = pedidosRango.filter(p => p.estado === EstadoPedido.ENTREGADO).length;
  const pedidosFinalizados = pedidosRango.filter(p => p.estado === EstadoPedido.FINALIZADO).length;
  const ticketPromedio = pedidosRango.length > 0 ? totalVentas / pedidosRango.length : 0;

  // Agrupar ventas por día dentro del rango
  const ventasPorDiaMap = pedidosRango.reduce((acc, p) => {
    const d = new Date(p.fecha);
    const clave = d.toLocaleDateString();
    acc[clave] = (acc[clave] || 0) + p.total;
    return acc;
  }, {} as Record<string, number>);
  const ventasPorDiaLabels = Object.keys(ventasPorDiaMap).sort((a,b)=> new Date(a).getTime() - new Date(b).getTime());
  const ventasPorDiaData = ventasPorDiaLabels.map(l => ventasPorDiaMap[l]);

  // Top productos vendidos por cantidad
  const productoCantidadMap: Record<number, number> = {};
  pedidosRango.forEach(p => {
    p.detalles?.forEach(d => {
      productoCantidadMap[d.productoId] = (productoCantidadMap[d.productoId] || 0) + d.cantidad;
    });
  });
  const topProductos = Object.entries(productoCantidadMap)
    .map(([productoId, cant]) => ({ productoId: Number(productoId), cantidad: cant }))
    .sort((a,b)=> b.cantidad - a.cantidad)
    .slice(0, 10);

  // Estados distribución (últimos rangoDias)
  const estadoCounts: Record<string, number> = {};
  pedidosRango.forEach(p => {
    const est = EstadoPedido[p.estado] || p.estado;
    estadoCounts[est] = (estadoCounts[est] || 0) + 1;
  });
  const estadoLabels = Object.keys(estadoCounts);
  const estadoData = estadoLabels.map(l => estadoCounts[l]);

  // Datos ChartJS
  const lineChartData = {
    labels: ventasPorDiaLabels,
    datasets: [
      {
        label: 'Ventas (Bs.)',
        data: ventasPorDiaData,
        fill: true,
        backgroundColor: 'rgba(59,130,246,0.25)',
        borderColor: '#3b82f6',
        tension: 0.3
      }
    ]
  };

  const barChartData = {
    labels: topProductos.map(tp => productos.find(p=>p.id===tp.productoId)?.nombre || `#${tp.productoId}`),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: topProductos.map(tp => tp.cantidad),
        backgroundColor: 'rgba(99,102,241,0.6)',
        borderRadius: 6,
        maxBarThickness: 42
      }
    ]
  };

  const doughnutData = {
    labels: estadoLabels,
    datasets: [
      {
        data: estadoData,
        backgroundColor: ['#f59e0b','#3b82f6','#10b981','#6b7280','#8b5cf6','#ef4444'],
        borderWidth: 1,
      }
    ]
  };

  const totalCantidadVendida = topProductos.reduce((s,p)=>s+p.cantidad,0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Reportes y Estadísticas</h1>
        <div className="flex items-center gap-3">
          <select value={rangoDias} onChange={e=>setRangoDias(Number(e.target.value))} className="px-3 py-2 border border-zinc-700 rounded-lg text-sm font-medium bg-zinc-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40">
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
            <option value={365}>Último año</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 font-medium">Ventas Totales</h3>
            <DollarSign className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-100">Bs.{totalVentas.toFixed(2)}</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 font-medium">Entregados</h3>
            <Activity className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-100">{pedidosEntregados}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm border-l-4 border-purple-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 font-medium">Finalizados</h3>
            <Activity className="text-purple-500" />
          </div>
            <p className="text-3xl font-bold text-gray-100">{pedidosFinalizados}</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm border-l-4 border-purple-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 font-medium">Ticket Promedio</h3>
            <TrendingUp className="text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-100">Bs.{ticketPromedio.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-100"><Calendar size={20}/>Ventas por Día</h2>
          <Line data={lineChartData} options={{ plugins:{ legend:{ display:false }}, scales:{ y:{ beginAtZero:true }}}} />
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-100"><BarChart3 size={20}/>Top Productos Vendidos</h2>
          {topProductos.length === 0 ? <div className="text-sm text-gray-400">Sin ventas en el rango.</div> : <Bar data={barChartData} options={{ plugins:{ legend:{ display:false }}, indexAxis:'y', scales:{ x:{ beginAtZero:true }}}} />}
          <div className="mt-4 text-xs text-gray-400">Total unidades (top 10): {totalCantidadVendida}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-100"><PieChart size={20}/>Estados de Pedidos</h2>
          <Doughnut data={doughnutData} />
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-gray-100">Resumen</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <li className="bg-zinc-800 rounded-lg p-4 flex flex-col">
              <span className="text-gray-400 font-medium mb-1">Total Ventas Rango</span>
              <span className="text-lg font-bold text-gray-100">Bs.{totalVentas.toFixed(2)}</span>
            </li>
            <li className="bg-zinc-800 rounded-lg p-4 flex flex-col">
              <span className="text-gray-400 font-medium mb-1">Ticket Promedio</span>
              <span className="text-lg font-bold text-gray-100">Bs.{ticketPromedio.toFixed(2)}</span>
            </li>
            <li className="bg-zinc-800 rounded-lg p-4 flex flex-col">
              <span className="text-gray-400 font-medium mb-1">Pedidos Entregados</span>
              <span className="text-lg font-bold text-gray-100">{pedidosEntregados}</span>
            </li>
            <li className="bg-zinc-800 rounded-lg p-4 flex flex-col">
              <span className="text-gray-400 font-medium mb-1">Pedidos Finalizados</span>
              <span className="text-lg font-bold text-gray-100">{pedidosFinalizados}</span>
            </li>
            <li className="bg-zinc-800 rounded-lg p-4 flex flex-col">
              <span className="text-gray-400 font-medium mb-1">Total Pedidos Rango</span>
              <span className="text-lg font-bold text-gray-100">{pedidosRango.length}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportesPage;
