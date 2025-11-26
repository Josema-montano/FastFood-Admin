using System;
using System.Collections.Generic;

namespace Aplication.DTOs
{
 public class VentaDTO
 {
 public int Id { get; set; }
 public DateTime Fecha { get; set; }
 public int? ClienteId { get; set; }
 public decimal Total { get; set; }
 public bool Cancelada { get; set; } = false;
 public List<DetalleVentaDTO> Detalles { get; set; } = new();
 public string? MotivoCancelacion { get; set; }
 public string TipoPago { get; set; } = "Efectivo";
 public decimal Descuento { get; set; } =0;
 public string? Notas { get; set; }
 public string? Recibo { get; set; }
 }

 public class DetalleVentaDTO
 {
 public int ProductoId { get; set; }
 public int Cantidad { get; set; }
 public decimal PrecioUnitario { get; set; }
 }
}
