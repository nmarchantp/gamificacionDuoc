import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SqliteService } from '../services/sqlite.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss']
})
export class RegistroPage {
  username = '';
  email = '';
  password = '';
  mensajeError = '';

  constructor(
    private sqliteService: SqliteService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async registro() {
    const isRegistered = await this.sqliteService.registerUser(this.username, this.email, this.password);
    if (isRegistered) {
      const alert = await this.alertController.create({
        header: 'Registro Exitoso',
        message: 'El usuario ha sido registrado correctamente.',
        buttons: ['OK']
      });
      await alert.present();
      this.router.navigate(['/login']); // Redirige al login tras el registro
    } else {
      this.mensajeError = 'Hubo un error al registrar el usuario. Inténtalo de nuevo.';
    }
  }

  volverALogin() {
    this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
  }
}
