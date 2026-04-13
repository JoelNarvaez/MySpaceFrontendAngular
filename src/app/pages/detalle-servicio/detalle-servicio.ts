import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Servicios } from '../../services/servicios';
import { Servicio } from '../../interfaces/servicio';
import { PrecioMxnPipe } from '../../pipes/precio-mxn-pipe';

@Component({
  selector: 'app-detalle-servicio',
  standalone: true,
  imports: [PrecioMxnPipe],
  templateUrl: './detalle-servicio.html',
  styleUrl: './detalle-servicio.css'
})
export class DetalleServicio implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private serviciosService = inject(Servicios);

  servicio = signal<Servicio | undefined>(undefined);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.serviciosService.getServicioById(id).subscribe(data => {
        this.servicio.set(data);
      });
    });
  }

  irAgendar() {
    this.router.navigate(['/agendar'], {
      queryParams: { idServicio: this.servicio()?.id, nombre: this.servicio()?.nombre }
    });
  }
}
