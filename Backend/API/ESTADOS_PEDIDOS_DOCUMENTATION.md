# Documentación de Estados de Pedidos

## Estados Disponibles

El sistema de pedidos maneja los siguientes estados:

### 1. **CREADO / PENDIENTE** (0)
- **Descripción**: Pedido recién creado, esperando confirmación
- **Alias**: CREADO y PENDIENTE son el mismo estado (valor 0)
- **Acción siguiente**: Pasar a EN_PREPARACION

### 2. **EN_PREPARACION** (1)
- **Descripción**: El pedido está siendo preparado en cocina
- **Transición desde**: CREADO/PENDIENTE
- **Acción siguiente**: Pasar a LISTO

### 3. **LISTO** (2)
- **Descripción**: El pedido está listo para ser entregado
- **Transición desde**: EN_PREPARACION
- **Acción siguiente**: Pasar a ENTREGADO

### 4. **ENTREGADO** (3)
- **Descripción**: El pedido ha sido entregado al cliente
- **Transición desde**: LISTO
- **Acción siguiente**: Pasar a FINALIZADO

### 5. **FINALIZADO** (4) ? **NUEVO**
- **Descripción**: El pedido ha sido completado exitosamente, incluyendo pago y cierre
- **Transición desde**: ENTREGADO
- **Acción siguiente**: Estado terminal - no hay más transiciones

### 6. **CANCELADO** (5)
- **Descripción**: El pedido fue cancelado
- **Transición desde**: Cualquier estado excepto FINALIZADO
- **Acción siguiente**: Estado terminal - no hay más transiciones

---

## Flujo de Estados (Happy Path)

```
CREADO/PENDIENTE ? EN_PREPARACION ? LISTO ? ENTREGADO ? FINALIZADO
```

---

## Transiciones Válidas

### Desde CREADO/PENDIENTE:
- ? **EN_PREPARACION**: Cuando cocina comienza a preparar
- ? **CANCELADO**: Si se cancela antes de preparar

### Desde EN_PREPARACION:
- ? **LISTO**: Cuando el pedido está preparado
- ? **CANCELADO**: Si se cancela durante preparación

### Desde LISTO:
- ? **ENTREGADO**: Cuando se entrega al cliente
- ? **CANCELADO**: Si se cancela antes de entregar

### Desde ENTREGADO:
- ? **FINALIZADO**: Cuando se cierra completamente el pedido
- ? **CANCELADO**: Si hay algún problema post-entrega

### Desde FINALIZADO:
- ? **Ninguna transición permitida**: Estado terminal

### Desde CANCELADO:
- ? **Ninguna transición permitida**: Estado terminal

---

## Endpoint para Actualizar Estado

### **PUT** `/api/pedidos/{id}/estado`

**Autenticación requerida**: Roles `administrador` o `cocina`

**Parámetros:**
- `id` (ruta): GUID del pedido
- `estado` (query): Nuevo estado del pedido

**Estados válidos:**
- `CREADO` o `PENDIENTE` (0)
- `EN_PREPARACION` (1)
- `LISTO` (2)
- `ENTREGADO` (3)
- `FINALIZADO` (4)
- `CANCELADO` (5)

---

## Ejemplos de Uso

### 1. Pasar pedido a preparación
```http
PUT https://localhost:7001/api/pedidos/123e4567-e89b-12d3-a456-426614174000/estado?estado=EN_PREPARACION
Authorization: Bearer {token}
```

### 2. Marcar pedido como listo
```http
PUT https://localhost:7001/api/pedidos/123e4567-e89b-12d3-a456-426614174000/estado?estado=LISTO
Authorization: Bearer {token}
```

### 3. Marcar pedido como entregado
```http
PUT https://localhost:7001/api/pedidos/123e4567-e89b-12d3-a456-426614174000/estado?estado=ENTREGADO
Authorization: Bearer {token}
```

