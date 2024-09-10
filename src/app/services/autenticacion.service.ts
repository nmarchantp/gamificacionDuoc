import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private usuarioPrueba = { nombre: 'Nicolás', contrasena: '1234', nivel: 0, puntos: 0 };
  private usuarioAutenticado: any = null; // Variable para almacenar el usuario autenticado

  constructor(private router: Router) {}

  iniciarSesion(usuario: string, contrasena: string): boolean {
    if (usuario === this.usuarioPrueba.nombre && contrasena === this.usuarioPrueba.contrasena) {
      this.usuarioAutenticado = this.usuarioPrueba;
      this.router.navigate(['/inicio']);
      return true;
    } else {
      this.usuarioAutenticado = null;
      return false;
    }
  }

  cerrarSesion() {
    this.usuarioAutenticado = null;
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    return this.usuarioAutenticado !== null;
  }

  obtenerUsuarioAutenticado() {
    return this.usuarioAutenticado;
  }

  actualizarUsuario(usuario: any) {
    this.usuarioAutenticado = usuario; 
  }
}