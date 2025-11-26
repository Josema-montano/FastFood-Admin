using Aplication.UseCases.Pagos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/pagos")]
  [Authorize]
    public class PagosController : ControllerBase
    {
        private readonly ListarPagos _listar;

  public PagosController(ListarPagos listar)
      {
            _listar = listar;
        }

        /// <summary>
        /// Lista todos los pagos registrados
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
     try
         {
            var pagos = await _listar.EjecutarAsync();
           return Ok(pagos);
}
            catch (Exception ex)
      {
     return StatusCode(500, new { mensaje = "Error al listar pagos", detalle = ex.Message });
         }
 }

        /// <summary>
        /// Lista pagos por estado (PENDIENTE, COMPLETADO, CANCELADO)
        /// </summary>
        [HttpGet("estado/{estado}")]
        public async Task<IActionResult> ListarPorEstado(string estado)
        {
     try
            {
   var pagos = await _listar.ListarPorEstadoAsync(estado);
        return Ok(pagos);
            }
catch (ArgumentException ex)
          {
   return BadRequest(new { mensaje = ex.Message });
            }
        catch (Exception ex)
            {
       return StatusCode(500, new { mensaje = "Error al listar pagos por estado", detalle = ex.Message });
            }
        }

        /// <summary>
        /// Lista pagos realizados (estado COMPLETADO)
   /// </summary>
     [HttpGet("realizados")]
        public async Task<IActionResult> ListarRealizados()
        {
      try
            {
    var pagos = await _listar.ListarPagosRealizadosAsync();
             return Ok(pagos);
            }
        catch (Exception ex)
        {
         return StatusCode(500, new { mensaje = "Error al listar pagos realizados", detalle = ex.Message });
    }
     }

        /// <summary>
    /// Lista pagos en un rango de fechas
 /// </summary>
        [HttpGet("por-fechas")]
     public async Task<IActionResult> ListarPorFechas(
            [FromQuery] DateTime? fechaInicio,
     [FromQuery] DateTime? fechaFin)
     {
try
            {
      var inicio = fechaInicio ?? DateTime.Today.AddDays(-30);
            var fin = fechaFin ?? DateTime.Today.AddDays(1);

      var pagos = await _listar.ListarPorFechasAsync(inicio, fin);
      return Ok(pagos);
   }
            catch (Exception ex)
            {
       return StatusCode(500, new { mensaje = "Error al listar pagos por fechas", detalle = ex.Message });
  }
        }
    }
}
