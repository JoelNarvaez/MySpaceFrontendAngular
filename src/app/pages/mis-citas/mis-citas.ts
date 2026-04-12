import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Citas } from '../../services/citas';
import { Cita } from '../../interfaces/cita';
import Swal from 'sweetalert2';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-mis-citas',
  imports: [],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css'
})
export class MisCitas implements OnInit {
  private citasService = inject(Citas);
  private authService = inject(Auth);
  router = inject(Router);

  citas: Cita[] = [];

  ngOnInit() {
    const email = this.authService.usuario()?.email || '';
    this.citasService.getCitasPorUsuario(email).subscribe(data => {
      this.citas = data;
    });
  }

  cancelarCita(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '¿Cancelar cita?',
      text: 'Esta acción no se puede deshacer',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#0d9488'
    }).then(result => {
      if (result.isConfirmed) {
        this.citasService.cancelarCita(id).subscribe({
          next: () => {
            this.citas = this.citas.filter(c => c.id !== id);
            Swal.fire({
              icon: 'success',
              title: 'Cita cancelada',
              showConfirmButton: false,
              timer: 1500
            });
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo cancelar la cita',
              confirmButtonColor: '#0d9488'
            });
          }
        });
      }
    });
  }
}