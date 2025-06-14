import { Routes } from '@angular/router';
import { PageEditorComponent } from './components/page-editor/page-editor.component';

export const routes: Routes = [
  { path: '', component: PageEditorComponent },
  { path: '**', redirectTo: '' }
];
