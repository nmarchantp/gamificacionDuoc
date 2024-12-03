import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorSQLite, JsonSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { isPlatform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, catchError, lastValueFrom, Observable, of, retry } from 'rxjs';
import { __awaiter } from 'tslib';


@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  public dbready: BehaviorSubject<boolean>;
  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isWeb: boolean;
  public isIos: boolean;
  public dbName: string;
  private currentUser: any = null;
  sqliteConnection!: SQLiteConnection;
  // private isConnected: boolean;
  private connectionCreated: boolean = false; // Indica si la conexión ha sido creada
  private connectionOpen: boolean = false; // Indica si la conexión está abierta

  constructor(private http: HttpClient) { 
    this.dbready = new BehaviorSubject(false);
    this.isWeb = false;
    this.isIos = false;
    this.dbName = 'gamificationDB';
    // this.isConnected = false;
    this.initWebStore();
    
  }

  ngOninit(){

  }

  private async initWebStore() {
    if (document.querySelector('jeep-sqlite') === null) {
        const jeepSqliteEl = document.createElement('jeep-sqlite');
        document.body.appendChild(jeepSqliteEl);
        await customElements.whenDefined('jeep-sqlite');
        await CapacitorSQLite.initWebStore(); 
    }
}

public async createConnection() {
  if (!this.connectionCreated) {
      try {
          await CapacitorSQLite.createConnection({ database: this.dbName });
          this.connectionCreated = true; // Marca que la conexión ha sido creada
          console.log(`Conexión creada para la base de datos ${this.dbName}.`);
      } catch (error) {
          console.error("Error al crear la conexión:", error);
      }
  } else {
      console.log("La conexión ya ha sido creada.");
  }
}

public async openConnection() {
  if (this.connectionCreated && !this.connectionOpen) {
      try {
          await CapacitorSQLite.open({ database: this.dbName });
          this.connectionOpen = true; // Marca que la conexión está abierta
          console.log(`Conexión abierta para la base de datos ${this.dbName}.`);
      } catch (error) {
          console.error("Error al abrir la conexión:", error);
      }
  } else if (!this.connectionCreated) {
      console.log("La conexión no ha sido creada aún. Primero crea la conexión.");
  } else {
      console.log("La conexión ya está abierta.");
  }
}

public async closeConnection() {
  if (this.connectionOpen) {
    try {
      console.log('Intentando cerrar la conexión...');
      await CapacitorSQLite.close({ database: this.dbName });
      this.connectionOpen = false;
      console.log(`Conexión cerrada para la base de datos ${this.dbName}.`);
    } catch (error) {
      console.error("Error al cerrar la conexión:", error);
    }
  } else {
    console.log("No hay una conexión abierta para cerrar.");
  }
}

public isConnectionCreated(): boolean {
  return this.connectionCreated;
}

