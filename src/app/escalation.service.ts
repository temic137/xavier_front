// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class EscalationService {

//   constructor() { }
// }

// escalation.service.ts
import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationService } from './notification.service';

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
  private apiUrl = 'http://127.0.0.1:5000';
  private escalationsEventSource: EventSource | null = null;
  private escalations = new BehaviorSubject<Escalation[]>([]);
  
  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private notificationService: NotificationService
  ) {
    // Start listening for escalations when service is initialized
    this.startGlobalEscalationsSSE();
  }

  getEscalations(): Observable<Escalation[]> {
    return this.escalations.asObservable();
  }

  private startGlobalEscalationsSSE(): void {
    if (this.escalationsEventSource) {
      this.escalationsEventSource.close();
    }

    // Note: Modified to listen to all escalations, not just for a specific chatbot
    this.escalationsEventSource = new EventSource(
      `${this.apiUrl}/agent/escalations/events`
    );

    this.escalationsEventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'escalations_update') {
        this.ngZone.run(() => {
          const currentEscalations = this.escalations.value;
          
          // Check for new escalations
          data.escalations.forEach((newEsc: Escalation) => {
            const existingEscalation = currentEscalations.find(e => e.id === newEsc.id);
            if (!existingEscalation) {
              // Show notification for new escalation regardless of current page
              this.notificationService.showNotification(
                `New escalation received from user ${newEsc.user_id}`,
                'info'
              );
            }
          });

          // Update the escalations list
          this.escalations.next(data.escalations);
        });
      }
    };

    this.escalationsEventSource.onerror = (error) => {
      console.error('Global Escalations SSE error:', error);
      this.escalationsEventSource?.close();
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.startGlobalEscalationsSSE(), 5000);
    };
  }

  // Method to fetch escalations for a specific chatbot
  fetchEscalationsForChatbot(chatbotId: string): Observable<Escalation[]> {
    return this.http.get<Escalation[]>(`${this.apiUrl}/agent/escalations/${chatbotId}`);
  }

  stopListening(): void {
    if (this.escalationsEventSource) {
      this.escalationsEventSource.close();
      this.escalationsEventSource = null;
    }
  }
}