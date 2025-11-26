using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace API.Hubs
{
 public class PedidosHub : Hub
 {
 // Join a group for cocina or mesa specific
 public Task JoinMesa(string mesa) => Groups.AddToGroupAsync(Context.ConnectionId, $"mesa-{mesa}");
 public Task JoinCocina() => Groups.AddToGroupAsync(Context.ConnectionId, "cocina");
 }
}