public isConnectionOpen(): boolean {
  return this.connectionOpen;
}
  
  
// 
async downloadDatabase() {
  try {
    this.http.get('assets/db/db.json').subscribe(
      async (jsonExport: JsonSQLite) => {
        try {
          const jsonstring = JSON.stringify(jsonExport);
          console.log("JSON descargado:", jsonstring);
          const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });
          if (isValid.result) {
            this.dbName = jsonExport.database;

            await CapacitorSQLite.importFromJson({ jsonstring });
            console.log("Base de datos importada exitosamente desde JSONbbbb.");
            //const usuarios =  await this.getAllUsers();
            // console.log(usuarios);

            this.dbready.next(true);
          } else {
            console.error("El JSON de la base de datos no es válido");
          }
        } catch (error) {
          console.error("Error durante la importación de la base de datos desde JSON:", error);
        }
      },
      (error) => {
        console.error("Error al descargar el archivo JSON de la base de datos:", error);
      }
    );
  } catch (error) {
    console.error("Error en el proceso de descarga de la base de datos:", error);
  }
}

  // async downloadDatabase() {
  //   try {
  //     // Descarga el archivo JSON
  //     const jsonExport: JsonSQLite = await lastValueFrom(this.http.get<JsonSQLite>('assets/db/db.json'));
  
  //     try {
  //       const jsonstring = JSON.stringify(jsonExport);
  //       console.log("JSON descargado:", jsonstring);
  
  //       // Valida el JSON descargado
  //       const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });
  //       console.log("Es válido:", isValid.result);
  
  //       if (isValid.result) {
  //         this.dbName = jsonExport.database;
  //         // Importa el JSON a la base de datos
  //         await CapacitorSQLite.importFromJson({ jsonstring });
  //         console.log("Base de datos importada exitosamente desde JSON.");
  
  //         // Actualiza el estado de la base de datos a lista
  //         this.dbready.next(true);
  //       } else {
  //         console.error("El JSON de la base de datos no es válido");
  //       }
  //     } catch (error) {
  //       console.error("Error durante la importación de la base de datos desde JSON:", error);
  //     }
  //   } catch (error) {
  //     console.error("Error al descargar el archivo JSON de la base de datos:", error);
  //   }
  // }
  
  
  async init() {
    try {
      
  
      // Elimina configuraciones previas
      await Preferences.remove({ key: 'first_setup_key' });
  
      // Obtiene información del dispositivo
      const info = await Device.getInfo();
      const sqlite = CapacitorSQLite as any;
  
      // Configuración específica según la plataforma
      if (info.platform === 'android') {
        try {
          await sqlite.requestPermissions();
        } catch (error) {
          console.error("Esta app necesita permisos para funcionar");
        }
      } else if (info.platform === 'web') {
        const jeepSqliteEl = document.createElement('jeep-sqlite');
        document.body.appendChild(jeepSqliteEl);
        await customElements.whenDefined('jeep-sqlite');
        await CapacitorSQLite.initWebStore();
      }
  
      // Verifica si se requiere configuración inicial
      const dbSetup = await Preferences.get({ key: 'first_setup_key' });
      await this.createConnection();
      await this.openConnection();
  
      if (!dbSetup.value) {
        console.log(`[${new Date().toISOString()}] Inicio de configuración inicial de la base de datos`);
        await this.createTables();
        console.log(`[${new Date().toISOString()}] Creación de tablas completada`);
        await this.downloadDatabase();
        console.log(`[${new Date().toISOString()}] Base de datos descargada e inicializada`);
        await Preferences.set({ key: 'first_setup_key', value: '1' });
      } else {
        console.log("La base de datos ya estaba configurada previamente");
      }
  
      this.dbready.next(true);
    } catch (error) {
      console.error("Error durante la inicialización:", error);
      this.dbready.next(false);
    } finally {
      await this.closeConnection(); 
    }
  }


  
  // creo tyablas usuario, roles, niveles, desafios, historial
  async createTables() {
    try {

      const createRolesTable = `
        CREATE TABLE IF NOT EXISTS Roles  ( 
          id_rol INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre_rol TEXT NOT NULL UNIQUE,
          estado_rol  TEXT NOT NULL
          );
      `;
      console.log("Tabla de Roles creada");

      const createDesafiosTable = `
        CREATE TABLE IF NOT EXISTS Desafios (
          id_desafio INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre_desafio TEXT NOT NULL,
          descripcion TEXT,
          puntos INTEGER NOT NULL
        );
      `;
      console.log("Tabla de Desafios creada");

      const createUsuariosTable = `
        CREATE TABLE IF NOT EXISTS Usuarios (
          id_user INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          nombre TEXT NOT NULL,
          apellido TEXT NOT NULL,
          id_rol  INTEGER NOT NULL,
          FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
        );
      `;
      console.log("Tabla de Usuarios creada");

      const createNivelesTable = `
        CREATE TABLE IF NOT EXISTS Niveles (
          id_nivel INTEGER PRIMARY KEY AUTOINCREMENT,
          id_user INTEGER NOT NULL,
          nivel INTEGER DEFAULT 1, 
          puntos_totales INTEGER DEFAULT 0,
          FOREIGN KEY (id_user) REFERENCES Usuarios(id_user) ON DELETE CASCADE
        );
      `;
      console.log("Tabla de Niveles creada");

      const createHistorialDesafiosTable = `
        CREATE TABLE IF NOT EXISTS HistorialDesafios (
          id_desafio_h INTEGER PRIMARY KEY AUTOINCREMENT,
          id_user INTEGER,
          id_desafio INTEGER,
          fecha_completado DATETIME DEFAULT CURRENT_TIMESTAMP,
          puntos_ganados INTEGER,
          FOREIGN KEY (id_user) REFERENCES Usuarios(id_user),
          FOREIGN KEY (id_desafio) REFERENCES Desafios(id_desafio)
        );
      `;
      console.log("Tabla de HistorialDesafios creada");

      await CapacitorSQLite.execute({ 
        database: this.dbName, 
        statements: `${createUsuariosTable} ${createRolesTable} ${createNivelesTable} ${createDesafiosTable} ${createHistorialDesafiosTable}` 
      });

      console.log("Tablas creadas correctamente en la base de datos.");
    } catch (error) {
      console.error("Error al crear las tablas:", error);
    }
  }
  
  
  async getDbName() {
    try {
      await this.openConnection(); // Abre la conexión antes de las operaciones
      if (!this.dbName) {
        const dbname = await Preferences.get({ key: 'dbname' });
        if (dbname.value) {
          this.dbName = dbname.value;
        }
      }
      return this.dbName; // Devuelve el nombre de la base de datos
    } catch (error) {
      console.error("Error al obtener el nombre de la base de datos:", error);
      throw error; // Propaga el error para manejarlo externamente si es necesario
    } finally {
      await this.closeConnection(); // Asegura que la conexión se cierre siempre
    }
  }

  async getRoles() {
    try {
      console.log("abro conexion en getRoles");
      await this.openConnection(); // Abre la conexión antes de ejecutar la consulta
      const query = `SELECT * FROM Roles`;
      const result = await CapacitorSQLite.query({
        database: this.dbName,
        statement: query,
        values: []
      });
      console.log(result.values);
      return result.values || []; // Devuelve los resultados de la consulta
    } catch (error) {
      console.error("Error al obtener los roles:", error);
      throw error; // Propaga el error para manejarlo externamente si es necesario
    } finally {
      await this.closeConnection(); // Asegura que la conexión se cierre siempre
    }
  }
  

