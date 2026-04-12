import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Servicios } from '../../services/servicios';
import { TarjetaServicio } from '../../components/tarjeta-servicio/tarjeta-servicio';
import { Servicio } from '../../interfaces/servicio';

@Component({
  selector: 'app-servicios',
  imports: [TarjetaServicio],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css'
})
export class ServiciosSeccion implements OnInit {
  private serviciosService = inject(Servicios);
  private router = inject(Router);

  servicios: Servicio[] = [];

  ngOnInit() {
    this.serviciosService.getServicios().subscribe(data => {
      this.servicios = data;
    });
  }

  // Recibe el @Output de tarjeta-servicio y navega al detalle
  irADetalle(id: number) {
    this.router.navigate(['/servicio', id]);
  }
}