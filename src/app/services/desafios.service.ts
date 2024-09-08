import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DesafiosService {
  // Lista de desafíos de ejemplo
  private desafios = [
    { id: 1, descripcion: 'Completa la actividad A', puntos: 10, completado: false },
    { id: 2, descripcion: 'Termina el proyecto B', puntos: 20, completado: false },
    { id: 3, descripcion: 'Lee el capítulo 4 del libro', puntos: 15, completado: false },
    { id: 4, descripcion: 'Participa en la reunión C', puntos: 25, completado: false },
    { id: 5, descripcion: 'Realiza un tutorial de Angular', puntos: 30, completado: false },
    { id: 6, descripcion: 'Publica un artículo en el blog', puntos: 20, completado: false },
    { id: 7, descripcion: 'Completa el ejercicio de matemáticas', puntos: 10, completado: false },
    { id: 8, descripcion: 'Envía una propuesta de proyecto', puntos: 35, completado: false },
    { id: 9, descripcion: 'Organiza un evento de equipo', puntos: 40, completado: false },
    { id: 10, descripcion: 'Crea una presentación sobre Ionic', puntos: 50, completado: false }
  ];

  constructor() {}

  // Obtener lista de desafíos no completados
  obtenerDesafios() {
    return this.desafios.filter(desafio => !desafio.completado);
  }

  // Completar un desafío
  completarDesafio(id: number): { puntos: number } | null {
    const desafio = this.desafios.find(d => d.id === id);
    if (desafio) {
      desafio.completado = true;
      return { puntos: desafio.puntos };
    }
    return null;
  }
}