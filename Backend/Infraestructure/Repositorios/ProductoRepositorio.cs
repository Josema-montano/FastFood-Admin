using Domain.Entities;
using Domain.Interfaces;
using Infraestructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace Infraestructure.Repositorios
{
 public class ProductoRepositorio : IProductoRepositorio
 {
 private readonly AppDbContext _context;
 public ProductoRepositorio(AppDbContext context) { _context = context; }

 public async Task<IEnumerable<Producto>> ListarAsync()
 => await _context.Productos.AsNoTracking().ToListAsync();

 public async Task<Producto?> ObtenerPorIdAsync(int id)
 => await _context.Productos.AsNoTracking().FirstOrDefaultAsync(x=>x.Id==id);

 public async Task CrearAsync(Producto producto)
 {
 _context.Productos.Add(producto);
 await _context.SaveChangesAsync();
 }

 public async Task ActualizarAsync(Producto producto)
 {
 // Buscar si la entidad ya está siendo rastreada
 var tracked = _context.ChangeTracker.Entries<Producto>()
 .FirstOrDefault(e => e.Entity.Id == producto.Id);

 if (tracked != null)
 {
 // Si ya está rastreada, actualizar sus valores
 tracked.CurrentValues.SetValues(producto);
 }
 else
 {
 // Si no está rastreada, buscarla en la base de datos
 var existente = await _context.Productos.FindAsync(producto.Id);
 if (existente == null) throw new KeyNotFoundException("Producto no encontrado");
 
 existente.Nombre = producto.Nombre;
 existente.Descripcion = producto.Descripcion;
 existente.Precio = producto.Precio;
 existente.Categoria = producto.Categoria;
 existente.Activo = producto.Activo;
 if (producto.ImagenUrl != null)
 {
 existente.ImagenUrl = producto.ImagenUrl;
 }
 existente.StockMinimo = producto.StockMinimo;
 }
 
 await _context.SaveChangesAsync();
 }

 public async Task EliminarAsync(int id)
 {
 var prod = await _context.Productos.FindAsync(id);
 if (prod != null)
 {
 _context.Productos.Remove(prod);
 await _context.SaveChangesAsync();
 }
 }
 }
}
