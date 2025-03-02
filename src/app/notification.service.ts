// // notification.service.ts
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';

// export interface NotificationMessage {
//   id: string;
//   message: string;
//   type: 'info' | 'success' | 'warning' | 'error';
//   timestamp: Date;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class NotificationService {
//   private notifications = new BehaviorSubject<NotificationMessage[]>([]);
//   private audio: HTMLAudioElement | null = null;
//   private soundEnabled = true;

//   constructor() {
//     try {
//       // Check if we're in a browser environment that supports Audio
//       if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
//         this.audio = new Audio();
//         this.audio.src = 'assets/notification-sound.mp3';
        
//         // Preload the audio file
//         this.audio.load();
        
//         // Handle any loading errors
//         this.audio.onerror = (e) => {
//           console.error('Error loading notification sound:', e);
//           this.soundEnabled = false;
//         };
//       } else {
//         this.soundEnabled = false;
//         console.warn('Audio not supported in this environment');
//       }
//     } catch (error) {
//       this.soundEnabled = false;
//       console.error('Error initializing audio:', error);
//     }
//   }

//   getNotifications(): Observable<NotificationMessage[]> {
//     return this.notifications.asObservable();
//   }

//   showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
//     const notification: NotificationMessage = {
//       id: crypto.randomUUID(),
//       message,
//       type,
//       timestamp: new Date()
//     };

//     const currentNotifications = this.notifications.value;
//     this.notifications.next([notification, ...currentNotifications]);
    
//     // Play sound for new notifications
//     this.playNotificationSound();

//     // Auto-remove after 5 seconds
//     setTimeout(() => {
//       this.removeNotification(notification.id);
//     }, 5000);
//   }

//   removeNotification(id: string): void {
//     const currentNotifications = this.notifications.value;
//     this.notifications.next(currentNotifications.filter(n => n.id !== id));
//   }

//   private playNotificationSound(): void {
//     if (!this.soundEnabled || !this.audio) {
//       return;
//     }

//     try {
//       // Reset the audio to the beginning if it's already playing
//       this.audio.currentTime = 0;
      
//       // Play the sound with error handling
//       this.audio.play().catch(error => {
//         console.error('Error playing notification sound:', error);
//         // Disable sound if we encounter playback errors
//         this.soundEnabled = false;
//       });
//     } catch (error) {
//       console.error('Error attempting to play notification sound:', error);
//       this.soundEnabled = false;
//     }
//   }

//   // Optional: Method to enable/disable sound
//   setSoundEnabled(enabled: boolean): void {
//     this.soundEnabled = enabled;
//   }

//   // Optional: Method to check if sound is enabled
//   isSoundEnabled(): boolean {
//     return this.soundEnabled;
//   }
// }



// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NotificationMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<NotificationMessage[]>([]);
  private audio: HTMLAudioElement | null = null;
  private soundEnabled = true;

  constructor() {
    try {
      if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
        this.audio = new Audio();
        this.audio.src = 'assets/notification-sound.mp3';
        this.audio.load();
        
        this.audio.onerror = (e) => {
          console.error('Error loading notification sound:', e);
          this.soundEnabled = false;
        };
      } else {
        this.soundEnabled = false;
        console.warn('Audio not supported in this environment');
      }
    } catch (error) {
      this.soundEnabled = false;
      console.error('Error initializing audio:', error);
    }
  }

  getNotifications(): Observable<NotificationMessage[]> {
    return this.notifications.asObservable();
  }

  showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const notification: NotificationMessage = {
      id: Date.now().toString(), // Use timestamp as ID
      message,
      type,
      timestamp: new Date()
    };
  
    const currentNotifications = this.notifications.value;
    this.notifications.next([notification, ...currentNotifications]);
    
    this.playNotificationSound();
  
    // Auto-remove after 5000 milliseconds (5 seconds)
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notifications.value;
    this.notifications.next(currentNotifications.filter(n => n.id !== id));
  }

  private playNotificationSound(): void {
    if (!this.soundEnabled || !this.audio) {
      return;
    }

    try {
      this.audio.currentTime = 0;
      this.audio.play().catch(error => {
        console.error('Error playing notification sound:', error);
        this.soundEnabled = false;
      });
    } catch (error) {
      console.error('Error attempting to play notification sound:', error);
      this.soundEnabled = false;
    }
  }
}