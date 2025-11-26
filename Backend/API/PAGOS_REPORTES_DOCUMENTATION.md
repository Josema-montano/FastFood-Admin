# Documentación de Endpoints de Pagos y Reportes

## Controlador de Pagos

### 1. GET `/api/pagos`
Lista todos los pagos registrados en el sistema.

**Autenticación:** Requerida

**Respuesta exitosa (200):**
```json
[
  {
    "id": "guid",
    "pedidoId": "guid",
    "monto": 150.50,
    "metodo": "Efectivo",
    "estado": "APROBADO",
    "fecha": "2024-11-23T10:30:00",
    "numeroMesa": 5,
    "totalPedido": 150.50
  }
]
```

---

### 2. GET `/api/pagos/estado/{estado}`
Lista pagos filtrados por estado.

**Autenticación:** Requerida

**Parámetros de ruta:**
- `estado`: PENDIENTE | APROBADO | RECHAZADO

**Ejemplo:** `/api/pagos/estado/APROBADO`

**Respuesta exitosa (200):**
```json
[
  {
    "id": "guid",
    "pedidoId": "guid",
    "monto": 150.50,
    "metodo": "Efectivo",
    "estado": "APROBADO",
    "fecha": "2024-11-23T10:30:00",
    "numeroMesa": 5,
    "totalPedido": 150.50
  }
]
```

---

### 3. GET `/api/pagos/realizados`
Lista únicamente los pagos realizados (estado APROBADO).

**Autenticación:** Requerida

**Respuesta exitosa (200):**
```json
[
  {
    "id": "guid",
    "pedidoId": "guid",
    "monto": 150.50,
    "metodo": "QR",
    "estado": "APROBADO",
    "fecha": "2024-11-23T10:30:00",
    "numeroMesa": 3,
    "totalPedido": 150.50
  }
]
```

---

### 4. GET `/api/pagos/por-fechas`
Lista pagos en un rango de fechas específico.

**Autenticación:** Requerida

**Parámetros de query (opcionales):**
- `fechaInicio`: DateTime (default: hace 30 días)
- `fechaFin`: DateTime (default: mañana)

**Ejemplo:** `/api/pagos/por-fechas?fechaInicio=2024-11-01&fechaFin=2024-11-30`

**Respuesta exitosa (200):**
```json
[
  {
    "id": "guid",
    "pedidoId": "guid",
    "monto": 75.00,
  "metodo": "Efectivo",
    "estado": "APROBADO",
    "fecha": "2024-11-15T14:20:00",
    "numeroMesa": 8,
    "totalPedido": 75.00
  }
]
```

---

## Controlador de Reportes

### 1. GET `/api/reportes/inventario`
Genera reporte del estado actual del inventario.

**Autenticación:** Requerida

**Parámetros de query:**
- `generadoPor`: string (default: "sistema")

**Ejemplo:** `/api/reportes/inventario?generadoPor=admin`

**Respuesta exitosa (200):**
```json
{
  "id": "guid",
  "tipo": "Inventario",
  "contenido": "===== REPORTE DE INVENTARIO =====\n...",
  "fechaInicio": "2024-11-23T00:00:00",
  "fechaFin": "2024-11-23T23:59:59",
  "generadoPor": "admin"
}
```

---

### 2. GET `/api/reportes/pagos`
Genera reporte de pagos con opciones de filtrado.

**Autenticación:** Requerida

**Parámetros de query:**
- `generadoPor`: string (default: "sistema")
- `fechaInicio`: DateTime (opcional, default: hace 30 días)
- `fechaFin`: DateTime (opcional, default: mañana)
- `soloRealizados`: bool (default: true)

**Ejemplo:** `/api/reportes/pagos?generadoPor=admin&soloRealizados=true`

**Respuesta exitosa (200):**
```json
{
  "id": "guid",
  "tipo": "Pagos",
  "contenido": "===== REPORTE DE PAGOS =====\nPeríodo: 01/11/2024 - 30/11/2024\nTipo: Solo pagos realizados\n...",
  "fechaInicio": "2024-11-01T00:00:00",
  "fechaFin": "2024-11-30T23:59:59",
  "generadoPor": "admin"
}
```

**Contenido del reporte incluye:**
- Resumen general (total de pagos, monto total, promedio)
- Pagos por método (Efectivo/QR)
- Pagos por estado
- Detalle de cada pago

---

### 3. GET `/api/reportes/pagos/realizados`
Genera reporte específico de pagos realizados (estado APROBADO).

**Autenticación:** Requerida

**Parámetros de query:**
- `generadoPor`: string (default: "sistema")
- `fechaInicio`: DateTime (opcional, default: hace 30 días)
- `fechaFin`: DateTime (opcional, default: mañana)

**Ejemplo:** `/api/reportes/pagos/realizados?generadoPor=admin&fechaInicio=2024-11-01&fechaFin=2024-11-30`

**Respuesta exitosa (200):**
```json
{
  "id": "guid",
  "tipo": "Pagos",
  "contenido": "===== REPORTE DE PAGOS =====\nPeríodo: 01/11/2024 - 30/11/2024\nTipo: Solo pagos realizados\n...",
  "fechaInicio": "2024-11-01T00:00:00",
  "fechaFin": "2024-11-30T23:59:59",
  "generadoPor": "admin"
}
```

---

## Estados de Pago

El sistema maneja los siguientes estados para los pagos:

- **PENDIENTE**: Pago registrado pero no completado
- **APROBADO**: Pago completado exitosamente
- **RECHAZADO**: Pago rechazado o cancelado

---

## Métodos de Pago

- **Efectivo**: Pago en efectivo
- **QR**: Pago mediante código QR

---

## Códigos de Respuesta

- **200 OK**: Operación exitosa
- **400 Bad Request**: Parámetros inválidos
- **401 Unauthorized**: Sin autenticación
- **403 Forbidden**: Sin permisos
- **500 Internal Server Error**: Error del servidor

---

## Notas Importantes

1. Todos los endpoints requieren autenticación mediante JWT Bearer token
2. Las fechas deben estar en formato ISO 8601
3. Los montos están en la moneda local (S/)
4. El campo `numeroMesa` puede ser null si el pedido no tiene mesa asignada
5. Por defecto, los reportes muestran solo pagos realizados (APROBADO)
6. Los pagos se ordenan por fecha descendente (más recientes primero)
