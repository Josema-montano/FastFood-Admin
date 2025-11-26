using System;

namespace Domain.Entities
{
 public class Reporte
 {
 public Guid Id { get; set; }
 public string Tipo { get; set; } = string.Empty; // ventas, inventario, satisfaccion
 public DateTime FechaInicio { get; set; }
 public DateTime FechaFin { get; set; }
 public string GeneradoPor { get; set; } = string.Empty;
 public string Contenido { get; set; } = string.Empty;
 }
}
