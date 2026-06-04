import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.html'
})
export class ResetPassword implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(Auth);
  private fb = inject(FormBuilder);

  token = '';

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {

    this.token =
      this.route.snapshot.paramMap.get('token') || '';

    this.authService
      .verifyResetToken(this.token)
      .subscribe({
        error: () => {

          Swal.fire({
            icon: 'error',
            title: 'Enlace inválido'
          });

          this.router.navigate(['/login']);
        }
      });

  }

  guardar() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService
      .resetPassword(
        this.token,
        this.form.value.password!
      )
      .subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada'
          }).then(() => {

            this.router.navigate(['/login']);

          });

        }

      });

  }

}