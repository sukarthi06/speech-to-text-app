import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '../guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('../features/login/login').then(m => m.Login) },
  { path: 'profile', canActivate: [authGuard], loadComponent: 
      () => import('../features/profile/profile').then(m => m.Profile) },

];