using Aplication.DTOs;
using Domain.Interfaces;
using System;
using System.Text;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace Aplication.UseCases.Usuarios
{
 public class Login
 {
 private readonly IUsuarioRepositorio _repo;
 public Login(IUsuarioRepositorio repo){ _repo=repo; }
 public async Task<bool> EjecutarAsync(LoginDTO dto)
 {
 var usuario = await _repo.ObtenerPorEmailAsync(dto.Email);
 if(usuario==null) return false;
 return usuario.PasswordHash == Hash(dto.Password);
 }
 private string Hash(string input){ using var sha = SHA256.Create(); return Convert.ToBase64String(sha.ComputeHash(Encoding.UTF8.GetBytes(input))); }
 }
}
