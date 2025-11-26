using System.ComponentModel.DataAnnotations;

namespace Aplication.DTOs
{
 public class ProductoDTO
 {
 public int Id { get; set; }
 [Required]
 public string Nombre { get; set; } = string.Empty;
 public string Descripcion { get; set; } = string.Empty;
 [Range(0.01,double.MaxValue)]
 public decimal Precio { get; set; }
 public string Categoria { get; set; } = string.Empty;
 public bool Activo { get; set; } = true;
 public string? ImagenUrl { get; set; }
 [Range(0,int.MaxValue)]
 public int StockMinimo { get; set; }
 }
}
