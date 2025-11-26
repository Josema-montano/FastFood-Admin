using Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Aplication.UseCases.Usuarios
{
 public class ListarUsuarios
 {
 private readonly IUsuarioRepositorio _repo;
 public ListarUsuarios(IUsuarioRepositorio repo){ _repo=repo; }
 public async Task<IEnumerable<Usuario>> EjecutarAsync() => await _repo.ListarAsync();
 }
}
