using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
 public interface IPedidoRepositorio
 {
 Task<Pedido> CrearAsync(Pedido pedido);
 Task<Pedido?> ObtenerPorIdAsync(Guid id);
 Task<IEnumerable<Pedido>> ListarAsync();
 Task ActualizarAsync(Pedido pedido);
 }
}
