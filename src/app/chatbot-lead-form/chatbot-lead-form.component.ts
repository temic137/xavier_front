import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadFormComponent } from '../lead-form/lead-form.component';

@Component({
  selector: 'app-chatbot-lead-form',
  standalone: true,
  imports: [CommonModule, LeadFormComponent],
  template: `
    <div class="lead-form-wrapper">
      <app-lead-form [chatbotId]="chatbotId"></app-lead-form>
    </div>
  `,
  styles: [`
    .lead-form-wrapper {
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 1000;
      width: 300px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      overflow: hidden;
    }
  `]
})
export class ChatbotLeadFormComponent implements OnInit {
  @Input() chatbotId: string = '';
  
  constructor() {}
  
  ngOnInit() {}
}
