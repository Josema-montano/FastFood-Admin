# Guía de Uso - Sistema de Gestión de Librerías y Papelerías

## Ejemplos de Uso de Casos de Uso

Esta guía muestra cómo utilizar los diferentes casos de uso del sistema.

## Configuración Inicial

### 1. Registro de Dependencias (Startup/Program.cs)

```csharp
// Registrar repositorios
services.AddScoped<IClienteRepositorio, ClienteRepositorio>();
services.AddScoped<IProveedorRepositorio, ProveedorRepositorio>();
services.AddScoped<IProductoRepositorio, ProductoRepositorio>();
services.AddScoped<IPromocionRepositorio, PromocionRepositorio>();
services.AddScoped<IDevolucionRepositorio, DevolucionRepositorio>();
services.AddScoped<IMovimientoInventarioRepositorio, MovimientoInventarioRepositorio>();

// Registrar casos de uso - Clientes
services.AddScoped<CrearCliente>();
services.AddScoped<ActualizarCliente>();
services.AddScoped<EliminarCliente>();
services.AddScoped<ListarClientes>();
services.AddScoped<ObtenerClientePorId>();

// Registrar casos de uso - Proveedores
services.AddScoped<CrearProveedor>();
services.AddScoped<ActualizarProveedor>();
services.AddScoped<EliminarProveedor>();
services.AddScoped<ListarProveedores>();
services.AddScoped<ObtenerProveedorPorId>();

// Registrar casos de uso - Productos
services.AddScoped<CrearProducto>();
services.AddScoped<ActualizarProducto>();
services.AddScoped<EliminarProducto>();
services.AddScoped<ListarProductos>();
services.AddScoped<ObtenerProductoPorId>();
services.AddScoped<ObtenerProductoPorCodigo>();

// Registrar casos de uso - Promociones
services.AddScoped<CrearPromocion>();
services.AddScoped<ActualizarPromocion>();
services.AddScoped<EliminarPromocion>();
services.AddScoped<ListarPromociones>();
services.AddScoped<ObtenerPromocionPorId>();
services.AddScoped<GestionarPromocion>();

// Registrar casos de uso - Inventario
services.AddScoped<ActualizarInventario>();
services.AddScoped<GenerarAlertasStockMinimo>();
services.AddScoped<ListarMovimientosPorProducto>();

// Registrar casos de uso - Devoluciones
services.AddScoped<RegistrarDevolucion>();
services.AddScoped<ListarDevoluciones>();
services.AddScoped<ObtenerDevolucionPorId>();

// AutoMapper
services.AddAutoMapper(typeof(MappingProfile));

// DbContext
services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));
```

## Ejemplos de Uso

### Gestión de Clientes

#### Crear Cliente
```csharp
var crearCliente = serviceProvider.GetService<CrearCliente>();

var nuevoCliente = new Cliente
{
    Nombres = "Juan Carlos",
    Apellidos = "Pérez García",
    Documento = "12345678",
    Telefono = "987654321",
    Email = "juan.perez@email.com",
    Direccion = "Av. Principal 123"
};

await crearCliente.EjecutarAsync(nuevoCliente);
```

#### Actualizar Cliente
```csharp
var actualizarCliente = serviceProvider.GetService<ActualizarCliente>();

var cliente = await obtenerClientePorId.EjecutarAsync(clienteId);
cliente.Telefono = "999888777";
cliente.Direccion = "Nueva dirección 456";

await actualizarCliente.EjecutarAsync(cliente);
```

#### Listar Clientes
```csharp
var listarClientes = serviceProvider.GetService<ListarClientes>();
var clientes = await listarClientes.EjecutarAsync();

foreach (var cliente in clientes)
{
    Console.WriteLine($"{cliente.Nombres} {cliente.Apellidos} - {cliente.Email}");
}
```

### Gestión de Proveedores

#### Crear Proveedor
```csharp
var crearProveedor = serviceProvider.GetService<CrearProveedor>();

var nuevoProveedor = new Proveedor
{
    Nombre = "Distribuidora ABC S.A.C.",
    Ruc = "20123456789",
  Telefono = "014567890",
    Email = "ventas@abc.com",
    Direccion = "Jr. Comercio 789"
};

await crearProveedor.EjecutarAsync(nuevoProveedor);
```

### Gestión de Productos

