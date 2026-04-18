import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Servicios } from '../../services/servicios';
import { Servicio } from '../../interfaces/servicio';
import { PrecioMxnPipe } from '../../pipes/precio-mxn-pipe';

type PanelDetalle = 'incluye' | 'visita' | 'ideal';

// para tener como un servicio mas personalizado puse una constante que marca una estrucura que se utiliza para 
// declarar un objeto el cual utilizo para despues desplegar la informacion 
const DETALLES_SERVICIOS: Record<number, { incluye: string[], ideal: string[], visita: string }> = {
  1: {
    incluye: ['Uso de aceites esenciales de grado terapéutico', 'Difusión ambiental personalizada', 'Masaje rítmico en todo el cuerpo'],
    ideal: ['Reducir niveles de estrés y ansiedad', 'Personas que buscan una experiencia sensorial', 'Mejorar el estado de ánimo'],
    visita: 'Iniciaremos con una breve prueba de olfato para que elijas el aceite esencial que más te agrade.'
  },
  2: {
    incluye: ['Técnica manual suave y rítmica', 'Música ambiental relajante', 'Aceites minerales hidratantes'],
    ideal: ['Desconexión total del día a día', 'Aliviar fatiga mental', 'Relajación muscular ligera'],
    visita: 'Es una sesión fluida diseñada para calmar el sistema nervioso sin presiones fuertes.'
  },
  3: {
    incluye: ['Presión profunda en zonas de tensión', 'Uso de bálsamos caloríficos', 'Estiramientos asistidos'],
    ideal: ['Dolor muscular por mala postura', 'Nudos de tensión (contracturas)', 'Recuperación tras actividad física'],
    visita: 'Nos enfocaremos en liberar los puntos gatillo y la rigidez en espalda, cuello y hombros.'
  },
  4: {
    incluye: ['Piedras volcánicas calientes', 'Aceite de coco orgánico', 'Termoterapia profunda'],
    ideal: ['Mejorar la circulación sanguínea', 'Aliviar dolores articulares', 'Combatir el insomnio y fatiga crónica'],
    visita: 'El calor de las piedras ayudará a relajar los músculos antes de iniciar las maniobras manuales.'
  },
  5: {
    incluye: ['Saquitos de hierbas calientes (Pindas)', 'Aromas herbales naturales', 'Presiones circulares'],
    ideal: ['Desintoxicación del cuerpo', 'Relajación profunda de la piel', 'Equilibrio energético'],
    visita: 'Disfrutarás de un ritual tailandés que combina calor, presión y herbolaria.'
  },
  6: {
    incluye: ['Maniobras de bombeo rítmico', 'Sin uso de aceites pesados', 'Enfoque en sistema linfático'],
    ideal: ['Reducir retención de líquidos', 'Post-operatorios (con alta médica)', 'Piernas cansadas o pesadez'],
    visita: 'Es un masaje muy sutil y suave que ayuda a tu cuerpo a eliminar toxinas naturalmente.'
  },
  7: {
    incluye: ['Técnicas de modelado corporal', 'Activación de la circulación', 'Tratamiento localizado'],
    ideal: ['Mejorar la apariencia de la piel', 'Complemento de hábitos saludables', 'Drenaje y reafirmación'],
    visita: 'Evaluaremos las zonas a trabajar para aplicar la técnica de remodelado más efectiva.'
  }
};

@Component({
  selector: 'app-detalle-servicio',
  standalone: true,
  imports: [NgClass, PrecioMxnPipe],
  templateUrl: './detalle-servicio.html',
  styleUrl: './detalle-servicio.css'
})
export class DetalleServicio implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private serviciosService = inject(Servicios);


  imagenes: Record<number, string> = {
    1: 'aromaterapia2.jpg',
    2: 'masajeRelajante.jpg',
    3: 'masajeDescontructurante.jpg',
    4: 'piedras.jpg',
    5: 'pinda.jpg',
    6: 'drenaje.jpeg',
    7: 'tratamiento.jpg'
  };

  //Posición para las imagenes
  posiciones: Record<number, string> = {
    1: 'center center',    // aromaterapia
    2: 'center top',       // masaje relajante
    3: 'center center',    // masaje descontracturante
    4: 'center center',    // piedras
    5: 'center top',       // pinda
    6: 'center center',    // drenaje
    7: 'center center'     // tratamiento
  };
  servicio = signal<Servicio | undefined>(undefined);
  panelActivo = signal<PanelDetalle>('incluye');

  // Resumen simplificado
  resumen = computed(() => {
    return this.servicio()?.descripcion || 'Una experiencia diseñada para tu bienestar.';
  });

  detalleActivo = computed(() => this.obtenerPanelContenido(this.panelActivo()));

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.serviciosService.getServicioById(id).subscribe((data) => {
        this.servicio.set(data);
      });
    });
  }

  seleccionarPanel(panel: PanelDetalle) {
    this.panelActivo.set(panel);
  }

  irAgendar() {
    this.router.navigate(['/agendar'], {
      queryParams: { idServicio: this.servicio()?.id, nombre: this.servicio()?.nombre }
    });
  }

  obtenerImagenFondo(): string {
    const id = this.servicio()?.id || 0;
    const imagen = this.imagenes[id];
    const posicion = this.posiciones[id] || 'center center';
    return imagen ? `url('${imagen}')` : '';
  }

  obtenerPosicionFondo(): string {
    const id = this.servicio()?.id || 0;
    return this.posiciones[id] || 'center center';
  }

  // Como todas duran 60 min, simplificamos la lógica
  obtenerEtiquetaDuracion(): string {
    return 'Sesión equilibrada';
  }

  obtenerMomentos(): Array<{ titulo: string; detalle: string; tiempo: string }> {
    return [
      { titulo: 'Bienvenida', detalle: 'Recepción y preparación del espacio.', tiempo: '10 min' },
      { titulo: 'Experiencia', detalle: 'Desarrollo de la técnica principal del masaje.', tiempo: '40 min' },
      { titulo: 'Cierre', detalle: 'Salida suave y recomendaciones de cuidado.', tiempo: '10 min' }
    ];
  }

  obtenerIndicadores(): Array<{ etiqueta: string; valor: string }> {
    return [
      { etiqueta: 'Duración', valor: '60 min' },
      { etiqueta: 'Modalidad', valor: 'Presencial' },
      { etiqueta: 'Atención', valor: 'Personalizada' }
    ];
  }

  private obtenerPanelContenido(panel: PanelDetalle): { titulo: string; descripcion: string; puntos: string[] } {
    const id = this.servicio()?.id || 0;
    const info = DETALLES_SERVICIOS[id];
    const nombre = this.servicio()?.nombre || 'el servicio';

    switch (panel) {
      case 'visita':
        return {
          titulo: 'Cómo será tu visita',
          descripcion: info?.visita || 'Una sesión organizada para tu máximo confort.',
          puntos: [
            'Llegada y ajuste de detalles de comodidad.',
            `Sesión continua de ${nombre.toLowerCase()}.`,
            'Hidratación y consejos post-masaje.'
          ]
        };
      case 'ideal':
        return {
          titulo: 'Ideal para ti si buscas',
          descripcion: 'Este masaje es la opción perfecta si tus objetivos son:',
          puntos: info?.ideal || ['Pausa en tu rutina', 'Bienestar integral']
        };
      default:
        return {
          titulo: 'Lo que incluye',
          descripcion: 'Detalles de lo que recibirás al reservar:',
          puntos: info?.incluye || ['Atención profesional', 'Ambiente privado']
        };
    }
  }
}