import { Component } from '@angular/core';
import { AutenticacionService } from '../services/autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  usuario = '';
  contrasena = '';
  mensajeError = '';

  constructor(private autenticacionService: AutenticacionService, private router: Router) {}

  iniciarSesion() {
    this.mensajeError = '';
    const esValido = this.autenticacionService.iniciarSesion(this.usuario, this.contrasena);
    
    if (esValido) {
      this.router.navigate(['/tabs/home']); // Redirige a la página de tabs con el home
    } else {
      this.mensajeError = 'Usuario o contraseña incorrectos. Inténtalo de nuevo.';
    }
  }

  irARecuperarContrasena() {
    this.router.navigate(['/resetpass']); // Redirige a la página de restablecimiento de contraseña
  }
}