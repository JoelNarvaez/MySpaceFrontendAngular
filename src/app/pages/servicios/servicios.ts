import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Servicios } from '../../services/servicios';
import { TarjetaServicio } from '../../components/tarjeta-servicio/tarjeta-servicio';
import { Servicio } from '../../interfaces/servicio';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [TarjetaServicio],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css'
})

export class ServiciosSeccion implements OnInit {
  private serviciosService = inject(Servicios);
  private router = inject(Router);

  servicios = signal<Servicio[]>([]);
  cargando = signal(true);
  errorCarga = signal(false);

  ngOnInit() {
    this.serviciosService.getServicios().subscribe({
      next: (data) => {
        this.servicios.set(Array.isArray(data) ? data : []);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set(true);
        this.cargando.set(false);
      }
    });
  }

  // Recibe el @Output de tarjeta-servicio y navega al detalle
  irADetalle(id: number) {
    this.router.navigate(['/servicio', id]);
  }
}
