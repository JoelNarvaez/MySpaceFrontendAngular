import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contacto',
  imports: [FormsModule, CommonModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class Contacto {
  // Double binding con ngModel para formulario template 
  nombre = '';
  email = '';
  mensaje = '';

  enviarMensaje() {
    if (!this.nombre || !this.email || !this.mensaje) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos',
        confirmButtonColor: '#0d9488'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: '¡Mensaje enviado!',
      text: 'Nos pondremos en contacto contigo pronto',
      confirmButtonColor: '#0d9488'
    });

    this.nombre = '';
    this.email = '';
    this.mensaje = '';
  }

calificacionSeleccionada = 0;
calificaciones: number[] = [5, 4, 5]; // inicial

calificar(n: number) {
  this.calificacionSeleccionada = n;
  this.calificaciones.push(n);
}

get promedio(): number {
  const total = this.calificaciones.reduce((a, b) => a + b, 0);
  return this.calificaciones.length ? total / this.calificaciones.length : 0;
}

mostrarMapa = false;
}

