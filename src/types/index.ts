export interface Fichaje {
  id: string;
  fechaHoraEntrada: string;
  fechaHoraSalida: string | null;
  tipo: string;
}

export interface ReporteHoras {
  nombreEmpleado: string;
  totalHoras: number;
  totalMinutos: number;
  tiempoFormateado: string;
}
export interface Usuario {
  id: string;
  dni: string;
  nombreCompleto: string;
  email: string;
  rol: 'ADMIN' | 'MANAGER' | 'USER';
  diasVacacionesAnuales: number;
  managerId: string | null;
  createdAt: string;
  activo: boolean;
}
export interface Delegacion {
  id: string;
  nombre: string;
  direccion: string;
}

export interface UsuarioRequest {
  dni: string;
  nombreCompleto: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'MANAGER' | 'USER';
  diasVacacionesAnuales?: number;
  delegacionId: string;
  managerId?: string | null;
}