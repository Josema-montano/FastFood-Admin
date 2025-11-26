# API Controllers Documentation

## Controladores Creados

Esta API REST implementa los siguientes controladores para gestionar el sistema de inventario:

### 1. **ClientesController** (`/api/clientes`)
Gestiona las operaciones CRUD de clientes.

#### Endpoints:
- **GET** `/api/clientes` - Lista todos los clientes
- **GET** `/api/clientes/{id}` - Obtiene un cliente por ID
- **POST** `/api/clientes` - Crea un nuevo cliente
- **PUT** `/api/clientes/{id}` - Actualiza un cliente existente
- **DELETE** `/api/clientes/{id}` - Elimina un cliente

#### Ejemplo de JSON para POST/PUT:
```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "documento": "12345678",
  "telefono": "987654321",
  "email": "juan.perez@example.com",
  "direccion": "Av. Principal 123"
}
```

---

### 2. **ProveedoresController** (`/api/proveedores`)
Gestiona las operaciones CRUD de proveedores.

#### Endpoints:
- **GET** `/api/proveedores` - Lista todos los proveedores
- **GET** `/api/proveedores/{id}` - Obtiene un proveedor por ID
- **POST** `/api/proveedores` - Crea un nuevo proveedor
- **PUT** `/api/proveedores/{id}` - Actualiza un proveedor existente
- **DELETE** `/api/proveedores/{id}` - Elimina un proveedor

#### Ejemplo de JSON para POST/PUT:
```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "nombre": "Distribuidora ABC",
  "ruc": "20123456789",
  "telefono": "987654321",
  "email": "ventas@distribuidoraabc.com",
  "direccion": "Av. Industrial 456"
}
```

---

### 3. **ProductosController** (`/api/productos`)
Gestiona las operaciones CRUD de productos e incluye búsqueda por código.

#### Endpoints:
- **GET** `/api/productos` - Lista todos los productos
- **GET** `/api/productos/{id}` - Obtiene un producto por ID
- **GET** `/api/productos/codigo/{codigo}` - Obtiene un producto por código
- **POST** `/api/productos` - Crea un nuevo producto
- **PUT** `/api/productos/{id}` - Actualiza un producto existente
- **DELETE** `/api/productos/{id}` - Elimina un producto

#### Ejemplo de JSON para POST/PUT:
```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "codigo": "PROD001",
  "nombre": "Laptop HP",
  "descripcion": "Laptop HP 15.6 pulgadas",
  "precioCompra": 1500.00,
  "precioVenta": 2000.00,
  "stock": 10,
  "stockMinimo": 5,
  "proveedorId": "guid-del-proveedor"
}
```

---

### 4. **PromocionesController** (`/api/promociones`)
Gestiona promociones y sus productos asociados con descuentos.

#### Endpoints:
- **GET** `/api/promociones` - Lista todas las promociones
- **GET** `/api/promociones/{id}` - Obtiene una promoción por ID
- **POST** `/api/promociones` - Crea una nueva promoción
- **PUT** `/api/promociones/{id}` - Actualiza una promoción existente
- **DELETE** `/api/promociones/{id}` - Elimina una promoción

#### Ejemplo de JSON para POST/PUT:
```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "nombre": "Cyber Monday",
  "descripcion": "Descuentos especiales por Cyber Monday",
  "fechaInicio": "2024-11-01T00:00:00",
  "fechaFin": "2024-11-30T23:59:59",
  "activa": true,
  "productos": [
    {
      "productoId": "guid-del-producto-1",
      "descuentoPorcentaje": 20.0
    },
    {
      "productoId": "guid-del-producto-2",
    "descuentoPorcentaje": 15.0
    }
  ]
}
```

---

### 5. **DevolucionesController** (`/api/devoluciones`)
Gestiona el registro y consulta de devoluciones de productos.

#### Endpoints:
- **GET** `/api/devoluciones` - Lista todas las devoluciones
- **GET** `/api/devoluciones/{id}` - Obtiene una devolución por ID
- **POST** `/api/devoluciones` - Registra una nueva devolución

#### Ejemplo de JSON para POST:
```json
{
  "productoId": "guid-del-producto",
  "clienteId": "guid-del-cliente",
  "cantidad": 2,
  "motivo": "Producto defectuoso"
}
```

**Nota:** Al registrar una devolución, automáticamente se actualiza el stock del producto y se registra un movimiento de inventario.

---

### 6. **InventarioController** (`/api/inventario`)
Gestiona movimientos de inventario y alertas de stock mínimo.

#### Endpoints:
- **GET** `/api/inventario/movimientos/{productoId}` - Lista movimientos de un producto
- **POST** `/api/inventario/actualizar` - Registra un movimiento de inventario
- **GET** `/api/inventario/alertas` - Obtiene productos con stock bajo el mínimo

#### Ejemplo de JSON para POST actualizar:
```json
{
  "productoId": "guid-del-producto",
  "cantidad": 50,
  "tipo": "Ingreso",
  "motivo": "Compra a proveedor"
}
```

**Tipos de movimiento válidos:** `Ingreso` o `Egreso`

---

## Configuración

### Cadena de Conexión
La aplicación usa SQL Server. La cadena de conexión se encuentra en `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=localhost;Initial Catalog=ProyectoFinal;Integrated Security=True;Trust Server Certificate=True"
  }
}
```

### Inyección de Dependencias
Todos los repositorios y casos de uso están registrados en `Program.cs` usando el patrón de inyección de dependencias de .NET.

### AutoMapper
Se utiliza AutoMapper para convertir entre entidades del dominio y DTOs. El perfil de mapeo se encuentra en `Aplication/Mapping/MappingProfile.cs`.

---

## Swagger/OpenAPI
La API incluye Swagger UI para documentación interactiva. Cuando ejecutes la aplicación en modo Development, accede a:

```
https://localhost:{puerto}/swagger
```

---

## Arquitectura
El proyecto sigue una arquitectura en capas:

- **API**: Controladores y configuración de la API
- **Application**: Casos de uso, DTOs y mapeos
- **Domain**: Entidades e interfaces de repositorios
- **Infrastructure**: Implementación de repositorios y DbContext

---

## Respuestas HTTP

### Códigos de Estado Comunes:
- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado exitosamente
- `204 No Content` - Operación exitosa sin contenido (DELETE)
- `400 Bad Request` - Datos de entrada inválidos
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

### Formato de Errores:
```json
{
  "mensaje": "Descripción del error"
}
```
