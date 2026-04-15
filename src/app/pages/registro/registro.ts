import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { Auth } from '../../services/auth';

export function passwordsIgualesValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmar = control.get('confirmarPassword');
  if (!password || !confirmar) return null;
  return password.value !== confirmar.value ? { passwordsNoCoinciden: true } : null;
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(Auth);

  cargando = false;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', [Validators.required]]
  }, { validators: passwordsIgualesValidator });

  get nombre() { return this.form.get('nombre'); }
  get email() { return this.form.get('email'); }
  get telefono() { return this.form.get('telefono'); }
  get password() { return this.form.get('password'); }
  get confirmarPassword() { return this.form.get('confirmarPassword'); }

  registrarse() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;
    const { nombre, email, telefono, password } = this.form.value;

    this.authService.registro({ nombre: nombre!, email: email!, telefono: telefono!, password: password! }).subscribe({
      next: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'success',
          iconColor: '#D4A373', 
          title: '<span class="logo-font" style="color: #1E3A5F; font-size: 1.5rem; tracking: 0.1em;">¡CUENTA CREADA!</span>',
          text: 'Tu espacio de bienestar te espera.',
          showConfirmButton: false,
          timer: 2000,
          background: '#F5F5F4', // Color hueso de fondo
          backdrop: `rgba(30, 58, 95, 0.4)`, // Fondo oscuro Navy con transparencia
          customClass: {
            popup: 'rounded-3xl border-none shadow-2xl',
            title: 'uppercase'
          }
        }).then(() => this.router.navigate(['/agendar']));
      },
      error: (err) => {
        this.cargando = false;
        const mensaje = err.status === 409
          ? 'Este correo ya está registrado'
          : 'No se pudo crear la cuenta, intenta de nuevo';
          
        Swal.fire({
          icon: 'error',
          iconColor: '#1E3A5F', // Navy para el error
          title: '<span class="logo-font" style="color: #1E3A5F;">Oops...</span>',
          text: mensaje,
          confirmButtonText: 'ENTENDIDO',
          confirmButtonColor: '#1E3A5F', // Botón Navy
          background: '#F5F5F4',
          customClass: {
            popup: 'rounded-3xl shadow-2xl',
            confirmButton: 'rounded-full px-8 py-3 uppercase tracking-widest text-xs font-bold'
          }
        });
      }
    });
  }
}
