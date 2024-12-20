import { Component, OnInit } from '@angular/core';
import { AvatarApiService } from '../services/avatar-api.service';
import { SqliteService } from '../services/sqlite.service';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {
  avatarUrl: string = 'assets/default-avatar.png'; // Imagen de avatar por defecto
  nombreUsuario: string = ''; 

  constructor(private avatarApiService: AvatarApiService, private userService: SqliteService) {}

  async ngOnInit() {
    try {
      this.nombreUsuario = await this.userService.traerNombreUsuario();
      console.log("El nombre rescatado es:", this.nombreUsuario);
      
      if (this.nombreUsuario) {
        // Intenta obtener la URL del avatar
        const avatar = await this.avatarApiService.traerAvatar(this.nombreUsuario);
        this.avatarUrl = avatar ? avatar : 'assets/default-avatar.png'; // Si no se recibe avatar, usa la imagen por defecto
      }
    } catch (error) {
      console.error("Error al traer el nombre del usuario o generar el avatar:", error);
      this.avatarUrl = 'assets/default-avatar.png'; // En caso de error, usa la imagen por defecto
    }
  }

  // Método que se llama si ocurre un error al cargar la imagen
  onAvatarError() {
    this.avatarUrl = 'assets/default-avatar.png'; // Imagen de avatar por defecto
  }
}
