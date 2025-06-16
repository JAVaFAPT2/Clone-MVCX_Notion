import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  usernameOrEmail = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading = true;
    this.error = '';
    this.auth.login({ usernameOrEmail: this.usernameOrEmail, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/workspace']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.error = 'Cannot connect to server. Please try again later.';
        } else {
          this.error = err.error?.message || 'Login failed';
        }
      }
    });
  }
} 