import { JsonPipe } from '@angular/common';
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

  public dbready: BehaviorSubject<boolean>
  public isWeb: boolean;
  public isIos: boolean;
  public dbName: string;

  constructor(private http: HttpClient) { 
    this.dbready = new BehaviorSubject(false);
    this.isWeb = false;
    this.isIos = false;
    this.dbName = '';
  }

  async init(){
    const info = await Device.getInfo();
    const sqlite = CapacitorSQLite as any;

    if(info.platform == 'android'){
      try{
        await sqlite.requestPermissions();
      }catch (error) {
        console.error("Esta app necesita permisos para funcionar")
      }
    }else if (info.platform == 'web'){
      this.isWeb = true;
      await sqlite.initWebStore();
    }else if (info.platform == 'ios'){
      this.isIos = true;
    }

    this.setupDatabase();
  }

  async setupDatabase(){
    const dbSetup = await Preferences.get({ key: 'first:_setup__key '})

    if(!dbSetup.value){
      this.downloadDatabase();
    }else{
      this.dbName = await this.getDbName();
      await CapacitorSQLite.createConnection({ database: this.dbName });
      await CapacitorSQLite.open({ database: this.dbName });
      this.dbready.next(true);
    }
  }

  downloadDatabase(){
    this.http.get('asset/db/db.json').subscribe(async (jsonExport: JsonSQLite) => {
      const jsonstring = JSON.stringify(jsonExport);
      const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

      if(isValid.result){
        this.dbName = jsonExport.database;
        await CapacitorSQLite.importFromJson({ jsonstring });
        await CapacitorSQLite.createConnection({ database: this.dbName });
        await CapacitorSQLite.open({ database: this.dbName });

        await Preferences.set({ key: 'first:_setup__key ', value:'1'})
        await Preferences.set({ key: 'dbname ', value: this.dbName})

        this.dbready.next(true);
      }

    });

  }

  async getDbName(){
    if(!this.dbName){
      const dbname = await Preferences.get({ key: 'dbname'})
      if(dbname.value){
        this.dbName = dbname.value
      }
    }
    return this. dbName;
  }
}
