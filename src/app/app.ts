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
    // When the user logs in, fetch their profile
    this.authSub = this.authService.authState$.subscribe(user => {
      if (user) {
        this.profileService.fetchUserProfile();
      }
    });
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
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