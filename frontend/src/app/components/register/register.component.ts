import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  agreeToTerms = false;
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (!this.agreeToTerms) {
      this.error = 'Please agree to the Terms of Service and Privacy Policy';
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.auth.register({ 
      username: this.username, 
      email: this.email, 
      password: this.password,
      role: ['user']
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.error = 'Cannot connect to server. Please try again later.';
        } else {
          this.error = err.error?.message || 'Registration failed';
        }
      }
    });
  }
}
