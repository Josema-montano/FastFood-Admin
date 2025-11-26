using Aplication.DTOs;
using Domain.Interfaces;
using AutoMapper;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Aplication.UseCases.Productos
{
 public class ListarProductos
 {
 private readonly IProductoRepositorio _repo;
 private readonly IMapper _mapper;
 public ListarProductos(IProductoRepositorio repo, IMapper mapper){ _repo = repo; _mapper = mapper; }
 public async Task<IEnumerable<ProductoDTO>> EjecutarAsync()
 {
 var lista = await _repo.ListarAsync();
 return _mapper.Map<IEnumerable<ProductoDTO>>(lista);
 }
 }
}
