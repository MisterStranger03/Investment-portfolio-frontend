import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth';
import { ProfileService } from './services/profile';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  public profileService = inject(ProfileService);
  private authSub!: Subscription;
  
  isDropdownOpen = false;

  ngOnInit() {
    // When the user's authentication state changes...
    this.authSub = this.authService.authState$.subscribe(user => {
      // If a user is logged in...
      if (user) {
        // --- THIS IS THE FIX ---
        // Call the correct method, 'getProfile()'.
        // We subscribe here just to trigger the API call. The 'tap' operator
        // inside the service will handle updating the signal.
        this.profileService.getProfile().subscribe();
        // -------------------------
      }
    });
  }

  ngOnDestroy() {
    // Clean up the subscription to prevent memory leaks
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  logout(): void {
    this.closeDropdown();
    this.authService.logout();
  }
}