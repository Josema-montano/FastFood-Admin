using Domain.Entities;
using Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Aplication.UseCases.Pedidos
{
 public class ListarPedidos
 {
 private readonly IPedidoRepositorio _repo;
 public ListarPedidos(IPedidoRepositorio repo){ _repo = repo; }
 public async Task<IEnumerable<Pedido>> EjecutarAsync() => await _repo.ListarAsync();
 }
}
