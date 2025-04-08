// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class EscalationService {

//   constructor() { }
// }

// // escalation.service.ts
// import { Injectable, NgZone } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { NotificationService } from './notification.service';

// export interface Escalation {
//   id: string;
//   chatbot_id: string;
//   user_id: string;
//   status: 'pending' | 'in_progress' | 'resolved' | 'closed';
//   created_at: string;
//   priority: 'low' | 'medium' | 'high';
//   last_message_time?: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class EscalationService {
//   private apiUrl = 'http://localhost:5000';
//   private escalationsEventSource: EventSource | null = null;
//   private escalations = new BehaviorSubject<Escalation[]>([]);
  
//   constructor(
//     private http: HttpClient,
//     private ngZone: NgZone,
//     private notificationService: NotificationService
//   ) {
//     // Start listening for escalations when service is initialized
//     this.startGlobalEscalationsSSE();
//   }

//   getEscalations(): Observable<Escalation[]> {
//     return this.escalations.asObservable();
//   }

//   private startGlobalEscalationsSSE(): void {
//     if (this.escalationsEventSource) {
//       this.escalationsEventSource.close();
//     }

//     // Note: Modified to listen to all escalations, not just for a specific chatbot
//     this.escalationsEventSource = new EventSource(
//       `${this.apiUrl}/agent/escalations/events`
//     );

//     this.escalationsEventSource.onmessage = (event) => {
//       const data = JSON.parse(event.data);
      
//       if (data.type === 'escalations_update') {
//         this.ngZone.run(() => {
//           const currentEscalations = this.escalations.value;
          
//           // Check for new escalations
//           data.escalations.forEach((newEsc: Escalation) => {
//             const existingEscalation = currentEscalations.find(e => e.id === newEsc.id);
//             if (!existingEscalation) {
//               // Show notification for new escalation regardless of current page
//               this.notificationService.showNotification(
//                 `New escalation received from user ${newEsc.user_id}`,
//                 'info'
//               );
//             }
//           });

//           // Update the escalations list
//           this.escalations.next(data.escalations);
//         });
//       }
//     };

//     this.escalationsEventSource.onerror = (error) => {
//       console.error('Global Escalations SSE error:', error);
//       this.escalationsEventSource?.close();
//       // Attempt to reconnect after 5 seconds
//       setTimeout(() => this.startGlobalEscalationsSSE(), 5000);
//     };
//   }

//   // Method to fetch escalations for a specific chatbot
//   fetchEscalationsForChatbot(chatbotId: string): Observable<Escalation[]> {
//     return this.http.get<Escalation[]>(`${this.apiUrl}/agent/escalations/${chatbotId}`);
//   }

//   stopListening(): void {
//     if (this.escalationsEventSource) {
//       this.escalationsEventSource.close();
//       this.escalationsEventSource = null;
//     }
//   }
// }


import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import Pusher from 'pusher-js'; // Default import for Pusher
// Define the Escalation interface
export interface Escalation {
  id: string;
  chatbot_id: string;
  user_id: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  priority: 'low' | 'medium' | 'high';
  last_message_time?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EscalationService {
  // private apiUrl = 'https://xavier-back.onrender.com';
  private apiUrl = 'https://xavierback-production.up.railway.app';
  private escalations = new BehaviorSubject<Escalation[]>([]);
  private pusher: Pusher;
  private pusherKey = '43bd6f1835e5bb8165d8'; // Replace with your actual Pusher app key
  private pusherCluster = 'us3'; // Replace with your actual Pusher cluster

  constructor(
    private http: HttpClient,
    private ngZone: NgZone
  ) {
    // Initialize Pusher with environment variables
    this.pusher = new Pusher(this.pusherKey, {
      cluster: this.pusherCluster,
      
    });
  }

  /**
   * Get an observable of the current escalations
   */
  getEscalations(): Observable<Escalation[]> {
    return this.escalations.asObservable();
  }

  /**
   * Subscribe to real-time escalation updates for a specific chatbot via Pusher
   * @param chatbotId The ID of the chatbot to listen for escalations
   */
  subscribeToChatbotEscalations(chatbotId: string): void {
    const channel = this.pusher.subscribe(`chatbot-${chatbotId}-escalations`);
    channel.bind('escalation-update', (data: { type: string; escalations: Escalation[] }) => {
      this.ngZone.run(() => {
        console.log('Received Pusher escalation update:', data);
        const currentEscalations = this.escalations.value;

        // Update or add new escalations
        data.escalations.forEach((newEsc: Escalation) => {
          const index = currentEscalations.findIndex(e => e.id === newEsc.id);
          if (index !== -1) {
            // Update existing escalation
            currentEscalations[index] = { ...currentEscalations[index], ...newEsc };
          } else {
            // Add new escalation
            currentEscalations.push(newEsc);
          }
        });

        // Emit the updated list
        this.escalations.next([...currentEscalations]);
      });
    });

    // Handle subscription errors
    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher subscription error in EscalationService:', error);
    });
  }

  /**
   * Fetch escalations for a specific chatbot via HTTP
   * @param chatbotId The ID of the chatbot
   * @returns Observable of Escalation array
   */
  fetchEscalationsForChatbot(chatbotId: string): Observable<Escalation[]> {
    return this.http.get<Escalation[]>(`${this.apiUrl}/agent/escalations/${chatbotId}`);
  }

  /**
   * Stop listening to Pusher updates and clean up
   */
  stopListening(): void {
    if (this.pusher) {
      this.pusher.disconnect(); // Disconnects from all channels
      this.escalations.next([]); // Optionally clear escalations
    }
  }

  /**
   * Utility to manually update escalations (if needed externally)
   * @param escalations New list of escalations
   */
  updateEscalations(escalations: Escalation[]): void {
    this.escalations.next([...escalations]);
  }
}
