import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

interface Chatbot {
  id: string;
  name: string;
}

@Component({
  selector: 'app-integration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './integration.component.html',
  styleUrl: './integration.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class IntegrationComponent implements OnInit {

  chatbotId: string = '';
  integrationCode: string = '';
  show=true;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      this.chatbotId = params.get('id') || '';
    });
    if (this.chatbotId) {
      this.generateCode(this.chatbotId);
    }

    this.fetchChatbots();
  }

  generateCode(chatbotId: string) {
    this.isProcessing = true;
    this.message = '';

    console.log(`Generating code for chatbot: ${chatbotId}`);

    this.apiService.getIntegration_code(chatbotId).subscribe({
      next: (response) => {
        console.log('Integration code response:', response);
        if (response && response.integration_code) {
          this.integrationCode = response.integration_code;
          this.showSuccessMessage('Integration code generated successfully');
        } else {
          this.showErrorMessage('Invalid response format from server');
          console.error('Invalid response format:', response);
        }
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Failed to fetch integration code', error);
        this.showErrorMessage('Failed to generate integration code. Please try again.');
        this.isProcessing = false;
      }
    });
  }


  clearIntegrationCode() {
    this.integrationCode = '';
    this.show = false;
  }

  chatbots: Chatbot[] = [];
  selectedChatbot: string | null = null;
  message: string = '';
  isSuccess: boolean = true;
  isProcessing: boolean = false;
  integrationStatus: { [key: string]: boolean } = {};
  processingStatus: { [key: string]: { count: number; timestamp: string } } = {};

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
    setTimeout(() => (this.message = ''), 5000);
  }

  codeCopied: boolean = false;

copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    this.codeCopied = true;
    setTimeout(() => {
      this.codeCopied = false;
    }, 2000);
  });
}
}
