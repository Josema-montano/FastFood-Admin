# Sistema de Gestión para Librerías y Papelerías

## Descripción
Sistema backend desarrollado para optimizar la administración de una librería o papelería mediante la automatización del registro y control de productos. Permite administrar cuentas de clientes y proveedores, generar alertas por stock mínimo, controlar devoluciones, gestionar inventarios y promociones.

## Arquitectura del Proyecto

El proyecto sigue una **Arquitectura en Capas (Layered Architecture)** con tres capas principales:

### 1. **Domain (Capa de Dominio)**
Contiene las entidades del negocio y las interfaces de los repositorios.

#### Entidades:
- **Cliente**: Gestión de datos de clientes (Nombres, Apellidos, Documento, Teléfono, Email, Dirección)
- **Proveedor**: Gestión de datos de proveedores (Nombre, RUC, Teléfono, Email, Dirección)
- **Producto**: Gestión de productos (Código, Nombre, Descripción, Precios, Stock, StockMínimo)
- **Promocion**: Gestión de promociones con fechas de inicio y fin
- **PromocionProducto**: Relación muchos a muchos entre Promociones y Productos con descuento
- **Devolucion**: Registro de devoluciones de productos por clientes
- **MovimientoInventario**: Registro de movimientos de entrada/salida de inventario
- **TipoMovimientoInventario**: Enum para tipos de movimiento (Ingreso/Egreso)

#### Interfaces:
- `IClienteRepositorio`
- `IProveedorRepositorio`
- `IProductoRepositorio`
- `IPromocionRepositorio`
- `IDevolucionRepositorio`
- `IMovimientoInventarioRepositorio`

### 2. **Aplication (Capa de Aplicación)**
Contiene los casos de uso y la lógica de negocio de la aplicación.

#### DTOs (Data Transfer Objects):
- `ClienteDTO`
- `ProveedorDTO`
- `ProductoDTO`
- `PromocionDTO`
- `PromocionProductoDTO`
- `DevolucionDTO`
- `MovimientoInventarioDTO`

#### Mapping:
- **MappingProfile**: Configuración de AutoMapper para mapeo entre entidades y DTOs

#### Casos de Uso:

**Clientes:**
- `CrearCliente`: Crear nuevo cliente con validaciones
- `ActualizarCliente`: Actualizar datos de cliente existente
- `EliminarCliente`: Eliminar cliente
- `ListarClientes`: Listar todos los clientes
- `ObtenerClientePorId`: Obtener cliente específico por ID

**Proveedores:**
- `CrearProveedor`: Crear nuevo proveedor con validaciones
- `ActualizarProveedor`: Actualizar datos de proveedor existente
- `EliminarProveedor`: Eliminar proveedor
- `ListarProveedores`: Listar todos los proveedores
- `ObtenerProveedorPorId`: Obtener proveedor específico por ID

**Productos:**
- `CrearProducto`: Crear nuevo producto con validación de código único
- `ActualizarProducto`: Actualizar datos de producto existente
- `EliminarProducto`: Eliminar producto
- `ListarProductos`: Listar productos (con opción de incluir proveedor)
- `ObtenerProductoPorId`: Obtener producto específico por ID
- `ObtenerProductoPorCodigo`: Obtener producto por código de barras

**Promociones:**
- `CrearPromocion`: Crear nueva promoción con productos y descuentos
- `ActualizarPromocion`: Actualizar promoción existente
- `EliminarPromocion`: Eliminar promoción
- `ListarPromociones`: Listar promociones (con opción de solo activas)
- `ObtenerPromocionPorId`: Obtener promoción específica por ID
- `GestionarPromocion`: Gestión completa de promociones y estado

**Inventario:**
- `ActualizarInventario`: Registrar movimientos de inventario (entrada/salida)
- `GenerarAlertasStockMinimo`: Generar alertas de productos con stock bajo el mínimo
- `ListarMovimientosPorProducto`: Listar historial de movimientos de un producto

**Devoluciones:**
- `RegistrarDevolucion`: Registrar devolución de producto con actualización de inventario
- `ListarDevoluciones`: Listar todas las devoluciones
- `ObtenerDevolucionPorId`: Obtener devolución específica por ID

### 3. **Infrastructure (Capa de Infraestructura)**
Implementación de acceso a datos y persistencia.

#### Data:
- **AppDbContext**: Contexto de Entity Framework Core con configuración de relaciones

#### Repositorios:
- `ClienteRepositorio`: Implementación CRUD para Clientes
- `ProveedorRepositorio`: Implementación CRUD para Proveedores
- `ProductoRepositorio`: Implementación CRUD para Productos con Include de Proveedor
- `PromocionRepositorio`: Implementación para Promociones con productos relacionados
- `DevolucionRepositorio`: Implementación para Devoluciones
- `MovimientoInventarioRepositorio`: Implementación para Movimientos de Inventario

## Características Principales

### 1. Gestión de Inventario
- Control de stock en tiempo real
- Alertas automáticas de stock mínimo
- Registro de movimientos de entrada y salida
- Historial de movimientos por producto

