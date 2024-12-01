import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import { HttpClientModule } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { SqliteService } from '../services/sqlite.service';
import { DesafiosService } from '../services/desafios.service';
import { AvatarApiService } from '../services/avatar-api.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

describe('HomePage', () => {
  let componente: HomePage; // Variable para el componente que se está probando
  let fixture: ComponentFixture<HomePage>;

  // Espías (mocks) para los servicios y dependencias del componente
  let sqliteServiceEspia: jasmine.SpyObj<SqliteService>;
  let desafiosServiceEspia: jasmine.SpyObj<DesafiosService>;
  let avatarApiServiceEspia: jasmine.SpyObj<AvatarApiService>;
  let routerEspia: jasmine.SpyObj<Router>;
  let navControllerMock: jasmine.SpyObj<NavController>;

  beforeEach(async () => {
    // Creación de espías para los servicios con métodos simulados
    sqliteServiceEspia = jasmine.createSpyObj('SqliteService', ['getCurrentUser', 'logout']);
    desafiosServiceEspia = jasmine.createSpyObj('DesafiosService', ['obtenerDesafios']);
    avatarApiServiceEspia = jasmine.createSpyObj('AvatarApiService', ['traerAvatar']);
    routerEspia = jasmine.createSpyObj('Router', ['navigate']);
    navControllerMock = jasmine.createSpyObj('NavController', ['navigateRoot']);

    // Configuración del módulo de pruebas
    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot(), HttpClientModule, MatMenuModule],
      providers: [
        { provide: SqliteService, useValue: sqliteServiceEspia },
        { provide: DesafiosService, useValue: desafiosServiceEspia },
        { provide: AvatarApiService, useValue: avatarApiServiceEspia },
        { provide: Router, useValue: routerEspia },
        { provide: NavController, useValue: navControllerMock },
      ],
    }).compileComponents();

    // Creación del componente para pruebas
    fixture = TestBed.createComponent(HomePage);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Prueba básica: verificar que el componente se cree correctamente
  it('debería crear el componente', () => {
    expect(componente).toBeTruthy();
  });

  // Prueba de actualización de datos del usuario
  it('debería actualizar los datos del usuario correctamente en actualizarUsuario', async () => {
    // Datos de prueba simulados para el usuario
    const datosUsuarioPrueba  = {
      username: 'usuarioPrueba',
      email: 'prueba@example.com',
      rol: 'admin',
      nivel: 10,
      puntos_totales: 500,
      nombre: 'Juan',
      apellido: 'Pérez',
    };
    sqliteServiceEspia.getCurrentUser.and.returnValue(Promise.resolve(datosUsuarioPrueba ));

    await componente.actualizarUsuario();

    // Verificaciones de los datos actualizados
    expect(componente.nombreUsuario).toBe(datosUsuarioPrueba .username);
    expect(componente.nivelUsuario).toBe(datosUsuarioPrueba .nivel);
    expect(componente.puntosUsuario).toBe(datosUsuarioPrueba .puntos_totales);
    expect(componente.nombreAvatar).toBe('Juan Pérez');
    expect(componente.nivelPorcentaje).toBe(10); // 10% de nivel
    expect(componente.puntosPorcentaje).toBe(50); // 50% de puntos
  });

  // Prueba de carga de los primeros 3 desafíos
  it('debería cargar los primeros 3 desafíos en cargarDesafios', () => {
    // Datos de prueba simulados para los desafíos
    const datosDesafiosPrueba  = [
      { id: 1, descripcion: 'Desafío 1', puntos: 10, completado: false, fechaLimite: '2023-12-31', condiciones: 'Ninguna' },
      { id: 2, descripcion: 'Desafío 2', puntos: 20, completado: true, fechaLimite: '2023-12-31', condiciones: 'Ninguna' },
      { id: 3, descripcion: 'Desafío 3', puntos: 30, completado: false, fechaLimite: '2023-12-31', condiciones: 'Ninguna' },
      { id: 4, descripcion: 'Desafío 4', puntos: 40, completado: true, fechaLimite: '2023-12-31', condiciones: 'Ninguna' },
    ];
    desafiosServiceEspia.obtenerDesafios.and.returnValue(datosDesafiosPrueba);

    componente.cargarDesafios();

    // Verificación de que solo se carguen los primeros 3 desafíos
    expect(componente.primerosDesafios.length).toBe(3);
    expect(componente.primerosDesafios).toEqual(datosDesafiosPrueba.slice(0, 3));
  });

  // Prueba de cierre de sesión
  it('debería llamar a logout y redirigir a login en cerrarSesion', () => {
    // Llama al método cerrarSesion
    componente.cerrarSesion();
  
    // Verifica que se llame al método logout del servicio SQLite
    expect(sqliteServiceEspia.logout).toHaveBeenCalled();
  
    // Verifica que Router navega a la página de login
    expect(routerEspia.navigate).toHaveBeenCalledWith(['/login']);
  });
});
