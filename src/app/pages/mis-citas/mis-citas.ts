import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Auth } from '../../services/auth';
import { Citas } from '../../services/citas';
import { Cita } from '../../interfaces/cita';

@Component({
  selector: 'app-mis-citas',
  imports: [NgClass],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css'
})
export class MisCitas implements OnInit {
  private readonly testimoniosStorageKey = 'mis-citas-testimonios';
  private citasService = inject(Citas);
  private authService = inject(Auth);
  private cd = inject(ChangeDetectorRef);

  router = inject(Router);

  citas: Cita[] = [];
  cargando = true;
  testimoniosRegistrados: Record<number, string> = {};

  get citasProximas(): Cita[] {
    const hoy = this.obtenerFechaHoy();
    return this.citas
      .filter((cita) => this.obtenerClaveFecha(cita.fecha) >= hoy && cita.estado !== 'cancelada')
      .sort((a, b) => this.obtenerClaveOrden(a).localeCompare(this.obtenerClaveOrden(b)));
  }

  get citasPasadas(): Cita[] {
    const hoy = this.obtenerFechaHoy();
    return this.citas
      .filter((cita) => this.obtenerClaveFecha(cita.fecha) < hoy || cita.estado === 'cancelada')
      .sort((a, b) => this.obtenerClaveOrden(b).localeCompare(this.obtenerClaveOrden(a)));
  }

  get tieneCitas(): boolean {
    return this.citas.length > 0;
  }

