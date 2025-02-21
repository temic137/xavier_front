import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ChatbotListComponent } from './chatbot-list/chatbot-list.component';
import { NotificationToastComponent } from './shared/notification-toast/notification-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NotificationToastComponent],
  template: `
    <router-outlet></router-outlet>
    <app-notification-toast></app-notification-toast>
  `
})
export class AppComponent {
  title = 'chatbot-dashboard';
}