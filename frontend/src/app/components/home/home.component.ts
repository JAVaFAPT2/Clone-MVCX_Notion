import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  currentUser: any = null;

  constructor(private theme: ThemeService, private auth: AuthService, private router: Router) {
    const token = this.auth.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser = { username: payload.sub };
      } catch {}
    }
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  toggleDarkMode() {
    this.theme.toggle();
  }
}
