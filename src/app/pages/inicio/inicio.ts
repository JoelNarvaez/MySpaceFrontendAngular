import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router'; // Añadimos Router
import { CommonModule } from '@angular/common';
import { Servicios } from '../../services/servicios'; 
import { TarjetaServicio } from '../../components/tarjeta-servicio/tarjeta-servicio';
import { Servicio } from '../../interfaces/servicio';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, CommonModule, TarjetaServicio], 
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit, OnDestroy {
  private serviciosService = inject(Servicios);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  serviciosAleatorios = signal<Servicio[]>([]);

  imagenes: string[] = ['hero-image.jpg', 'hero-image2.jpg', 'hero-image3.jpg'];
  indiceImagenActual: number = 0;
  intervalo: any;

  ngOnInit() {
    // Lógica del slider
    this.intervalo = setInterval(() => {
      this.siguienteImagen();
    }, 8000);

    // Cargar servicios y elegir 2 al azar
    this.serviciosService.getServicios().subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Mezclar el arreglo y tomar los primeros 2
          const random = data.sort(() => 0.5 - Math.random()).slice(0, 2);
          this.serviciosAleatorios.set(random);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  siguienteImagen() {
    this.indiceImagenActual = (this.indiceImagenActual + 1) % this.imagenes.length;
    this.cdr.detectChanges();
  }

  // Navegación al detalle (igual que en tu página de servicios)
  irADetalle(id: number) {
    this.router.navigate(['/servicio', id]);
  }

    // Seccion de FAQ
  faqAbierto: number | null = null;

  toggleFAQ(index: number) {
    this.faqAbierto = this.faqAbierto === index ? null : index;
  }
}