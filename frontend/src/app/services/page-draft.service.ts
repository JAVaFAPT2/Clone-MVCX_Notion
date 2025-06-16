import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class PageDraftService {
  private readonly _draft$ = new BehaviorSubject<Page | null>(null);

  /**
   * Observable stream of the current draft page
   */
  get draft$(): Observable<Page | null> {
    return this._draft$.asObservable();
  }

  /** Return current value synchronously */
  get current(): Page | null {
    return this._draft$.value;
  }

  /** Replace the whole draft (deep copy to avoid reference leaks) */
  setDraft(page: Page): void {
    this._draft$.next(JSON.parse(JSON.stringify(page)));
  }

  /** Update part of the draft (shallow merge) */
  updateDraft(partial: Partial<Page>): void {
    const existing = this._draft$.value;
    if (existing) {
      this._draft$.next({ ...existing, ...partial });
    }
  }

  /** Clear the draft (e.g., on page navigation) */
  clear(): void {
    this._draft$.next(null);
  }
} 