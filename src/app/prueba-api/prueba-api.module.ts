import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PruebaApiPageRoutingModule } from './prueba-api-routing.module';

import { PruebaApiPage } from './prueba-api.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PruebaApiPageRoutingModule
  ],
  declarations: [PruebaApiPage]
})
export class PruebaApiPageModule {}
