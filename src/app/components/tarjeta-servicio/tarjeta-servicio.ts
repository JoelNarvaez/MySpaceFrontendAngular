import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Servicio } from '../../interfaces/servicio';
import { PrecioMxnPipe } from '../../pipes/precio-mxn-pipe';

@Component({
  selector: 'app-tarjeta-servicio',
  standalone: true,
  imports: [PrecioMxnPipe],
  templateUrl: './tarjeta-servicio.html',
  styleUrl: './tarjeta-servicio.css'
})
export class TarjetaServicio {
  // @Input Recibe el servicio del componente padre
  @Input() servicio!: Servicio;

  // @Output Aquí se avisa al padre cuando el usuario quiere ver el detalle
    @Output() verDetalle = new EventEmitter<number>();

  onVerDetalle() {
    this.verDetalle.emit(this.servicio.id);
  }
}
