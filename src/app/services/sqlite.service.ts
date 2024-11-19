import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorSQLite, JsonSQLite } from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';

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
  private isConnected: boolean = false; // Nueva variable de contr

  constructor(private http: HttpClient) { 
    this.dbready = new BehaviorSubject(false);
    this.isWeb = false;
    this.isIos = false;
    this.dbName = 'gamificationDB';
  }

  ngOninit() {}

    async openConnection() {
    try {
      if (!this.isConnected) {
        await CapacitorSQLite.createConnection({ database: this.dbName });
        await CapacitorSQLite.open({ database: this.dbName });
        this.isConnected = true; // Actualiza el estado
        console.log(`Conexión a la base de datos ${this.dbName} abierta.`);
      } else {
        console.log(`La conexión a ${this.dbName} ya está activa.`);
      }
    } catch (error) {
      console.error("Error al abrir la conexión:", error);
      throw error;
    }
  }

  async closeConnection() {
    try {
      if (this.isConnected) {
        await CapacitorSQLite.close({ database: this.dbName });
        this.isConnected = false; // Actualiza el estado
        console.log(`Conexión a la base de datos ${this.dbName} cerrada.`);
      } else {
        console.log(`No hay conexión activa para cerrar en ${this.dbName}.`);
      }
    } catch (error) {
      console.warn("Error al cerrar la conexión o ya estaba cerrada:", error);
    }
  }

  async deleteDatabase(dbName: string) {
    try {
      await this.closeConnection(); // Asegúrate de cerrar la conexión antes de eliminar
      await CapacitorSQLite.deleteDatabase({ database: dbName });
      console.log(`Base de datos ${dbName} eliminada correctamente.`);
    } catch (error) {
      console.error("Error al eliminar la base de datos:", error);
    }
  }

  async init() {
    try {
      await Preferences.remove({ key: 'first_setup_key' });
      const info = await Device.getInfo();
  
      this.isWeb = info.platform === 'web';
      if (this.isWeb) {
        const jeepSqliteEl = document.createElement('jeep-sqlite');
        document.body.appendChild(jeepSqliteEl);
        await customElements.whenDefined('jeep-sqlite');
        await CapacitorSQLite.initWebStore();
      }
  
      await this.closeConnection(); // Cierra cualquier conexión existente
      await this.openConnection(); // Abre una nueva conexión
      // Eliminar base de datos para configuraciones iniciales
      await this.deleteDatabase(this.dbName);
  
      const dbSetup = await Preferences.get({ key: 'first_setup_key' });
      if (!dbSetup.value) {
        await this.openConnection();
        await this.createTables();
        await this.downloadDatabase();
        await Preferences.set({ key: 'first_setup_key', value: '1' });
      } else {
        await this.openConnection();
      }
  
      this.dbready.next(true);
    } catch (error) {
      console.error("Error durante la inicialización:", error);
      this.dbready.next(false);
    } finally {
      await this.closeConnection();
    }
  }

  async createRolesTable() {
    const createRolesTable = `
      CREATE TABLE IF NOT EXISTS Roles (
        id_rol INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_rol TEXT NOT NULL UNIQUE,
        estado_rol TEXT NOT NULL
      );
    `;
    await CapacitorSQLite.execute({
      database: this.dbName,
      statements: createRolesTable
    });
    console.log("Tabla de Roles creada");
  }

  async createDesafiosTable() {
    const createDesafiosTable = `
      CREATE TABLE IF NOT EXISTS Desafios (
        id_desafio INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_desafio TEXT NOT NULL,
        descripcion TEXT,
        puntos INTEGER NOT NULL
      );
    `;
    await CapacitorSQLite.execute({
      database: this.dbName,
      statements: createDesafiosTable
    });
    console.log("Tabla de Desafios creada");
  }

  async createUsuariosTable() {
    const createUsuariosTable = `
      CREATE TABLE IF NOT EXISTS Usuarios (
        id_user INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        id_rol INTEGER NOT NULL,
        FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
      );
    `;
    await CapacitorSQLite.execute({
      database: this.dbName,
      statements: createUsuariosTable
    });
    console.log("Tabla de Usuarios creada");
  }

  async createNivelesTable() {
    const createNivelesTable = `
      CREATE TABLE IF NOT EXISTS Niveles (
        id_nivel INTEGER PRIMARY KEY AUTOINCREMENT,
        id_user INTEGER NOT NULL,
        nivel INTEGER DEFAULT 1,
        puntos_totales INTEGER DEFAULT 0,
        FOREIGN KEY (id_user) REFERENCES Usuarios(id_user) ON DELETE CASCADE
      );
    `;
    await CapacitorSQLite.execute({
      database: this.dbName,
      statements: createNivelesTable
    });
    console.log("Tabla de Niveles creada");
  }

  async createHistorialDesafiosTable() {
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
    await CapacitorSQLite.execute({
      database: this.dbName,
      statements: createHistorialDesafiosTable
    });
    console.log("Tabla de HistorialDesafios creada");
  }

  async createTables() {
    try {
      await this.openConnection();
      await this.createRolesTable();
      await this.createDesafiosTable();
      await this.createUsuariosTable();
      await this.createNivelesTable();
      await this.createHistorialDesafiosTable();
      console.log("Todas las tablas han sido creadas correctamente.");
    } catch (error) {
      console.error("Error al crear las tablas:", error);
    } finally {
      await this.closeConnection();
    }
  }

  async registerUser(username: string, email: string, password: string, nombre: string, apellido: string, rol: number): Promise<boolean> {
    try {
      await this.openConnection();
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

      const queryNivel = `INSERT INTO Niveles (id_user, nivel, puntos_totales) 
      VALUES (?, ?, ?); `;
      await CapacitorSQLite.run({
        database: this.dbName,
        statement: queryNivel,
        values: [id_usuario, 1, 0]
      });

      console.log("Usuario registrado correctamente");
      return true;
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      return false;
    } finally {
      await this.closeConnection();
    }
  }

  async actualizarUser(id_user: number, nombre: string, apellido: string) {
    const query = `
      UPDATE Usuarios 
      SET nombre = ?, apellido = ?
      WHERE id_user = ?
    `;
    try {
      await this.openConnection();
      const result = await CapacitorSQLite.run({
        statement: query,
        values: [nombre, apellido, id_user]
      });
      console.log('Usuario actualizado con éxito:', result);
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      throw error;
    } finally {
      await this.closeConnection();
    }
  }

  async eliminarUser(id_user: number) {
    const query = `DELETE FROM Usuarios WHERE id_user = ?`;
    try {
      await this.openConnection();
      const result = await CapacitorSQLite.run({
        statement: query,
        values: [id_user]
      });
      console.log('Usuario eliminado con éxito:', result);
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      throw error;
    } finally {
      await this.closeConnection();
    }
  }
  async login(username: string, password: string): Promise<boolean> {
    try {
      await this.openConnection();
      const query = `SELECT * FROM Usuarios WHERE username = ? AND password = ?`;
      const result = await CapacitorSQLite.query({
        database: this.dbName,
        statement: query,
        values: [username, password]
      });
      if (result.values && result.values.length > 0) {
        this.currentUser = result.values[0];
        this.isAuthenticated.next(true);
        console.log("Usuario autenticado desde SQLite:", this.currentUser);
        return true;
      } else {
        console.error("Usuario o credenciales incorrectas en SQLite.");
        return false;
      }
    } catch (error) {
      console.error("Error en la autenticación:", error);
      return false;
    } finally {
      await this.closeConnection();
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      await this.openConnection();
      const query = `SELECT * FROM Usuarios`;
      const result = await CapacitorSQLite.query({
        database: this.dbName,
        statement: query,
        values: []
      });
      console.log("Resultado de la consulta de usuarios:", result);
      return result.values || [];
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      return [];
    } finally {
      await this.closeConnection();
    }
  }


  async getRoles() {
    try {
      await this.openConnection();
      const query = `SELECT * FROM Roles`;
      const result = await CapacitorSQLite.query({
        database: this.dbName,
        statement: query,
        values: []
      });
      console.log(result.values);
      return result.values || [];
    } catch (error) {
      console.error("Error al obtener roles:", error);
      return [];
    } finally {
      await this.closeConnection();
    }
  }

  async consultas(query: string, params: any[] = []) {
    try {
      await this.openConnection();
      const result = await CapacitorSQLite.query({
        statement: query,
        values: params
      });
      console.log('Resultado de la consulta:', result.values);
      return result.values;
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      throw error;
    } finally {
      await this.closeConnection();
    }
  }

  async getCurrentUser() {
    try {
      if (!this.currentUser) return null;

      await this.openConnection();
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
        console.log("Usuario actual:", userData);

        // Guarda los datos localmente
        await Preferences.set({
          key: 'currentUser',
          value: JSON.stringify(userData)
        });
        return userData;
      } else {
        console.error("Usuario no encontrado en la base de datos.");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el usuario autenticado:", error);
      return null;
    } finally {
      await this.closeConnection();
    }
  }

  async traerNombreUsuario(): Promise<string> {
    try {
      const { value } = await Preferences.get({ key: 'currentUser' });
      if (value) {
        const user = JSON.parse(value);
        const nombreAvatar = `${user.nombre} ${user.apellido}`;
        return nombreAvatar;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el nombre del usuario:', error);
      return null;
    }
  }

  async borrarLocalStorage() {
    try {
      await Preferences.clear();
      console.log('LocalStorage limpiado completamente.');
    } catch (error) {
      console.error('Error al borrar el LocalStorage:', error);
      throw error;
    }
  }

  logout() {
    try {
      this.currentUser = null;
      this.isAuthenticated.next(false);
      this.borrarLocalStorage();
      console.log('Sesión cerrada.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async downloadDatabase() {
    try {
      this.http.get('assets/db/db.json').subscribe(
        async (jsonExport: JsonSQLite) => {
          try {
            const jsonstring = JSON.stringify(jsonExport);
            console.log("JSON descargado:", jsonstring);
            await this.openConnection();
            const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

            if (isValid.result) {
              this.dbName = jsonExport.database;
              await CapacitorSQLite.importFromJson({ jsonstring });
              console.log("Base de datos importada exitosamente desde JSON.");
              const usuarios = await this.getAllUsers();
              console.log("Usuarios registrados: ",usuarios);
              this.dbready.next(true);
            } else {
              console.error("El JSON de la base de datos no es válido");
            }
          } catch (error) {
            console.error("Error durante la importación de la base de datos desde JSON:", error);
          } finally {
            await this.closeConnection();
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
}
