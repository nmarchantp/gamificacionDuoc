import { Component, OnInit } from '@angular/core';
import { DesafiosService } from '../services/desafios.service';
import { AutenticacionService } from '../services/autenticacion.service';
import { Router } from '@angular/router';

// Definición de la interfaz Desafio dentro del mismo archivo
interface Desafio {
  id: number;
  descripcion: string;
  puntos: number;
  completado: boolean;
}

@Component({
  selector: 'app-desafios',
  templateUrl: './desafios.page.html',
  styleUrls: ['./desafios.page.scss']
})
export class DesafiosPage implements OnInit {
  desafios: Desafio[] = []; // Uso de la interfaz Desafio

  constructor(
    private desafiosService: DesafiosService,
    private autenticacionService: AutenticacionService,
    private router: Router // Inyección del servicio Router
  ) {}

  ngOnInit() {
    this.desafios = this.desafiosService.obtenerDesafios();
  }

  completarDesafio(id: number) {
    const codigo = prompt('Ingrese el código para completar el desafío:');
    // Ingresar cualquier número
    if (codigo) {
      const resultado = this.desafiosService.completarDesafio(id);
      if (resultado) {
        const usuario = this.autenticacionService.obtenerUsuarioAutenticado();
        if (usuario) {
          usuario.puntos += resultado.puntos;
          this.autenticacionService.actualizarUsuario(usuario);
          alert(`¡Desafío completado! Has ganado ${resultado.puntos} puntos.`);
          this.desafios = this.desafiosService.obtenerDesafios();
        }
      } else {
        alert('Error: El desafío no se pudo completar.');
      }
    } else {
      alert('El código ingresado es inválido.');
    }
  }

  volverAlHome() {
    // Redirigir al usuario a la página de inicio
    this.router.navigate(['/tabs/home']);
  }
}