import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'desafios',
        loadChildren: () => import('../desafios/desafios.module').then(m => m.DesafiosPageModule)
      },
      // {
      //   path: 'ranking',
      //   loadChildren: () => import('../ranking/ranking.module').then(m => m.RankingPageModule)
      // },
      // {
      //   path: 'premios',
      //   loadChildren: () => import('../premios/premios.module').then(m => m.PremiosPageModule)
      // },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}