import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-confirmacion',
  imports: [],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.css'
})
export class Confirmacion implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);

  nombre = '';
  servicio = '';
  fecha = '';
  hora = '';

  ngOnInit() {
    // queryParams que recibe los datos de la cita 
    this.route.queryParamMap.subscribe(params => {
      this.nombre = params.get('nombre') || '';
      this.servicio = params.get('servicio') || '';
      this.fecha = params.get('fecha') || '';
      this.hora = params.get('hora') || '';
    });
  }
}