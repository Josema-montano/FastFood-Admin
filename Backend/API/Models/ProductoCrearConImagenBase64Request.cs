using System.ComponentModel.DataAnnotations;

namespace API.Models
{
 public class ProductoCrearConImagenBase64Request
 {
 [Required]
 public string Nombre { get; set; } = string.Empty;
 public string Descripcion { get; set; } = string.Empty;
 [Range(0.01,double.MaxValue)]
 public decimal Precio { get; set; }
 public string Categoria { get; set; } = string.Empty;
 public bool Activo { get; set; } = true;
 [Range(0,int.MaxValue)]
 public int StockMinimo { get; set; }
 // data URL completo: data:image/png;base64,AAA...
 // o solo la parte base64 y un campo separado de mime
 public string? ImagenBase64 { get; set; } // opcional
 }
}
