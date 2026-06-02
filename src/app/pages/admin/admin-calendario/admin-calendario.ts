import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { Citas } from '../../../services/citas';
import { Cita } from '../../../interfaces/cita';

@Component({
  selector: 'app-admin-calendario',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-calendario.html',
  styleUrl: './admin-calendario.css'
})
export class AdminCalendario implements OnInit {
  private citasService = inject(Citas);

  //  Signals (se actualizan reactivamente en el template) 
  citas   = signal<Cita[]>([]);
  cargando = signal(true);
  error    = signal(false);
  fechaSeleccionada = signal('');

  citasFiltradas = computed(() => {
    const fecha = this.fechaSeleccionada();
    if (!fecha) return this.citas();
    // MySQL puede devolver "2026-05-29T00:00:00.000Z" → tomamos solo los primeros 10 chars
    return this.citas().filter(c => (c.fecha ?? '').substring(0, 10) === fecha);
  });

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    this.cargando.set(true);
    this.error.set(false);
    this.citasService.getCitasAdmin().subscribe({
      next: (data) => {
        this.citas.set(data ?? []);
        this.cargando.set(false);
      },
     error: () => {
        this.error.set(true);
        this.cargando.set(false);
      }
    });
  }

  cancelarCita(id: number) {
    Swal.fire({
      title: '¿Cancelar esta cita?',
      input: 'text',
      inputLabel: 'Motivo de cancelación',
      inputPlaceholder: 'Escribe el motivo (mínimo 8 caracteres)...',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#0d9488',
      inputValidator: (value) => {
        if (!value || value.trim().length < 8) {
          return 'El motivo debe tener al menos 8 caracteres';
        }
        return null;
      }
    }).then(result => {
      if (result.isConfirmed) {
        this.citasService.cancelarCita(id, result.value).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Cita cancelada', showConfirmButton: false, timer: 1500 });
            this.cargarCitas();
          },
          error: () => {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cancelar la cita', confirmButtonColor: '#0d9488' });
          }
        });
      }
    });
  }

  limpiarFecha() {
    this.fechaSeleccionada.set('');
  }

  setFecha(valor: string) {
    this.fechaSeleccionada.set(valor);
  }

  formatoHora(hora: string): string {
    return hora ? hora.substring(0, 5) : '—';
  }

  formatoFecha(fecha: string): string {
    if (!fecha) return '—';
    // Tomar solo YYYY-MM-DD para evitar desfase de zona horaria con UTC
    const solo = fecha.substring(0, 10);
    const [y, m, d] = solo.split('-').map(Number);
    // Construir fecha local (sin conversión UTC → local)
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day:     'numeric',
      month:   'long',
      year:    'numeric'
    });
  }


  estadoClase(estado?: string): string {
    switch (estado) {
      case 'confirmada':  return 'bg-green-100 text-green-700';
      case 'cancelada':   return 'bg-red-100 text-red-600';
      case 'completada':  return 'bg-blue-100 text-blue-700';
      case 'no_asistio':  return 'bg-gray-100 text-gray-500';
      default:            return 'bg-amber-100 text-amber-700';
    }
  }

  estadoLabel(estado?: string): string {
    switch (estado) {
      case 'confirmada':  return 'Confirmada';
      case 'cancelada':   return 'Cancelada';
      case 'completada':  return 'Completada';
      case 'no_asistio':  return 'No asistió';
      default:            return 'Pendiente';
    }
  }
}