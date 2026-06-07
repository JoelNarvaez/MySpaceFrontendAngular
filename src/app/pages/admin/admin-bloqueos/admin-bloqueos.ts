import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

import { Bloqueos } from '../../../services/bloqueos';
import { Bloqueo } from '../../../interfaces/bloqueo';

@Component({
  selector: 'app-admin-bloqueos',
  imports: [ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './admin-bloqueos.html',
  styleUrl: './admin-bloqueos.css',
})
export class AdminBloqueos implements OnInit {
  private bloqueosService = inject(Bloqueos);
  private fb = inject(FormBuilder);

  // ── Signals ────────────────────────────────────────────────────────────────
  bloqueos          = signal<Bloqueo[]>([]);
  festivosSeleccionados = signal<string[]>([]);
  bloqueandoFestivos = signal(false);

  // ── Días de la semana ──────────────────────────────────────────────────────
  diasSemana = [
    { valor: 1, nombre: 'Lunes' },
    { valor: 2, nombre: 'Martes' },
    { valor: 3, nombre: 'Miércoles' },
    { valor: 4, nombre: 'Jueves' },
    { valor: 5, nombre: 'Viernes' },
    { valor: 6, nombre: 'Sábado' },
    { valor: 0, nombre: 'Domingo' },
  ];

  // ── Festivos oficiales México 2026-2027 (lista fija) ───────────────────────
  festivos = [
    { fecha: '2026-09-16', nombre: 'Independencia de México' },
    { fecha: '2026-11-16', nombre: 'Revolución Mexicana' },
    { fecha: '2026-12-25', nombre: 'Navidad' },
    { fecha: '2027-01-01', nombre: 'Año Nuevo' },
    { fecha: '2027-02-01', nombre: 'Día de la Constitución' },
    { fecha: '2027-03-15', nombre: 'Natalicio de Benito Juárez' },
    { fecha: '2027-05-01', nombre: 'Día del Trabajo' },
    { fecha: '2027-09-16', nombre: 'Independencia de México' },
    { fecha: '2027-11-15', nombre: 'Revolución Mexicana' },
    { fecha: '2027-12-25', nombre: 'Navidad' },
  ];

  // ── Formulario personalizado ───────────────────────────────────────────────
  form = this.fb.group({
    tipo:        ['dia', [Validators.required]],
    fecha:       [''],
    dia_semana:  [null as number | null],
    hora_inicio: [''],
    hora_fin:    [''],
    motivo:      ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
  });

  get tipo()        { return this.form.get('tipo'); }
  get fecha()       { return this.form.get('fecha'); }
  get hora_inicio() { return this.form.get('hora_inicio'); }
  get hora_fin()    { return this.form.get('hora_fin'); }
  get motivo()      { return this.form.get('motivo'); }

  ngOnInit() {
    this.cargarBloqueos();
    this.aplicarValidacionCondicional();
  }

  private aplicarValidacionCondicional() {
    this.form.get('tipo')?.valueChanges.subscribe(tipo => {
      const fecha       = this.form.get('fecha');
      const dia_semana  = this.form.get('dia_semana');
      const hora_inicio = this.form.get('hora_inicio');
      const hora_fin    = this.form.get('hora_fin');

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
    this.bloqueosService.getBloqueos().subscribe({
      next: (data) => this.bloqueos.set(data ?? []),
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los bloqueos', confirmButtonColor: '#0d9488' })
    });
  }

  // ── Bloqueo rápido por día de semana ───────────────────────────────────────
  bloqueoRapidoDia(diaSemana: number, nombre: string) {
    Swal.fire({
      title: `¿Bloquear todos los ${nombre}?`,
      text: `Nadie podrá agendar citas los ${nombre}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, bloquear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#0d9488',
    }).then(result => {
      if (!result.isConfirmed) return;
      this.bloqueosService.crearBloqueo({
        tipo: 'dia',
        dia_semana: diaSemana,
        motivo: `${nombre} — día de descanso`,
      }).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: `¡${nombre} bloqueados!`, showConfirmButton: false, timer: 1500 });
          this.cargarBloqueos();
        },
        error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el bloqueo', confirmButtonColor: '#0d9488' })
      });
    });
  }

  // ── Festivos ───────────────────────────────────────────────────────────────
  toggleFestivo(fecha: string) {
    const actual = this.festivosSeleccionados();
    const idx = actual.indexOf(fecha);
    if (idx === -1) {
      this.festivosSeleccionados.set([...actual, fecha]);
    } else {
      this.festivosSeleccionados.set(actual.filter(f => f !== fecha));
    }
  }

  esFestivoSeleccionado(fecha: string): boolean {
    return this.festivosSeleccionados().includes(fecha);
  }

  bloquearFestivosSeleccionados() {
    const seleccionados = this.festivosSeleccionados();
    if (seleccionados.length === 0) return;

    const peticiones = seleccionados.map(fecha => {
      const festivo = this.festivos.find(f => f.fecha === fecha);
      return this.bloqueosService.crearBloqueo({
        tipo: 'dia',
        fecha,
        motivo: festivo?.nombre ?? 'Día festivo',
      });
    });

    this.bloqueandoFestivos.set(true);
    forkJoin(peticiones).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: `¡${seleccionados.length} día(s) bloqueados!`, showConfirmButton: false, timer: 1500 });
        this.festivosSeleccionados.set([]);
        this.cargarBloqueos();
        this.bloqueandoFestivos.set(false);
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Algunos bloqueos no se pudieron guardar', confirmButtonColor: '#0d9488' });
        this.bloqueandoFestivos.set(false);
      }
    });
  }

  // ── Formulario personalizado ───────────────────────────────────────────────
  guardarBloqueo() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.value;
    const tipo  = valor.tipo as 'dia' | 'horario';

    if (tipo === 'dia' && !valor.fecha && valor.dia_semana === null) {
      Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Debes indicar una fecha específica o un día de la semana', confirmButtonColor: '#0d9488' });
      return;
    }

    const bloqueo: Omit<Bloqueo, 'id'> = {
      tipo,
      motivo:      valor.motivo!,
      fecha:       valor.fecha       || undefined,
      dia_semana:  valor.dia_semana  ?? undefined,
      hora_inicio: valor.hora_inicio || undefined,
      hora_fin:    valor.hora_fin    || undefined,
    };

    this.bloqueosService.crearBloqueo(bloqueo).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: '¡Bloqueo guardado!', showConfirmButton: false, timer: 1500 });
        this.form.reset({ tipo: 'dia' });
        this.cargarBloqueos();
      },
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el bloqueo', confirmButtonColor: '#0d9488' })
    });
  }

  // ── Eliminar ───────────────────────────────────────────────────────────────
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
      if (!result.isConfirmed) return;
      this.bloqueosService.eliminarBloqueo(id).subscribe({
        next: () => {
          this.bloqueos.update(lista => lista.filter(b => b.id !== id));
          Swal.fire({ icon: 'success', title: 'Bloqueo eliminado', showConfirmButton: false, timer: 1500 });
        },
        error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el bloqueo', confirmButtonColor: '#0d9488' })
      });
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  nombreDia(num?: number): string {
    if (num === undefined || num === null) return '';
    return this.diasSemana.find(d => d.valor === num)?.nombre ?? '';
  }

  // Formatea "2026-06-22T06:00:00.000Z" → "lunes, 22 de junio de 2026"
  formatoFecha(fecha: string): string {
    if (!fecha) return '—';
    const solo = fecha.substring(0, 10); // YYYY-MM-DD
    const [y, m, d] = solo.split('-').map(Number);
    const date = new Date(y, m - 1, d); // hora local, sin desfase UTC
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day:     'numeric',
      month:   'long',
      year:    'numeric'
    });
  }
}
