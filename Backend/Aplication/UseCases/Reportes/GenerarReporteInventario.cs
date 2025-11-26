using Domain.Entities;
using Domain.Interfaces;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace Aplication.UseCases.Reportes
{
 public class GenerarReporteInventario
 {
 private readonly IInventarioRepositorio _inventarioRepo;
 private readonly IProductoRepositorio _productoRepo;
 public GenerarReporteInventario(IInventarioRepositorio inventarioRepo, IProductoRepositorio productoRepo){ _inventarioRepo = inventarioRepo; _productoRepo = productoRepo; }
 public async Task<Reporte> EjecutarAsync(string generadoPor)
 {
 var inventarios = await _inventarioRepo.ListarAsync();
 var productos = await _productoRepo.ListarAsync();
 var join = from i in inventarios join p in productos on i.ProductoId equals p.Id select new { p.Nombre, i.Stock, i.StockMinimo, i.StockMaximo };
 var sb = new StringBuilder();
 sb.AppendLine("Producto,Stock,Minimo,Maximo");
 foreach(var r in join) sb.AppendLine($"{r.Nombre},{r.Stock},{r.StockMinimo},{r.StockMaximo}");
 return new Reporte{ Id=System.Guid.NewGuid(), Tipo="INVENTARIO", FechaInicio=System.DateTime.UtcNow, FechaFin=System.DateTime.UtcNow, GeneradoPor=generadoPor, Contenido=sb.ToString() };
 }
 }
}
