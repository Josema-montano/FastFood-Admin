import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProductosPage from "./pages/ProductosPage";
import InventarioPage from "./pages/InventarioPage";
import POSPage from "./pages/POSPage";
import CocinaPage from "./pages/CocinaPage";
import PedidosPage from "./pages/PedidosPage";
import UsuariosPage from "./pages/UsuariosPage";
import ReportesPage from "./pages/ReportesPage";
import PagosPage from "./pages/PagosPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/cocina" element={<CocinaPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/pagos" element={<PagosPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
