// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { ApiService } from '../api.service';
// import { Router } from '@angular/router';
// import { trigger, transition, style, animate } from '@angular/animations';
// import { HttpClient, HttpHeaders } from '@angular/common/http';

// interface Chatbot {
//   id: string;
//   name: string;
//   trainedFile?: string;
//   description?: string;
//   status?: string;
// }

// @Component({
//   selector: 'app-train',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormsModule],
//   templateUrl: './train.component.html',
//   styleUrl: './train.component.css',
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
//   isDragging: boolean = false;
//   isLoading: boolean = false;
//   uploadProgress: number = 0;
  
//   // File upload constraints
//   maxFileSize: number = 50 * 1024 * 1024; 
//   allowedFileTypes: string[] = ['.pdf', '.txt', '.doc', '.docx', '.md', '.rst'];

//   constructor(
//     private apiService: ApiService,
//     private router: Router,
//     private route: ActivatedRoute,
//     private http: HttpClient
//   ) {}

//   ngOnInit() {
   
//     this.route.paramMap.subscribe(params => {
//       const id = params.get('id');
//       if (id) {
//         this.chatbotId = id;
//         this.loadChatbotDetails();
//       } else {
//         this.showErrorMessage('No chatbot ID provided');
//         this.router.navigate(['/chatbots']);
//       }
//     });
//   }

//   loadChatbotDetails() {
//     this.apiService.getChatbot(this.chatbotId).subscribe({
//       next: (chatbot: Chatbot) => {
       
//         // console.log('Chatbot details loaded:', chatbot);
//       },
//       error: (error) => {
//         this.showErrorMessage('Failed to load chatbot details');
//         console.error('Error loading chatbot:', error);
//       }
//     });
//   }

//   onFileSelected(event: Event) {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.handleFile(input.files[0]);
//     }
//   }

//   handleFile(file: File) {
    
//     if (file.size > this.maxFileSize) {
//       this.showErrorMessage(`File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`);
//       return;
//     }

    
//     const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
//     if (!this.allowedFileTypes.includes(fileExtension)) {
//       this.showErrorMessage(`Invalid file type. Allowed types: ${this.allowedFileTypes.join(', ')}`);
//       return;
//     }

//     this.selectedFile = file;
//     this.showSuccessMessage(`File "${file.name}" selected successfully`);
//   }

  
//   onDragOver(event: DragEvent) {
//     event.preventDefault();
//     event.stopPropagation();
//     this.isDragging = true;
//   }

//   onDragLeave(event: DragEvent) {
//     event.preventDefault();
//     event.stopPropagation();
//     this.isDragging = false;
//   }

//   onDrop(event: DragEvent) {
//     event.preventDefault();
//     event.stopPropagation();
//     this.isDragging = false;

//     const files = event.dataTransfer?.files;
//     if (files && files.length > 0) {
//       this.handleFile(files[0]);
//     }
//   }

  
//   async onTrainSubmit() {
//     if (!this.isValidSubmission()) {
//       this.showErrorMessage('Please provide at least one source (API URL, file, website, or folder path)');
//       return;
//     }

//     this.isLoading = true;

//     try {
//       const formData = await this.prepareFormData();
      
//       this.apiService.trainChatbot(
//         this.chatbotId,
//         this.selectedFile,
//         this.apiUrl,
//         this.folderPath,
//         this.WebsiteUrl,
//       ).subscribe({
//         next: (response) => {
//           this.handleTrainingSuccess(response);
//         },
//         error: (error) => {
//           this.handleTrainingError(error);
//         },
//         complete: () => {
//           this.isLoading = false;
//         }
//       });
//     } catch (error) {
//       this.handleTrainingError(error);
//       this.isLoading = false;
//     }
//   }

//   private isValidSubmission(): boolean {
//     return !!(this.apiUrl || this.selectedFile || this.WebsiteUrl || this.folderPath);
//   }

//   private async prepareFormData(): Promise<FormData> {
//     const formData = new FormData();
    
//     if (this.selectedFile) {
//       formData.append('file', this.selectedFile);
//     }
//     if (this.apiUrl) {
//       formData.append('apiUrl', this.apiUrl);
//     }
//     if (this.folderPath) {
//       formData.append('folderPath', this.folderPath);
//     }
//     if (this.WebsiteUrl) {
//       formData.append('websiteUrl', this.WebsiteUrl);
//     }

//     return formData;
//   }

//   private handleTrainingSuccess(response: any) {
//     this.showSuccessMessage('Chatbot training started successfully');
//     this.uploadProgress = 100;
//   }

//   private handleTrainingError(error: any) {
//     console.error('Training error:', error);
//     this.showErrorMessage(error.message || 'Failed to train chatbot');
//     this.uploadProgress = 0;
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

//   private clearMessageAfterDelay(delay: number = 3000) {
//     setTimeout(() => {
//       this.message = '';
//     }, delay);
//   }

  
//   cancelTraining() {
//     this.router.navigate(['/chatbots']);
//   }
  
//   ngOnDestroy() {
   
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


