import { Component, Input, OnInit } from '@angular/core';
import { AvatarApiService } from '../services/avatar-api.service';
import { SqliteService } from '../services/sqlite.service';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {

  avatarUrl!: string;
  nombreUsuario: string = ''; 

  constructor(private avatarApiService: AvatarApiService, private userService: SqliteService) { }

  async ngOnInit() {
    try {
      this.nombreUsuario = '';
      this.nombreUsuario = await this.userService.traerNombreUsuario();
      console.log('El nombre rescatado es:', this.nombreUsuario);
      this.avatarUrl = this.avatarApiService.traerAvatar(this.nombreUsuario);
    } catch (error) {
      console.error('Error al traer el nombre del usuario o generar el avatar:', error);
    }
    
  }

}
