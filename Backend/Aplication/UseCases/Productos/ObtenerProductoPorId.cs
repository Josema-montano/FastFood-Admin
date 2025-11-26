using Aplication.DTOs;
using Domain.Interfaces;
using AutoMapper;
using System.Threading.Tasks;
using System;

namespace Aplication.UseCases.Productos
{
 public class ObtenerProductoPorId
 {
 private readonly IProductoRepositorio _repo;
 private readonly IMapper _mapper;
 public ObtenerProductoPorId(IProductoRepositorio repo, IMapper mapper){ _repo = repo; _mapper = mapper; }
 public async Task<ProductoDTO?> EjecutarAsync(int id)
 {
 if(id<=0) throw new ArgumentException("Id inválido");
 var prod = await _repo.ObtenerPorIdAsync(id);
 return prod==null? null : _mapper.Map<ProductoDTO>(prod);
 }
 }
}
