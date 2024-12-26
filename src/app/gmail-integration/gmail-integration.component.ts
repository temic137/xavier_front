import { Component , OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// interface GmailIntegration {
//   chatbot_id: string;
//   is_active: boolean;
//   last_processed: string;
// }

// @Component({
//   selector: 'app-gmail-integration',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormsModule],
//   templateUrl: './gmail-integration.component.html',
//   styleUrl: './gmail-integration.component.css'
// })
// export class GmailIntegrationComponent implements OnInit {
//   selectedChatbot: string | null = null;
//   message: string = '';
//   isSuccess: boolean = true;
//   isProcessing: boolean = false;
//   integrationStatus: { [key: string]: boolean } = {};
//   processingStatus: { [key: string]: { count: number, timestamp: string } } = {};

//   constructor(private apiService: ApiService) {}

//   ngOnInit() {
//   }

//   authorizeGmail(chatbotId: string) {
//     this.apiService.authorizeGmail(chatbotId).subscribe({
//       next: (response) => {
//         window.location.href = response.authorization_url;
//       },
//       error: (error) => {
//         this.showErrorMessage('Failed to authorize Gmail');
//         console.error('Gmail authorization failed', error);
//       }
//     });
//   }

//   processEmails(chatbotId: string) {
//     this.isProcessing = true;
//     this.apiService.processEmails(chatbotId).subscribe({
//       next: (response) => {
//         this.showSuccessMessage(`Processed ${response.processed_count} emails`);
//         this.processingStatus[chatbotId] = {
//           count: response.processed_count,
//           timestamp: new Date().toLocaleString()
//         };
//         this.isProcessing = false;
//       },
//       error: (error) => {
//         this.showErrorMessage('Failed to process emails');
//         console.error('Email processing failed', error);
//         this.isProcessing = false;
//       }
//     });
//   }

//   disableIntegration(chatbotId: string) {
//     if (confirm('Are you sure you want to disable Gmail integration?')) {
//       this.apiService.disableGmailIntegration(chatbotId).subscribe({
//         next: () => {
//           this.showSuccessMessage('Gmail integration disabled successfully');
//           this.integrationStatus[chatbotId] = false;
//         },
//         error: (error) => {
//           this.showErrorMessage('Failed to disable Gmail integration');
//           console.error('Failed to disable integration', error);
//         }
//       });
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

// }

interface Chatbot {
  id: string;
  name: string;
}

@Component({
  selector: 'app-gmail-integration',
  templateUrl: './gmail-integration.component.html',
  styleUrls: ['./gmail-integration.component.css'],
  imports: [FormsModule,CommonModule],
  standalone: true,
})
export class GmailIntegrationComponent implements OnInit {
  chatbots: Chatbot[] = []; // Store available chatbots
  selectedChatbot: string | null = null;
  message: string = '';
  isSuccess: boolean = true;
  isProcessing: boolean = false;
  integrationStatus: { [key: string]: boolean } = {};
  processingStatus: { [key: string]: { count: number; timestamp: string } } = {};

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchChatbots(); // Load chatbots on component initialization
  }

  fetchChatbots() {
    this.apiService.getChatbots().subscribe({
      next: (bots) => (this.chatbots = bots),
      error: (err) => this.showErrorMessage('Failed to fetch chatbots'),
    });
  }

  authorizeGmail(chatbotId: string) {
    this.apiService.authorizeGmail(chatbotId).subscribe({
      next: (response) => (window.location.href = response.authorization_url),
      error: (err) => this.showErrorMessage('Failed to authorize Gmail'),
    });
  }

  processEmails(chatbotId: string) {
    this.isProcessing = true;
    this.apiService.processEmails(chatbotId).subscribe({
      next: (response) => {
        this.showSuccessMessage(`Processed ${response.processed_count} emails`);
        this.processingStatus[chatbotId] = {
          count: response.processed_count,
          timestamp: new Date().toLocaleString(),
        };
        this.isProcessing = false;
      },
      error: (err) => {
        this.showErrorMessage('Failed to process emails');
        this.isProcessing = false;
      },
    });
  }

  disableIntegration(chatbotId: string) {
    if (confirm('Are you sure you want to disable Gmail integration?')) {
      this.apiService.disableGmailIntegration(chatbotId).subscribe({
        next: () => {
          this.showSuccessMessage('Gmail integration disabled successfully');
          this.integrationStatus[chatbotId] = false;
        },
        error: (err) => this.showErrorMessage('Failed to disable Gmail integration'),
      });
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
    setTimeout(() => (this.message = ''), 3000);
  }
}