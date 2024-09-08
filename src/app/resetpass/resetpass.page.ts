import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resetpass',
  templateUrl: './resetpass.page.html',
  styleUrls: ['./resetpass.page.scss']
})
export class ResetpassPage {
  nombreUsuario: string = '';

  constructor(private router: Router) {}

  recuperarContrasena() {
    //valida que al menos se ingrese un usuario
    if (!this.nombreUsuario.trim()) {
      alert('Por favor, ingrese su nombre de usuario.');
      return;
    }
    // se levanta una alerta por mientras
    alert(`Se ha enviado un correo de recuperación a ${this.nombreUsuario}`);

    // Redirige al usuario después de solicitar la recuperación
    this.router.navigate(['/login']);
  }

  volverAlLogin() {
    // Redirige al usuario a la página de login
    this.router.navigate(['/login']);
  }
}