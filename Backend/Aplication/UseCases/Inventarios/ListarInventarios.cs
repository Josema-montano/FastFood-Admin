using Aplication.DTOs;
using Domain.Interfaces;
using AutoMapper;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Aplication.UseCases.Inventarios
{
 public class ListarInventarios
 {
 private readonly IInventarioRepositorio _repo;
 private readonly IMapper _mapper;
 public ListarInventarios(IInventarioRepositorio repo, IMapper mapper){ _repo = repo; _mapper = mapper; }
 public async Task<IEnumerable<InventarioDTO>> EjecutarAsync()
 {
 var lista = await _repo.ListarAsync();
 return _mapper.Map<IEnumerable<InventarioDTO>>(lista);
 }
 }
}
