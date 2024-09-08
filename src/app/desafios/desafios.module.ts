import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DesafiosPageRoutingModule } from './desafios-routing.module';

import { DesafiosPage } from './desafios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DesafiosPageRoutingModule
  ],
  declarations: [DesafiosPage]
})
export class DesafiosPageModule {}
