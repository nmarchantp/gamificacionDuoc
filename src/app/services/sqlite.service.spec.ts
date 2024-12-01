import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SqliteService } from './sqlite.service';
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { Preferences } from '@capacitor/preferences';
import { Device } from '@capacitor/device';
import { of } from 'rxjs';

describe('SqliteService', () => {
  let service: SqliteService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let capacitorSQLiteSpy: any;
  let preferencesSpy: any;
  let deviceSpy: any;

  beforeEach(() => {
    // Simular el elemento jeep-sqlite en el DOM
    const jeepSqliteElement = document.createElement('jeep-sqlite');
    document.body.appendChild(jeepSqliteElement);
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
  
    capacitorSQLiteSpy = jasmine.createSpyObj('CapacitorSQLite', {
      createConnection: Promise.resolve(),
      open: Promise.resolve(),
      close: Promise.resolve(),
      isJsonValid: Promise.resolve({ result: true }),
      importFromJson: Promise.resolve(),
      execute: Promise.resolve(),
      query: Promise.resolve({ values: [] }),
      run: Promise.resolve({ changes: { lastId: 1 } }),
    });
  
    preferencesSpy = jasmine.createSpyObj('Preferences', {
      get: Promise.resolve({ value: null }),
      set: Promise.resolve(),
      remove: Promise.resolve(),
      clear: Promise.resolve(),
    });
  
    deviceSpy = jasmine.createSpyObj('Device', {
      getInfo: Promise.resolve({ platform: 'web' }),
    });
  
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        SqliteService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: CapacitorSQLite, useValue: capacitorSQLiteSpy },
        { provide: Preferences, useValue: preferencesSpy },
        { provide: Device, useValue: deviceSpy },
      ],
    });
  
    service = TestBed.inject(SqliteService);
  });
  
  
  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

 
  it('debería autenticar al usuario con credenciales válidas', async () => {
    // Mock para abrir la conexión
    capacitorSQLiteSpy.open.and.returnValue(Promise.resolve());
  
    // Mock para la consulta de usuario
    const datosUsuarioPrueba = {
      id_user: 1,
      username: 'usuario1',
      password: '1234',
    };
  
    capacitorSQLiteSpy.query.and.returnValue(
      Promise.resolve({ values: [datosUsuarioPrueba] })
    );
  
    // Asegúrate de abrir la conexión antes de autenticar
    await service.createConnection();
    await service.openConnection();
  
    const resultado = await service.login('usuario1', '1234');
  
    expect(capacitorSQLiteSpy.query).toHaveBeenCalledWith({
      database: service.dbName,
      statement: jasmine.any(String),
      values: ['usuario1', '1234'],
    });
  
    expect(resultado).toBeTrue();
    expect(service['currentUser']).toEqual(datosUsuarioPrueba);
    expect(service.isAuthenticated.value).toBeTrue();
  });
  
  
  it('debería retornar false si las credenciales son incorrectas', async () => {
    // Simular un resultado vacío (usuario no encontrado)
    capacitorSQLiteSpy.query.and.returnValue(Promise.resolve({ values: [] }));
  
    const resultado = await service.login('usuarioInvalido', 'contrasenaIncorrecta');
  
    expect(resultado).toBeFalse();
    expect(service['currentUser']).toBeNull();
    expect(service.isAuthenticated.value).toBeFalse();
  });
  


  it('debería registrar un nuevo usuario correctamente', async () => {
    capacitorSQLiteSpy.open.and.returnValue(Promise.resolve());
    capacitorSQLiteSpy.run.and.returnValue(
      Promise.resolve({ changes: { lastId: 1 } })
    );
  
    await service.createConnection();
    await service.openConnection();
  
    const resultado = await service.registerUser(
      'nuevoUsuario',
      'nuevo@correo.com',
      'nuevaContrasena',
      'Nombre',
      'Apellido',
      1
    );
  
    expect(capacitorSQLiteSpy.run).toHaveBeenCalledTimes(2); // Para Usuarios y Niveles
    expect(resultado).toBeTrue();
  });
  
  
  it('debería obtener la lista de roles correctamente', async () => {
    // Mock para abrir la conexión
    capacitorSQLiteSpy.open.and.returnValue(Promise.resolve());
  
    // Mock para los datos de roles
    const datosRolesPrueba = [
      { id_rol: 1, nombre_rol: 'Admin', estado_rol: 'Activo' },
      { id_rol: 2, nombre_rol: 'Usuario', estado_rol: 'Activo' },
    ];
  
    capacitorSQLiteSpy.query.and.returnValue(
      Promise.resolve({ values: datosRolesPrueba })
    );
  
    // Asegúrate de abrir la conexión antes de obtener roles
    await service.createConnection();
    await service.openConnection();
  
    const roles = await service.getRoles();
  
    expect(capacitorSQLiteSpy.query).toHaveBeenCalledWith({
      database: service.dbName,
      statement: 'SELECT * FROM Roles',
      values: [],
    });
  
    expect(roles).toEqual(datosRolesPrueba);
  });


  it('debería cerrar la conexión correctamente', async () => {
    // Configurar el estado inicial de la conexión
    service['connectionOpen'] = true;
  
    // Llamar al método closeConnection
    await service.closeConnection();
  
    // Verificar que CapacitorSQLite.close fue llamado con los parámetros correctos
    expect(capacitorSQLiteSpy.close).toHaveBeenCalledWith({ database: service.dbName });
  
    // Verificar que connectionOpen se establece en false
    expect(service['connectionOpen']).toBeFalse();
  });
  
  
  it('debería descargar y validar el JSON de la base de datos', async () => {
    const mockJson = {
      database: 'gamificationDB',
      version: 1,
      encrypted: false,
      tables: [
        {
          name: 'Usuarios',
          schema: [
            { column: 'id_user', value: 'INTEGER PRIMARY KEY NOT NULL' },
            { column: 'username', value: 'TEXT NOT NULL UNIQUE' },
          ],
          values: [],
        },
      ],
    };
  
    // Configurar el mock para simular la llamada HTTP
    httpClientSpy.get.and.returnValue(of(mockJson));
  
    // Simular los métodos de CapacitorSQLite
    capacitorSQLiteSpy.isJsonValid.and.returnValue(Promise.resolve({ result: true }));
    capacitorSQLiteSpy.importFromJson.and.returnValue(Promise.resolve());
  
    await service.downloadDatabase();
  
    // Verificar que el cliente HTTP se llamó correctamente
    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/db/db.json');
  
    // Verificar que los métodos de CapacitorSQLite se llamaron correctamente
    expect(capacitorSQLiteSpy.isJsonValid).toHaveBeenCalledWith({ jsonstring: JSON.stringify(mockJson) });
    expect(capacitorSQLiteSpy.importFromJson).toHaveBeenCalledWith({ jsonstring: JSON.stringify(mockJson) });
  });
    

  it('debería actualizar la información del usuario correctamente', async () => {
    // Simular el comportamiento de la actualización
    capacitorSQLiteSpy.run.and.returnValue(Promise.resolve({ changes: { changes: 1 } }));
  
    // Llamar al método de actualización
    const idUser = 1;
    const nuevoNombre = 'Juan';
    const nuevoApellido = 'Perez';
  
    await service.actualizarUser(idUser, nuevoNombre, nuevoApellido);
  
    // Verificar que el método run fue llamado con la consulta esperada
    expect(capacitorSQLiteSpy.run).toHaveBeenCalledWith({
      database: service.dbName,
      statement: `
          UPDATE Usuarios 
          SET nombre = ?, apellido = ?
          WHERE id_user = ?
      `,
      values: [nuevoNombre, nuevoApellido, idUser],
    });
  });
  

  it('debería eliminar un usuario correctamente', async () => {
    // Simular el comportamiento de la eliminación
    capacitorSQLiteSpy.run.and.returnValue(Promise.resolve({ changes: { changes: 1 } }));
  
    const idUser = 1;
    await service.eliminarUser(idUser);
  
    // Verificar que el método run fue llamado con la consulta correcta
    expect(capacitorSQLiteSpy.run).toHaveBeenCalledWith({
      database: service.dbName,
      statement: `DELETE FROM Usuarios WHERE id_user = ?`,
      values: [idUser],
    });
  });
  

  it('debería borrar el almacenamiento local correctamente', async () => {
    // Llamar al método de borrado
    await service.borrarLocalStorage();
  
    // Verificar que se llamó a Preferences.clear
    expect(preferencesSpy.clear).toHaveBeenCalled();
  });
  
  }); 

