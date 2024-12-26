import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
// Add these imports for animations
import { trigger, transition, style, animate } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

interface Chatbot {
  id: string;
  name: string;
  trainedFile?: string;
}

@Component({
  selector: 'app-train',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './train.component.html',
  styleUrl: './train.component.css',
   // Add animations configuration here
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

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get the chatbot ID from the route parameters
    this.route.paramMap.subscribe(params => {
      this.chatbotId = params.get('id') || '';
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onTrainSubmit() {
    if (this.apiUrl || this.selectedFile || this.WebsiteUrl || this.folderPath) {
      this.apiService.trainChatbot(
        this.chatbotId,
        this.selectedFile,
        this.apiUrl,
        this.folderPath,
        this.WebsiteUrl,
      ).subscribe({
        next: () => {
          this.showSuccessMessage('Chatbot trained successfully');
          
        },
        error: (error) => {
          this.showErrorMessage('Failed to train chatbot');
          console.error('Failed to train chatbot', error);
        }
      });
    } else {
      this.showErrorMessage('Please provide an API URL or upload a PDF file');
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

  private clearMessageAfterDelay() {
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  cancelTraining() {
    this.router.navigate(['/chatbots']);
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