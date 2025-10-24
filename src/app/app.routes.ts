import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // ... (dashboard and add stock routes remain the same)
  {
    path: '',
    title: 'Portfolio Dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./portfolio-dashboard/portfolio-dashboard').then(c => c.PortfolioDashboardComponent),
  },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./login/login').then(c => c.LoginComponent),
  },
  {
    path: 'register',
    title: 'Register',
    loadComponent: () => import('./register/register').then(c => c.RegisterComponent),
  },
  {
    path: 'add',
    title: 'Add New Stock',
    canActivate: [authGuard],
    loadComponent: () => import('./add-stock-form/add-stock-form').then(c => c.AddStockComponent),
  },
  // --- ADD THIS NEW PROTECTED ROUTE ---
  {
    path: 'profile',
    title: 'My Profile',
    canActivate: [authGuard],
    loadComponent: () => import('./profile/profile').then(c => c.ProfileComponent),
  },
  // ---
  // ... (login and register routes remain the same)
];