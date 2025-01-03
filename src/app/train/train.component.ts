// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { ApiService } from '../api.service';
// import { Router } from '@angular/router';
// // Add these imports for animations
// import { trigger, transition, style, animate } from '@angular/animations';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// interface Chatbot {
//   id: string;
//   name: string;
//   trainedFile?: string;
// }

// @Component({
//   selector: 'app-train',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormsModule],
//   templateUrl: './train.component.html',
//   styleUrl: './train.component.css',
//    // Add animations configuration here
//    animations: [
//     trigger('slideInOut', [
//       transition(':enter', [
//         style({ transform: 'translateX(100%)', opacity: 0 }),
//         animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
//       ]),
//       transition(':leave', [
//         animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
//       ])
//     ])
//   ]
  
// })
// export class TrainComponent implements OnInit {
//   chatbotId: string = '';
//   apiUrl: string = '';
//   selectedFile: File | null = null;
//   folderPath: string | null = null;
//   WebsiteUrl: string | null = null;
//   message: string = '';
//   isSuccess: boolean = true;

//   constructor(
//     private apiService: ApiService, 
//     private router: Router,
//     private route: ActivatedRoute
//   ) {}

//   ngOnInit() {
//     // Get the chatbot ID from the route parameters
//     this.route.paramMap.subscribe(params => {
//       this.chatbotId = params.get('id') || '';
//     });
//   }

//   onFileSelected(event: Event) {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.selectedFile = input.files[0];
//     }
//   }

//   onTrainSubmit() {
//     if (this.apiUrl || this.selectedFile || this.WebsiteUrl || this.folderPath) {
//       this.apiService.trainChatbot(
//         this.chatbotId,
//         this.selectedFile,
//         this.apiUrl,
//         this.folderPath,
//         this.WebsiteUrl,
//       ).subscribe({
//         next: () => {
//           console.log("select:", this.selectedFile);
//           this.showSuccessMessage('Chatbot trained successfully');
          
//         },
//         error: (error) => {
//           this.showErrorMessage('Failed to train chatbot');
//           console.error('Failed to train chatbot', error);
//         }
//       });
//     } else {
//       this.showErrorMessage('Please provide an API URL or upload a PDF file');
//     }
//   }

//   private showSuccessMessage(message: string) {
//     this.message = message;
//     this.isSuccess = true;
//     this.clearMessageAfterDelay();
//   }

//   private showErrorMessage(message: string) {
//     this.message = message;
//     this.isSuccess = false;
//     this.clearMessageAfterDelay();
//   }

//   private clearMessageAfterDelay() {
//     setTimeout(() => {
//       this.message = '';
//     }, 3000);
//   }

//   cancelTraining() {
//     this.router.navigate(['/chatbots']);
//   }
// }



import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Chatbot {
  id: string;
  name: string;
  trainedFile?: string;
  description?: string;
  status?: string;
}

