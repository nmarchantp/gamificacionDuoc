import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AvatarSelectorComponent } from './avatar-selector.component';

@NgModule({
  declarations: [AvatarSelectorComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [AvatarSelectorComponent]
})
export class AvatarSelectorModule {}
