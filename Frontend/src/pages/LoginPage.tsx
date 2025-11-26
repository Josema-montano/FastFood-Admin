import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post<any>('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const token = response.data.token;
      let usuario = response.data.usuario;

      if (!token) {
        throw new Error("Token no recibido");
      }

      // Si el usuario no viene en la respuesta, intentamos decodificar el token
      if (!usuario) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const decoded = JSON.parse(jsonPayload);
          console.log('Decoded JWT:', decoded);

          // Mapear claims del token al objeto Usuario
          // Ajusta las claves según lo que devuelva tu backend (.NET suele usar URIs largos para claims)
          const roleRaw = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || 'Mesero';
          // Normalizar rol (Capitalize)
          const role = roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1).toLowerCase();

          // Buscar el nombre en múltiples posibles claims
          const nombreClaim = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] 
            || decoded.unique_name 
            || decoded.name 
            || decoded.given_name
            || decoded.email?.split('@')[0]
            || 'Usuario';

          usuario = {
            id: decoded.sub || decoded.id || decoded.uid,
            nombre: nombreClaim,
            email: decoded.email,
            rol: role,
            telefono: '',
            creadoEn: new Date().toISOString()
          };
        } catch (e) {
          console.error("Error decodificando token:", e);
        }
      }
      
      if (!usuario) {
        throw new Error("No se pudo obtener la información del usuario");
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      // Redirección basada en rol
      if (usuario.rol === 'Cocina') {
        navigate("/cocina");
      } else if (usuario.rol === 'Mesero') {
        navigate("/pos");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas o error en el servidor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-sans">
      <div className="flex w-full max-w-4xl md:max-w-6xl min-h-[600px] bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800">
        {/* Fondo decorativo y branding */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-cover bg-center p-16 relative" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80)' }}>
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <div className="flex flex-col items-center relative z-20">
            <div className="bg-amber-500 rounded-full p-4 mb-6 shadow-lg">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" fill="#fff"/>
                <rect x="16" y="12" width="4" height="24" rx="2" fill="#222"/>
                <rect x="24" y="12" width="4" height="24" rx="2" fill="#222"/>
                <rect x="32" y="12" width="4" height="24" rx="2" fill="#222"/>
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Valdis Burguer</h2>
            <h3 className="text-2xl font-semibold text-amber-500 mt-8 mb-2">Sabor y Calidad</h3>
            <p className="text-gray-200 text-center mb-8">Gestiona tu restaurante de manera eficiente.</p>
            <div className="flex gap-2 mt-4">
              <span className="w-8 h-1 bg-amber-500 rounded-full"></span>
              <span className="w-8 h-1 bg-amber-500 rounded-full opacity-60"></span>
              <span className="w-8 h-1 bg-amber-500 rounded-full opacity-30"></span>
            </div>
          </div>
        </div>
        {/* Formulario login */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-12 md:p-16">
          <h4 className="text-xs font-semibold text-amber-500 mb-2 tracking-wider">¡BIENVENIDO!</h4>
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Inicia sesión en tu cuenta</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Correo electrónico</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                placeholder="************"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="absolute right-3 top-9 text-gray-400 hover:text-gray-200" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <div className="text-red-400 text-sm font-semibold mb-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>}
            <button type="submit" className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold text-lg mt-2 hover:bg-amber-700 transition shadow-lg shadow-amber-500/20">INGRESAR</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
