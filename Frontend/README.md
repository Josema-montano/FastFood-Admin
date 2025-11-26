# 📚 Sistema de Gestión para Librerías y Papelerías

Sistema profesional de gestión integral desarrollado con **React + TypeScript + Vite** para la administración completa de librerías y papelerías.

## 🎯 Características Principales

- ✅ **Gestión de Clientes**: Registro completo con datos de contacto
- ✅ **Gestión de Proveedores**: Control de proveedores y sus productos
- ✅ **Catálogo de Productos**: CRUD completo con alertas de stock
- ✅ **Promociones**: Creación y asignación de descuentos
- ✅ **Devoluciones**: Registro de devoluciones con motivo
- ✅ **Inventario**: Control de movimientos (entrada/salida/ajuste)
- ✅ **Dashboard**: Resumen ejecutivo con estadísticas en tiempo real
- ✅ **Alertas de Stock**: Notificaciones automáticas de productos con stock bajo
- ✅ **Diseño Responsivo**: Interfaz moderna con Tailwind CSS

## 🛠️ Tecnologías Utilizadas

- **React 18** - Librería de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Iconos modernos

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Backend API corriendo en `https://localhost:7224` (ver configuración)

## 🚀 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd PROYECTOFINAL
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la URL de la API

Edita el archivo `src/config/api.ts` y ajusta las URLs según tu backend:

```typescript
export const API_BASE_URL = "https://localhost:7224/api";
export const CLIENTES_API_URL = "https://localhost:7224/api/Clientes";
// ... resto de URLs
```

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

El servidor de desarrollo se iniciará en `http://localhost:5173`

### 5. Compilar para producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 📁 Estructura del Proyecto

```
PROYECTOFINAL/
├── src/
│   ├── components/
│   │   └── Layout.tsx          # Layout principal con sidebar
│   ├── pages/
│   │   ├── Dashboard.tsx       # Panel principal con estadísticas
│   │   ├── ClientesPage.tsx    # Gestión de clientes
│   │   ├── ProveedoresPage.tsx # Gestión de proveedores
│   │   ├── ProductosPage.tsx   # Catálogo de productos
│   │   ├── PromocionesPage.tsx # Gestión de promociones
│   │   ├── DevolucionesPage.tsx# Registro de devoluciones
│   │   └── InventarioPage.tsx  # Control de inventario
│   ├── config/
│   │   └── api.ts              # Configuración de URLs
│   ├── types/
│   │   └── index.ts            # Interfaces TypeScript
│   ├── App.tsx                 # Componente raíz
│   ├── main.tsx                # Punto de entrada
│   └── index.css               # Estilos globales
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔧 Configuración del Backend

Asegúrate de que tu API .NET esté configurada correctamente con:

### CORS habilitado

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

### Endpoints disponibles

- `GET/POST/PUT/DELETE /api/Clientes`
- `GET/POST/PUT/DELETE /api/Proveedores`
- `GET /api/Proveedores/{id}/details` (productos del proveedor)
- `GET/POST/PUT/DELETE /api/Productos`
- `GET /api/Productos/codigo/{codigo}` (buscar por código)
- `GET/POST/PUT/DELETE /api/Promociones`
- `POST /api/Promociones/{id}/productos` (asignar productos)
- `GET/POST/DELETE /api/Devoluciones`
- `GET /api/Inventario/alertas` (alertas de stock)
- `GET /api/Inventario/producto/{productoId}` (movimientos)
- `POST /api/Inventario/actualizar` (registrar movimiento)

## 📊 Módulos del Sistema

### 1. **Dashboard**
Panel principal con:
- Estadísticas generales (productos, clientes, proveedores)
- Alertas de stock en tiempo real
- Valor total del inventario
- Promociones activas
- Accesos rápidos a todos los módulos

### 2. **Clientes**
- Listado completo de clientes
- Formulario de registro/edición
- Campos: Nombres, Apellidos, Documento, Teléfono, Email, Dirección
- Búsqueda y filtrado

### 3. **Proveedores**
- Gestión de proveedores
- Ver productos por proveedor
- Modal interactivo con lista de productos
- Campos: Nombre, RUC, Teléfono, Email, Dirección

### 4. **Productos**
- Catálogo completo de productos
- Alertas visuales de stock bajo
- Filtros: Todos, Con alertas, Sin stock
- Relación con proveedores
- Campos: Código, Nombre, Descripción, Precios, Stock, Stock Mínimo

### 5. **Promociones**
- Creación de promociones con fechas
- Estado activo/inactivo
- Asignación de productos con descuentos
- Modal para gestionar productos incluidos

### 6. **Devoluciones**
- Registro de devoluciones
- Asociación con clientes (opcional)
- Campos: Producto, Cliente, Fecha, Cantidad, Motivo

### 7. **Inventario**
- Registro de movimientos (Entrada, Salida, Ajuste)
- Historial completo de movimientos
- Alertas de stock crítico destacadas
- Control de stock en tiempo real

## 🎨 Características de Diseño

- **Tema moderno** con degradados y sombras
- **Iconos intuitivos** de Lucide React
- **Tablas responsivas** con filas alternas
- **Formularios validados** con feedback visual
- **Modales interactivos** para acciones complejas
- **Alertas contextuales** con códigos de color
- **Navegación lateral** colapsable
- **Breadcrumbs** en el header

## 🔐 Seguridad y Validaciones

- Validación de formularios en frontend
- Confirmación de eliminaciones
- Manejo de errores con mensajes al usuario
- Prevención de envíos duplicados con loading states


## 👨‍💻 Autor

Desarrollado como parte del caso de estudio: **Sistema de Gestión para Librerías y Papelerías**

## 📞 Soporte

Para problemas o sugerencias, abre un issue en el repositorio.

---

**¡Gracias por usar este sistema de gestión!** 📚✨
