using System;

namespace Domain.Entities
{
 public class Inventario
 {
 public Guid Id { get; set; }
 public int ProductoId { get; set; }
 public Producto? Producto { get; set; }
 public int Stock { get; set; }
 public int StockMinimo { get; set; }
 public int StockMaximo { get; set; }
 public string Unidad { get; set; } = string.Empty;
 public DateTime ActualizadoEn { get; set; }
 }
}
