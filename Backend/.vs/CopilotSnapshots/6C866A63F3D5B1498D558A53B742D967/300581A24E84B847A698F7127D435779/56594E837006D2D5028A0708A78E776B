using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarEstadoFinalizado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Actualizar todos los pedidos con estado CANCELADO (4) al nuevo valor (5)
            // Esto debe hacerse antes de que el nuevo código intente usar el estado 4 para FINALIZADO
            migrationBuilder.Sql(@"
                UPDATE Pedidos 
                SET Estado = 5 
                WHERE Estado = 4
            ");

            // Actualizar historial de estados (nombre correcto de la tabla: PedidoEstadosHistorial)
            migrationBuilder.Sql(@"
                UPDATE PedidoEstadosHistorial 
                SET Estado = 5 
                WHERE Estado = 4
            ");

            // Nota: Ahora el estado 4 está libre para usarse como FINALIZADO
            // Estado 5 es el nuevo CANCELADO
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revertir: volver CANCELADO de 5 a 4
            migrationBuilder.Sql(@"
                UPDATE Pedidos 
                SET Estado = 4 
                WHERE Estado = 5
            ");

            migrationBuilder.Sql(@"
                UPDATE PedidoEstadosHistorial 
                SET Estado = 4 
                WHERE Estado = 5
            ");

            // Convertir cualquier FINALIZADO (4) a ENTREGADO (3)
            migrationBuilder.Sql(@"
                UPDATE Pedidos 
                SET Estado = 3 
                WHERE Estado = 4
            ");

            migrationBuilder.Sql(@"
                UPDATE PedidoEstadosHistorial 
                SET Estado = 3 
                WHERE Estado = 4
            ");
        }
    }
}
