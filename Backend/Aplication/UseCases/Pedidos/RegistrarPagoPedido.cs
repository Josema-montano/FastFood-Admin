using Aplication.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Threading.Tasks;

namespace Aplication.UseCases.Pedidos
{
 public class RegistrarPagoPedido
 {
 private readonly IPedidoRepositorio _pedidoRepo;
 private readonly IPagoRepositorio _pagoRepo;
 public RegistrarPagoPedido(IPedidoRepositorio pedidoRepo, IPagoRepositorio pagoRepo){ _pedidoRepo = pedidoRepo; _pagoRepo = pagoRepo; }

 public async Task<Guid> EjecutarAsync(PagoDTO dto)
 {
 var pedido = await _pedidoRepo.ObtenerPorIdAsync(dto.PedidoId) ?? throw new ArgumentException("Pedido no encontrado");
 if (pedido.Pago != null) throw new InvalidOperationException("Pedido ya tiene pago registrado");
 if (dto.Monto != pedido.Total) throw new InvalidOperationException("Monto no coincide con total del pedido");
 var pago = new Pago
 {
 Id = Guid.NewGuid(),
 PedidoId = pedido.Id,
 Monto = dto.Monto,
 Metodo = dto.Metodo,
 Estado = EstadoPago.APROBADO,
 Fecha = DateTime.UtcNow
 };
 await _pagoRepo.RegistrarAsync(pago);
 pedido.Pago = pago;
 await _pedidoRepo.ActualizarAsync(pedido);
 return pago.Id;
 }
 }
}
