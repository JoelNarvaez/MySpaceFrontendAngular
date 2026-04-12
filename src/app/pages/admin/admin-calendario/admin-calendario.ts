import { Component, inject, OnInit } from '@angular/core';
import { Citas } from '../../../services/citas';
import { Cita } from '../../../interfaces/cita';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-calendario',
  imports: [FormsModule],
  templateUrl: './admin-calendario.html',
  styleUrl: './admin-calendario.css'
})
export class AdminCalendario implements OnInit {
  private citasService = inject(Citas);

  citas: Cita[] = [];
  fechaSeleccionada = '';

  get citasFiltradas(): Cita[] {
    if (!this.fechaSeleccionada) return this.citas;
    return this.citas.filter(c => c.fecha === this.fechaSeleccionada);
  }

  ngOnInit() {
    this.citasService.getCitasAdmin().subscribe(data => {
      this.citas = data;
    });
  }
}