### 4. Finalizar pedido (NUEVO)
```http
PUT https://localhost:7001/api/pedidos/123e4567-e89b-12d3-a456-426614174000/estado?estado=FINALIZADO
Authorization: Bearer {token}
```

### 5. Cancelar pedido
```http
PUT https://localhost:7001/api/pedidos/123e4567-e89b-12d3-a456-426614174000/estado?estado=CANCELADO
Authorization: Bearer {token}
```

---

## Respuestas de la API

### Éxito (200 OK)
```json
{
  "mensaje": "Estado actualizado"
}
```

### Error: Transición Inválida (400 Bad Request)
```json
{
  "mensaje": "Transición inválida: ENTREGADO -> EN_PREPARACION"
}
```

### Error: Pedido no encontrado (404 Not Found)
```json
{
  "mensaje": "Pedido no encontrado"
}
```

### Error: Sin autenticación (401 Unauthorized)
```json
{
  "mensaje": "No autorizado"
}
```

### Error: Sin permisos (403 Forbidden)
```json
{
  "mensaje": "Acceso denegado"
}
```

---

## Notificaciones en Tiempo Real (SignalR)

Cuando se actualiza el estado de un pedido, se envían notificaciones en tiempo real a:

1. **Grupo "cocina"**: Todos los usuarios conectados al grupo de cocina
2. **Grupo "mesa-{numeroMesa}"**: Clientes de la mesa específica

### Mensaje enviado:
```javascript
{
  "id": "guid-del-pedido",
  "estado": "FINALIZADO"
}
```

---

## Historial de Estados

Cada cambio de estado se registra en la tabla `PedidoEstadoHistorial` con:
- ID del pedido
- Estado nuevo
- Fecha y hora del cambio

Esto permite auditar todos los cambios realizados en el pedido.

---

## Casos de Uso del Estado FINALIZADO

El estado **FINALIZADO** es útil para:

1. ? **Cierre contable**: Indica que el pedido está completamente cerrado
2. ? **Análisis de métricas**: Separar pedidos entregados de pedidos finalizados
3. ? **Gestión de mesas**: Liberar la mesa cuando el pedido está finalizado
4. ? **Reportes**: Generar reportes solo con pedidos completamente finalizados
5. ? **Protección de datos**: Evitar modificaciones una vez finalizado

---

## Diferencia entre ENTREGADO y FINALIZADO

| Aspecto | ENTREGADO | FINALIZADO |
|---------|-----------|------------|
| **Comida** | Entregada al cliente | Consumida/completada |
| **Pago** | Puede estar pendiente | Debe estar completado |
| **Mesa** | Ocupada | Libre |
| **Modificaciones** | Aún se puede cancelar | No se puede modificar |
| **Siguiente paso** | Puede finalizar | Estado terminal |

---

## Notas Importantes

1. ?? No se puede regresar a estados anteriores (solo hacia adelante o cancelar)
2. ?? Una vez FINALIZADO o CANCELADO, no hay más transiciones
3. ?? El sistema valida automáticamente las transiciones permitidas
4. ?? Los cambios de estado generan notificaciones en tiempo real
5. ?? Todo cambio queda registrado en el historial

---

## Migración de Base de Datos

Se ha creado una migración llamada `AgregarEstadoFinalizado` que actualiza:
- El enum `EstadoPedido` en la base de datos
- Los valores actuales se mantienen sin cambios
- No requiere migración de datos existentes

Para aplicar la migración:
```bash
dotnet ef database update --project Infraestructure --startup-project API
```

---

## Diagrama de Estados

```
          [CREADO/PENDIENTE]
        |
         v
      [EN_PREPARACION]
     |
        v
 [LISTO]
      |
          v
       [ENTREGADO]
      |
            v
           [FINALIZADO] ?
           
        
  Cualquier estado ? [CANCELADO]
  (excepto FINALIZADO)
```
