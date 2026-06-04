import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {

  private fb = inject(FormBuilder);
  private authService = inject(Auth);

  cargando = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  enviar() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;

    this.authService
      .forgotPassword(this.form.value.email!)
      .subscribe({

        next: (resp: any) => {

          this.cargando = false;

          Swal.fire({
            icon: 'success',
            title: 'Solicitud enviada',
            text: 'Revisa tu correo electrónico.'
          });
          this.form.reset();
        },

        error: () => {

          this.cargando = false;

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No fue posible procesar la solicitud.'
          });

        }

      });

  }

}