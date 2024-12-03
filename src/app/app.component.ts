import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Device } from '@capacitor/device';
import { SqliteService } from './services/sqlite.service';
import { SplashScreen } from '@capacitor/splash-screen';

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
    //this.showSplash(); // con esta confi ya se deberia ejecutar el splash
  }

  async initApp() {
    try {

      this.platform.ready().then(async () => {
        const info = await Device.getInfo();
        this.isWeb = info.platform == 'web';
        this.load = true;
      })

      await this.sqlite.init();
  
      this.sqlite.dbready.subscribe(load => {
        this.load = load;
        console.log("Estado de la base de datos:", this.load);
      });
    } catch (error) {
      console.error("Error durante la inicialización de la aplicación:", error);
    }
  }
  
  async showSplash(){
    await SplashScreen.show({
      autoHide: true,
      showDuration: 3000, // 3 segundos (podemos cambiarlo dependiendo las pruebas en la tablet)
    });
  }

}
