import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AvatarSelectorComponent } from '../avatar-selector/avatar-selector.component';
import { SqliteService } from '../services/sqlite.service';
import { Router } from '@angular/router'; 
import { DesafiosService } from '../services/desafios.service';
import { AvatarApiService } from '../services/avatar-api.service';

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
  avatarNombre: string = '';
  selectedAvatar: string = 'assets/avatars/avatar1.png'; // Avatar predeterminado
  nivelPorcentaje: number = 0; // Porcentaje de la barra de nivel
  puntosPorcentaje: number = 0; // Porcentaje de la barra de experiencia

  constructor(
    private sqliteService: SqliteService, 
    private router: Router, 
    private desafiosService: DesafiosService,
    private avatarApiService: AvatarApiService,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    await this.actualizarUsuario();
    this.primerosDesafios = this.desafiosService.obtenerDesafios().slice(0, 3);
    this.nombreUsuario = await this.sqliteService.traerNombreUsuario();
    this.avatarNombre = this.avatarApiService.traerAvatar(this.nombreUsuario);
    this.actualizarPorcentajes();
    console.log('Nombre Avatar desde HomePage:', this.nombreAvatar);
  }

  async openAvatarSelection() {
    const modal = await this.modalController.create({
      component: AvatarSelectorComponent
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.selectedAvatar = data.data; // Guarda el avatar seleccionado
      }
    });

    await modal.present();
  }

  cerrarSesion() {
    this.sqliteService.logout();
    this.router.navigate(['/login']);
  }

  async actualizarUsuario() {
    const usuario = await this.sqliteService.getCurrentUser();
    if (usuario) {
      this.nombreUsuario = usuario.username;
      this.nivelUsuario = usuario.nivel;
      this.puntosUsuario = usuario.puntos_totales;
      this.nombreAvatar = usuario.nombre + " " + usuario.apellido;
      this.actualizarPorcentajes(); // Actualiza los porcentajes de las barras después de obtener los datos del usuario
    }
  }

  actualizarPorcentajes() {
    // Ajusta los cálculos según tus requerimientos específicos
    this.nivelPorcentaje = (this.nivelUsuario / 100) * 100; // Calcula el porcentaje de nivel
    this.puntosPorcentaje = (this.puntosUsuario / 1000) * 100; // Calcula el porcentaje de experiencia
  }
}
