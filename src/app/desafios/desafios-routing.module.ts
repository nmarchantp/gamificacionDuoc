import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DesafiosPage } from './desafios.page';

const routes: Routes = [
  {
    path: '',
    component: DesafiosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DesafiosPageRoutingModule {}
