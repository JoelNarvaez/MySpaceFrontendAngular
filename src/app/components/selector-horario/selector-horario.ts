import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Horario } from '../../interfaces/horario';

@Component({
  selector: 'app-selector-horario',
  imports: [],
  templateUrl: './selector-horario.html',
  styleUrl: './selector-horario.css'
})
export class SelectorHorario {
  @Input() horarios: Horario[] = [];
  @Output() horarioSeleccionado = new EventEmitter<string>();

  seleccionar(horario: Horario) {
    if (!horario.disponible) return;
    this.horarioSeleccionado.emit(horario.hora);
  }
}