import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css',
})
export class Nosotros implements OnInit, OnDestroy{

   private cdr = inject(ChangeDetectorRef);
imagenes = [
  { tipo: 'img', src: 'local1.jpeg' },
  { tipo: 'img', src: 'local2.jpeg' },
  { tipo: 'video', src: 'video.mp4' },
];

indiceImagenActual: number = 0;
intervalo: any;

ngOnInit() {
    this.intervalo = setInterval(() => {
      this.siguienteImagen();
    }, 4000);
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  siguienteImagen() {
    this.indiceImagenActual =
      (this.indiceImagenActual + 1) % this.imagenes.length;

    this.cdr.detectChanges(); 
  }
}