#### Crear Producto
```csharp
var crearProducto = serviceProvider.GetService<CrearProducto>();

var nuevoProducto = new Producto
{
    Codigo = "PROD-001",
    Nombre = "Cuaderno Anillado A4",
    Descripcion = "Cuaderno 100 hojas cuadriculado",
    PrecioCompra = 5.50m,
    PrecioVenta = 8.90m,
 Stock = 50,
    StockMinimo = 10,
    ProveedorId = proveedorId
};

await crearProducto.EjecutarAsync(nuevoProducto);
```

#### Obtener Producto por Código
```csharp
var obtenerPorCodigo = serviceProvider.GetService<ObtenerProductoPorCodigo>();
var producto = await obtenerPorCodigo.EjecutarAsync("PROD-001");

if (producto != null)
{
    Console.WriteLine($"Producto: {producto.Nombre}");
    Console.WriteLine($"Stock: {producto.Stock}");
    Console.WriteLine($"Precio: {producto.PrecioVenta:C}");
}
```

#### Listar Productos con Proveedor
```csharp
var listarProductos = serviceProvider.GetService<ListarProductos>();
var productos = await listarProductos.EjecutarAsync(incluirProveedor: true);

foreach (var producto in productos)
{
    Console.WriteLine($"{producto.Nombre} - Proveedor: {producto.Proveedor?.Nombre}");
}
```

### Gestión de Inventario

#### Actualizar Inventario - Ingreso
```csharp
var actualizarInventario = serviceProvider.GetService<ActualizarInventario>();

// Registrar una compra de 20 unidades
await actualizarInventario.EjecutarAsync(
    productoId: productoId,
    cantidad: 20,
    tipo: TipoMovimientoInventario.Ingreso,
    motivo: "Compra a proveedor",
    referenciaId: ordenCompraId
);
```

#### Actualizar Inventario - Egreso
```csharp
// Registrar una venta de 5 unidades
await actualizarInventario.EjecutarAsync(
    productoId: productoId,
    cantidad: 5,
    tipo: TipoMovimientoInventario.Egreso,
 motivo: "Venta a cliente",
    referenciaId: ventaId
);
```

#### Generar Alertas de Stock Mínimo
```csharp
var generarAlertas = serviceProvider.GetService<GenerarAlertasStockMinimo>();
var alertas = await generarAlertas.EjecutarAsync();

foreach (var alerta in alertas)
{
    Console.WriteLine($"?? ALERTA: {alerta.nombre}");
    Console.WriteLine($"   Stock actual: {alerta.stock}");
    Console.WriteLine($"   Stock mínimo: {alerta.stockMinimo}");
}
```

#### Consultar Movimientos de un Producto
```csharp
var listarMovimientos = serviceProvider.GetService<ListarMovimientosPorProducto>();
var movimientos = await listarMovimientos.EjecutarAsync(productoId);

foreach (var mov in movimientos)
{
    Console.WriteLine($"{mov.Fecha:dd/MM/yyyy} - {mov.Tipo}: {mov.Cantidad} unidades - {mov.Motivo}");
}
```

### Gestión de Promociones

#### Crear Promoción
```csharp
var crearPromocion = serviceProvider.GetService<CrearPromocion>();

var nuevaPromocion = new Promocion
{
    Nombre = "Promoción Escolar 2024",
    Descripcion = "Descuentos en útiles escolares",
    FechaInicio = DateTime.UtcNow,
    FechaFin = DateTime.UtcNow.AddMonths(2),
    Activa = true
};

var productosPromocion = new List<(Guid ProductoId, decimal Descuento)>
{
    (producto1Id, 15m), // 15% de descuento
    (producto2Id, 20m), // 20% de descuento
    (producto3Id, 10m)  // 10% de descuento
};

var promocionId = await crearPromocion.EjecutarAsync(nuevaPromocion, productosPromocion);
```

#### Actualizar Promoción
```csharp
var actualizarPromocion = serviceProvider.GetService<ActualizarPromocion>();

var datosActualizados = new Promocion
{
    Nombre = "Promoción Escolar 2024 - Extendida",
    Descripcion = "Descuentos en útiles escolares - Plazo extendido",
    FechaInicio = DateTime.UtcNow,
    FechaFin = DateTime.UtcNow.AddMonths(3),
    Activa = true
};

await actualizarPromocion.EjecutarAsync(promocionId, datosActualizados);
```

