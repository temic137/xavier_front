// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ApiService } from '../api.service';
// import { Router } from '@angular/router';


// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl:'./login.component.html',
//   styleUrl: './login.component.css',
// })
// export class LoginComponent {
//   username = '';
//   password = '';
//   isLoading = false;

//   constructor(private apiService: ApiService, private router: Router) {}

//   onSubmit() {
//     this.isLoading = true;
//     this.apiService.login(this.username, this.password).subscribe(
//       (response) => {
//         console.log('Logged in successfully');
//         this.router.navigate(['/chatbots']);
//         this.isLoading = false;
//       },
//       (error) => {
//         console.error('Login failed', error);
//         this.isLoading = false;
//       }
//     );
//   }
//   register(){
//     this.router.navigate(['/register']);
//   }
// }


// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ApiService } from '../api.service';
// import { Router } from '@angular/router';


// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl:'./login.component.html',
//   styleUrl: './login.component.css',
// })
// export class LoginComponent {
//   username = '';
//   password = '';
//   isLoading = false;

//   constructor(private apiService: ApiService, private router: Router) {}

//   onSubmit() {
//     this.isLoading = true;
//     this.apiService.login(this.username, this.password).subscribe(
//       (response) => {
//         console.log('Logged in successfully');
//         this.router.navigate(['/chatbots']);
//         this.isLoading = false;
//       },
//       (error) => {
//         console.error('Login failed', error);
//         this.isLoading = false;
//       }
//     );
//   }
//   register(){
//     this.router.navigate(['/register']);
//   }
// }



import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private firebaseAuth: FirebaseAuthService
  ) {}

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.firebaseAuth.isAuthenticated()) {
      this.router.navigate(['/chatbots']);
    }
  }

  signInWithGoogle() {
    this.isLoading = true;
    this.errorMessage = '';

    this.firebaseAuth.signInWithGoogle().subscribe(
      (response) => {
        console.log('Google sign-in successful');
        this.router.navigate(['/chatbots']);
        this.isLoading = false;
      },
      (error) => {
        console.error('Google sign-in failed', error);
        this.isLoading = false;

        if (error.code === 'auth/api-key-not-valid') {
          this.errorMessage = 'Firebase configuration error. Please contact support.';
        } else if (error.code === 'auth/popup-closed-by-user') {
          this.errorMessage = 'Sign-in cancelled. Please try again.';
        } else if (error.code === 'auth/popup-blocked') {
          this.errorMessage = 'Sign-in popup was blocked. Please allow popups for this site.';
        } else if (error.code === 'auth/network-request-failed') {
          this.errorMessage = 'Network error. Please check your internet connection.';
        } else {
          this.errorMessage = 'Google sign-in failed. Please try again.';
        }
      }
    );
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = ''; // Reset any previous error messages

    this.apiService.login(this.username, this.password).subscribe(
      (response) => {
        console.log('Logged in successfully');
        this.router.navigate(['/chatbots']);
        this.isLoading = false;
      },
      (error) => {
        console.error('Login failed', error);
        this.isLoading = false;

        // Set appropriate error message based on the error
        if (error.status === 401) {
          this.errorMessage = 'Invalid username or password';
        } else if (error.status === 404) {
          this.errorMessage = 'User not found';
        } else {
          this.errorMessage = 'Login failed. Please try again later.';
        }
      }
    );
  }

  register() {
    this.router.navigate(['/register']);
  }
}
