using Domain.Interfaces;
using System.Threading.Tasks;
using System;

namespace Aplication.UseCases.Productos
{
 public class EliminarProducto
 {
 private readonly IProductoRepositorio _repo;
 public EliminarProducto(IProductoRepositorio repo){ _repo = repo; }
 public async Task EjecutarAsync(int id)
 {
 if(id<=0) throw new ArgumentException("Id inválido");
 await _repo.EliminarAsync(id);
 }
 }
}
