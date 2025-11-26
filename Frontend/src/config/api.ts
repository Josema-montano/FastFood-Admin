import axios from 'axios';

const USE_PROXY = false;
const BACKEND_URL = "https://localhost:7224";
export const BACKEND_ORIGIN = BACKEND_URL; // Para recursos estáticos (imagenes_productos, etc.)

export const API_BASE_URL = USE_PROXY ? "/api" : `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
