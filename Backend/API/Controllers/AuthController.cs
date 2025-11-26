using Aplication.UseCases.Usuarios;
using Aplication.DTOs; // agregado para DTOs
using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Http; // agregado para CookieOptions y SameSiteMode

namespace API.Controllers
{
 [ApiController]
 [Route("api/auth")]
 public class AuthController : ControllerBase
 {
 private readonly Login _login;
 private readonly IUsuarioRepositorio _usuarioRepo;
 private readonly RegistrarUsuario _registrar;
 private readonly string _jwtKey;
 public AuthController(Login login, IUsuarioRepositorio usuarioRepo, RegistrarUsuario registrar, IConfiguration config)
 { _login = login; _usuarioRepo = usuarioRepo; _registrar = registrar; _jwtKey = config["Jwt:Key"] ?? "ClaveSuperSecretaMinima123456789"; }

 [HttpPost("login")]
 public async Task<IActionResult> Login(LoginDTO dto)
 {
 var ok = await _login.EjecutarAsync(dto);
 if(!ok) return Unauthorized();
 var usuario = await _usuarioRepo.ObtenerPorEmailAsync(dto.Email)!;
 var token = GenerarToken(usuario);
 EstablecerCookieToken(token);
 return Ok(new { token });
 }

 [HttpPost("register")]
 public async Task<IActionResult> Register(RegistrarUsuarioDTO dto)
 {
 var id = await _registrar.EjecutarAsync(dto);
 var usuario = await _usuarioRepo.ObtenerPorIdAsync(id);
 var token = GenerarToken(usuario!);
 EstablecerCookieToken(token);
 return Ok(new { id, token });
 }

 private void EstablecerCookieToken(string token)
 {
 Response.Cookies.Append("access_token", token, new CookieOptions
 {
 HttpOnly = true,
 Secure = true,
 SameSite = SameSiteMode.Strict,
 Expires = DateTimeOffset.UtcNow.AddHours(2)
 });
 }

 private string GenerarToken(Domain.Entities.Usuario usuario)
 {
 var claims = new[]
 {
 new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
 new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()), // agregado id explícito
 new Claim(ClaimTypes.Name, usuario.Nombre),
 new Claim(ClaimTypes.Email, usuario.Email),
 new Claim(ClaimTypes.Role, usuario.Rol)
 };
 var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
 var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
 var jwt = new JwtSecurityToken(
 claims: claims,
 expires: DateTime.UtcNow.AddHours(2),
 signingCredentials: creds
 );
 return new JwtSecurityTokenHandler().WriteToken(jwt);
 }
 }
}
