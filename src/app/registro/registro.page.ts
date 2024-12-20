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
  nombre = '';
  apellido = '';
  roles: any[] = [];
  rol = 0;
  telefono = '';
  fechaNacimiento = '';
  mensajeError = '';

  constructor(
    private sqliteService: SqliteService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit(){
    this.cargaRoles();
  }

  async cargaRoles(){
    console.log('comienzo a cargar los roles');
    try{
      this.roles = await this.sqliteService.getRoles();
      console.log('Roles cargados: ',this.roles);
    }catch(error){
      console.error(error); 
    }
  }

  async registro() {
    if (!this.username || !this.email || !this.password || !this.nombre || !this.apellido || !this.rol) {
      this.mensajeError = 'Por favor completa todos los campos.';
      return;
    }
  
    const isRegistered = await this.sqliteService.registerUser(this.username, this.email, this.password, this.nombre, this.apellido, this.rol);
    if (isRegistered) {
      const alert = await this.alertController.create({
        header: 'Registro Exitoso',
        message: 'El usuario ha sido registrado correctamente.',
        buttons: ['OK']
      });
      await alert.present();
      this.router.navigate(['/login']); 
    } else {
      this.mensajeError = 'Hubo un error al registrar el usuario. Inténtalo de nuevo.';
    }
  }
  



  volverALogin() {
    this.router.navigate(['/login']); 
  }

  // subirFoto(event: any){
  //   const archivo = event.target.files[0];
  //   const leer = new FileReader();
  //   leer.onload =() => {
  //     this.foto = leer.result as string;
  //   };
  //   leer.readAsDataURL(archivo);
  // }

}
