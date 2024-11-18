import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DesafiosService {
  // Lista de desafíos con información adicional
  private desafios = [
    
      { 
        id: 1, 
        descripcion: 'Obtén 100% de asistencia', 
        puntos: 900, 
        completado: false, 
        fechaLimite: '23-11-2024', 
        condiciones: 'Debes tener asistencia perfecta en todas tus clases.'
      },
      { 
        id: 2, 
        descripcion: 'Realiza la encuesta docente', 
        puntos: 500, 
        completado: false, 
        fechaLimite: '10-12-2024', 
        condiciones: 'Debes completar evaluador a todos los docentes de la encuesta.'
      },
      { 
        id: 3, 
        descripcion: 'Obten promedio final 6.5 ', 
        puntos: 1000, 
        completado: false, 
        fechaLimite: '31-12-2024', 
        condiciones: 'Debes tener un promedio final superior a 6.5 en el semestre.'
      },
      { 
        id: 4, 
        descripcion: 'Encuesta de caracterización', 
        puntos: 25, 
        completado: false, 
        fechaLimite: '30-11-2024', 
        condiciones: 'Completa todas las preguntas de la encuesta de caracterización.'
      },
      { 
        id: 5, 
        descripcion: 'No repruebes ningun ramo', 
        puntos: 500, 
        completado: false, 
        fechaLimite: '05-12-2024', 
        condiciones: 'Pasa todos tus ramos de forma exitosa y aprueba el semestre.'
      },
      { 
        id: 6, 
        descripcion: 'A escribir en un foro', 
        puntos: 20, 
        completado: false, 
        fechaLimite: '20-11-2024', 
        condiciones: 'Debes participar en al menos un foro de discusión en la plataforma académica.'
      },
      { 
        id: 7, 
        descripcion: 'Participa en la feria laboral', 
        puntos: 50, 
        completado: false, 
        fechaLimite: '25-11-2024', 
        condiciones: 'Participa en al menos dos stands en la feria laboral para completar este desafío.'
      },
      { 
        id: 8, 
        descripcion: 'Sácate una foto con DUCO', 
        puntos: 35, 
        completado: false, 
        fechaLimite: '15-11-2024', 
        condiciones: 'Sube la foto al portal estudiantil para validar el desafío.'
      },
      { 
        id: 9, 
        descripcion: 'Firma el contrato DUOC', 
        puntos: 50, 
        completado: false, 
        fechaLimite: '10-03-2024', 
        condiciones: 'Firma tu contrato a través del portal estudiantil.'
      },
      { 
        id: 10, 
        descripcion: 'Inscribe tus ramos', 
        puntos: 10, 
        completado: false, 
        fechaLimite: '30-01-2025', 
        condiciones: 'Debes inscribir al menos 5 ramos para completar este desafío.'
      }
    
    
   
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