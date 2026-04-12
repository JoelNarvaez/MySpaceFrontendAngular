import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'precioMxn',
})
export class PrecioMxnPipe implements PipeTransform {
  transform(valor: number): string {
    if (!valor && valor !== 0) return '';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  }
}
