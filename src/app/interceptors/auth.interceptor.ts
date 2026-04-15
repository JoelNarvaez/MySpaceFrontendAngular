import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  if (usuario?.token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${usuario.token}` }
    });
  }

  return next(req);
};
