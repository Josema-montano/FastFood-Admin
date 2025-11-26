using Aplication.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Threading.Tasks;

namespace Aplication.UseCases.Inventarios
{
 public class CrearInventario
 {
 private readonly IInventarioRepositorio _repo;
 public CrearInventario(IInventarioRepositorio repo){ _repo = repo; }
 public async Task<Guid> EjecutarAsync(InventarioDTO dto)
 {
 if(dto.ProductoId<=0) throw new ArgumentException("ProductoId inválido");
 var existente = await _repo.ObtenerPorProductoIdAsync(dto.ProductoId);
 if(existente!=null) throw new InvalidOperationException("Inventario ya existe para producto");
 var inv = new Inventario
 {
 Id = Guid.NewGuid(),
 ProductoId = dto.ProductoId,
 Stock = dto.Stock,
 StockMinimo = dto.StockMinimo,
 StockMaximo = dto.StockMaximo,
 Unidad = dto.Unidad,
 ActualizadoEn = DateTime.UtcNow
 };
 await _repo.CrearAsync(inv);
 return inv.Id;
 }
 }
}
