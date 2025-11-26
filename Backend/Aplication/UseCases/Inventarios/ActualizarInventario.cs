using Aplication.DTOs;
using Domain.Interfaces;
using System;
using System.Threading.Tasks;

namespace Aplication.UseCases.Inventarios
{
 public class ActualizarInventario
 {
 private readonly IInventarioRepositorio _repo;
 public ActualizarInventario(IInventarioRepositorio repo){ _repo = repo; }
 public async Task EjecutarAsync(InventarioDTO dto)
 {
 var existente = await _repo.ObtenerPorIdAsync(dto.Id) ?? throw new ArgumentException("Inventario no encontrado");
 existente.Stock = dto.Stock;
 existente.StockMinimo = dto.StockMinimo;
 existente.StockMaximo = dto.StockMaximo;
 existente.Unidad = dto.Unidad;
 existente.ActualizadoEn = DateTime.UtcNow;
 await _repo.ActualizarAsync(existente);
 }
 }
}
