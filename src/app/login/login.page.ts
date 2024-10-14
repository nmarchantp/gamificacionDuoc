import { Component } from '@angular/core';
import { SqliteService } from '../services/sqlite.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  usuario = '';
  contrasena = '';
  mensajeError = '';
  mostrarContrasena: boolean = false;

  constructor(
    private sqliteService: SqliteService, 
    private router: Router, 
    private alertController: AlertController
  ) {}

  async iniciarSesion() {
    this.mensajeError = '';
    // llama al método login en SqliteService para verificar el usuario
    // se reemplaza el metodo autenticacion
    // console.log("user:",this.usuario," pass:",this.contrasena);
    const esValido = await this.sqliteService.login(this.usuario, this.contrasena);
    console.log(esValido);
    if (esValido) {
      console.log(esValido);
      this.router.navigate(['/tabs/home']);
    } else {
      const alert = await this.alertController.create({
        header: '¡Ouch!',
        message: 'Usuario o contraseña incorrectos. Inténtalo de nuevo.',
        buttons: ['Reintentar']
      });
      await alert.present();
    }
  }

  togglePasswordVisibility() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  irARecuperarContrasena() {
    this.router.navigate(['/resetpass']);
  }

  irARegistro() {
    this.router.navigate(['/registro']); 
  }
}


