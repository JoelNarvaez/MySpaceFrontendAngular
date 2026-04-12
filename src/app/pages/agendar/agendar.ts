import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Servicios } from '../../services/servicios';
import { Citas } from '../../services/citas';
import { Servicio } from '../../interfaces/servicio';
import { Horario } from '../../interfaces/horario';
import { SelectorHorario } from '../../components/selector-horario/selector-horario';
import Swal from 'sweetalert2';

// Validador personalizado APORTACIÓN EXTRA 
export function fechaFuturaValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const fecha = new Date(control.value);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fecha < hoy ? { fechaPasada: true } : null;
}

@Component({
  selector: 'app-agendar',
  imports: [ReactiveFormsModule, SelectorHorario],
  templateUrl: './agendar.html',
  styleUrl: './agendar.css'
})
export class Agendar implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private serviciosService = inject(Servicios);
  private citasService = inject(Citas);

  servicios: Servicio[] = [];
  horarios: Horario[] = [];
  cargandoHorarios = false;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    id_servicio: ['', [Validators.required]],
    fecha: ['', [Validators.required, fechaFuturaValidator]],
    hora: ['', [Validators.required]]
  });

  get nombre() { return this.form.get('nombre'); }
  get email() { return this.form.get('email'); }
  get telefono() { return this.form.get('telefono'); }
  get id_servicio() { return this.form.get('id_servicio'); }
  get fecha() { return this.form.get('fecha'); }
  get hora() { return this.form.get('hora'); }

  ngOnInit() {
    // Cargar servicios
    this.serviciosService.getServicios().subscribe(data => {
      this.servicios = data;
    });

    // queryParams si viene del detalle de servicio 
    this.route.queryParamMap.subscribe(params => {
      const idServicio = params.get('idServicio');
      if (idServicio) {
        this.form.patchValue({ id_servicio: idServicio });
        this.cargarHorarios();
      }
    });
  }

  cargarHorarios() {
    const fecha = this.form.value.fecha;
    const idServicio = this.form.value.id_servicio;

    if (!fecha || !idServicio) return;

    this.cargandoHorarios = true;
    this.citasService.getHorariosDisponibles(fecha, Number(idServicio)).subscribe(data => {
      this.horarios = data;
      this.cargandoHorarios = false;
    });
  }

  onHorarioSeleccionado(hora: string) {
    this.form.patchValue({ hora });
  }

  guardarCita() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos correctamente',
        confirmButtonColor: '#0d9488'
      });
      return;
    }

    const { nombre, email, telefono, id_servicio, fecha, hora } = this.form.value;

    this.citasService.crearCita({
      nombre_cliente: nombre!,
      email: email!,
      telefono: telefono!,
      id_servicio: Number(id_servicio),
      fecha: fecha!,
      hora: hora!
    }).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: '¡Cita agendada!',
          text: 'Tu cita fue registrada correctamente',
          confirmButtonColor: '#0d9488'
        }).then(() => {
          this.router.navigate(['/confirmacion'], {
            queryParams: {
              nombre: nombre,
              servicio: this.servicios.find(s => s.id === Number(id_servicio))?.nombre,
              fecha: fecha,
              hora: hora
            }
          });
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo agendar la cita, intenta de nuevo',
          confirmButtonColor: '#0d9488'
        });
      }
    });
  }
}