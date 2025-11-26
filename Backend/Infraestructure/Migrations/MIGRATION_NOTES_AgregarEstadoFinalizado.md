# Notas de la Migración: AgregarEstadoFinalizado

## Fecha de Creación
2024-11-24

## Propósito
Agregar el nuevo estado **FINALIZADO** al enum `EstadoPedido` y actualizar los datos existentes para mantener consistencia.

---

## Cambios en el Enum EstadoPedido

### Antes:
```csharp
CREADO = 0,
PENDIENTE = 0,
EN_PREPARACION = 1,
LISTO = 2,
ENTREGADO = 3,
CANCELADO = 4  // ? Cambió de valor
```

### Después:
```csharp
CREADO = 0,
PENDIENTE = 0,
EN_PREPARACION = 1,
LISTO = 2,
ENTREGADO = 3,
FINALIZADO = 4,  // ? NUEVO estado
CANCELADO = 5    // ? Cambió de 4 a 5
```

---

## ?? Problema Identificado

Al cambiar el valor de `CANCELADO` de **4** a **5**, todos los pedidos existentes con estado cancelado tendrían inconsistencias. Por eso, la migración incluye scripts SQL para actualizar los datos.

---

## ?? Scripts SQL Incluidos

### En `Up()` (Aplicar migración):

1. **Actualizar pedidos cancelados:**
   ```sql
   UPDATE Pedidos 
   SET Estado = 5 
   WHERE Estado = 4
   ```
   Convierte todos los pedidos con estado CANCELADO del valor antiguo (4) al nuevo (5).

2. **Actualizar historial de estados:**
   ```sql
   UPDATE PedidoEstadoHistorial 
   SET Estado = 5 
   WHERE Estado = 4
   ```
   Actualiza el historial para mantener consistencia.

### En `Down()` (Revertir migración):

1. **Revertir CANCELADO:**
   ```sql
   UPDATE Pedidos SET Estado = 4 WHERE Estado = 5
   UPDATE PedidoEstadoHistorial SET Estado = 4 WHERE Estado = 5
   ```

2. **Convertir FINALIZADO a ENTREGADO:**
   ```sql
   UPDATE Pedidos SET Estado = 3 WHERE Estado = 4
   UPDATE PedidoEstadoHistorial SET Estado = 3 WHERE Estado = 4
```

---

## ?? Impacto en la Base de Datos

### Tablas Afectadas:
- ? **Pedidos**: Columna `Estado` (int)
- ? **PedidoEstadoHistorial**: Columna `Estado` (int)

### Datos Afectados:
- ? Todos los pedidos con estado CANCELADO (valor 4 ? 5)
- ? Todo el historial de estados cancelados (valor 4 ? 5)

### Datos NO Afectados:
- ? Estados: CREADO (0), EN_PREPARACION (1), LISTO (2), ENTREGADO (3) permanecen sin cambios

---

## ?? Cómo Aplicar la Migración

### Opción 1: Desde Visual Studio
```
Tools ? NuGet Package Manager ? Package Manager Console
```
```powershell
Update-Database
```

### Opción 2: Desde línea de comandos
```bash
dotnet ef database update --project Infraestructure --startup-project API
```

### Opción 3: Desde el directorio del proyecto API
```bash
cd API
dotnet ef database update
```

---

## ? Verificación Post-Migración

Después de aplicar la migración, verificar:

### 1. Estados actualizados correctamente:
```sql
-- Ver distribución de estados
SELECT Estado, COUNT(*) as Cantidad
FROM Pedidos
GROUP BY Estado
ORDER BY Estado

-- Resultado esperado:
-- 0 = CREADO/PENDIENTE
-- 1 = EN_PREPARACION
-- 2 = LISTO
-- 3 = ENTREGADO
-- 4 = (vacío, listo para FINALIZADO)
-- 5 = CANCELADO (movido desde 4)
```

### 2. Historial actualizado:
```sql
SELECT Estado, COUNT(*) as Cantidad
FROM PedidoEstadoHistorial
GROUP BY Estado
ORDER BY Estado
```

### 3. Probar nuevo estado:
```http
PUT /api/pedidos/{id}/estado?estado=FINALIZADO
```

---

## ?? Rollback (Revertir)

Si necesitas revertir la migración:

```bash
dotnet ef database update 20251123070412_ActualizacionesRestaurante --project Infraestructure --startup-project API
```

Esto ejecutará el método `Down()` que:
1. Revierte CANCELADO de 5 a 4
2. Convierte FINALIZADO (4) a ENTREGADO (3)

---

## ?? Advertencias Importantes

1. **?? Backup antes de aplicar**: Siempre hacer backup de la base de datos antes de aplicar esta migración.

2. **?? Downtime recomendado**: Aplicar la migración cuando no haya operaciones activas para evitar inconsistencias.

3. **?? No aplicar parcialmente**: Los scripts SQL deben ejecutarse completamente o no aplicarse.

4. **?? Validar después**: Verificar que no haya pedidos huérfanos o estados inconsistentes.

---

## ?? Notas Técnicas

- La migración **no altera la estructura** de las tablas (no agrega columnas)
- Solo actualiza **valores de datos** existentes
- Los enums se almacenan como **enteros (int)** en SQL Server
- La migración es **idempotente**: puede ejecutarse múltiples veces sin problemas

---

## ?? Testing

Después de aplicar la migración, probar:

1. ? Crear un nuevo pedido
2. ? Avanzar por todos los estados hasta ENTREGADO
3. ? Marcar como FINALIZADO
4. ? Verificar que no se puede cancelar desde FINALIZADO
5. ? Verificar que el historial se registra correctamente

---

## ?? Documentación Relacionada

- `API/ESTADOS_PEDIDOS_DOCUMENTATION.md` - Documentación completa de estados
- `Domain/Entities/EstadoPedido.cs` - Definición del enum
- `Aplication/UseCases/Pedidos/ActualizarEstadoPedido.cs` - Lógica de transiciones

---

## ? Resumen

Esta migración permite agregar el estado **FINALIZADO** sin perder datos existentes, asegurando que todos los pedidos cancelados mantengan su estado correctamente después del cambio de valores en el enum.

**Estado antes de migración:**
- Pedidos cancelados: Estado = 4

**Estado después de migración:**
- Pedidos cancelados: Estado = 5
- Estado 4 disponible para FINALIZADO

? **Migración lista para aplicar en producción**
