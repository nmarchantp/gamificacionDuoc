import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { createAnimation } from '@ionic/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { HttpClientModule } from '@angular/common/http';
import { AvatarApiService } from './services/avatar-api.service';
import { AvatarComponent } from './avatar/avatar.component';

// Importa el módulo AvatarSelectorModule
import { AvatarSelectorModule } from './avatar-selector/avatar-selector.module';

// Define una animación nula
const noAnimation = (navEl: HTMLElement, opts: any) => {
  const enteringEl = opts.enteringEl as HTMLElement;
  const leavingEl = opts.leavingEl as HTMLElement;

  // Elimina la transición que generaba un pestañeo entre páginas.
  return createAnimation()
    .addElement(leavingEl)
    .beforeStyles({ 'visibility': 'hidden' }) // Oculta el contenido antes de la animación
    .addElement(enteringEl)
    .beforeStyles({ 'visibility': 'hidden' }) // Oculta el contenido antes de la animación
    .afterStyles({ 'visibility': 'visible' }); // Muestra el contenido después de la animación
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AvatarSelectorModule, // Añade AvatarSelectorModule aquí
    IonicModule.forRoot({
      navAnimation: noAnimation, // Establece la animación nula 
    }),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, AvatarApiService],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule {
  constructor() {
    jeepSqlite(window);
  }
}
