import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class PageSelectionService {
  private selectedPageSubject = new BehaviorSubject<Page | null>(null);

  selectPage(page: Page | null) {
    this.selectedPageSubject.next(page);
  }

  getSelectedPage(): Observable<Page | null> {
    return this.selectedPageSubject.asObservable();
  }

  getCurrentPage(): Page | null {
    return this.selectedPageSubject.value;
  }
} 