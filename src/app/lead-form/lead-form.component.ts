import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lead-form.component.html',
  styleUrls: ['./lead-form.component.css']
})
export class LeadFormComponent implements OnInit {
  @Input() chatbotId: string = '';
  
  lead = {
    name: '',
    email: '',
    phone: '',
    message: '',
    chatbot_id: ''
  };
  
  message: string = '';
  isSuccess: boolean = true;
  isSubmitting: boolean = false;
  showForm: boolean = true;
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit() {
    this.lead.chatbot_id = this.chatbotId;
  }
  
  submitLead() {
    if (!this.lead.name || !this.lead.email) {
      this.showErrorMessage('Please fill in all required fields');
      return;
    }
    
    this.isSubmitting = true;
    
    this.apiService.submitLead(this.lead).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.showSuccessMessage('Thank you for your interest! We will contact you soon.');
        this.resetForm();
        this.showForm = false; // Hide form after successful submission
      },
      error: (error) => {
        this.isSubmitting = false;
        this.showErrorMessage('Failed to submit your information. Please try again.');
      }
    });
  }
  
  resetForm() {
    this.lead = {
      name: '',
      email: '',
      phone: '',
      message: '',
      chatbot_id: this.chatbotId
    };
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
    }, 5000);
  }
}
