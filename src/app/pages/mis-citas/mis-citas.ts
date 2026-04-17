import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Citas } from '../../services/citas';
import { Cita } from '../../interfaces/cita';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';

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

  private cd = inject(ChangeDetectorRef);

  citas: Cita[] = [];
  cargando = true;

  get citasProximas(): Cita[] {
    const hoy = new Date().toISOString().split('T')[0];
    return this.citas.filter(c => c.fecha >= hoy && c.estado !== 'cancelada');
  }

  get citasPasadas(): Cita[] {
    const hoy = new Date().toISOString().split('T')[0];
    return this.citas.filter(c => c.fecha < hoy || c.estado === 'cancelada');
  }

  ngOnInit() {
    const email = this.authService.usuario()?.email || '';

    console.log("EMAIL:", email);

    this.citasService.getCitasPorUsuario(email).subscribe({
      next: (res: any) => {

        console.log("CITAS BACK:", res.data);
        
        this.citas = res.data;
        this.cargando = false;

        this.cd.detectChanges();
      },
      error: (err) => {
        
        console.log("ERROR CITAS:", err)

        this.cargando = false;
      }
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
            this.citas = this.citas.map(c =>
              c.id === id ? { ...c, estado: 'cancelada' } : c
            );
            this.cd.detectChanges();
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