//metodo para realizar cualquier consuilta y mostrarlo en consola
async consultas(query: string, params: any[] = []) {
  try {
    await this.openConnection(); // Abre la conexión antes de ejecutar la consulta
    const result = await CapacitorSQLite.query({
      statement: query,
      values: params
    });
    console.log('Resultado de la consulta:', result.values);
    return result.values; // Devuelve los resultados de la consulta
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    throw error; // Propaga el error para manejo externo
  } finally {
    await this.closeConnection(); // Asegura que la conexión se cierre siempre
  }
}



  //metodo que consulta la base de datos segun el username y password entregado
  //luego valida si el usuario existe y si tiene permisos para acceder
  async login(username: string, password: string): Promise<boolean> {
    try {
      console.log('Intentando abrir conexión...');
      await this.openConnection(); 
  
      console.log('Conexión abierta, ejecutando query...');
      const query = `SELECT * FROM Usuarios WHERE username = ? AND password = ?`;
      const result = await CapacitorSQLite.query({
        database: this.dbName,
        statement: query,
        values: [username, password],
      });
  
      console.log('Resultado de query:', result);
  
      if (result.values && result.values.length > 0) {
        this.currentUser = result.values[0];
        this.isAuthenticated.next(true);
        return true;
      }
      console.error('Usuario no encontrado.');
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      await this.closeConnection();
    }
  }
  
  

  async registerUser(
    username: string,
    email: string,
    password: string,
    nombre: string,
    apellido: string,
    rol: number
  ): Promise<boolean> {
    try {
      await this.openConnection(); // Abre la conexión antes de realizar las consultas
  
      const queryUsuario = `
        INSERT INTO Usuarios (username, email, password, nombre, apellido, id_rol)
        VALUES (?, ?, ?, ?, ?, ?);
      `;
      const insertaUsuario = await CapacitorSQLite.run({
        database: this.dbName,
        statement: queryUsuario,
        values: [username, email, password, nombre, apellido, rol]
      });
  
      const id_usuario = insertaUsuario.changes.lastId;
  
      const queryNivel = `
        INSERT INTO Niveles (id_user, nivel, puntos_totales) 
        VALUES (?, ?, ?);
      `;
      await CapacitorSQLite.run({
        database: this.dbName,
        statement: queryNivel,
        values: [id_usuario, 1, 0]
      });
  
      console.log("Usuario registrado correctamente");
      return true; // Retorna true si el registro es exitoso
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      return false; // Retorna false si ocurre un error
    } finally {
      await this.closeConnection(); // Asegura que la conexión se cierre siempre
    }
  }
  

  async getAllUsers(): Promise<any[]> {
    try {
      await this.openConnection(); // Asegúrate de que la conexión esté abierta
  
      const query = `SELECT * FROM Usuarios`;
      const result = await CapacitorSQLite.query({
        database: this.dbName,
        statement: query,
        values: []
      });
  
      console.log("Resultado de la consulta de usuarios:", result);
      return result.values || []; // Devuelve los usuarios obtenidos
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      return []; // Retorna un arreglo vacío si ocurre un error
    } finally {
      await this.closeConnection(); // Asegura que la conexión siempre se cierre
    }
  }
  
  

  async actualizarUser(id_user: number, nombre: string, apellido: string) {
    try {
      await this.openConnection(); // Abre la conexión antes de realizar la actualización
  
      const query = `
        UPDATE Usuarios 
        SET nombre = ?, apellido = ?
        WHERE id_user = ?
      `;
  
      const result = await CapacitorSQLite.run({
        database: this.dbName,
        statement: query,
        values: [nombre, apellido, id_user]
      });
  
      console.log('Usuario actualizado con éxito:', result);
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      throw error; // Propaga el error para manejo externo si es necesario
    } finally {
      await this.closeConnection(); // Asegura que la conexión siempre se cierre
    }
  }
  

  async eliminarUser(id_user: number) {
    try {
      await this.openConnection(); // Abre la conexión antes de realizar la eliminación
  
      const query = `DELETE FROM Usuarios WHERE id_user = ?`;
  
      const result = await CapacitorSQLite.run({
        database: this.dbName,
        statement: query,
        values: [id_user]
      });
  
      console.log('Usuario eliminado con éxito:', result);
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      throw error; // Propaga el error para manejo externo
    } finally {
      await this.closeConnection(); // Asegura que la conexión siempre se cierre
    }
  }
  
    
      
  async getCurrentUser() {
    if (!this.currentUser) return null;
  
    try {
      await this.openConnection(); // Abre la conexión antes de realizar la consulta
  
      const query = `
        SELECT Usuarios.username, Usuarios.email, Usuarios.nombre, Usuarios.apellido, Roles.nombre_rol, Niveles.nivel, Niveles.puntos_totales 
        FROM Usuarios 
        JOIN Niveles ON Usuarios.id_user = Niveles.id_user 
        JOIN Roles ON Usuarios.id_rol = Roles.id_rol 
        WHERE Usuarios.id_user = ?;
      `;
  
      const result = await CapacitorSQLite.query({
        database: this.dbName,
        statement: query,
        values: [this.currentUser.id_user]
      });
  
      if (result.values && result.values.length > 0) {
        const user = result.values[0];
        const userData = {
          username: user.username,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          rol: user.nombre_rol,
          nivel: user.nivel,
          puntos_totales: user.puntos_totales
        };
        console.log("Current user", userData);
  
        // Guarda los datos localmente
        await Preferences.set({
          key: 'currentUser',
          value: JSON.stringify(userData)
        });
  
        return userData; // Devuelve los datos del usuario
      } else {
        console.error("Usuario no encontrado en la base de datos.");
        return null; // Retorna null si no se encuentra el usuario
      }
    } catch (error) {
      console.error("Error al obtener el usuario autenticado:", error);
      return null; // Retorna null si ocurre un error
    } finally {
      await this.closeConnection(); // Asegura que la conexión siempre se cierre
    }
  }
  
  

  async traerNombreUsuario(): Promise<string | null> {
    try {
      await this.openConnection(); // Abre la conexión antes de acceder a los datos
  
      const { value } = await Preferences.get({ key: 'currentUser' });
      if (value) {
        const user = JSON.parse(value);
        const nombreAvatar = `${user.nombre} ${user.apellido}`;
        return nombreAvatar; // Devuelve el nombre completo del usuario
      } else {
        return null; // Retorna null si no se encuentra el usuario
      }
    } catch (error) {
      console.error('Error al obtener el nombre del usuario:', error);
      return null; // Retorna null si ocurre un error
    } finally {
      await this.closeConnection(); // Asegura que la conexión siempre se cierre
    }
  }
  
    
  //metodo para borar el local storage
  async borrarLocalStorage(): Promise<void> {
    try {
      await Preferences.clear(); // Limpia el almacenamiento local
      console.log('Se ha limpiado localstorage completamente');
    } catch (error) {
      console.error('Error al limpiar el localstorage:', error); // Maneja errores si ocurren
      throw error; // Propaga el error si es necesario
    }
  }
  
  
  //metodo para desloguear la aplicación
  async logout(): Promise<void> {
    try {
      this.currentUser = null; // Elimina el usuario actual
      this.isAuthenticated.next(false); // Marca al usuario como no autenticado
  
      await this.borrarLocalStorage(); // Limpia el almacenamiento local
      console.log("LocalStorage limpiado correctamente durante el logout");
    } catch (error) {
      console.error("Error durante la limpieza del localStorage en logout:", error);
    } finally {
      await this.closeConnection(); // Asegura que la conexión se cierre
      console.log("Conexión cerrada correctamente durante el logout");
    }
  }
  


 }
