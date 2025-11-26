using System;
using System.ComponentModel.DataAnnotations;

namespace Aplication.DTOs
{
 public class InventarioDTO
 {
 public Guid Id { get; set; }
 [Required]
 public int ProductoId { get; set; }
 [Range(0,int.MaxValue)]
 public int Stock { get; set; }
 [Range(0,int.MaxValue)]
 public int StockMinimo { get; set; }
 [Range(0,int.MaxValue)]
 public int StockMaximo { get; set; }
 public string Unidad { get; set; } = string.Empty;
 public DateTime ActualizadoEn { get; set; }
 }
}
