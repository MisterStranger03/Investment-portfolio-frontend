import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use modern inject() function to get instances of Firebase Auth and Angular Router
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);

  // Get an observable of the current authentication state from Firebase
  public authState$ = authState(this.auth);
  
  // Use a signal for a modern, reactive way to track if the user is logged in
  public isAuthenticated = signal<boolean>(false);
  public currentUser: User | null = null;

  constructor() {
    // Subscribe to the authentication state to update our signal and current user
    this.authState$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated.set(!!user); // Sets the signal to true if user is not null, false otherwise
    });
  }

  // Method for user registration
  register(credentials: { email: string, password: string }): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, credentials.email, credentials.password)).pipe(
      map(userCredential => userCredential.user) // Return just the user object on success
    );
  }

  // Method for user login
  login(credentials: { email: string, password: string }): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, credentials.email, credentials.password)).pipe(
      map(userCredential => userCredential.user) // Return just the user object on success
    );
  }

  // ... inside the AuthService class ...

  // ADD THIS METHOD
  getCurrentUserUID(): string | null {
    return this.currentUser ? this.currentUser.uid : null;
  }

// ... rest of the class

  // Method for user logout
  async logout(): Promise<void> {
    await signOut(this.auth);
    // After signing out, navigate the user back to the login page
    this.router.navigate(['/login']);
  }

  // Asynchronous method to get the current user's Firebase ID Token
  async getToken(): Promise<string | null> {
    // If there is no logged-in user, return null
    if (!this.currentUser) {
      return null;
    }
    // Otherwise, get and return the ID token
    return this.currentUser.getIdToken();
  }
}