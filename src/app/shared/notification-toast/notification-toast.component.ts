import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationMessage } from '../../notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50">
      <div *ngFor="let notification of notifications" 
           class="mb-2 p-4 rounded-lg shadow-lg min-w-[300px] transform transition-all duration-300 ease-in-out"
           [ngClass]="{
             'bg-blue-600': notification.type === 'info',
             'bg-green-600': notification.type === 'success',
             'bg-yellow-600': notification.type === 'warning',
             'bg-red-600': notification.type === 'error'
           }">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-white">{{notification.message}}</p>
            <p class="text-xs text-gray-200 mt-1">{{notification.timestamp | date:'short'}}</p>
          </div>
          <button (click)="removeNotification(notification.id)" 
                  class="ml-4 text-white/80 hover:text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  notifications: NotificationMessage[] = [];
  private subscription: Subscription | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.getNotifications()
      .subscribe(notifications => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeNotification(id: string) {
    this.notificationService.removeNotification(id);
  }
} 