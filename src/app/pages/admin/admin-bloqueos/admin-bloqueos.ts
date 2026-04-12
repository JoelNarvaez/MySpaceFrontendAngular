import { Component, inject, OnInit } from '@angular/core';
import { Bloqueos } from '../../../services/bloqueos';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Bloqueo } from '../../../interfaces/bloqueo';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-bloqueos',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './admin-bloqueos.html',
  styleUrl: './admin-bloqueos.css',
})
export class AdminBloqueos implements OnInit {
  private bloqueosService = inject(Bloqueos);
  private fb = inject(FormBuilder);

  bloqueos: Bloqueo[] = [];

  form = this.fb.group({
    tipo: ['dia', [Validators.required]],
    fecha: [''],
    dia_semana: [null],
    hora: [''],
    motivo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
  });

  get tipo() { return this.form.get('tipo'); }
  get fecha() { return this.form.get('fecha'); }
  get motivo() { return this.form.get('motivo'); }

  ngOnInit() {
    this.cargarBloqueos();
  }

  cargarBloqueos() {
    this.bloqueosService.getBloqueos().subscribe(data => {
      this.bloqueos = data;
    });
  }

  guardarBloqueo() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.bloqueosService.crearBloqueo(this.form.value as any).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Bloqueo guardado!',
          showConfirmButton: false,
          timer: 1500
        });
        this.form.reset({ tipo: 'dia' });
        this.cargarBloqueos();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar el bloqueo',
          confirmButtonColor: '#0d9488'
        });
      }
    });
  }

  eliminarBloqueo(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar bloqueo?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#0d9488'
    }).then(result => {
      if (result.isConfirmed) {
        this.bloqueosService.eliminarBloqueo(id).subscribe({
          next: () => {
            this.bloqueos = this.bloqueos.filter(b => b.id !== id);
            Swal.fire({
              icon: 'success',
              title: 'Bloqueo eliminado',
              showConfirmButton: false,
              timer: 1500
            });
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el bloqueo',
              confirmButtonColor: '#0d9488'
            });
          }
        });
      }
    });
  }

  diasSemana = [
    { valor: 0, nombre: 'Domingo' },
    { valor: 1, nombre: 'Lunes' },
    { valor: 2, nombre: 'Martes' },
    { valor: 3, nombre: 'Miércoles' },
    { valor: 4, nombre: 'Jueves' },
    { valor: 5, nombre: 'Viernes' },
    { valor: 6, nombre: 'Sábado' }
  ];
}
