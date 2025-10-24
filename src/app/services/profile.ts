import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

interface ApiResponse { success: boolean; data: any; error?: string; }
export interface Profile { name: string; defaultCurrency: string; imageUrl: string; }

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = `${environment.backendUrl}/api/profile`; // Point directly to the profile endpoint
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  public currentUserProfile = signal<Profile | null>(null);

  /**
   * Fetches the user's profile.
   * It does NOT send a userId. It relies on the auth.interceptor to add the
   * Authorization header, which the backend will use to identify the user.
   */
  getProfile(): Observable<ApiResponse> {
    if (!this.authService.getCurrentUserUID()) {
      return of({ success: true, data: null });
    }
    
    // The request is simple. The interceptor does all the magic.
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      tap(res => {
        if (res.success) {
          this.currentUserProfile.set(res.data);
        }
      })
    );
  }

  /**
   * Saves the user's profile.
   * It does NOT send a userId in the payload. The backend will get the
   * userId from the verified token.
   */
  saveProfile(profileData: Partial<Profile>): Observable<ApiResponse> {
    if (!this.authService.getCurrentUserUID()) {
      return of({ success: false, data: null, error: "User not authenticated" });
    }

    // The payload is just the profile data. No 'user' field needed.
    return this.http.post<ApiResponse>(this.apiUrl, profileData).pipe(
      tap(res => {
        if (res.success) {
          this.currentUserProfile.set(res.data);
        }
      })
    );
  }

  // The cloudinary signature endpoint is separate and correct.
  getCloudinarySignature(): Observable<{success: boolean, signature: string, timestamp: number}> {
    return this.http.post<{success: boolean, signature: string, timestamp: number}>(`${environment.backendUrl}/api/cloudinary-signature`, {});
  }
}