using System;

namespace Domain.Entities
{
 public class Pago
 {
 public Guid Id { get; set; }
 public Guid PedidoId { get; set; }
 public Pedido? Pedido { get; set; }
 public decimal Monto { get; set; }
 public string Metodo { get; set; } = "Efectivo"; // Efectivo / QR
 public EstadoPago Estado { get; set; } = EstadoPago.PENDIENTE;
 public DateTime Fecha { get; set; }
 }
}
