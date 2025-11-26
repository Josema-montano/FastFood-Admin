using Aplication.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.UseCases.Usuarios
{
 public class RegistrarUsuario
 {
 private readonly IUsuarioRepositorio _repo;
 public RegistrarUsuario(IUsuarioRepositorio repo){ _repo=repo; }
 public async Task<Guid> EjecutarAsync(RegistrarUsuarioDTO dto)
 {
 var existente = await _repo.ObtenerPorEmailAsync(dto.Email);
 if(existente!=null) throw new InvalidOperationException("Email ya registrado");
 var usuario = new Usuario
 {
 Id = Guid.NewGuid(),
 Nombre = dto.Nombre,
 Email = dto.Email,
 Rol = dto.Rol,
 Telefono = dto.Telefono,
 PasswordHash = Hash(dto.Password),
 CreadoEn = DateTime.UtcNow
 };
 await _repo.RegistrarAsync(usuario);
 return usuario.Id;
 }
 private string Hash(string input){ using var sha = SHA256.Create(); return Convert.ToBase64String(sha.ComputeHash(Encoding.UTF8.GetBytes(input))); }
 }
}
