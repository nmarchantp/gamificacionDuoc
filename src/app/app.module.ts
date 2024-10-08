import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { createAnimation } from '@ionic/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { defineCustomElements as jeepSqlite} from 'jeep-sqlite/loader';
import { HttpClientModule } from '@angular/common/http';

// Define una animación nula
const noAnimation = (navEl: HTMLElement, opts: any) => {
  const enteringEl = opts.enteringEl as HTMLElement;
  const leavingEl = opts.leavingEl as HTMLElement;


  // elimina la transición que generaba un pestañeo entre paginas.
  return createAnimation()
    .addElement(leavingEl)
    .beforeStyles({ 'visibility': 'hidden' }) // Oculta el contenido antes de la animación
    .addElement(enteringEl)
    .beforeStyles({ 'visibility': 'hidden' }) // Oculta el contenido antes de la animación
    .afterStyles({ 'visibility': 'visible' }); // Muestra el contenido después de la animación
};

jeepSqlite(window)
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot({
      navAnimation: noAnimation, // Establece la animación nula 
    }),
    AppRoutingModule,HttpClientModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule {}