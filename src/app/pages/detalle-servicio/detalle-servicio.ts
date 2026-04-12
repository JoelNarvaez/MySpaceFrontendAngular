import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Servicios } from '../../services/servicios';
import { Servicio } from '../../interfaces/servicio';
import { PrecioMxnPipe } from '../../pipes/precio-mxn-pipe';

@Component({
  selector: 'app-detalle-servicio',
  imports: [PrecioMxnPipe],
  templateUrl: './detalle-servicio.html',
  styleUrl: './detalle-servicio.css'
})
export class DetalleServicio implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private serviciosService = inject(Servicios);

  servicio: Servicio | undefined;

  ngOnInit() {
    // paramsMap 
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.serviciosService.getServicioById(id).subscribe(data => {
        this.servicio = data;
      });
    });
  }

  irAgendar() {
    this.router.navigate(['/agendar'], {
      queryParams: { idServicio: this.servicio?.id, nombre: this.servicio?.nombre }
    });
  }
}