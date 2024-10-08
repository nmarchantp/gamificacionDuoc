import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AutenticacionService } from './autenticacion.service'; 

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private autenticacionService: AutenticacionService, private router: Router) {}
//podría agregar al if si son distintos roles, tipo si es profesor envía a una ruta, si es alumno lo envio a otra , *los delegados podrian ser moderadores
  canActivate(): boolean {
    // Verifica si el usuario está autenticado
    if (this.autenticacionService.estaAutenticado()) {
      return true; // Permite el acceso si el usuario está autenticado
    } else {
      // Redirige a la página de login si no está autenticado
      this.router.navigate(['/login']);
      return false;
    }
  }
}

