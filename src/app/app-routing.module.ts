import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/autenticacion.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'desafios',
    loadChildren: () =>
      import('./desafios/desafios.module').then((m) => m.DesafiosPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'resetpass',
    loadChildren: () =>
      import('./resetpass/resetpass.module').then((m) => m.ResetpassPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: 'prueba-api',
    loadChildren: () => import('./prueba-api/prueba-api.module').then( m => m.PruebaApiPageModule)
  },
  {
    path: 'prueba-api',
    loadChildren: () => import('./prueba-api/prueba-api.module').then( m => m.PruebaApiPageModule)
  },
  {
    path: 'notfound',
    loadChildren: () => import('./notfound/notfound.module').then( m => m.NotFoundPageModule)
  },
  {
    path: '**', 
    redirectTo: 'notfound' 
  }


  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
