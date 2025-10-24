import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth'; // Ensure this path is correct
import { environment } from '../../environments/environment.prod';

// Define interfaces at the top level for reusability
interface ApiResponse { success: boolean; data: any; error?: string; }
export interface Profile { name: string; defaultCurrency: string; imageUrl: string; }

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = `${environment.backendUrl}/api`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Use a signal to store the current user's profile state for the whole app
  public currentUserProfile = signal<Profile | null>(null);

  /**
   * This is the method the dashboard and other components should call.
   * It fetches the user's profile, updates the local signal, and returns the Observable.
   */
  getProfile(): Observable<ApiResponse> {
    const userUID = this.authService.getCurrentUserUID();
    if (!userUID) {
      return of({ success: true, data: null });
    }
    
    return this.http.get<ApiResponse>(`${this.apiUrl}/profile?userId=${userUID}`).pipe(
      // The 'tap' operator performs a side-effect without changing the stream.
      // Here, we use it to update our signal whenever the profile is fetched.
      tap(res => {
        if (res.success) {
          this.currentUserProfile.set(res.data);
        }
      })
    );
  }

  /**
   * A fire-and-forget method for components (like AppComponent) that just need to
   * trigger a profile fetch without needing to chain onto the result.
   */
  fetchUserProfile(): void {
    // This simply calls getProfile and subscribes, because we only care about the
    // side-effect (the 'tap' operator) happening inside getProfile.
    this.getProfile().subscribe();
  }

  saveProfile(profileData: Partial<Profile>): Observable<ApiResponse> {
    const userUID = this.authService.getCurrentUserUID();
    if (!userUID) return of({ success: false, data: null, error: "User not authenticated" });

    const payload = { ...profileData, user: userUID };
    return this.http.post<ApiResponse>(`${this.apiUrl}/profile`, payload).pipe(
      // Also update the local signal on a successful save
      tap(res => {
        if (res.success) {
          this.currentUserProfile.set(res.data);
        }
      })
    );
  }
  
  getCloudinarySignature(): Observable<{success: boolean, signature: string, timestamp: number}> {
    return this.http.post<{success: boolean, signature: string, timestamp: number}>(`${this.apiUrl}/cloudinary-signature`, {});
  }
}