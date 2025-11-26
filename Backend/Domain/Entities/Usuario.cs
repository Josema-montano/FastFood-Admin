using System;
using System.Collections.Generic;

namespace Domain.Entities
{
 public class Usuario
 {
 public Guid Id { get; set; }
 public string Nombre { get; set; } = string.Empty;
 public string Email { get; set; } = string.Empty;
 public string Telefono { get; set; } = string.Empty;
 public string Rol { get; set; } = string.Empty; // administrador, cocina, mesero
 public string PasswordHash { get; set; } = string.Empty;
 public DateTime CreadoEn { get; set; }
 public ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();
 }
}
