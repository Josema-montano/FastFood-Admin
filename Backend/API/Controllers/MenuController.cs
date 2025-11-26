using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
 [ApiController]
 [Route("api/menu")]
 public class MenuController : ControllerBase
 {
 private readonly IProductoRepositorio _productoRepo;
 private readonly IInventarioRepositorio _inventarioRepo;
 public MenuController(IProductoRepositorio productoRepo, IInventarioRepositorio inventarioRepo){ _productoRepo = productoRepo; _inventarioRepo = inventarioRepo; }

 [HttpGet]
 public async Task<IActionResult> ObtenerMenu()
 {
 var productos = await _productoRepo.ListarAsync();
 var inventarios = await _inventarioRepo.ListarAsync();
 var disponibles = from p in productos
 join i in inventarios on p.Id equals i.ProductoId
 where p.Activo && i.Stock >0
 select new { p.Id, p.Nombre, p.Descripcion, p.Precio, p.ImagenUrl, Disponible = i.Stock >0 };
 return Ok(disponibles);
 }
 }
}
