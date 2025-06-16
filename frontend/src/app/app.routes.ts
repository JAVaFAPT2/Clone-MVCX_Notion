import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './auth.guard';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { PageEditorComponent } from './components/page-editor/page-editor.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'workspace', canActivate: [AuthGuard], component: WorkspaceComponent },
  { path: 'workspace/page/new', canActivate: [AuthGuard], component: PageEditorComponent },
  { path: 'workspace/page/:id', canActivate: [AuthGuard], component: PageEditorComponent },
  { path: 'collaborative-example', canActivate: [AuthGuard], loadComponent: () => import('./components/collaborative-example/collaborative-example.component').then(m => m.CollaborativeExampleComponent) },
  { path: 'block-editor-demo', canActivate: [AuthGuard], loadComponent: () => import('./pages/block-editor-demo/block-editor-demo.component').then(m => m.BlockEditorDemoComponent) },
  { path: 'search', canActivate: [AuthGuard], loadComponent: () => import('./components/search/search-results.component').then(m => m.SearchResultsComponent) },
  { path: 'protected', canActivate: [AuthGuard], component: LoginComponent },
  { path: 'product', loadComponent: () => import('./components/product/product.component').then(m => m.ProductComponent) },
  { path: 'download', loadComponent: () => import('./components/download/download.component').then(m => m.DownloadComponent) },
  { path: 'solutions', loadComponent: () => import('./components/solutions/solutions.component').then(m => m.SolutionsComponent) },
  { path: 'resources', loadComponent: () => import('./components/resources/resources.component').then(m => m.ResourcesComponent) },
  { path: 'pricing', loadComponent: () => import('./components/pricing/pricing.component').then(m => m.PricingComponent) },
];