#### Listar Promociones Activas
```csharp
var listarPromociones = serviceProvider.GetService<ListarPromociones>();
var promocionesActivas = await listarPromociones.EjecutarAsync(soloActivas: true);

foreach (var promo in promocionesActivas)
{
    Console.WriteLine($"?? {promo.Nombre}");
    Console.WriteLine($"   Válida hasta: {promo.FechaFin:dd/MM/yyyy}");
    Console.WriteLine($"   Productos en promoción: {promo.Productos.Count}");
    
    foreach (var pp in promo.Productos)
    {
    Console.WriteLine($"   - {pp.Producto?.Nombre}: {pp.DescuentoPorcentaje}% OFF");
    }
}
```

#### Gestionar Estado de Promoción
```csharp
var gestionarPromocion = serviceProvider.GetService<GestionarPromocion>();

// Desactivar promoción
await gestionarPromocion.ActualizarEstadoAsync(promocionId, activa: false);
```

### Gestión de Devoluciones

#### Registrar Devolución
```csharp
var registrarDevolucion = serviceProvider.GetService<RegistrarDevolucion>();

// Devolución con cliente
var devolucionId = await registrarDevolucion.EjecutarAsync(
    productoId: productoId,
    cantidad: 2,
    motivo: "Producto defectuoso",
    clienteId: clienteId
);

// Devolución sin cliente (anónima)
var devolucionId2 = await registrarDevolucion.EjecutarAsync(
    productoId: productoId,
    cantidad: 1,
    motivo: "Cliente no satisfecho"
);
```

#### Listar Devoluciones
```csharp
var listarDevoluciones = serviceProvider.GetService<ListarDevoluciones>();
var devoluciones = await listarDevoluciones.EjecutarAsync();

foreach (var devol in devoluciones)
{
    Console.WriteLine($"Devolución #{devol.Id}");
    Console.WriteLine($"Producto: {devol.Producto?.Nombre}");
 Console.WriteLine($"Cantidad: {devol.Cantidad}");
    Console.WriteLine($"Motivo: {devol.Motivo}");
    Console.WriteLine($"Fecha: {devol.Fecha:dd/MM/yyyy HH:mm}");
    if (devol.Cliente != null)
        Console.WriteLine($"Cliente: {devol.Cliente.Nombres} {devol.Cliente.Apellidos}");
}
```

## Manejo de Errores

Todos los casos de uso lanzan excepciones con mensajes descriptivos cuando ocurren errores:

```csharp
try
{
    await crearProducto.EjecutarAsync(producto);
}
catch (ArgumentNullException ex)
{
    // Objeto nulo
    Console.WriteLine($"Error: {ex.Message}");
}
catch (ArgumentException ex)
{
    // Validación fallida
 Console.WriteLine($"Validación: {ex.Message}");
}
catch (InvalidOperationException ex)
{
    // Operación no válida (ej: stock insuficiente)
    Console.WriteLine($"Error de operación: {ex.Message}");
}
catch (Exception ex)
{
    // Otros errores
    Console.WriteLine($"Error inesperado: {ex.Message}");
}
```

## Validaciones Comunes

### Validaciones de Producto
- Código no puede estar vacío
- Código debe ser único
- Nombre es obligatorio
- Precio de venta debe ser mayor a 0
- Stock mínimo no puede ser negativo

### Validaciones de Inventario
- Cantidad debe ser positiva
- Stock no puede ser negativo (no se permite egreso mayor al stock disponible)
- Producto debe existir

### Validaciones de Promoción
- Nombre es obligatorio
- Fecha de inicio debe ser anterior a fecha de fin
- Descuento debe estar entre 0 y 100
- Productos deben existir

### Validaciones de Devolución
- Cantidad debe ser positiva
- Producto debe existir
- Motivo es obligatorio

## Buenas Prácticas

1. **Siempre valide los datos antes de llamar a los casos de uso**
2. **Use try-catch para manejar excepciones apropiadamente**
3. **Verifique la existencia de entidades antes de operaciones de actualización/eliminación**
4. **Utilice transacciones cuando realice operaciones múltiples relacionadas**
5. **Mantenga el stock actualizado con cada movimiento de inventario**
6. **Revise regularmente las alertas de stock mínimo**
7. **Documente el motivo de cada movimiento de inventario**

---

**Sistema desarrollado siguiendo los principios SOLID y Clean Architecture**
