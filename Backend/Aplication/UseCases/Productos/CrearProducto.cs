using Aplication.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using System.Threading.Tasks;
using System;

namespace Aplication.UseCases.Productos
{
 public class CrearProducto
 {
 private readonly IProductoRepositorio _repo;
 public CrearProducto(IProductoRepositorio repo){ _repo=repo; }
 public async Task<int> EjecutarAsync(ProductoDTO dto)
 {
 if(string.IsNullOrWhiteSpace(dto.Nombre)) throw new ArgumentException("Nombre requerido");
 var entity = new Producto
 {
 Nombre = dto.Nombre,
 Descripcion = dto.Descripcion,
 Precio = dto.Precio,
 Categoria = dto.Categoria,
 Activo = dto.Activo,
 ImagenUrl = dto.ImagenUrl,
 StockMinimo = dto.StockMinimo
 };
 await _repo.CrearAsync(entity);
 return entity.Id;
 }
 }
}
