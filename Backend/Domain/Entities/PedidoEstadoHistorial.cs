using System;

namespace Domain.Entities
{
 public class PedidoEstadoHistorial
 {
 public Guid Id { get; set; }
 public Guid PedidoId { get; set; }
 public Pedido? Pedido { get; set; }
 public EstadoPedido Estado { get; set; }
 public DateTime CambioEn { get; set; }
 }
}