### 2. Gestión de Promociones
- Creación de promociones con múltiples productos
- Descuentos por porcentaje (0-100%)
- Control de fechas de vigencia
- Activación/desactivación de promociones

### 3. Control de Devoluciones
- Registro de devoluciones con motivo
- Actualización automática de inventario
- Asociación opcional con clientes
- Trazabilidad completa

### 4. Validaciones de Negocio
Cada caso de uso incluye validaciones robustas:
- Validación de datos requeridos
- Validación de existencia de entidades
- Validación de rangos y valores
- Validación de stock suficiente para egresos
- Validación de códigos únicos para productos

## Tecnologías Utilizadas

- **.NET** (Framework principal)
- **Entity Framework Core** (ORM)
- **AutoMapper** (Mapeo de objetos)
- **Arquitectura en Capas** (Patrón arquitectónico)
- **Repository Pattern** (Patrón de diseño)
- **Dependency Injection** (Inversión de dependencias)

## Principios Aplicados

- **Separation of Concerns**: Cada capa tiene responsabilidades bien definidas
- **Single Responsibility**: Cada clase tiene una única razón de cambio
- **Dependency Inversion**: Las capas superiores dependen de abstracciones
- **Open/Closed**: Abierto a extensión, cerrado a modificación
- **CRUD Operations**: Operaciones básicas de Create, Read, Update, Delete

## Estructura de Archivos

```
ProyectoFinal/
??? Domain/
?   ??? Entities/
?   ?   ??? Cliente.cs
?   ?   ??? Proveedor.cs
?   ?   ??? Producto.cs
?   ?   ??? Promocion.cs
?   ?   ??? PromocionProducto.cs
?   ?   ??? Devolucion.cs
?   ?   ??? MovimientoInventario.cs
?   ? ??? TipoMovimientoInventario.cs
?   ??? Interfaces/
?       ??? IClienteRepositorio.cs
?       ??? IProveedorRepositorio.cs
?       ??? IProductoRepositorio.cs
?       ??? IPromocionRepositorio.cs
?       ??? IDevolucionRepositorio.cs
?       ??? IMovimientoInventarioRepositorio.cs
?
??? Aplication/
?   ??? DTOs/
?   ?   ??? ClienteDTO.cs
??   ??? ProveedorDTO.cs
?   ?   ??? ProductoDTO.cs
?   ?   ??? PromocionDTO.cs
?   ?   ??? DevolucionDTO.cs
?   ?   ??? MovimientoInventarioDTO.cs
?   ??? Mapping/
?   ?   ??? MappingProfile.cs
?   ??? UseCases/
?       ??? Clientes/
?       ?   ??? CrearCliente.cs
?       ?   ??? ActualizarCliente.cs
?       ?   ??? EliminarCliente.cs
?       ?   ??? ListarClientes.cs
?       ?   ??? ObtenerClientePorId.cs
?     ??? Proveedores/
?    ?   ??? CrearProveedor.cs
?     ?   ??? ActualizarProveedor.cs
?  ?   ??? EliminarProveedor.cs
?       ? ??? ListarProveedores.cs
?       ?   ??? ObtenerProveedorPorId.cs
? ??? Productos/
?       ?   ??? CrearProducto.cs
?       ?   ??? ActualizarProducto.cs
?       ?   ??? EliminarProducto.cs
?       ?   ??? ListarProductos.cs
?       ?   ??? ObtenerProductoPorId.cs
?       ?   ??? ObtenerProductoPorCodigo.cs
?     ??? Promociones/
?  ?   ??? CrearPromocion.cs
?       ?   ??? ActualizarPromocion.cs
?  ?   ??? EliminarPromocion.cs
? ?   ??? ListarPromociones.cs
?       ?   ??? ObtenerPromocionPorId.cs
?       ?   ??? GestionarPromocion.cs
?     ??? Devoluciones/
?   ?   ??? RegistrarDevolucion.cs
?       ?   ??? ListarDevoluciones.cs
? ?   ??? ObtenerDevolucionPorId.cs
?       ??? Inventario/
?      ??? ActualizarInventario.cs
?           ??? GenerarAlertasStockMinimo.cs
?           ??? ListarMovimientosPorProducto.cs
?
??? Infraestructure/
    ??? Data/
    ?   ??? AppDbContext.cs
    ??? Repositorios/
    ??? ClienteRepositorio.cs
        ??? ProveedorRepositorio.cs
   ??? ProductoRepositorio.cs
        ??? PromocionRepositorio.cs
        ??? DevolucionRepositorio.cs
        ??? MovimientoInventarioRepositorio.cs
```

## Compilación

```bash
dotnet build
```

## Notas Importantes

- Las migraciones se generan automáticamente con Entity Framework Core
- Todos los casos de uso incluyen validaciones exhaustivas
- El sistema utiliza Guid para identificadores únicos
- Las fechas se manejan en formato UTC
- El stock se actualiza automáticamente con movimientos de inventario
- Las devoluciones generan movimientos de inventario de tipo Ingreso

---

**Desarrollado con Clean Architecture y mejores prácticas de desarrollo de software.**
