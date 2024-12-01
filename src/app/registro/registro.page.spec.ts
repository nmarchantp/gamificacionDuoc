import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroPage } from './registro.page';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SqliteService } from '../services/sqlite.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

describe('RegistroPage', () => {
  let componente: RegistroPage;
  let fixture: ComponentFixture<RegistroPage>;
  let sqliteServiceEspia: jasmine.SpyObj<SqliteService>;
  let routerEspia: jasmine.SpyObj<Router>;
  let alertControllerEspia: jasmine.SpyObj<AlertController>;

  beforeEach(async () => {
    sqliteServiceEspia = jasmine.createSpyObj('SqliteService', ['getRoles', 'registerUser']);
    routerEspia = jasmine.createSpyObj('Router', ['navigate']);
    alertControllerEspia = jasmine.createSpyObj('AlertController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [RegistroPage],
      imports: [HttpClientModule, FormsModule, ReactiveFormsModule],
      providers: [
        { provide: SqliteService, useValue: sqliteServiceEspia },
        { provide: Router, useValue: routerEspia },
        { provide: AlertController, useValue: alertControllerEspia },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroPage);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(componente).toBeTruthy();
  });

  // Prueba 1: Cargar roles correctamente
  it('debería cargar roles correctamente al llamar a cargaRoles', async () => {
    const datosRolesPrueba = [
      { id: 1, nombre: 'Admin' },
      { id: 2, nombre: 'Usuario' },
    ];
    sqliteServiceEspia.getRoles.and.returnValue(Promise.resolve(datosRolesPrueba));

    await componente.cargaRoles();

    // Verificar que getRoles fue llamado
    expect(sqliteServiceEspia.getRoles).toHaveBeenCalled();

    // Verificar que los roles se cargaron correctamente
    expect(componente.roles).toEqual(datosRolesPrueba);
  });

  // Prueba 2: Registrar un usuario exitosamente
  it('debería registrar un usuario y navegar a /login si el registro es exitoso', async () => {
    sqliteServiceEspia.registerUser.and.returnValue(Promise.resolve(true)); // Mock para registro exitoso
    alertControllerEspia.create.and.returnValue(
      Promise.resolve({
        present: jasmine.createSpy('present'),
      } as any)
    );

    // Establecer valores para el registro
    componente.username = 'usuarioPrueba';
    componente.email = 'correo@prueba.com';
    componente.password = 'contrasenaPrueba';
    componente.nombre = 'Juan';
    componente.apellido = 'Pérez';
    componente.rol = 1;

    await componente.registro();

    // Verificar que registerUser fue llamado con los datos correctos
    expect(sqliteServiceEspia.registerUser).toHaveBeenCalledWith(
      'usuarioPrueba',
      'correo@prueba.com',
      'contrasenaPrueba',
      'Juan',
      'Pérez',
      1
    );

    // Verificar que se navega a la página de login
    expect(routerEspia.navigate).toHaveBeenCalledWith(['/login']);
  });

  // Prueba 3: Navegar al login
  it('debería navegar a /login cuando se llame a volverALogin', () => {
    componente.volverALogin();

    // Verificar que Router navega a la página de login
    expect(routerEspia.navigate).toHaveBeenCalledWith(['/login']);
  });
});