@Component({
  selector: 'app-train',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './train.component.html',
  styleUrl: './train.component.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class TrainComponent implements OnInit {
  // Properties
  chatbotId: string = '';
  apiUrl: string = '';
  selectedFile: File | null = null;
  folderPath: string | null = null;
  WebsiteUrl: string | null = null;
  message: string = '';
  isSuccess: boolean = true;
  isDragging: boolean = false;
  isLoading: boolean = false;
  uploadProgress: number = 0;
  
  // File upload constraints
  maxFileSize: number = 50 * 1024 * 1024; // 50MB
  allowedFileTypes: string[] = ['.pdf', '.txt', '.doc', '.docx', '.md', '.rst'];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Get chatbot ID from route parameters
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.chatbotId = id;
        this.loadChatbotDetails();
      } else {
        this.showErrorMessage('No chatbot ID provided');
        this.router.navigate(['/chatbots']);
      }
    });
  }

  loadChatbotDetails() {
    this.apiService.getChatbot(this.chatbotId).subscribe({
      next: (chatbot: Chatbot) => {
        // Handle chatbot details if needed
        console.log('Chatbot details loaded:', chatbot);
      },
      error: (error) => {
        this.showErrorMessage('Failed to load chatbot details');
        console.error('Error loading chatbot:', error);
      }
    });
  }

  // File Selection Handlers
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    // Check file size
    if (file.size > this.maxFileSize) {
      this.showErrorMessage(`File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`);
      return;
    }

    // Check file type
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!this.allowedFileTypes.includes(fileExtension)) {
      this.showErrorMessage(`Invalid file type. Allowed types: ${this.allowedFileTypes.join(', ')}`);
      return;
    }

    this.selectedFile = file;
    this.showSuccessMessage(`File "${file.name}" selected successfully`);
  }

  // Drag and Drop Handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  // Form Submission
  async onTrainSubmit() {
    if (!this.isValidSubmission()) {
      this.showErrorMessage('Please provide at least one source (API URL, file, website, or folder path)');
      return;
    }

    this.isLoading = true;

    try {
      const formData = await this.prepareFormData();
      
      this.apiService.trainChatbot(
        this.chatbotId,
        this.selectedFile,
        this.apiUrl,
        this.folderPath,
        this.WebsiteUrl,
      ).subscribe({
        next: (response) => {
          this.handleTrainingSuccess(response);
        },
        error: (error) => {
          this.handleTrainingError(error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.handleTrainingError(error);
      this.isLoading = false;
    }
  }

  private isValidSubmission(): boolean {
    return !!(this.apiUrl || this.selectedFile || this.WebsiteUrl || this.folderPath);
  }

  private async prepareFormData(): Promise<FormData> {
    const formData = new FormData();
    
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }
    if (this.apiUrl) {
      formData.append('apiUrl', this.apiUrl);
    }
    if (this.folderPath) {
      formData.append('folderPath', this.folderPath);
    }
    if (this.WebsiteUrl) {
      formData.append('websiteUrl', this.WebsiteUrl);
    }

    return formData;
  }

  private handleTrainingSuccess(response: any) {
    this.showSuccessMessage('Chatbot training started successfully');
    this.uploadProgress = 100;
  }

  private handleTrainingError(error: any) {
    console.error('Training error:', error);
    this.showErrorMessage(error.message || 'Failed to train chatbot');
    this.uploadProgress = 0;
  }

  // Message Handling
  private showSuccessMessage(message: string) {
    this.message = message;
    this.isSuccess = true;
    this.clearMessageAfterDelay();
  }

  private showErrorMessage(message: string) {
    this.message = message;
    this.isSuccess = false;
    this.clearMessageAfterDelay();
  }

  private clearMessageAfterDelay(delay: number = 3000) {
    setTimeout(() => {
      this.message = '';
    }, delay);
  }

  // Navigation
  cancelTraining() {
    this.router.navigate(['/chatbots']);
  }

  // Clean up
  ngOnDestroy() {
    // Clean up any subscriptions or resources if needed
  }
}



// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { ApiService } from '../api.service';
// import { Router } from '@angular/router';
// // Add these imports for animations
// import { trigger, transition, style, animate } from '@angular/animations';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// interface Chatbot {
//   id: string;
//   name: string;
//   trainedFile?: string;
// }

// @Component({
//   selector: 'app-train',
//   standalone: true,
//   imports: [
//     CommonModule, 
//     RouterModule, 
//     FormsModule,
//     BrowserAnimationsModule // Add this import
//   ],
//   templateUrl: './train.component.html',
//   styleUrl: './train.component.css',
//   // Add animations configuration here
//   animations: [
//     trigger('slideInOut', [
//       transition(':enter', [
//         style({ transform: 'translateX(100%)', opacity: 0 }),
//         animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
//       ]),
//       transition(':leave', [
//         animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
//       ])
//     ])
//   ]
// })
// export class TrainComponent implements OnInit {
//   chatbotId: string = '';
//   apiUrl: string = '';
//   selectedFile: File | null = null;
//   folderPath: string | null = null;
//   WebsiteUrl: string | null = null;
//   message: string = '';
//   isSuccess: boolean = true;

//   constructor(
//     private apiService: ApiService, 
//     private router: Router,
//     private route: ActivatedRoute
//   ) {}

//   ngOnInit() {
//     // Get the chatbot ID from the route parameters
//     this.route.paramMap.subscribe(params => {
//       this.chatbotId = params.get('id') || '';
//     });
//   }

//   onFileSelected(event: Event) {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.selectedFile = input.files[0];
//     }
//   }

//   onTrainSubmit() {
//     if (this.apiUrl || this.selectedFile || this.WebsiteUrl || this.folderPath) {
//       this.apiService.trainChatbot(
//         this.chatbotId,
//         this.selectedFile,
//         this.apiUrl,
//         this.folderPath,
//         this.WebsiteUrl,
//       ).subscribe({
//         next: () => {
//           this.showSuccessMessage('Chatbot trained successfully');
          
//         },
//         error: (error) => {
//           this.showErrorMessage('Failed to train chatbot');
//           console.error('Failed to train chatbot', error);
//         }
//       });
//     } else {
//       this.showErrorMessage('Please provide an API URL or upload a PDF file');
//     }
//   }

//   private showSuccessMessage(message: string) {
//     this.message = message;
//     this.isSuccess = true;
//     this.clearMessageAfterDelay();
//   }

//   private showErrorMessage(message: string) {
//     this.message = message;
//     this.isSuccess = false;
//     this.clearMessageAfterDelay();
//   }

//   private clearMessageAfterDelay() {
//     setTimeout(() => {
//       this.message = '';
//     }, 3000);
//   }

//   cancelTraining() {
//     this.router.navigate(['/chatbots']);
//   }
// }