import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SqliteService } from '../services/sqlite.service';
import { of } from 'rxjs';

describe('LoginPage', () => {
  let componente: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let sqliteServiceEspia: jasmine.SpyObj<SqliteService>;
  let routerEspia: jasmine.SpyObj<Router>;
  let alertControllerEspia: jasmine.SpyObj<AlertController>;

  beforeEach(async () => {
    sqliteServiceEspia = jasmine.createSpyObj('SqliteService', ['login']);
    routerEspia = jasmine.createSpyObj('Router', ['navigate']);
    alertControllerEspia = jasmine.createSpyObj('AlertController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [IonicModule.forRoot(), HttpClientModule],
      providers: [
        { provide: SqliteService, useValue: sqliteServiceEspia },
        { provide: Router, useValue: routerEspia },
        { provide: AlertController, useValue: alertControllerEspia },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(componente).toBeTruthy();
  });

  // Prueba 1: Iniciar sesión correctamente
  it('debería iniciar sesión y navegar a /tabs/home cuando las credenciales son correctas', async () => {
    sqliteServiceEspia.login.and.returnValue(Promise.resolve(true)); // Mock para login válido

    componente.usuario = 'usuarioPrueba';
    componente.contrasena = 'contrasenaPrueba';

    await componente.iniciarSesion();

    // Verifica que el servicio login fue llamado con las credenciales correctas
    expect(sqliteServiceEspia.login).toHaveBeenCalledWith('usuarioPrueba', 'contrasenaPrueba');

    // Verifica que navega a la página principal
    expect(routerEspia.navigate).toHaveBeenCalledWith(['/tabs/home'], jasmine.any(Object));
  });

  // Prueba 2: Alternar visibilidad de la contraseña
  it('debería alternar la visibilidad de la contraseña', () => {
    // Estado inicial: contraseña no visible
    expect(componente.mostrarContrasena).toBeFalse();

    // Llamar al método para alternar visibilidad
    componente.togglePasswordVisibility();

    // Verificar que cambia el estado
    expect(componente.mostrarContrasena).toBeTrue();

    // Llamar al método nuevamente
    componente.togglePasswordVisibility();

    // Verificar que regresa al estado inicial
    expect(componente.mostrarContrasena).toBeFalse();
  });

  // Prueba 3: Navegar a la página de registro
  it('debería navegar a /registro cuando se llame a irARegistro', () => {
    componente.irARegistro();

    // Verifica que navega a la página de registro
    expect(routerEspia.navigate).toHaveBeenCalledWith(['/registro']);
  });
});
