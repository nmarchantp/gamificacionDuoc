import { Component } from '@angular/core';
import { SqliteService } from '../services/sqlite.service';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  usuarios: any[] = [];
  usuario: string = '';
  contrasena: string = '';
  mensajeError = '';
  mostrarContrasena: boolean = false;

  constructor(
    private sqliteService: SqliteService, 
    private router: Router, 
    private alertController: AlertController
  ) {}


  // async ngOnInit() {
  //   this.usuarios = await this.sqliteService.getAllUsers(); // Carga los usuarios desde SQLite
  // }

  // onUserChange(event: any) {
  //   // Asigna automáticamente la contraseña del usuario seleccionado
  //   this.contrasena = event.detail.value.password || '';
  // }

  async iniciarSesion() {
    this.mensajeError = '';
    // llama al método login en SqliteService para verificar el usuario
    // se reemplaza el metodo autenticacion
    // console.log("user:",this.usuario," pass:",this.contrasena);
    if (this.usuario && this.contrasena) {
      const esValido = await this.sqliteService.login(this.usuario, this.contrasena);

      if (esValido) {
        //uso de state
        const navigationExtras: NavigationExtras = {
          state: {
            user: this.usuario 
          }
        };
      await Preferences.set({ key: 'user', value: JSON.stringify(this.usuario) });
      this.router.navigate(['/tabs/home'], navigationExtras);
    } else {
      const alert = await this.alertController.create({
        header: '¡Ouch!',
        message: 'Contraseña incorrecta. Inténtalo de nuevo.',
        buttons: ['Reintentar']
      });
      await alert.present();
      }
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


