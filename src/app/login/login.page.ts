import { Component } from '@angular/core';
import { AutenticacionService } from '../services/autenticacion.service';
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
  mostrarContrasena: boolean = false; // agregue la funcion de que se pueda visualizar la contraseña para comprobar que este correcta al seleccionar el tipico icono de ojo 

  constructor(private autenticacionService: AutenticacionService, private router: Router, private alertController: AlertController) {}

  async iniciarSesion() { //async es para que aparezca como pop up
    this.mensajeError = '';
    const esValido = this.autenticacionService.iniciarSesion(this.usuario, this.contrasena);
    
    if (esValido) {
      this.router.navigate(['/tabs/home']); // Redirige a la página de tabs con el home
    } else {
      const alert = await this.alertController.create({
        header:'¡Ouch!',
        message:'Usuario o contraseña incorrectos. Inténtalo de nuevo.',
        buttons: ['Reintentar']
      });
      await alert.present();//para evitar un bucle en la alerta
      return;
      // this.mensajeError = 'Usuario o contraseña incorrectos. Inténtalo de nuevo.';
    }
  }

  togglePasswordVisibility() {
    this.mostrarContrasena = !this.mostrarContrasena; // muestra la contraseña para facilitar el ingreso del usuario
  }

  irARecuperarContrasena() {
    this.router.navigate(['/resetpass']); // Redirige a la página de restablecimiento de contraseña
  }
}