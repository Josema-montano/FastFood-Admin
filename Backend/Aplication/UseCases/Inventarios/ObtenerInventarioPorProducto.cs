using Aplication.DTOs;
using Domain.Interfaces;
using AutoMapper;
using System.Threading.Tasks;

namespace Aplication.UseCases.Inventarios
{
 public class ObtenerInventarioPorProducto
 {
 private readonly IInventarioRepositorio _repo;
 private readonly IMapper _mapper;
 public ObtenerInventarioPorProducto(IInventarioRepositorio repo, IMapper mapper){ _repo = repo; _mapper = mapper; }
 public async Task<InventarioDTO?> EjecutarAsync(int productoId)
 {
 var inv = await _repo.ObtenerPorProductoIdAsync(productoId);
 return inv==null? null : _mapper.Map<InventarioDTO>(inv);
 }
 }
}
