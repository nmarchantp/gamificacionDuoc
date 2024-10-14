import { Component, OnInit } from '@angular/core';
// import { AutenticacionService } from '../services/autenticacion.service';
import { SqliteService } from '../services/sqlite.service';
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

  // constructor(private autenticacionService: AutenticacionService, private router: Router, private desafiosService: DesafiosService) {}
  constructor(
    private sqliteService: SqliteService, 
    private router: Router, 
    private desafiosService: DesafiosService
  ) {}

  ngOnInit() {
    // obtengo datos del usuario autenticado desde el servicio
    // const usuario = this.autenticacionService.obtenerUsuarioAutenticado();
    const usuario = this.sqliteService.getCurrentUser();
    if (usuario) {
      console.log(usuario);
      this.nombreUsuario = usuario.username;
      this.nivelUsuario = usuario.nivel;
      this.puntosUsuario = usuario.puntos_totales;
    }
    this.actualizarUsuario();
    //Me traigo los primeros 3 desafios para mostrar
    this.primerosDesafios = this.desafiosService.obtenerDesafios().slice(0, 3);
  }

  cerrarSesion() {
    // lógica para cerrar sesión
    // this.autenticacionService.cerrarSesion();
    this.sqliteService.logout();
    this.router.navigate(['/login']); // Redirige al login
  }

  actualizarUsuario() {
    // const usuario = this.autenticacionService.obtenerUsuarioAutenticado();
    const usuario = this.sqliteService.getCurrentUser();
    if (usuario) {
      this.nombreUsuario = usuario.username;
      this.nivelUsuario = usuario.nivel;
      this.puntosUsuario = usuario.puntos_totales;
    }
  }
}