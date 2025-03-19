// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ApiService } from '../api.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-register',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl:'./register.component.html' ,
//   styleUrl:'./register.component.css',
// })
// export class RegisterComponent {
//   username = '';
//   password = '';
//   isLoading = false;

//   constructor(private apiService: ApiService, private router: Router) {}

//   onSubmit() {
//     this.isLoading = true;
//     this.apiService.register(this.username, this.password).subscribe(
//       (response) => {
//         console.log('Registered successfully');
//         this.router.navigate(['/login']);
//         this.isLoading = false;
//       },
//       (error) => {
//         console.error('Registration failed', error);
//         this.isLoading = false;
//       }
//     );
//   }
//   login(){
//     this.router.navigate(['/login']);
//   }
// }



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
  isLoading = false;
  errorMessage = '';
  
  // Form validation errors
  usernameError = '';
  passwordError = '';

  constructor(private apiService: ApiService, private router: Router) {}

  validateForm(): boolean {
    let isValid = true;
    
    // Reset error messages
    this.usernameError = '';
    this.passwordError = '';
    this.errorMessage = '';
    
    // Validate username
    if (!this.username.trim()) {
      this.usernameError = 'Username is required';
      isValid = false;
    }
    
    // Validate password
    if (!this.password) {
      this.passwordError = 'Password is required';
      isValid = false;
    } else if (this.password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long';
      isValid = false;
    }
    
    return isValid;
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }
    
    this.isLoading = true;
    this.apiService.register(this.username, this.password).subscribe(
      (response) => {
        console.log('Registered successfully');
        this.router.navigate(['/login']);
        this.isLoading = false;
      },
      (error) => {
        console.error('Registration failed', error);
        this.isLoading = false;
        
        // Set appropriate error message based on error response
        if (error.status === 409) {
          this.errorMessage = 'Username already exists';
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Registration failed. Please try again later.';
        }
      }
    );
  }
  
  login(){
    this.router.navigate(['/login']);
  }
}
