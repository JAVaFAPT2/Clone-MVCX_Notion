import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly darkMode$ = new BehaviorSubject<boolean>(false);

  constructor() {
    // Load preference from localStorage if it exists
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      this.enableDarkMode();
    }
  }

  /** Toggle dark-mode on or off */
  toggle(): void {
    if (this.darkMode$.value) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  /** Observable to react to dark-mode changes */
  isDarkMode$() {
    return this.darkMode$.asObservable();
  }

  private enableDarkMode() {
    document.body.classList.add('dark-mode');
    this.darkMode$.next(true);
    localStorage.setItem('darkMode', 'true');
  }

  private disableDarkMode() {
    document.body.classList.remove('dark-mode');
    this.darkMode$.next(false);
    localStorage.setItem('darkMode', 'false');
  }
} 