  ngOnInit() {
    this.cargarTestimoniosRegistrados();

    const email = this.authService.usuario()?.email || '';

    this.citasService.getCitasPorUsuario(email).subscribe({
      next: (citas: Cita[]) => {
        // getCitasPorUsuario ya hace map(res => res.data) en el servicio,
        // así que aquí llega directamente el array de citas
        this.citas = citas ?? [];
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'No fue posible cargar tus citas',
          text: 'Intenta de nuevo en unos momentos.',
          confirmButtonColor: '#1E3A5F'
        });
      }
    });
  }

  cancelarCita(id: number) {
    const cita = this.citas.find((item) => item.id === id);

    Swal.fire({
      icon: 'warning',
      title: 'Cancelar cita',
      text: 'Indica el motivo de cancelacion para continuar.',
      input: 'textarea',
      inputLabel: 'Motivo de cancelacion',
      inputPlaceholder: 'Ej. Me surgio un compromiso y necesito reprogramar.',
      inputAttributes: {
        maxlength: '180'
      },
      showCancelButton: true,
      confirmButtonText: 'Si, cancelar',
      cancelButtonText: 'No, mantener',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#1E3A5F',
      inputValidator: (value) => {
        if (!value || value.trim().length < 8) {
          return 'Escribe un motivo de al menos 8 caracteres.';
        }
        return null;
      }
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }

      const motivoCancelacion = resultado.value.trim();

      this.citasService.cancelarCita(id, motivoCancelacion).subscribe({
        next: () => {
          this.citas = this.citas.map((item) =>
            item.id === id ? { ...item, estado: 'cancelada', motivo_cancelacion: motivoCancelacion } : item
          );
          this.cd.detectChanges();

          Swal.fire({
            icon: 'success',
            title: 'Cita cancelada',
            text: cita?.nombre_servicio
              ? `Se cancelo tu cita de ${cita.nombre_servicio}.`
              : 'Tu cita fue cancelada correctamente.',
            confirmButtonColor: '#1E3A5F'
          });
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cancelar la cita.',
            confirmButtonColor: '#1E3A5F'
          });
        }
      });
    });
  }

  puedeDejarResena(cita: Cita): boolean {
    return cita.estado === 'completada';
  }

  yaDejoResena(cita: Cita): boolean {
    return Boolean(this.testimoniosRegistrados[cita.id]);
  }

  dejarResena(cita: Cita) {
    if (this.yaDejoResena(cita)) {
      Swal.fire({
        icon: 'info',
        title: 'Resena ya enviada',
        text: 'Ya registraste un testimonio para esta cita.',
        confirmButtonColor: '#1E3A5F'
      });
      return;
    }

    Swal.fire({
      icon: 'question',
      title: 'Dejar resena',
      text: 'Comparte tu experiencia de esta visita.',
      input: 'textarea',
      inputLabel: cita.nombre_servicio || 'Servicio reservado',
      inputPlaceholder: 'Escribe tu opinion sobre la atencion, el ambiente o el resultado.',
      inputAttributes: {
        maxlength: '280'
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar resena',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#1E3A5F',
      cancelButtonColor: '#A3AAB7',
      inputValidator: (value) => {
        if (!value || value.trim().length < 12) {
          return 'Escribe una resena de al menos 12 caracteres.';
        }
        return null;
      }
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }

      this.testimoniosRegistrados[cita.id] = resultado.value.trim();
      this.guardarTestimoniosRegistrados();
      this.cd.detectChanges();

      Swal.fire({
        icon: 'success',
        title: 'Resena enviada',
        text: 'Gracias por compartir tu experiencia.',
        confirmButtonColor: '#1E3A5F'
      });
    });
  }

  obtenerMotivoCancelacion(cita: Cita): string {
    return cita.motivo_cancelacion?.trim() || 'Sin motivo registrado.';
  }

  formatearFecha(fecha: string): string {
    const fechaNormalizada = this.convertirFecha(fecha);

    if (!fechaNormalizada) {
      return 'Fecha no disponible';
    }

    return fechaNormalizada.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  formatearHora(hora: string): string {
    const [horaTexto, minutoTexto] = hora.split(':');
    const horaNumero = Number(horaTexto);
    const periodo = horaNumero >= 12 ? 'PM' : 'AM';
    const hora12 = horaNumero > 12 ? horaNumero - 12 : horaNumero === 0 ? 12 : horaNumero;
    return `${String(hora12).padStart(2, '0')}:${minutoTexto} ${periodo}`;
  }

  obtenerEstadoLabel(estado?: Cita['estado']): string {
    switch (estado) {
      case 'confirmada':
        return 'Confirmada';
      case 'cancelada':
        return 'Cancelada';
      case 'completada':
        return 'Completada';
      case 'no_asistio':
        return 'No asistio';
      default:
        return 'Pendiente';
    }
  }

  obtenerEstadoClase(estado?: Cita['estado']): string {
    switch (estado) {
      case 'confirmada':
        return 'status-chip--success';
      case 'cancelada':
        return 'status-chip--danger';
      case 'completada':
        return 'status-chip--neutral';
      case 'no_asistio':
        return 'status-chip--muted';
      default:
        return 'status-chip--pending';
    }
  }

  private cargarTestimoniosRegistrados() {
    const data = localStorage.getItem(this.testimoniosStorageKey);

    if (!data) {
      this.testimoniosRegistrados = {};
      return;
    }

    try {
      this.testimoniosRegistrados = JSON.parse(data) as Record<number, string>;
    } catch {
      this.testimoniosRegistrados = {};
    }
  }

  private guardarTestimoniosRegistrados() {
    localStorage.setItem(this.testimoniosStorageKey, JSON.stringify(this.testimoniosRegistrados));
  }

  private obtenerFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private obtenerClaveOrden(cita: Cita): string {
    return `${this.obtenerClaveFecha(cita.fecha)} ${cita.hora || ''}`;
  }

  private obtenerClaveFecha(fecha: string): string {
    const fechaNormalizada = this.convertirFecha(fecha);

    if (!fechaNormalizada) {
      return '';
    }

    const year = fechaNormalizada.getFullYear();
    const month = String(fechaNormalizada.getMonth() + 1).padStart(2, '0');
    const day = String(fechaNormalizada.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private convertirFecha(fecha: string): Date | null {
    if (!fecha) {
      return null;
    }

    const coincidenciaIso = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (coincidenciaIso) {
      const [, yearTexto, monthTexto, dayTexto] = coincidenciaIso;
      const year = Number(yearTexto);
      const month = Number(monthTexto);
      const day = Number(dayTexto);
      const fechaLocal = new Date(year, month - 1, day);

      if (!Number.isNaN(fechaLocal.getTime())) {
        return fechaLocal;
      }
    }

    const fechaParseada = new Date(fecha);
    return Number.isNaN(fechaParseada.getTime()) ? null : fechaParseada;
  }
}
