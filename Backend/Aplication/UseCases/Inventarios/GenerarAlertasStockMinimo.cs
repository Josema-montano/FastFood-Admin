using Domain.Interfaces;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace Aplication.UseCases.Inventarios
{
 public class GenerarAlertasStockMinimo
 {
 private readonly IInventarioRepositorio _inventarioRepo;
 private readonly ILogger<GenerarAlertasStockMinimo> _logger;
 public GenerarAlertasStockMinimo(IInventarioRepositorio inventarioRepo, ILogger<GenerarAlertasStockMinimo> logger){ _inventarioRepo = inventarioRepo; _logger = logger; }
 public async Task<IEnumerable<object>> EjecutarAsync()
 {
 var inventarios = await _inventarioRepo.ListarAsync();
 var alertas = inventarios.Where(i => i.Stock <= i.StockMinimo).Select(i => new { i.ProductoId, i.Stock, i.StockMinimo });
 foreach(var a in alertas) _logger.LogWarning("Stock bajo en producto {ProductoId}: {Stock}/{StockMinimo}", a.ProductoId, a.Stock, a.StockMinimo);
 return alertas;
 }
 }
}
