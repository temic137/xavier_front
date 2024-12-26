import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:'./register.component.html' ,
  styleUrl:'./register.component.css',
})
export class RegisterComponent {
  username = '';
  password = '';

  constructor(private apiService: ApiService, private router: Router) {}

  onSubmit() {
    this.apiService.register(this.username, this.password).subscribe(
      (response) => {
        console.log('Registered successfully');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Registration failed', error);
      }
    );
  }
  login(){
    this.router.navigate(['/login']);
  }
}