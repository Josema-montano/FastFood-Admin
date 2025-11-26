export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: 'Administrador' | 'Cocina' | 'Mesero';
  creadoEn: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  activo: boolean;
  imagenUrl?: string;
  stockMinimo: number;
}

export interface Inventario {
  id: string;
  productoId: number;
  producto?: Producto;
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  unidad: string;
  actualizadoEn: string;
}

export enum EstadoPedido {
  CREADO = 0,
  PENDIENTE = 0, // alias visual para CREADO
  EN_PREPARACION = 1,
  LISTO = 2,
  ENTREGADO = 3,
  FINALIZADO = 4,
  CANCELADO = 5
}

// Mapeo para mostrar estados en UI (usa PENDIENTE si valor 0)
export function mapEstadoDisplay(estado: EstadoPedido | number | string): string {
  if (typeof estado === 'string') {
    // Normalizamos alias string desde backend si algún día envía "CREADO"
    if (estado.toUpperCase() === 'CREADO') return 'PENDIENTE';
    return estado.toUpperCase();
  }
  switch (estado) {
    case EstadoPedido.CREADO:
    case EstadoPedido.PENDIENTE:
      return 'PENDIENTE';
    case EstadoPedido.EN_PREPARACION:
      return 'EN PREPARACIÓN';
    case EstadoPedido.LISTO:
      return 'LISTO';
    case EstadoPedido.ENTREGADO:
      return 'ENTREGADO';
    case EstadoPedido.FINALIZADO:
      return 'FINALIZADO';
    case EstadoPedido.CANCELADO:
      return 'CANCELADO';
    default:
      return String(estado);
  }
}

export interface DetallePedido {
  id: string;
  pedidoId: string;
  productoId: number;
  producto?: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  fecha: string;
  estado: EstadoPedido;
  usuarioId?: string;
  usuario?: Usuario;
  mesa: string;
  notas?: string;
  total: number;
  detalles?: DetallePedido[];
  pagos?: Pago[];
}

export enum EstadoPago {
  PENDIENTE = 0,
  COMPLETADO = 1,
  FALLIDO = 2
}

export interface Pago {
  id: string;
  pedidoId: string;
  monto: number;
  metodo: string; // 'Efectivo', 'Tarjeta', etc.
  estado: EstadoPago;
  fecha: string;
}

export interface Reporte {
  id: string;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  generadoPor: string;
  contenido: string; // JSON string or similar
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

