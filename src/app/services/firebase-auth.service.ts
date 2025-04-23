import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, from, firstValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private app = initializeApp(environment.firebase);
  private analytics = getAnalytics(this.app);
  private auth = getAuth(this.app);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  private baseUrl: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    // Get the API URL from the ApiService
    this.baseUrl = this.apiService.apiUrl;

    // Listen for auth state changes
    onAuthStateChanged(this.auth, (user: User | null) => {
      this.currentUserSubject.next(user);
    });
  }

  // Sign in with Google
  signInWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)
      .then(async (result: any) => {
        // Get the user's ID token
        const idToken = await result.user.getIdToken();

        // Send the token to your backend
        return this.verifyToken(idToken);
      })
      .catch((error) => {
        console.error('Google sign-in error:', error);
        if (error.code === 'auth/api-key-not-valid') {
          console.error('Invalid API key. Please check your Firebase configuration.');
        }
        throw error;
      }));
  }

  // Verify token with backend
  private verifyToken(idToken: string): Promise<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/verify-firebase-token`,
        { idToken },
        { headers, withCredentials: true }
      )
    );
  }

  // Sign out
  signOut(): Observable<any> {
    return from(signOut(this.auth)
      .then(async () => {
        // Also sign out from the backend
        return await firstValueFrom(
          this.http.post(`${this.baseUrl}/logout`, {},
            { withCredentials: true }
          )
        );
      }));
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Get user ID token
  async getUserIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;

    return user.getIdToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }
}
