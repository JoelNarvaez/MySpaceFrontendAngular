import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AdminCalendario } from './admin-calendario';
import { Citas } from '../../../services/citas';
import { Cita } from '../../../interfaces/cita';

// ─────────────────────────────────────────────────────────────────────────────
// TDD — Componente AdminCalendario
// Panel de administración: visualización y gestión de citas del spa
// ─────────────────────────────────────────────────────────────────────────────

// Data 
const mockCitas: Cita[] = [
  {
    id: 1,
    nombre_cliente: 'Ana Rosales',
    email: 'ana@correo.com',
    telefono: '4491234567',
    id_servicio: 1,
    nombre_servicio: 'Masaje relajante',
    fecha: '2026-06-10',
    hora: '10:00',
    estado: 'confirmada'
  },
  {
    id: 2,
    nombre_cliente: 'Luis García',
    email: 'luis@correo.com',
    telefono: '4497654321',
    id_servicio: 2,
    nombre_servicio: 'Facial hidratante',
    fecha: '2026-06-10',
    hora: '12:00',
    estado: 'pendiente'
  },
  {
    id: 3,
    nombre_cliente: 'María López',
    email: 'maria@correo.com',
    telefono: '4499876543',
    id_servicio: 3,
    nombre_servicio: 'Aromaterapia',
    fecha: '2026-06-15',
    hora: '11:00',
    estado: 'cancelada'
  }
];

// Datos del servicio Citas 
const mockCitasService = {
  getCitasAdmin: vi.fn().mockReturnValue(of(mockCitas)),
  cancelarCita: vi.fn().mockReturnValue(of({ success: true }))
};

describe('AdminCalendario — TDD Panel Admin', () => {
  let component: AdminCalendario;
  let fixture: ComponentFixture<AdminCalendario>;

  // Configuración inicial 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminCalendario,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
      ],
      providers: [
        { provide: Citas, useValue: mockCitasService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCalendario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  //  SECCIÓN 1: Creación del componente 
  describe('Inicialización', () => {

    it('debe crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializar sin fecha seleccionada', () => {
      expect(component.fechaSeleccionada()).toBe('');
    });

    it('debe inicializar el signal de error en false', () => {
      expect(component.error()).toBeFalsy();
    });

  });

  // SECCIÓN 2: Carga de citas desde el backend 
  // RED: queremos que el componente cargue citas al iniciar
  // GREEN: ngOnInit llama a cargarCitas() que llama al servicio
  describe('Carga de citas', () => {

    it('debe llamar a getCitasAdmin al inicializar', () => {
      component.ngOnInit();
      expect(mockCitasService.getCitasAdmin).toHaveBeenCalled();
    });

    it('debe cargar las citas correctamente en el signal', () => {
      component.cargarCitas();
      expect(component.citas().length).toBe(3);
    });

    it('debe poner cargando en false después de cargar', () => {
      component.cargarCitas();
      expect(component.cargando()).toBeFalsy();
    });

    it('debe manejar error del backend correctamente', () => {
      // Simulamos que el backend falla
      mockCitasService.getCitasAdmin.mockReturnValueOnce(
        throwError(() => new Error('Error de red'))
      );
      component.cargarCitas();
      expect(component.error()).toBeTruthy();
      expect(component.cargando()).toBeFalsy();
    });

    it('debe manejar respuesta vacía del backend sin errores', () => {
      mockCitasService.getCitasAdmin.mockReturnValueOnce(of([]));
      component.cargarCitas();
      expect(component.citas().length).toBe(0);
      expect(component.error()).toBeFalsy();
    });

  });

  // SECCIÓN 3: Filtrado por fecha
  // RED: queremos que el filtro muestre solo las citas de la fecha elegida
  // GREEN: el computed citasFiltradas filtra por fechaSeleccionada
  describe('Filtrado por fecha', () => {

    beforeEach(() => {
      component.cargarCitas();
    });

    it('debe mostrar todas las citas cuando no hay fecha seleccionada', () => {
      component.limpiarFecha();
      expect(component.citasFiltradas().length).toBe(3);
    });

    it('debe filtrar correctamente por fecha específica', () => {
      component.setFecha('2026-06-10');
      expect(component.citasFiltradas().length).toBe(2);
    });

    it('debe devolver cero citas si no hay ninguna en esa fecha', () => {
      component.setFecha('2099-01-01');
      expect(component.citasFiltradas().length).toBe(0);
    });

    it('debe actualizar el signal fechaSeleccionada con setFecha', () => {
      component.setFecha('2026-06-15');
      expect(component.fechaSeleccionada()).toBe('2026-06-15');
    });

    it('debe limpiar la fecha seleccionada con limpiarFecha', () => {
      component.setFecha('2026-06-10');
      component.limpiarFecha();
      expect(component.fechaSeleccionada()).toBe('');
    });

  });

  // SECCIÓN 4: Helpers de formato y estado
  // RED: queremos que la hora y el estado se muestren con formato correcto
  // GREEN: los métodos formatoHora y estadoLabel formatean los valores
  describe('Helpers de formato', () => {

    it('debe formatear la hora correctamente (HH:MM)', () => {
      expect(component.formatoHora('10:00:00')).toBe('10:00');
    });

    it('debe devolver guión si la hora está vacía', () => {
      expect(component.formatoHora('')).toBe('—');
    });

    it('debe devolver la etiqueta correcta para estado confirmada', () => {
      expect(component.estadoLabel('confirmada')).toBe('Confirmada');
    });

    it('debe devolver la etiqueta correcta para estado cancelada', () => {
      expect(component.estadoLabel('cancelada')).toBe('Cancelada');
    });

    it('debe devolver la etiqueta correcta para estado completada', () => {
      expect(component.estadoLabel('completada')).toBe('Completada');
    });

    it('debe devolver Pendiente para estado undefined', () => {
      expect(component.estadoLabel(undefined)).toBe('Pendiente');
    });

  });

  // SECCIÓN 5: Computed citasFiltradas
  // RED: queremos que citasFiltradas sea reactivo a cambios en signals
  // GREEN: computed recalcula automáticamente cuando cambian sus dependencias
  describe('Computed citasFiltradas', () => {

    it('debe recalcularse automáticamente al cambiar la fecha', () => {
      component.citas.set(mockCitas);

      component.setFecha('2026-06-10');
      const cantidad1 = component.citasFiltradas().length;

      component.setFecha('2026-06-15');
      const cantidad2 = component.citasFiltradas().length;

      expect(cantidad1).not.toBe(cantidad2);
    });

    it('debe contener los datos correctos de la cita filtrada', () => {
      component.citas.set(mockCitas);
      component.setFecha('2026-06-15');

      const cita = component.citasFiltradas()[0];
      expect(cita.nombre_cliente).toBe('María López');
      expect(cita.nombre_servicio).toBe('Aromaterapia');
    });

  });

});
