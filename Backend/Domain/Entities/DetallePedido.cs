using System;

namespace Domain.Entities
{
 public class DetallePedido
 {
 public Guid Id { get; set; }
 public Guid PedidoId { get; set; }
 public Pedido? Pedido { get; set; }
 public int ProductoId { get; set; }
 public Producto? Producto { get; set; }
 public int Cantidad { get; set; }
 public decimal PrecioUnitario { get; set; }
 public decimal Subtotal { get; set; }
 }
}
