// import { Component, OnInit, NgZone, signal, ViewChild, ElementRef } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Subscription } from 'rxjs';
// import { SseService } from '../sse.service';

// interface Escalation {
//   id: string;
//   chatbot_id: string;
//   user_id: string;
//   status: 'pending' | 'in_progress' | 'resolved' | 'closed';
//   created_at: string;
//   priority: 'low' | 'medium' | 'high';
//   last_message_time?: string;
// }

// interface EscalationMessage {
//   id: string;
//   sender: 'agent' | 'user';
//   message: string;
//   timestamp: string;
//   read?: boolean;
// }

// interface EscalationStatus {
//   status: 'pending' | 'in_progress' | 'resolved' | 'closed';
//   agent_joined: boolean;
// }

// @Component({
//   selector: 'app-agent-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './agent-dashboard.component.html',
//   styleUrls: ['./agent-dashboard.component.css']
// })
// export class AgentDashboardComponent implements OnInit {
//   @ViewChild('messageContainer') private messageContainer!: ElementRef;

//   private apiUrl = 'http://127.0.0.1:5000';
//   private autoRefreshInterval: any;
//   private sseSubscription: Subscription | null = null;

//   // Signals
//   selectedEscalation = signal<Escalation | null>(null);
//   escalations = signal<Escalation[]>([]);
//   messages = signal<EscalationMessage[]>([]);
//   newMessage = signal<string>('');
//   isLoading = signal<boolean>(false);
//   error = signal<string | null>(null);

//   constructor(
//     private http: HttpClient,
//     private sseService: SseService,
//     private ngZone: NgZone
//   ) {}

//   ngOnInit(): void {
//     this.fetchEscalations();
//     this.startAutoRefresh();
//   }

//   // ngOnDestroy(): void {
//   //   this.stopSSE();
//   //   if (this.autoRefreshInterval) {
//   //     clearInterval(this.autoRefreshInterval);
//   //   }
//   // }

//   private startAutoRefresh(): void {
//     this.autoRefreshInterval = setInterval(() => this.fetchEscalations(), 30000);
//   }

//   private fetchEscalations(): void {
//     this.isLoading.set(true);
//     this.http.get<Escalation[]>(`${this.apiUrl}/agent/escalations`).subscribe({
//       next: (data) => {
//         this.escalations.set(data);
//         this.isLoading.set(false);
//       },
//       error: (error) => {
//         console.error('Error fetching escalations:', error);
//         this.error.set('Failed to fetch escalations');
//         this.isLoading.set(false);
//       }
//     });
//   }

//   selectEscalation(escalation: Escalation): void {
//     this.selectedEscalation.set(escalation);
//     this.messages.set([]);
//     this.fetchMessages(escalation.id);
//     this.startSSE(escalation.id);
//   }

//   joinEscalation(event: Event, escalationId: string): void {
//     event.stopPropagation();
//     this.isLoading.set(true);
    
//     this.http.post(`${this.apiUrl}/agent/escalation/${escalationId}/join`, {}).subscribe({
//       next: () => {
//         this.fetchEscalations();
//         const escalation = this.escalations().find(e => e.id === escalationId);
//         if (escalation) {
//           this.selectEscalation(escalation);
//         }
//         this.isLoading.set(false);
//       },
//       error: (error) => {
//         console.error('Error joining escalation:', error);
//         this.error.set('Failed to join escalation');
//         this.isLoading.set(false);
//       }
//     });
//   }

//   private fetchMessages(escalationId: string): void {
//     this.http.get<EscalationMessage[]>(`${this.apiUrl}/escalation/${escalationId}/messages`).subscribe({
//       next: (data) => {
//         this.messages.set(data);
//         this.scrollToBottom();
//       },
//       error: (error) => {
//         console.error('Error fetching messages:', error);
//         this.error.set('Failed to fetch messages');
//       }
//     });
//   }

//   private startSSE(escalationId: string): void {
//     this.stopSSE();

//     const url = `${this.apiUrl}/escalation/${escalationId}/events`;
//     this.sseSubscription = this.sseService.getEventSource(url).subscribe({
//       next: (event: MessageEvent) => {
//         const data = JSON.parse(event.data);
//         this.handleSSEEvent(data);
//       },
//       error: (error) => console.error('SSE error:', error)
//     });
//   }

//   private stopSSE(): void {
//     if (this.sseSubscription) {
//       this.sseSubscription.unsubscribe();
//       this.sseSubscription = null;
//     }
//     this.sseService.closeEventSource();
//   }

//   private handleSSEEvent(data: any): void {
//     this.ngZone.run(() => {
//       if (data.type === 'status') {
//         this.handleStatusUpdate(data as EscalationStatus);
//       } else if (data.type === 'message') {
//         this.handleNewMessage(data as EscalationMessage);
//       }
//     });
//   }

//   private handleStatusUpdate(data: EscalationStatus): void {
//     const currentEscalation = this.selectedEscalation();
//     if (currentEscalation) {
//       this.selectedEscalation.set({
//         ...currentEscalation,
//         status: data.status
//       });
//     }
//     this.fetchEscalations();
//   }

//   private handleNewMessage(message: EscalationMessage): void {
//     this.messages.update(messages => [...messages, message]);
//     this.scrollToBottom();
//   }

//   closeEscalation(escalationId: string): void {
//     this.http.post(`${this.apiUrl}/escalation/${escalationId}/close`, {}).subscribe({
//       next: () => {
//         this.fetchEscalations();
//         const current = this.selectedEscalation();
//         if (current?.id === escalationId) {
//           this.selectedEscalation.set(null);
//           this.stopSSE();
//         }
//       },
//       error: (error) => {
//         console.error('Error closing escalation:', error);
//         this.error.set('Failed to close escalation');
//       }
//     });
//   }

//   sendMessage(): void {
//     const message = this.newMessage().trim();
//     const escalation = this.selectedEscalation();
    
//     if (!message || !escalation) return;

//     const payload = {
//       message,
//       sender: 'agent'
//     };

//     this.http.post(`${this.apiUrl}/escalation/${escalation.id}/send`, payload).subscribe({
//       next: () => {
//         this.newMessage.set('');
//       },
//       error: (error) => {
//         console.error('Error sending message:', error);
//         this.error.set('Failed to send message');
//       }
//     });
//   }

//   private scrollToBottom(): void {
//     setTimeout(() => {
//       if (this.messageContainer) {
//         const element = this.messageContainer.nativeElement;
//         element.scrollTop = element.scrollHeight;
//       }
//     });
//   }

//   handleKeyPress(event: KeyboardEvent): void {
//     if (event.key === 'Enter' && !event.shiftKey) {
//       event.preventDefault();
//       this.sendMessage();
//     }
//   }
// }