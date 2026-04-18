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

  ngOnInit() {
    const emailUsuario = localStorage.getItem('usuario') 
      ? JSON.parse(localStorage.getItem('usuario')!).email 
      : null;

    if (emailUsuario) {
      const calificacionGuardada = localStorage.getItem(`calificacion_${emailUsuario}`);
      if (calificacionGuardada) { //Verificar si ya hay una calificación de la página
        this.yaCalifico = true;
        this.calificacionSeleccionada = Number(calificacionGuardada);
      }
    } else {  
      // Si no hay sesión, resetea las estrellas
      this.yaCalifico = false;
      this.calificacionSeleccionada = 0;
    }
}

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

// Escala de calificaciones
yaCalifico = false;
calificacionSeleccionada = 0;
calificaciones: number[] = [5, 4, 5]; // inicial
estrellaHover = 0;

/*calificar(n: number) {
  this.calificacionSeleccionada = n;
  this.calificaciones.push(n);
}*/



calificar(n: number) {
  if (this.yaCalifico) return;

  const emailUsuario = localStorage.getItem('usuario')
    ? JSON.parse(localStorage.getItem('usuario')!).email
    : null;

  if (!emailUsuario) {
    Swal.fire({
      icon: 'info',
      title: 'Inicia sesión',
      text: 'Debes iniciar sesión para calificar',
      confirmButtonColor: '#0d9488'
    });
    return;
  }

  this.calificacionSeleccionada = n;
  this.calificaciones.push(n);
  this.yaCalifico = true;
  localStorage.setItem(`calificacion_${emailUsuario}`, n.toString());

  Swal.fire({
    icon: 'success',
    title: '¡Gracias por tu calificación!',
    showConfirmButton: false,
    timer: 1500
  });
}

get promedio(): number {
  const total = this.calificaciones.reduce((a, b) => a + b, 0);
  return this.calificaciones.length ? total / this.calificaciones.length : 0;
}

mostrarMapa = false;
}

