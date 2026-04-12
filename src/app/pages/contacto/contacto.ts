import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contacto',
  imports: [FormsModule],
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
}