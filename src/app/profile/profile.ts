import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProfileService, Profile } from '../services/profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  public profileService = inject(ProfileService);
  private http = inject(HttpClient);
  
  profileForm: FormGroup;
  isLoading = true;
  successMessage: string | null = null;
  
  // Your Cloudinary cloud name from your .env.local
  private cloudinaryCloudName = 'dchdfdaqy'; 
  
  constructor() {
    this.profileForm = this.fb.group({
      name: [''],
      defaultCurrency: ['INR'],
      imageUrl: ['']
    });
  }

  ngOnInit(): void {
    // If the profile is already loaded, patch the form
    const currentProfile = this.profileService.currentUserProfile();
    if (currentProfile) {
      this.profileForm.patchValue(currentProfile);
      this.isLoading = false;
    } else {
      // If not, wait a moment for it to load
      setTimeout(() => {
        this.profileForm.patchValue(this.profileService.currentUserProfile()!);
        this.isLoading = false;
      }, 1000);
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Get a secure signature from our backend
    this.profileService.getCloudinarySignature().subscribe(res => {
      if (!res.success) return;

      const { signature, timestamp } = res;
      const apiKey = '722431573746188'; // Get this from Cloudinary dashboard
      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudinaryCloudName}/image/upload`;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());

      // 2. Upload the file directly to Cloudinary
      this.http.post(uploadUrl, formData).subscribe((uploadRes: any) => {
        const secureUrl = uploadRes.secure_url;
        // 3. Patch the form and save the new URL to our database
        this.profileForm.patchValue({ imageUrl: secureUrl });
        this.onSubmit();
      });
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    
    this.profileService.saveProfile(this.profileForm.value).subscribe(res => {
      if (res.success) {
        this.successMessage = 'Profile saved successfully!';
        setTimeout(() => this.successMessage = null, 3000);
      }
    });
  }
}