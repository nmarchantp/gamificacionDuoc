import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Device } from '@capacitor/device';
import { SqliteService } from './services/sqlite.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {

  public isWeb: boolean;
  public load: boolean;

  constructor(
    private platform: Platform,
    private sqlite: SqliteService
  ) {
    this.isWeb = false;
    this.load = false;
    this.initApp();
  }

  async initApp() {
    try {
      await this.platform.ready();
      const info = await Device.getInfo();
      this.isWeb = info.platform === 'web';
      if (this.isWeb) {
        const jeepSqliteEl = document.createElement('jeep-sqlite');
        document.body.appendChild(jeepSqliteEl);
      }
      await this.sqlite.init();
  
      this.sqlite.dbready.subscribe(load => {
        this.load = load;
        console.log("Estado de la base de datos:", this.load);
      });
    } catch (error) {
      console.error("Error durante la inicialización de la aplicación:", error);
    }
  }
  
}
