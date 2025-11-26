using Aplication.DTOs;
using Domain.Interfaces;
using System;
using System.Threading.Tasks;

namespace Aplication.UseCases.Usuarios
{
    public class ObtenerUsuarioPorId
    {
 private readonly IUsuarioRepositorio _repo;

        public ObtenerUsuarioPorId(IUsuarioRepositorio repo)
  {
      _repo = repo;
 }

        public async Task<UsuarioDTO?> EjecutarAsync(Guid id)
     {
    var usuario = await _repo.ObtenerPorIdAsync(id);
          if (usuario == null) return null;

  return new UsuarioDTO
            {
    Id = usuario.Id,
 Nombre = usuario.Nombre,
     Email = usuario.Email,
  Rol = usuario.Rol,
      Telefono = usuario.Telefono
       };
        }
    }
}
