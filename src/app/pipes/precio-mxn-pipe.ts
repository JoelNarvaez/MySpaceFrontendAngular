import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'precioMxn',
  standalone: true,
})
export class PrecioMxnPipe implements PipeTransform {
  transform(valor: number | string | null | undefined): string {
    if (!valor && valor !== 0) return '';

    const numero = typeof valor === 'string' ? Number(valor) : valor;
    if (Number.isNaN(numero)) return '';

    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(numero);
  }
}
