using Aplication.DTOs;
using Domain.Interfaces;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.UseCases.Usuarios
{
    public class ActualizarUsuario
    {
        private readonly IUsuarioRepositorio _repo;

        public ActualizarUsuario(IUsuarioRepositorio repo)
        {
   _repo = repo;
        }

    public async Task EjecutarAsync(Guid id, ActualizarUsuarioDTO dto)
        {
            var usuario = await _repo.ObtenerPorIdAsync(id);
  if (usuario == null)
           throw new ArgumentException("Usuario no encontrado");

            // Validar que el email no esté en uso por otro usuario
            var usuarioConEmail = await _repo.ObtenerPorEmailAsync(dto.Email);
       if (usuarioConEmail != null && usuarioConEmail.Id != id)
                throw new ArgumentException("El email ya está en uso por otro usuario");

   // Actualizar propiedades
         usuario.Nombre = dto.Nombre;
     usuario.Email = dto.Email;
            usuario.Rol = dto.Rol;
  usuario.Telefono = dto.Telefono;

    // Si se proporciona nueva contraseña, actualizarla
 if (!string.IsNullOrWhiteSpace(dto.NuevoPassword))
{
      usuario.PasswordHash = Hash(dto.NuevoPassword);
     }

   await _repo.ActualizarAsync(usuario);
        }

        private string Hash(string input)
  {
            using var sha = SHA256.Create();
    return Convert.ToBase64String(sha.ComputeHash(Encoding.UTF8.GetBytes(input)));
        }
    }
}
