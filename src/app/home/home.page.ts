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
  nombreAvatar: string  = '';
  nivelUsuario: number = 0;
  puntosUsuario: number = 0;
  primerosDesafios: any[] = [];

  // constructor(private autenticacionService: AutenticacionService, private router: Router, private desafiosService: DesafiosService) {}
  constructor(
    private sqliteService: SqliteService, 
    private router: Router, 
    private desafiosService: DesafiosService
  ) {}

  async ngOnInit() {
    // obtengo datos del usuario autenticado desde el servicio
    // const usuario = this.autenticacionService.obtenerUsuarioAutenticado();
    await this.actualizarUsuario();
    this.primerosDesafios = this.desafiosService.obtenerDesafios().slice(0, 3);
    //this.nombreAvatar = await this.obtenerNombreAvatar();
    console.log('Nombre Avatar desde HomePage:', this.nombreAvatar);
  }

  cerrarSesion() {
    // lógica para cerrar sesión
    // this.autenticacionService.cerrarSesion();
    this.sqliteService.logout();
    this.router.navigate(['/login']); // Redirige al login
  }

  async actualizarUsuario() {
    // const usuario = this.autenticacionService.obtenerUsuarioAutenticado();
    const usuario = await this.sqliteService.getCurrentUser();
    if (usuario) {
      this.nombreUsuario = usuario.username;
      this.nivelUsuario = usuario.nivel;
      this.puntosUsuario = usuario.puntos_totales;
      this.nombreAvatar = usuario.nombre+" "+usuario.apellido;
    }
  }
  
}