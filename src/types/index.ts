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
