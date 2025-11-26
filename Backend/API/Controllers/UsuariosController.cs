using Aplication.UseCases.Usuarios;
using Aplication.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System;

namespace API.Controllers
{
    [ApiController]
    [Route("api/usuarios")]
    [Authorize(Roles="administrador")] // proteger todo el controlador
    public class UsuariosController : ControllerBase
    {
        private readonly ListarUsuarios _listar;
        private readonly ObtenerUsuarioPorId _obtener;
        private readonly ActualizarUsuario _actualizar;

        public UsuariosController(
            ListarUsuarios listar,
    ObtenerUsuarioPorId obtener,
    ActualizarUsuario actualizar)
      {
            _listar = listar;
            _obtener = obtener;
  _actualizar = actualizar;
      }

     [HttpGet]
        public async Task<IActionResult> Listar() => Ok(await _listar.EjecutarAsync());

     [HttpGet("{id:guid}")]
        public async Task<IActionResult> Obtener(Guid id)
      {
    var usuario = await _obtener.EjecutarAsync(id);
            if (usuario == null) return NotFound(new { mensaje = "Usuario no encontrado" });
   return Ok(usuario);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarUsuarioDTO dto)
        {
      if (!ModelState.IsValid) return BadRequest(ModelState);

  try
        {
    await _actualizar.EjecutarAsync(id, dto);
     return Ok(new { mensaje = "Usuario actualizado correctamente" });
            }
         catch (ArgumentException ex)
  {
            return BadRequest(new { mensaje = ex.Message });
      }
 catch (Exception ex)
        {
        return StatusCode(500, new { mensaje = "Error al actualizar usuario", detalle = ex.Message });
          }
  }
    }
}
