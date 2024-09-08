import { Component, OnInit } from '@angular/core';
import { AutenticacionService } from '../services/autenticacion.service';
import { Router } from '@angular/router'; 
import { DesafiosService } from '../services/desafios.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  nombreUsuario: string = '';
  nivelUsuario: number = 0;
  puntosUsuario: number = 0;
  primerosDesafios: any[] = [];

  constructor(private autenticacionService: AutenticacionService, private router: Router, private desafiosService: DesafiosService) {}

  ngOnInit() {
    // Obtener datos del usuario autenticado desde el servicio
    const usuario = this.autenticacionService.obtenerUsuarioAutenticado();
    if (usuario) {
      console.log(usuario);
      this.nombreUsuario = usuario.nombre;
      this.nivelUsuario = usuario.nivel;
      this.puntosUsuario = usuario.puntos;
    }
    this.actualizarUsuario();
    //Me traigo los primeros 3 desafios para mostrar
    this.primerosDesafios = this.desafiosService.obtenerDesafios().slice(0, 3);
  }

  cerrarSesion() {
    // Lógica para cerrar sesión
    this.autenticacionService.cerrarSesion();
    this.router.navigate(['/login']); // Redirige al login
  }

  actualizarUsuario() {
    const usuario = this.autenticacionService.obtenerUsuarioAutenticado();
    if (usuario) {
      this.nombreUsuario = usuario.nombre;
      this.nivelUsuario = usuario.nivel;
      this.puntosUsuario = usuario.puntos;
    }
  }
}