import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorSQLite, JsonSQLite } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
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

  constructor(private http: HttpClient) { 
    this.dbready = new BehaviorSubject(false);
    this.isWeb = false;
    this.isIos = false;
    this.dbName = 'gamificationDB';
  }
  async init() {
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
  
    if (!dbSetup.value) {
      // solo la primera vez
      await this.downloadDatabase();
      await Preferences.set({ key: 'first_setup_key', value: '1' });
    } else {
      // si la base de datos ya existe solo abre la conexion
      this.dbName = await this.getDbName();
      await CapacitorSQLite.createConnection({ database: this.dbName });
      await CapacitorSQLite.open({ database: this.dbName });
      this.dbready.next(true);
    }
  }
  

  async createTables() {
    try {
      const createUsuariosTable = `
        CREATE TABLE IF NOT EXISTS Usuarios (
          id_user INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          nivel INTEGER DEFAULT 1, 
          puntos_totales INTEGER DEFAULT 0
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
        statements: `${createUsuariosTable} ${createDesafiosTable} ${createHistorialDesafiosTable}` 
      });

      console.log("Tablas creadas correctamente en la base de datos.");
    } catch (error) {
      console.error("Error al crear las tablas:", error);
    }
  }

  async downloadDatabase() {
    this.http.get('assets/db/db.json').subscribe(
      async (jsonExport: JsonSQLite) => {
        const jsonstring = JSON.stringify(jsonExport);
        const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });
  
        if (isValid.result) {
          this.dbName = jsonExport.database;
  
          // importo la base de datos desde el json
          await CapacitorSQLite.importFromJson({ jsonstring });
          console.log("Base de datos importada exitosamente desde JSON.");
  
          // creo y abro la conexión
          await CapacitorSQLite.createConnection({ database: this.dbName });
          await CapacitorSQLite.open({ database: this.dbName });
          
          // creo las tablas solo si es necesario
          await this.createTables();
  
          // coloco el valor en preference para evitar una carga repetida
          await Preferences.set({ key: 'first_setup_key', value: '1' });
          await Preferences.set({ key: 'dbname', value: this.dbName });
  
          this.dbready.next(true);
        } else {
          console.error("El JSON de la base de datos no es válido");
        }
      },
      (error) => {
        console.error("Error al descargar la base de datos JSON:", error);
      }
    );
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

  async login(username: string, password: string): Promise<boolean> {
    try {
      const query = `SELECT * FROM Usuarios WHERE username = ? AND password = ?`;
      const result = await CapacitorSQLite.query({
        database: this.dbName,
        statement: query,
        values: [username, password]        
      });
      console.log("usuario:",result.values);

      if (result.values && result.values.length > 0) {
        this.currentUser = result.values[0];
        this.isAuthenticated.next(true);
        console.log("Usuario autenticado:", this.currentUser);
        return true;
      } else {
        console.error("Usuario o credenciales incorrectas");
        return false;
      }
    } catch (error) {
      console.error("Error en la autenticación:", error);
      return false;
    }
  }

  async registerUser(username: string, email: string, password: string): Promise<boolean> {
    try {
      const query = `
        INSERT INTO Usuarios (username, email, password, nivel, puntos_totales)
        VALUES (?, ?, ?, ?, ?);
      `;
      await CapacitorSQLite.run({
        database: this.dbName,
        statement: query,
        values: [username, email, password, 1, 0] 
      });
      const result = await CapacitorSQLite.query({
        database: this.dbName,
        statement: `SELECT * FROM Usuarios WHERE username = ? AND email = ?`,
        values: [username, email]
      });
      console.log("Usuario registrado correctamente");
      return true;
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      return false;
    }
  }
  
  getCurrentUser() {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    this.isAuthenticated.next(false);
  }
}
