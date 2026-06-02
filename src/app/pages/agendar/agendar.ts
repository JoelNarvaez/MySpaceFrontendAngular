import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Horario } from '../../interfaces/horario';
import { Servicio } from '../../interfaces/servicio';
import { Auth } from '../../services/auth';
import { Citas } from '../../services/citas';
import { Servicios } from '../../services/servicios';
import { Bloqueos } from '../../services/bloqueos';

export function fechaFuturaValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const fecha = new Date(control.value + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fecha < hoy ? { fechaPasada: true } : null;
}

interface DiaCalendario {
  dia: number | null;
  fecha: Date | null;
  esHoy: boolean;
  esPasado: boolean;
  esBloqueado: boolean;
}

@Component({
  selector: 'app-agendar',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './agendar.html',
  styleUrl: './agendar.css'
})
export class Agendar implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private serviciosService = inject(Servicios);
  private citasService = inject(Citas);
  private bloqueosService = inject(Bloqueos);
  private authService = inject(Auth);
  private cd = inject(ChangeDetectorRef);

  // Bloqueos cargados del backend
  private diasSemanaBloquedos: number[] = [];   // 0=Dom, 1=Lun...
  private fechasEspecificasBloquedas: string[] = []; // 'YYYY-MM-DD'

  servicios: Servicio[] = [];
  horarios: Horario[] = [];
  cargandoHorarios = false;
  diaSeleccionado: Date | null = null;
  mesVista: Date = new Date();
  diasCalendario: DiaCalendario[] = [];
  visibleHorariosManana = 4;
  visibleHorariosMedioDia = 4;
  visibleHorariosTarde = 4;

  readonly diasSemana = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly mesesNombre = [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE'
  ];

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{3}\s?\d{3}\s?\d{4}$/)]],
    id_servicio: ['', Validators.required],
    fecha: ['', [Validators.required, fechaFuturaValidator]],
    hora: ['', Validators.required]
  });

  get nombre() {
    return this.form.get('nombre');
  }

  get email() {
    return this.form.get('email');
  }

  get telefono() {
    return this.form.get('telefono');
  }

  get id_servicio() {
    return this.form.get('id_servicio');
  }

  get fecha() {
    return this.form.get('fecha');
  }

  get hora() {
    return this.form.get('hora');
  }

  get mesNombre(): string {
    return `${this.mesesNombre[this.mesVista.getMonth()]} ${this.mesVista.getFullYear()}`;
  }

  get esMesActual(): boolean {
    const hoy = new Date();
    return this.mesVista.getFullYear() === hoy.getFullYear() && this.mesVista.getMonth() === hoy.getMonth();
  }

  get horariosOrdenados(): Horario[] {
    return [...this.horarios].sort((a, b) => a.hora.localeCompare(b.hora));
  }

  get horariosDisponibles(): Horario[] {
    return this.horariosOrdenados.filter((horario) => horario.disponible);
  }

  get horariosManana(): Horario[] {
    return this.horariosOrdenados.filter((horario) => this.obtenerHoraNumero(horario.hora) < 12);
  }

  get horariosMedioDia(): Horario[] {
    return this.horariosOrdenados.filter((horario) => {
      const hora = this.obtenerHoraNumero(horario.hora);
      return hora >= 12 && hora < 16;
    });
  }

  get horariosTarde(): Horario[] {
    return this.horariosOrdenados.filter((horario) => this.obtenerHoraNumero(horario.hora) >= 16);
  }

  get horariosMananaVisibles(): Horario[] {
    return this.horariosManana.slice(0, this.visibleHorariosManana);
  }

  get horariosMedioDiaVisibles(): Horario[] {
    return this.horariosMedioDia.slice(0, this.visibleHorariosMedioDia);
  }

  get horariosTardeVisibles(): Horario[] {
    return this.horariosTarde.slice(0, this.visibleHorariosTarde);
  }

  get hayMasHorariosManana(): boolean {
    return this.horariosManana.length > this.horariosMananaVisibles.length;
  }

  get puedeMostrarMenosManana(): boolean {
    return this.visibleHorariosManana > 4;
  }

  get hayMasHorariosMedioDia(): boolean {
    return this.horariosMedioDia.length > this.horariosMedioDiaVisibles.length;
  }

  get puedeMostrarMenosMedioDia(): boolean {
    return this.visibleHorariosMedioDia > 4;
  }

  get hayMasHorariosTarde(): boolean {
    return this.horariosTarde.length > this.horariosTardeVisibles.length;
  }

  get puedeMostrarMenosTarde(): boolean {
    return this.visibleHorariosTarde > 4;
  }

  get servicioSeleccionado(): Servicio | undefined {
    return this.servicios.find((servicio) => servicio.id === Number(this.id_servicio?.value));
  }

  get nombreDiaSeleccionado(): string {
    if (!this.diaSeleccionado) return '';
    return this.diaSeleccionado.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  get resumenHorariosTexto(): string {
    if (!this.diaSeleccionado) return 'Primero elige una fecha';
    if (!this.horariosDisponibles.length) return 'No hay horarios disponibles';
    return `${this.horariosDisponibles.length} horarios disponibles`;
  }

  get botonTexto(): string {
    const nombre = this.form.value.nombre?.trim().split(' ')[0] || '...';
    const servicio = this.servicioSeleccionado?.nombre || '...';
    const horaFormateada = this.form.value.hora ? this.formatHora(this.form.value.hora) : '...';
    const fechaFormateada = this.diaSeleccionado
      ? this.diaSeleccionado
          .toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
          .replace('.', '')
          .toUpperCase()
      : '...';

    return `CONFIRMAR EXPERIENCIA (${nombre}, ${fechaFormateada}, ${horaFormateada}, ${servicio})`;
  }

  get resumenTexto(): string {
    const partes = [
      this.form.value.nombre,
      this.form.value.email,
      this.diaSeleccionado
        ? this.diaSeleccionado.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
        : null,
      this.form.value.hora ? this.formatHora(this.form.value.hora) : null
    ].filter(Boolean);

    return partes.join(', ');
  }

  get precioServicio(): string {
    const precio = this.servicioSeleccionado?.precio;
    if (!precio) return '$X,XX';

    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  }

  formatHora(hora: string): string {
    const [horaTexto, minutoTexto] = hora.split(':');
    const horaNumero = Number(horaTexto);
    const periodo = horaNumero >= 12 ? 'PM' : 'AM';
    const hora12 = horaNumero > 12 ? horaNumero - 12 : horaNumero === 0 ? 12 : horaNumero;
    return `${String(hora12).padStart(2, '0')}:${minutoTexto} ${periodo}`;
  }

  ngOnInit() {
    // Primero cargar bloqueos para que el calendario los refleje
    this.bloqueosService.getBloqueoPublico().subscribe({
      next: (bloqueos) => {
        this.diasSemanaBloquedos = bloqueos
          .filter(b => b.dia_semana !== null && b.dia_semana !== undefined)
          .map(b => b.dia_semana as number);

        this.fechasEspecificasBloquedas = bloqueos
          .filter(b => b.fecha)
          .map(b => {
            // MySQL puede devolver la fecha como Date object; normalizamos a YYYY-MM-DD
            const f = b.fecha as string;
            return f.substring(0, 10);
          });

        this.generarCalendario();
        this.cd.detectChanges();
      },
      error: () => {
        // Si falla la carga de bloqueos, el calendario igual funciona (sin restricciones)
        this.generarCalendario();
      }
    });

    this.serviciosService.getServicios().subscribe((data) => {
      this.servicios = data;
      this.cd.detectChanges();
    });

    const usuario = this.authService.usuario();
    if (usuario) {
      this.form.patchValue({
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: this.formatearTelefono(usuario.telefono || '')
      });
    }

    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('idServicio');
      if (id) {
        this.form.patchValue({ id_servicio: id });
        this.cd.detectChanges();
      }
    });
  }

  generarCalendario() {
    const year = this.mesVista.getFullYear();
    const month = this.mesVista.getMonth();
    const primerDia = new Date(year, month, 1).getDay();
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    this.diasCalendario = [];

    for (let indice = 0; indice < primerDia; indice++) {
      this.diasCalendario.push({ dia: null, fecha: null, esHoy: false, esPasado: true, esBloqueado: false });
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(year, month, dia);
      fecha.setHours(0, 0, 0, 0);

      // Verificar si el día está bloqueado
      const diaSemana = fecha.getDay(); // 0=Dom, 1=Lun...
      const fechaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const esBloqueado =
        this.diasSemanaBloquedos.includes(diaSemana) ||
        this.fechasEspecificasBloquedas.includes(fechaStr);

      this.diasCalendario.push({
        dia,
        fecha,
        esHoy: fecha.getTime() === hoy.getTime(),
        esPasado: fecha.getTime() < hoy.getTime(),
        esBloqueado
      });
    }
  }

  anteriorMes() {
    if (this.esMesActual) return;
    this.mesVista = new Date(this.mesVista.getFullYear(), this.mesVista.getMonth() - 1, 1);
    this.generarCalendario();
  }

  siguienteMes() {
    this.mesVista = new Date(this.mesVista.getFullYear(), this.mesVista.getMonth() + 1, 1);
    this.generarCalendario();
  }

  esDiaSeleccionado(celda: DiaCalendario): boolean {
    if (!celda.fecha || !this.diaSeleccionado) return false;
    return celda.fecha.getTime() === this.diaSeleccionado.getTime();
  }

  seleccionarDia(celda: DiaCalendario) {
    if (!celda.fecha || celda.esPasado || celda.esBloqueado) return;
    if (!this.id_servicio?.value) {
      Swal.fire({
        icon: 'info',
        title: 'Selecciona un servicio',
        text: 'Primero elige el servicio deseado antes de escoger una fecha.',
        confirmButtonColor: '#1E3A5F'
      });
      return;
    }

    const fechaNormalizada = new Date(celda.fecha);
    fechaNormalizada.setHours(0, 0, 0, 0);
    this.diaSeleccionado = fechaNormalizada;
    this.resetVisibilidadHorarios();
    this.form.patchValue({ hora: '' });

    const year = fechaNormalizada.getFullYear();
    const month = String(fechaNormalizada.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaNormalizada.getDate()).padStart(2, '0');
    this.form.patchValue({ fecha: `${year}-${month}-${dia}` });

    this.cargarHorarios();
  }

  onServicioChange() {
    this.form.patchValue({ hora: '' });
    this.resetVisibilidadHorarios();
    this.horarios = [];

    if (this.id_servicio?.value && this.fecha?.value) {
      this.cargarHorarios();
    }
  }

  onTelefonoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const valorFormateado = this.formatearTelefono(input.value);
    this.form.patchValue({ telefono: valorFormateado }, { emitEvent: false });
  }

  mostrarMasHorarios(seccion: 'manana' | 'medioDia' | 'tarde') {
    if (seccion === 'manana') {
      this.visibleHorariosManana += 4;
      return;
    }

    if (seccion === 'medioDia') {
      this.visibleHorariosMedioDia += 4;
      return;
    }

    this.visibleHorariosTarde += 4;
  }

  mostrarMenosHorarios(seccion: 'manana' | 'medioDia' | 'tarde') {
    if (seccion === 'manana') {
      this.visibleHorariosManana = 4;
      return;
    }

    if (seccion === 'medioDia') {
      this.visibleHorariosMedioDia = 4;
      return;
    }

    this.visibleHorariosTarde = 4;
  }

  seleccionarHora(horario: Horario) {
    if (!horario.disponible) return;
    this.form.patchValue({ hora: horario.hora });
    this.cd.detectChanges();
  }

  guardarCita() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Completa todos los campos correctamente.',
        confirmButtonColor: '#1E3A5F'
      });
      return;
    }

    const { nombre, email, telefono, id_servicio, fecha, hora } = this.form.value;

    this.citasService
      .crearCita({
        nombre_cliente: nombre!,
        email: email!,
        telefono: this.normalizarTelefono(telefono || ''),
        id_servicio: Number(id_servicio),
        fecha: fecha!,
        hora: hora!
      })
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Cita agendada',
            text: 'Tu cita fue registrada correctamente.',
            confirmButtonColor: '#1E3A5F'
          }).then(() =>
            this.router.navigate(['/confirmacion'], {
              state: { nombre, servicio: this.servicioSeleccionado?.nombre, fecha, hora }
            })
          );
        },
        error: (err) => {
          if (err.status === 401) {
            Swal.fire({
              icon: 'warning',
              title: 'Sesion expirada',
              text: 'Inicia sesion nuevamente.',
              confirmButtonColor: '#1E3A5F'
            }).then(() => this.router.navigate(['/login']));
            return;
          }

          if (err.status === 409) {
            this.form.patchValue({ hora: '' });
            this.cargarHorarios();

            Swal.fire({
              icon: 'error',
              title: 'Horario no disponible',
              text: 'Ese horario ya no esta libre. Actualizamos los horarios para que elijas otro.',
              confirmButtonColor: '#1E3A5F'
            });
            return;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo agendar la cita, intenta de nuevo.',
            confirmButtonColor: '#1E3A5F'
          });
        }
      });
  }

  private cargarHorarios() {
    const fecha = this.form.value.fecha;
    const idServicio = this.form.value.id_servicio;
    if (!fecha || !idServicio) return;

    this.cargandoHorarios = true;
    this.citasService.getHorariosDisponibles(fecha, Number(idServicio)).subscribe({
      next: (respuesta: any) => {
        this.horarios = respuesta.data || [];

        const horaSeleccionada = this.form.value.hora;
        if (horaSeleccionada && !this.horarios.some((horario) => horario.hora === horaSeleccionada && horario.disponible)) {
          this.form.patchValue({ hora: '' }, { emitEvent: false });
        }

        this.resetVisibilidadHorarios();
        this.cargandoHorarios = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.horarios = [];
        this.cargandoHorarios = false;
        this.cd.detectChanges();
      }
    });
  }

  private resetVisibilidadHorarios() {
    this.visibleHorariosManana = 4;
    this.visibleHorariosMedioDia = 4;
    this.visibleHorariosTarde = 4;
  }

  private obtenerHoraNumero(hora: string): number {
    return Number(hora.split(':')[0]);
  }

  private normalizarTelefono(telefono: string): string {
    return telefono.replace(/\D/g, '').slice(0, 10);
  }

  private formatearTelefono(telefono: string): string {
    const digitos = this.normalizarTelefono(telefono);
    const bloques = [digitos.slice(0, 3), digitos.slice(3, 6), digitos.slice(6, 10)].filter(Boolean);
    return bloques.join(' ');
  }
}
