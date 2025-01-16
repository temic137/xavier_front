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
    this.router.navigate(['/chatbots']);
  }
  
  ngOnDestroy() {
   
  }
}

