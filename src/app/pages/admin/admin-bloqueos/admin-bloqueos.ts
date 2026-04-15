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
    dia_semana: [null as number | null],
    hora_inicio: [''],
    hora_fin: [''],
    motivo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
  });

  get tipo() { return this.form.get('tipo'); }
  get fecha() { return this.form.get('fecha'); }
  get hora_inicio() { return this.form.get('hora_inicio'); }
  get hora_fin() { return this.form.get('hora_fin'); }
  get motivo() { return this.form.get('motivo'); }

  ngOnInit() {
    this.cargarBloqueos();
    this.aplicarValidacionCondicional();
  }

  private aplicarValidacionCondicional() {
    this.form.get('tipo')?.valueChanges.subscribe(tipo => {
      const fecha = this.form.get('fecha');
      const dia_semana = this.form.get('dia_semana');
      const hora_inicio = this.form.get('hora_inicio');
      const hora_fin = this.form.get('hora_fin');

      fecha?.clearValidators();
      dia_semana?.clearValidators();
      hora_inicio?.clearValidators();
      hora_fin?.clearValidators();

      if (tipo === 'horario') {
        hora_inicio?.setValidators(Validators.required);
        hora_fin?.setValidators(Validators.required);
      }

      fecha?.updateValueAndValidity();
      dia_semana?.updateValueAndValidity();
      hora_inicio?.updateValueAndValidity();
      hora_fin?.updateValueAndValidity();

      this.form.patchValue({ fecha: '', dia_semana: null, hora_inicio: '', hora_fin: '' });
    });
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

    const valor = this.form.value;
    const tipo = valor.tipo as 'dia' | 'horario';

    if (tipo === 'dia' && !valor.fecha && valor.dia_semana === null) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Debes indicar una fecha específica o un día de la semana',
        confirmButtonColor: '#0d9488'
      });
      return;
    }

    const bloqueo: Omit<Bloqueo, 'id'> = {
      tipo,
      motivo: valor.motivo!,
      fecha: valor.fecha || undefined,
      dia_semana: valor.dia_semana ?? undefined,
      hora_inicio: valor.hora_inicio || undefined,
      hora_fin: valor.hora_fin || undefined,
    };

    this.bloqueosService.crearBloqueo(bloqueo).subscribe({
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
