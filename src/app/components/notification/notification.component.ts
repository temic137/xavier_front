import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  template: `
    <div class="notification" [class.success]="type === 'success'" [class.error]="type === 'error'">
      <span class="message">{{ message }}</span>
    </div>
  `,
  styles: [`
    .notification {
      padding: 16px;
      border-radius: 4px;
      margin: 8px;
      color: white;
    }
    .success {
      background-color: #4caf50;
    }
    .error {
      background-color: #f44336;
    }
    .message {
      font-size: 14px;
    }
  `]
})
export class NotificationComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
}