type TrainingStage = 'PREPARING' | 'UPLOADING' | 'PROCESSING' | 'TRAINING' | 'FINALIZING';
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
  trainingStatus: string = '';
  progressInterval: any;
  
  
  
  readonly STAGES: Record<TrainingStage, { start: number, end: number }> = {
    PREPARING: { start: 0, end: 10 },
    UPLOADING: { start: 10, end: 40 },
    PROCESSING: { start: 40, end: 70 },
    TRAINING: { start: 70, end: 95 },
    FINALIZING: { start: 95, end: 100 }
  };
  currentStage: TrainingStage = 'PREPARING';
  
  // File upload constraints
  maxFileSize: number = 50 * 1024 * 1024; 
  allowedFileTypes: string[] = ['.pdf', '.txt', '.doc', '.docx', '.md', '.rst'];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
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
        // console.log('Chatbot details loaded:', chatbot);
      },
      error: (error) => {
        this.showErrorMessage('Failed to load chatbot details');
        console.error('Error loading chatbot:', error);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    if (file.size > this.maxFileSize) {
      this.showErrorMessage(`File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`);
      return;
    }
    
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!this.allowedFileTypes.includes(fileExtension)) {
      this.showErrorMessage(`Invalid file type. Allowed types: ${this.allowedFileTypes.join(', ')}`);
      return;
    }

    this.selectedFile = file;
    this.showSuccessMessage(`File "${file.name}" selected successfully`);
  }
  
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
  
  async onTrainSubmit() {
    if (!this.isValidSubmission()) {
      this.showErrorMessage('Please provide at least one source (API URL, file, website, or folder path)');
      return;
    }

    this.isLoading = true;
    this.uploadProgress = 0;
    this.updateTrainingStage('PREPARING');
    
    try {
      // Prepare the data and submit the training job
      await this.simulateAccurateProgress();
      
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
        }
      });
    } catch (error) {
      this.handleTrainingError(error);
    }
  }

  private async simulateAccurateProgress() {
    return new Promise<void>((resolve) => {
      // Clear any existing intervals
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }
      
      // Dynamically adjust timing based on inputs
      const hasFile = !!this.selectedFile;
      const hasWebsite = !!this.WebsiteUrl;
      const totalSteps = 5; // Total number of progress steps
      let currentStep = 0;
      
      this.progressInterval = setInterval(() => {
        currentStep++;
        
        // Progress logic based on current step
        switch (currentStep) {
          case 1:
            this.updateTrainingStage('PREPARING');
            break;
          case 2:
            this.updateTrainingStage('UPLOADING');
            // Simulate file upload progress - slower for large files
            if (hasFile) {
              this.simulateFileUploadProgress();
            } else {
              // Skip ahead if no file
              this.updateProgress(this.STAGES.UPLOADING.end);
            }
            break;
          case 3:
            this.updateTrainingStage('PROCESSING');
            break;
          case 4:
            this.updateTrainingStage('TRAINING');
            break;
          case 5:
            this.updateTrainingStage('FINALIZING');
            clearInterval(this.progressInterval);
            resolve();
            break;
        }
      }, 1500); // Transition between stages every 1.5 seconds
    });
  }
  
  private simulateFileUploadProgress() {
    if (!this.selectedFile) return;
    
    // Estimate upload time based on file size
    const fileSizeMB = this.selectedFile.size / (1024 * 1024);
    const uploadStart = this.STAGES.UPLOADING.start;
    const uploadEnd = this.STAGES.UPLOADING.end;
    const uploadRange = uploadEnd - uploadStart;
    
    // Simulate upload progress based on file size
    let progress = uploadStart;
    const smallIncrement = uploadRange / (fileSizeMB * 2 + 10); // Adjust based on file size
    
    const uploadInterval = setInterval(() => {
      if (progress >= uploadEnd || !this.isLoading) {
        clearInterval(uploadInterval);
        return;
      }
      
      // Simulate realistic upload with varying speeds
      progress += smallIncrement * (0.5 + Math.random());
      if (progress > uploadEnd) progress = uploadEnd;
      
      this.updateProgress(progress);
    }, 100); 
  }
  

private updateTrainingStage(stage: TrainingStage) {
  this.currentStage = stage;
  const stageData = this.STAGES[stage];
  
  if (stageData) {
    this.updateProgress(stageData.start);
    this.trainingStatus = this.getStatusMessage(stage);
  }
}
  

private getStatusMessage(stage: TrainingStage): string {
  switch (stage) {
    case 'PREPARING': return 'Preparing data...';
    case 'UPLOADING': return 'Uploading files...';
    case 'PROCESSING': return 'Processing data...';
    case 'TRAINING': return 'Training model...';
    case 'FINALIZING': return 'Finalizing training...';
    default: return 'Processing...';
  }
}
  
  private updateProgress(value: number) {
    this.uploadProgress = Math.round(value);
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
    this.updateProgress(100);
    this.trainingStatus = 'Training completed successfully!';
    
    // Short delay before showing success message
    setTimeout(() => {
      this.showSuccessMessage('Chatbot training completed successfully');
      this.isLoading = false;
    }, 500);
  }

  private handleTrainingError(error: any) {
    console.error('Training error:', error);
    this.showErrorMessage(error.message || 'Failed to train chatbot');
    this.uploadProgress = 0;
    this.trainingStatus = '';
    this.isLoading = false;
    
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

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
  
  cancelTraining() {
    // If training is in progress, cancel it
    if (this.isLoading) {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }
      this.isLoading = false;
      this.uploadProgress = 0;
      this.trainingStatus = '';
      this.showErrorMessage('Training cancelled');
    }
    this.router.navigate(['/chatbots']);
  }
  
  ngOnDestroy() {
    // Clean up intervals when component is destroyed
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }
}
