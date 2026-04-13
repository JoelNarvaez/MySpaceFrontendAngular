import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-confirmacion',
  imports: [],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.css'
})
export class Confirmacion implements OnInit {
  private router = inject(Router);

  nombre = '';
  servicio = '';
  fecha = '';
  hora = '';

  ngOnInit() {
    const state = history.state;

    if (!state?.nombre) {
      this.router.navigate(['/mis-citas']);
      return;
    }

    this.nombre = state['nombre'];
    this.servicio = state['servicio'];
    this.fecha = state['fecha'];
    this.hora = state['hora'];
  }

  irAMisCitas() {
    this.router.navigate(['/mis-citas']);
  }

  irAInicio() {
    this.router.navigate(['/']);
  }
}
