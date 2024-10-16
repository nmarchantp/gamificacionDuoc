import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorSQLite, JsonSQLite } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, catchError, Observable, of, retry } from 'rxjs';
import { Storage  } from '@capacitor/storage';


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

  async createTables() {
    try {
      const createUsuariosTable = `
      CREATE TABLE IF NOT EXISTS Usuarios (
        id_user INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        foto TEXT
      );
    `;

      const createNivelesTable = `
      CREATE TABLE IF NOT EXISTS Niveles (
        id_nivel INTEGER PRIMARY KEY AUTOINCREMENT,
        id_user INTEGER NOT NULL,
        nivel INTEGER DEFAULT 1, 
        puntos_totales INTEGER DEFAULT 0,
        FOREIGN KEY (id_user) REFERENCES Usuarios(id_user) ON DELETE CASCADE
      );
    `;

      const createDesafiosTable = `
      CREATE TABLE IF NOT EXISTS Desafios (
        id_desafio INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_desafio TEXT NOT NULL,
        descripcion TEXT,
        puntos INTEGER NOT NULL
      );
    `;

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
        statements: `${createUsuariosTable} ${createNivelesTable} ${createDesafiosTable} ${createHistorialDesafiosTable}` 
      });

      console.log("Tablas creadas correctamente en la base de datos.");
    } catch (error) {
      console.error("Error al crear las tablas:", error);
    }
  }


  async init() {
    //habialitar remove para crearla base de dats nuevamente
    await Preferences.remove({ key: 'first_setup_key' });
    const info = await Device.getInfo();
    const sqlite = CapacitorSQLite as any;

    if (info.platform === 'android') {
      try {
        await sqlite.requestPermissions();
      } catch (error) {
        console.error("Esta app necesita permisos para funcionar");
      }
    } else if (info.platform === 'web') {
      this.isWeb = true;
      await sqlite.initWebStore();
    } else if (info.platform === 'ios') {
      this.isIos = true;
    }
  
    // verifico si ya hizo la configuración inicial
    const dbSetup = await Preferences.get({ key: 'first_setup_key' });
    console.log('paso por la configuracion inicial')
    console.log('valor dbSetup first_setup_key: ',dbSetup.value);

    //veriofico si existe en localstorage
    //estp no lo debería jhacer por temas de seguridad
    // const localUser = await this.getUsuarioLocalStorage();
    // if(localUser){
    //   this.currentUser = localUser;
    //   this.isAuthenticated.next(true);
    //   console.log('usuario existe en localstorage', this.currentUser);
    //   this.dbready.next(true);
    //   return;
    // }

    try{
        if (!dbSetup.value) {
          // solo la primera vez, se crea la conexiion y crea las tablas
          // await this.downloadDatabase();
          await CapacitorSQLite.createConnection({ database: this.dbName });
          await CapacitorSQLite.open({ database: this.dbName });
          await this.createTables();
          await this.traerUsuariosApi();
          await Preferences.set({ key: 'first_setup_key', value: '1' });
          console.log('Base de datos creada y usuarios cargados desde la API');
        } else {
          // si la base de datos ya existe solo abro la conexion
          this.dbName = await this.getDbName();
          await CapacitorSQLite.createConnection({ database: this.dbName });
          await CapacitorSQLite.open({ database: this.dbName });
          console.log('Conectado a la base de datos existente');
        }
        //le doy paso al siguiente page
        this.dbready.next(true);
      } catch (error) {
        console.error("Error durante la configuración de la base de datos:", error);
        this.dbready.next(false);
      }    
  }  

  
  // async downloadDatabase() {
  //   this.http.get('assets/db/db.json').subscribe(
  //     async (jsonExport: JsonSQLite) => {
  //       const jsonstring = JSON.stringify(jsonExport);
  //       const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });
  
  //       if (isValid.result) {
  //         this.dbName = jsonExport.database;
  
  //         // importo la base de datos desde el json
  //         await CapacitorSQLite.importFromJson({ jsonstring });
  //         console.log("Base de datos importada exitosamente desde JSON.");
  
  //         // creo y abro la conexión
  //         await CapacitorSQLite.createConnection({ database: this.dbName });
  //         await CapacitorSQLite.open({ database: this.dbName });
          
  //         // creo las tablas solo si es necesario
  //         await this.createTables();
  
  //         // coloco el valor en preference para evitar una carga repetida
  //         await Preferences.set({ key: 'first_setup_key', value: '1' });
  //         await Preferences.set({ key: 'dbname', value: this.dbName });
  
  //         this.dbready.next(true);
  //       } else {
  //         console.error("El JSON de la base de datos no es válido");
  //       }
  //     },
  //     (error) => {
  //       console.error("Error al descargar la base de datos JSON:", error);
  //     }
  //   );
  // }
  

  async getDbName(){
    if(!this.dbName){
      const dbname = await Preferences.get({ key: 'dbname' });
      if(dbname.value){
        this.dbName = dbname.value;
      }
    }
    return this.dbName;
  }

  //metodo que consulta la base de datos segun el username y password entregado
  //luego valida si el usuario existe y si tiene permisos para acceder
  async login(username: string, password: string): Promise<boolean> {
    try {
      // primero consulta la base de datos
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

  async registerUser(username: string, email: string, password: string, foto: string): Promise<boolean> {
    try {
      const queryUsuario = `
        INSERT INTO Usuarios (username, email, password, foto)
        VALUES (?, ?, ?, ?);
      `;
       const insertaUsuario = await CapacitorSQLite.run({
        database: this.dbName,
        statement: queryUsuario,
        values: [username, email, password, foto] 
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
  
  async getCurrentUser() {
    if (!this.currentUser) return null;
  
    try {
      const query = `
        SELECT Usuarios.username, Usuarios.email, Usuarios.foto, Niveles.nivel, Niveles.puntos_totales 
        FROM Usuarios 
        JOIN Niveles ON Usuarios.id_user = Niveles.id_user 
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
          foto: user.foto,
          nivel: user.nivel,
          puntos_totales: user.puntos_totales
        };

        //guardo los datos localmente (localstorage)
        await Storage.set({
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
  

  async deleteDatabase() {
    try {
      await CapacitorSQLite.deleteDatabase({ database: this.dbName });
      console.log("Base de datos eliminada exitosamente.");
    } catch (error) {
      console.error("Error al eliminar la base de datos:", error);
    }
  }
  
  //conecta a la api de usuarios y trae 5 al azar
  //los guarda en la base de datos, esto simula a tener  una base de datos con usuarios
  //el problema es que como son al azar, debo mostrarlos en alguna parte para usarlos
  //los mostraré con console y le preguntare al profe si sirve
  async traerUsuariosApi() {
    try {
      const apiUrl = 'https://randomuser.me/api/?results=5';
    
    // Realiza la solicitud HTTP con retry en caso de fallo
      const apiResult: any = await this.http.get(apiUrl).pipe(
        retry(3), // ntenta 3 veces en caso de error
        catchError(error => {
        console.error("Error en la solicitud de API después de reintentar:", error);
        return of(null); 
      })
    ).toPromise();
  
      if (apiResult && apiResult.results && Array.isArray(apiResult.results)) {
        for (let user of apiResult.results) {
          const username = user.login.username;
          const password = user.login.password;
          const email = user.email;
          const foto = user.picture.large;
          
          //inserto en la tabla Usuarios
          const insertUserQuery = `
            INSERT INTO Usuarios (username, email, password, foto)
            VALUES (?, ?, ?, ?);
          `;
          const insertUserResult = await CapacitorSQLite.run({
            database: this.dbName,
            statement: insertUserQuery,
            values: [username, email, password, foto]
          });
  
          // Obtiene el ID del usuario insertado
          const id_user = insertUserResult.changes.lastId;
  
          // inserto en la tabla niveles los campos relacionados al id_user
          const insertNivelQuery = `
            INSERT INTO Niveles (id_user, nivel, puntos_totales)
            VALUES (?, ?, ?);
          `;
          await CapacitorSQLite.run({
            database: this.dbName,
            statement: insertNivelQuery,
            values: [id_user, 1, 0] 
          });
          console.log(`Usuario ${username} y su nivel inicial han sido guardados en la base de datos.`);
          //guardo el susuario en localstorage
          //esto no lo debería hacer por temas de seguridad
          // const userData = { username, email, password, foto, nivel: 1, puntos_totales: 0 };
          // await Storage.set({
          // key: `user_${id_user}`,
          // value: JSON.stringify(userData)
          // });  
          // console.log(`Usuario ${username} y su nivel inicial han sido guardados en localstorage.`);
        }
      } else {
        console.error("La respuesta de la API no contiene usuarios válidos");
      }
    } catch (error) {
      console.error("Error al obtener y guardar los usuarios de la API:", error);
    }
  }
  
  //metodo para traer todos los usuarios guardados en la base de datos
  async getAllUsers(): Promise<any[]> {
    const query = `SELECT * FROM Usuarios`;
    const result = await CapacitorSQLite.query({
      database: this.dbName,
      statement: query,
      values: []
    });
    return result.values || [];
  }

  //metodo para verificar si el susuario esta en local storage antes de consultar la bd
  //esto no me sirve por que no se pueden guardar usuarios en local storage
  // async getUsuarioLocalStorage(): Promise<any> {
  //   const { value } = await Storage.get({ key: 'currentUser' });
  //   return value ? JSON.parse(value) : null;
  // }

  //metodo para borar el local storage
  async borrarLocalStorage(){
    await Storage.clear();
    console.log('Se ha limpiado localstorage completamente');
  } 
  
  //metodo para desloguear la aplicación
  logout() {
    this.currentUser = null;
    this.isAuthenticated.next(false);
    this.borrarLocalStorage();
  }

}
