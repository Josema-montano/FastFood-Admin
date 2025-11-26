# FastFood Admin

Sistema administrador para un local de comida rápida. Este proyecto facilita la gestión de productos, pedidos, usuarios, reportes y operaciones del día a día en un negocio de comida rápida.

## Características

- Gestión de productos (crear, editar, eliminar, categorías, precios, stock)
- Gestión de pedidos (toma de pedidos, estados, historial)
- Gestión de clientes y usuarios (roles, permisos)
- Reportes y estadísticas (ventas, productos más vendidos, performance por periodo)
- Control de caja y turnos
- Soporte para múltiples plataformas (frontend en TypeScript, backend en C#)

## Tecnologías y stack

- TypeScript (≈57.3%)
  - Framework/SPA frontend (ej. React/Vue/Angular) y utilidades
  - Manejo de estados, UI, y comunicación con API REST
- C# (≈41.9%)
  - API REST con ASP.NET Core
  - Integración con base de datos (ORM como Entity Framework)
  - Lógica de negocio y autenticación/autorización
- Otros (≈0.8%)

> Nota: Los porcentajes son aproximados según la composición de lenguajes del repositorio.

## Estructura típica del proyecto

- `frontend/` (TypeScript)
  - `src/` componentes, páginas, servicios
  - `public/` recursos estáticos
- `backend/` (C# / ASP.NET Core)
  - `Controllers/` controladores de API
  - `Models/` entidades y DTOs
  - `Services/` lógica de negocio
  - `Data/` contexto y migraciones (EF)
- `docs/` documentación adicional
- `scripts/` automatizaciones (build/deploy)

La estructura exacta puede variar según la organización del repositorio.

## Requisitos previos

- Node.js (v18+ recomendado) y npm o pnpm
- .NET SDK (v8+ recomendado)
- Base de datos (p. ej., SQL Server o PostgreSQL)
- Git

## Configuración

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Josema-montano/FastFood-Admin.git
   cd FastFood-Admin
   ```

2. Backend (C# / ASP.NET Core):
   - Copia el archivo de configuración:
     ```bash
     cp backend/appsettings.json.example backend/appsettings.json
     ```
   - Ajusta:
     - Connection string de la base de datos
     - Parámetros de JWT/autenticación (si aplica)
     - Configuraciones de CORS y entorno
   - Aplica migraciones (si usas EF):
     ```bash
     dotnet ef database update --project backend
     ```

3. Frontend (TypeScript):
   - Instala dependencias:
     ```bash
     cd frontend
     npm install
     ```
   - Configura variables de entorno (por ejemplo, `VITE_API_URL` o `REACT_APP_API_URL`):
     ```bash
     cp .env.example .env
     # Edita .env con la URL del backend
     ```

## Ejecución en desarrollo

- Backend:
  ```bash
  cd backend
  dotnet run
  ```
  Por defecto expone la API en `http://localhost:5000` (ajusta según tu configuración).

- Frontend:
  ```bash
  cd frontend
  npm run dev
  ```
  Por defecto corre en `http://localhost:5173` o `http://localhost:3000` dependiendo del framework.

Asegúrate de que el frontend apunte a la URL del backend definida en tu `.env`.

## Construcción para producción

- Backend:
  ```bash
  cd backend
  dotnet publish -c Release
  ```

- Frontend:
  ```bash
  cd frontend
  npm run build
  ```
  Sirve el contenido estático generado en `dist/` detrás de un servidor (Nginx, Apache) o integra con el backend.

## Seguridad y autenticación

- Autenticación basada en JWT (recomendado)
- Roles y permisos para limitar acceso a funciones administrativas
- Configurar HTTPS y CORS apropiadamente en producción

## Pruebas

- Backend:
  ```bash
  cd backend
  dotnet test
  ```

- Frontend:
  ```bash
  cd frontend
  npm test
  ```

## Roadmap sugerido

- [ ] Módulo de promociones y combos
- [ ] Integración con pasarelas de pago
- [ ] Impresión de tickets y control de cocina
- [ ] Inventarios avanzados y alertas de stock
- [ ] Multi-sucursal y reportes consolidados
- [ ] Internacionalización (i18n)

## Contribuir

1. Crea una rama desde `main`:
   ```bash
   git checkout -b feat/nombre-de-feature
   ```
2. Asegúrate de pasar linters y pruebas.
3. Haz un pull request describiendo claramente los cambios.

Por favor sigue el estilo de código del proyecto y agrega documentación cuando sea necesario.

## Licencia

Este proyecto se distribuye bajo una licencia definida en el repositorio. Consulta el archivo `LICENSE` si está disponible.

## Contacto

- Autor: Josema-montano
- Repo: [FastFood-Admin](https://github.com/Josema-montano/FastFood-Admin)

¿Necesitás que lo adapte a la estructura real del repo o agregar logos/capturas? Decime y lo ajusto.
