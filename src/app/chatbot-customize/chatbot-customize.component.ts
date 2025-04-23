import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface CustomizationData {
  theme_color: string;
  avatar_url: string;
  enable_tickets: boolean;
}

@Component({
  selector: 'app-chatbot-customize',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterModule],
  templateUrl: './chatbot-customize.component.html',
  styleUrl: './chatbot-customize.component.css'
})
export class ChatbotCustomizeComponent {
  // private apiUrl = 'https://xavier-back.onrender.com'; // Update this with your Flask backend URL
  private apiUrl = 'http://127.0.0.1:5000';
  themeColor: string = '#0084ff';
  avatarUrl: string = '';
  avatarPreview: string | null = null;
  // Removed escalation feature
  enableTickets: boolean = false;
  isSaving: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  chatbotId: string = '';
  imageUrlInput: string = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.chatbotId = params['id'];
      this.loadCurrentCustomization();
    });
  }

  loadCurrentCustomization() {
    this.isSaving = true;
    console.log('Loading customization for chatbot:', this.chatbotId);

    this.http.get<CustomizationData>(`${this.apiUrl}/chatbot/${this.chatbotId}/customize`, {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        console.log('Raw API Response:', response);

        try {
          if (response && typeof response === 'object') {
            // Safely extract values with defaults
            this.themeColor = response.theme_color || '#0084ff';
            this.enableTickets = response.enable_tickets !== undefined ? !!response.enable_tickets : true;

            console.log('Processed values:', {
              themeColor: this.themeColor,
              enableTickets: this.enableTickets
            });

            // Handle avatar URL safely
            if (response.avatar_url && typeof response.avatar_url === 'string') {
              this.avatarUrl = response.avatar_url;
              this.avatarPreview = response.avatar_url;
              console.log('Avatar URL set to:', this.avatarUrl);
            } else {
              this.avatarUrl = '';
              this.avatarPreview = null;
              console.log('No avatar URL found or invalid format');
            }

            this.showMessage('Customization loaded successfully', 'success');
          } else {
            console.warn('Empty or invalid response received');
            this.resetToDefaults();
            this.showMessage('Unable to load customization settings', 'error');
          }
        } catch (err) {
          console.error('Error processing response:', err);
          this.resetToDefaults();
          this.showMessage('Error processing customization data', 'error');
        }

        this.isSaving = false;
      },
      error: (error) => {
        console.error('API Error:', error);
        this.resetToDefaults();
        this.showMessage(
          error.error?.message || 'Failed to load customization settings',
          'error'
        );
        this.isSaving = false;
      }
    });
  }

  onColorChange(event: any) {
    this.themeColor = event.target.value;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    // Check if the dropped content is text (URL)
    if (event.dataTransfer?.items) {
      const items = event.dataTransfer.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'string' && items[i].type === 'text/plain') {
          items[i].getAsString((url) => {
            if (this.isValidImageUrl(url)) {
              this.setImageFromUrl(url);
            }
          });
          return;
        }
      }
    }

    // Handle file drop
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.showMessage('Please upload an image file', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      this.showMessage('File size should be less than 10MB', 'error');
      return;
    }

    this.isSaving = true;
    this.showMessage('Uploading image...', 'success');

    // Create FormData
    const formData = new FormData();
    formData.append('avatar', file);

    // Upload image to server
    this.http.post<{avatar_url: string}>(`${this.apiUrl}/chatbot/${this.chatbotId}/upload-avatar`,
      formData,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        console.log('Upload response:', response);

        if (response && response.avatar_url) {
          this.avatarPreview = response.avatar_url;
          this.avatarUrl = response.avatar_url;

          // Save the customization with the new avatar URL
          setTimeout(() => {
            this.saveCustomization();
            this.showMessage('Image uploaded and saved successfully', 'success');
            this.isSaving = false;
          }, 500); // Small delay to ensure the avatar URL is properly set
        } else {
          console.error('Invalid upload response:', response);
          this.showMessage('Failed to process uploaded image', 'error');
          this.isSaving = false;
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.showMessage('Failed to upload image', 'error');
        this.isSaving = false;
      }
    });
  }

  removeImage() {
    this.avatarPreview = null;
    this.avatarUrl = '';
  }

  saveCustomization() {
    this.isSaving = true;

    // Ensure we have valid values
    const customization: CustomizationData = {
      theme_color: this.themeColor || '#0084ff',
      avatar_url: this.avatarUrl || '',
      enable_tickets: Boolean(this.enableTickets)
    };

    console.log('Saving customization:', customization);

    this.http.put<any>(`${this.apiUrl}/chatbot/${this.chatbotId}/customize`,
      customization,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        console.log('Save Response:', response);

        if (response && response.customization) {
          // Update local values with what was actually saved
          if (response.customization.theme_color) {
            this.themeColor = response.customization.theme_color;
          }
          if (response.customization.avatar_url !== undefined) {
            this.avatarUrl = response.customization.avatar_url;
            this.avatarPreview = response.customization.avatar_url || null;
          }
          if (response.customization.enable_tickets !== undefined) {
            this.enableTickets = !!response.customization.enable_tickets;
          }

          this.showMessage('Customization saved successfully', 'success');
        } else {
          this.showMessage('Failed to save customization', 'error');
        }
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Save Error:', error);
        this.showMessage(
          error.error?.message || 'Failed to save customization',
          'error'
        );
        this.isSaving = false;
      }
    });
  }

  showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  // Add new method to validate image URLs
  isValidImageUrl(url: string): boolean {
    // Check for common image extensions
    const hasImageExtension = url.match(/\.(jpeg|jpg|gif|png)$/i) != null;

    // Check for data URLs
    const isDataUrl = url.startsWith('data:image/');

    // Check for Google Images URLs
    const isGoogleImageUrl = url.includes('encrypted-tbn') && url.includes('gstatic.com');

    // Check for URLs with image-related query parameters
    const hasImageParams = url.includes('image') || url.includes('img') || url.includes('photo');

    return hasImageExtension || isDataUrl || isGoogleImageUrl || hasImageParams;
  }

  // Add new method to set image from URL
  setImageFromUrl(url: string) {
    // Create a new image to test the URL
    const img = new Image();
    img.onload = () => {
      this.avatarPreview = url;
      this.avatarUrl = url;
      this.showMessage('Image URL set successfully', 'success');
    };
    img.onerror = () => {
      this.showMessage('Invalid image URL', 'error');
    };
    img.src = url;
  }

  // Add new method to handle URL input
  onImageUrlSubmit() {
    if (!this.imageUrlInput) {
      this.showMessage('Please enter an image URL', 'error');
      return;
    }

    if (this.isValidImageUrl(this.imageUrlInput)) {
      this.setImageFromUrl(this.imageUrlInput);
      this.imageUrlInput = ''; // Clear the input after successful set
    } else {
      this.showMessage('Please enter a valid image URL', 'error');
    }
  }

  // Add new method to reset to defaults
  private resetToDefaults() {
    console.log('Resetting to defaults');
    this.themeColor = '#0084ff';
    this.avatarUrl = '';
    this.avatarPreview = null;
    // Removed escalation
    this.enableTickets = false;
  }

  // Add this new method
  onToggleChange(feature: string, value: boolean) {
    console.log(`${feature} changed:`, value);
  }
}
