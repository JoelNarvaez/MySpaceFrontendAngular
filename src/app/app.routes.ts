import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [ 
    // Con lazyloading
    // Rutas públicas
    { path: '', loadComponent: () => import('./pages/inicio/inicio').then(m => m.Inicio)},
    { path: 'servicios', loadComponent: () => import('./pages/servicios/servicios').then(m => m.ServiciosSeccion) },
    { path: 'servicio/:id', loadComponent: () => import('./pages/detalle-servicio/detalle-servicio').then(m => m.DetalleServicio) },
    { path: 'nosotros', loadComponent: () => import('./pages/nosotros/nosotros').then(m => m.Nosotros) },
    { path: 'contacto', loadComponent: () => import('./pages/contacto/contacto').then(m => m.Contacto) },
    { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
    
    // Rutas protegidas - usuario
    { path: 'agendar', loadComponent: () => import('./pages/agendar/agendar').then(m => m.Agendar), canActivate: [authGuard] },
    { path: 'confirmacion', loadComponent: () => import('./pages/confirmacion/confirmacion').then(m => m.Confirmacion), canActivate: [authGuard] },
    { path: 'mis-citas', loadComponent: () => import('./pages/mis-citas/mis-citas').then(m => m.MisCitas), canActivate: [authGuard] },

    // Rutas protegidas - admin
    { path: 'admin/calendario', loadComponent: () => import('./pages/admin/admin-calendario/admin-calendario').then(m => m.AdminCalendario), canActivate: [authGuard, adminGuard] },
    { path: 'admin/bloqueos', loadComponent: () => import('./pages/admin/admin-bloqueos/admin-bloqueos').then(m => m.AdminBloqueos), canActivate: [authGuard, adminGuard] },

    // Ruta no encontrada
    { path: '**', loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound) }
];
