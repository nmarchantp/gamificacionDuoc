import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorSQLite, JsonSQLite } from '@capacitor-community/sqlite';
import { isPlatform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, catchError, Observable, of, retry } from 'rxjs';
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

  constructor(private http: HttpClient) { 
    this.dbready = new BehaviorSubject(false);
    this.isWeb = false;
    this.isIos = false;
    this.dbName = 'gamificationDB';
  }

  ngOninit(){

  }
  
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
              console.log("Base de datos importada exitosamente desde JSON.");
              const usuarios =  await this.getAllUsers();
              console.log(usuarios);

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
  

      await this.deleteDatabase(this.dbName);
  
      const dbSetup = await Preferences.get({ key: 'first_setup_key' });
      if (!dbSetup.value) {
        await CapacitorSQLite.createConnection({ database: this.dbName });
        await CapacitorSQLite.open({ database: this.dbName });
        await this.createTables();
        await this.downloadDatabase();
        await Preferences.set({ key: 'first_setup_key', value: '1' });
      } else {
        await CapacitorSQLite.createConnection({ database: this.dbName });
        await CapacitorSQLite.open({ database: this.dbName });
      }
  
      this.dbready.next(true);
    } catch (error) {
      console.error("Error durante la inicialización:", error);
      this.dbready.next(false);
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

  async deleteDatabase(dbName: string) {
    try {
      // Abre la conexión si no está abierta
      await CapacitorSQLite.createConnection({ database: dbName });
      await CapacitorSQLite.open({ database: dbName });
  
      // Ahora que la conexión está abierta, procede a eliminar la base de datos
      await CapacitorSQLite.deleteDatabase({ database: dbName });
      console.log(`Base de datos ${dbName} eliminada correctamente`);
    } catch (err) {
      console.error('Error al eliminar la base de datos:', err);
    }
  }
  
  
  async getDbName(){
    if(!this.dbName){
      const dbname = await Preferences.get({ key: 'dbname' });
      if(dbname.value){
        this.dbName = dbname.value;
      }
    }
    return this.dbName;
  }

  async getRoles(){
    await CapacitorSQLite.createConnection({ database: this.dbName });
    await CapacitorSQLite.open({ database: this.dbName });
    const query = `SELECT * FROM Roles`;
    const result = await CapacitorSQLite.query({
      database: this.dbName,
      statement: query,
      values: []
    });
    console.log(result.values);
    return result.values || [];
  }

//metodo para realizar cualquier consuilta y mostrarlo en consola
  async consultas(query: string, params: any[] = []) {
    try {
      const result = await CapacitorSQLite.query({
        statement: query,
        values: params
      });
      console.log('Resultado de la consulta:', result.values);
      return result.values;
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      throw error;
    }
  }  


  //metodo que consulta la base de datos segun el username y password entregado
  //luego valida si el usuario existe y si tiene permisos para acceder
  async login(username: string, password: string): Promise<boolean> {
    try {
      await CapacitorSQLite.createConnection({ database: this.dbName });
      await CapacitorSQLite.open({ database: this.dbName });
      const query = `SELECT * FROM Usuarios WHERE username = ? AND password = ?`;
      const result = await CapacitorSQLite.query({
        database: this.dbName,
        statement: query,
        values: [username, password]        
      });
      //await this.consultas('SELECT * FROM Usuarios WHERE username = ?', [username]);
      console.log(result);
      if (result.values && result.values.length > 0) {
        this.currentUser = result.values[0];
        this.isAuthenticated.next(true);
        console.log("Usuario autenticado desde SQLite_:", this.currentUser);
        return true;
      }else{
        console.error("Usuario o credenciales incorrectas en SQLite.");
        return false;
      }

      // const apiResult: any = await this.http.get(this.apiUrl).toPromise();
      // console.log(apiResult);
      
      // if (apiResult && apiResult.results && Array.isArray(apiResult.results)) {
      //   const apiUser = apiResult.results.find((user: any) => 
      //     user.login.username === username && user.login.password === password
      //   );

      //   if (apiUser) {
      //     this.currentUser = {
      //       username: apiUser.login.username,
      //       password: apiUser.login.password,
      //       name: `${apiUser.name.first} ${apiUser.name.last}`,
      //       email: apiUser.email
      //     };
      //     this.isAuthenticated.next(true);
      //     console.log("Usuario autenticado desde la API:", this.currentUser);
      //     return true;
      //   } else {
      //     console.error("Usuario o credenciales incorrectas en ambas fuentes");
      //   }
      // } else {
      //   console.error("La respuesta de la API no contiene la estructura esperada.");
      // }
    
      } catch (error) {
        console.error("Error en la autenticación:", error);
        return false;
    }      
      //no puedo usar el localstorage para  guardar el usuario
      //por lo tanto no lo puedo autenticar desde aca
    //   const storedUser = await this.getUsuarioLocalStorage();
    // if (storedUser && storedUser.username === username && storedUser.password === password) {
    //   this.currentUser = storedUser;
    //   this.isAuthenticated.next(true);
    //   console.log("Usuario autenticado desde localStorage:", this.currentUser);
    //   return true;
    // } else {
    //   console.error("Usuario o credenciales incorrectas en localStorage.");
    //   return false;
    // }
  }

  async registerUser(username: string, email: string, password: string, nombre: string,  apellido: string, rol:  number): Promise<boolean> {
    try {
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

      const queryNivel =  `INSERT INTO Niveles (id_user, nivel, puntos_totales) 
      VALUES (?,?,?); `;
      await  CapacitorSQLite.run({
        database: this.dbName,
        statement: queryNivel,
        values: [id_usuario, 1, 0]
        });

      console.log("Usuario registrado correctamente");
      return true;
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      return false;
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      // Crea y abre la conexión a la base de datos si no está abierta.
      await CapacitorSQLite.createConnection({ database: this.dbName });
      await CapacitorSQLite.open({ database: this.dbName });
      console.log("Conexión a la base de datos abierta correctamente.");
      
      // Realiza la consulta para obtener los usuarios.
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
      // Cierra la conexión después de usarla
      await CapacitorSQLite.close({ database: this.dbName });
    }
  }
  

    async actualizarUser(id_user: number, nombre: string, apellido: string) {
      const query = `
        UPDATE Usuarios 
        SET nombre = ?, apellido = ?
        WHERE id_user = ?
      `;
      try {
        const result = await CapacitorSQLite.run({
          statement: query,
          values: [nombre, apellido, id_user] 
        });
        console.log('Usuario actualizado con éxito:', result);
      } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        throw error;
      }
    }

    async eliminarUser(id_user: number) {
      const query = `DELETE FROM Usuarios WHERE id_user = ?`;
      try {
        const result = await CapacitorSQLite.run({
          statement: query,
          values: [id_user] 
        });
        console.log('Usuario eliminado con éxito:', result);
      } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        throw error;
      }
    }
    
    
  
  async getCurrentUser() {
    if (!this.currentUser) return null;
  
    try {
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
          apellido:  user.apellido,
          rol: user.nombre_rol,
          nivel: user.nivel,
          puntos_totales: user.puntos_totales
        };
        console.log("Current user", userData);

        //guardo los datos localmente (localstorage)
        await Preferences.set({
          key: 'currentUser',
          value:JSON.stringify(userData)
        });
        return userData;

      } else {
        console.error("Usuario no encontrado en la base de datos.");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el usuario autenticado:", error);
      return null;
    }
  }
  

  async traerNombreUsuario(): Promise<string>{
    try {
      const {value} = await Preferences.get({ key: 'currentUser'});
      if (value) {
        const user = JSON.parse(value);
        const nombreAvatar = user.nombre + " " + user.apellido;
        return nombreAvatar;
      }else{
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el nombre del usuario:', error);
      return null;
    }
  }
  

  
  //metodo para borar el local storage
  async borrarLocalStorage(){
    await Preferences.clear();
    console.log('Se ha limpiado localstorage completamente');
  } 
  
  //metodo para desloguear la aplicación
  logout() {
    this.currentUser = null;
    this.isAuthenticated.next(false);
    this.borrarLocalStorage();
  }

}
