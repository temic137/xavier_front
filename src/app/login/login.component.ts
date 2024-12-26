import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:'./login.component.html', 
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private apiService: ApiService, private router: Router) {}

  onSubmit() {
    this.apiService.login(this.username, this.password).subscribe(
      (response) => {
        console.log('Logged in successfully');
        this.router.navigate(['/chatbots']);
      },
      (error) => {
        console.error('Login failed', error);
      }
    );
  }
  register(){
    this.router.navigate(['/register']);
  }
}