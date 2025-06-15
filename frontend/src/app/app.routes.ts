import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './auth.guard';
import { HomeComponent } from './components/home.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'protected', canActivate: [AuthGuard], component: LoginComponent },
  { path: 'product', loadComponent: () => import('./components/product/product.component').then(m => m.ProductComponent) },
  { path: 'download', loadComponent: () => import('./components/download/download.component').then(m => m.DownloadComponent) },
  { path: 'solutions', loadComponent: () => import('./components/solutions/solutions.component').then(m => m.SolutionsComponent) },
  { path: 'resources', loadComponent: () => import('./components/resources/resources.component').then(m => m.ResourcesComponent) },
  { path: 'pricing', loadComponent: () => import('./components/pricing/pricing.component').then(m => m.PricingComponent) },
];
