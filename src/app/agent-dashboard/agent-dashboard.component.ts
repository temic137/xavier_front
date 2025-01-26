
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Subscription } from 'rxjs';
// import { SseService } from '../sse.service';

// interface Escalation {
//   id: string;
//   chatbot_id: string;
//   user_id: string;
//   status: string;
//   created_at: string;
// }

// interface EscalationMessage {
//   id: string;
//   sender: 'agent' | 'user';
//   message: string;
//   timestamp: string;
// }

// interface EscalationStatus {
//   status: string;
//   agent_joined: boolean;
// }

// @Component({
//   selector: 'app-agent-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './agent-dashboard.component.html',
//   styleUrls: ['./agent-dashboard.component.css']
// })
// export class AgentDashboardComponent implements OnInit, OnDestroy {

//   escalations: Escalation[] = []; // List of pending escalations
//   selectedEscalation: Escalation | null = null; // Currently selected escalation
//   messages: EscalationMessage[] = []; // Messages in the selected escalation
//   newMessage: string = ''; // New message input
//   sseSubscription: Subscription | null = null; // SSE subscription

//   apiUrl = 'http://127.0.0.1:5000'; // Backend API URL

//   constructor(private http: HttpClient, private sseService: SseService) {}

//   ngOnInit(): void {
//     this.fetchEscalations(); // Fetch pending escalations on component initialization
//   }

//   ngOnDestroy(): void {
//     if (this.sseSubscription) {
//       this.sseSubscription.unsubscribe(); // Unsubscribe from SSE on component destruction
//     }
//     this.sseService.closeEventSource(); // Close the SSE connection
//   }

//   // Fetch pending escalations from the backend
//   fetchEscalations(): void {
//     this.http.get<Escalation[]>(`${this.apiUrl}/agent/escalations`).subscribe(
//       (data) => {
//         this.escalations = data;
//       },
//       (error) => {
//         console.error('Error fetching escalations:', error);
//       }
//     );
//   }


//   // Select an escalation and start listening for real-time updates
//   selectEscalation(escalation: Escalation): void {
//     this.selectedEscalation = escalation;
//     this.messages = []; // Clear previous messages
//     this.startSSE(escalation.id); // Start SSE for real-time updates
//   }

//   // Start SSE connection for real-time updates
//   startSSE(escalationId: string): void {
//     if (this.sseSubscription) {
//       this.sseSubscription.unsubscribe(); // Unsubscribe from previous SSE connection
//     }

//     const url = `${this.apiUrl}/escalation/${escalationId}/events`;
//     this.sseSubscription = this.sseService.getEventSource(url).subscribe(
//       (event: MessageEvent) => {
//         const data = JSON.parse(event.data);

//         if (data.type === 'status') {
//           // Handle status updates
//           this.handleEscalationStatus(data);
//         } else if (data.type === 'message') {
//           // Handle new messages
//           this.handleEscalationMessage(data);
//         }
//       },
//       (error) => {
//         console.error('SSE error:', error);
//       }
//     );
//   }

//   // Handle escalation status updates
//   handleEscalationStatus(status: EscalationStatus): void {
//     if (status.agent_joined) {
//       // this.messages.push({
//       //   id: 'status',
//       //   sender: 'agent',
//       //   message: 'Agent has joined the conversation. You can now chat directly.',
//       //   timestamp: new Date().toISOString()
//       // });
//     } else {
//       this.messages.push({
//         id: 'status',
//         sender: 'agent',
//         message: `Escalation status: ${status.status}`,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   // Handle new escalation messages
//   handleEscalationMessage(message: EscalationMessage): void {
//     this.messages.push(message);
//   }

//   // Join an escalation as an agent
//   joinEscalation(escalationId: string): void {
//     this.http.post(`${this.apiUrl}/agent/escalation/${escalationId}/join`, {}).subscribe(
//       () => {
//         alert('Successfully joined the escalation!');
//         this.fetchEscalations(); // Refresh the list of escalations
//       },
//       (error) => {
//         console.error('Error joining escalation:', error);
//       }
//     );
//   }

//     // Join an escalation as an agent
//     deleteEscalation(escalationId: string): void {
//       this.http.delete(`${this.apiUrl}/escalation/${escalationId}`, {}).subscribe(
//         () => {
//           // alert('Successfully deleted the escalation!');
//           this.fetchEscalations(); // Refresh the list of escalations
//         },
//         (error) => {
//           console.error('Error deleting escalation:', error);
//         }
//       );
//     }

//   // Send a message to the user in the selected escalation
//   sendMessage(): void {
//     if (!this.selectedEscalation || !this.newMessage) return;

//     const payload = {
//       message: this.newMessage,
//       user_id: 'agent',
//     };

//     this.http.post(`${this.apiUrl}/escalation/${this.selectedEscalation.id}/send`, payload).subscribe(
//       () => {
//         this.newMessage = ''; // Clear the input field
//       },
//       (error) => {
//         console.error('Error sending message:', error);
//       }
//     );
//   }
// }



// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Subscription } from 'rxjs';
// import { SseService } from '../sse.service';

// interface Escalation {
//   id: string;
//   chatbot_id: string;
//   user_id: string;
//   status: string;
//   created_at: string;
// }

// interface EscalationMessage {
//   id: string;
//   sender: 'agent' | 'user';
//   message: string;
//   timestamp: string;
// }

// interface EscalationStatus {
//   status: string;
//   agent_joined: boolean;
// }

// @Component({
//   selector: 'app-agent-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './agent-dashboard.component.html',
//   styleUrls: ['./agent-dashboard.component.css']
// })
// export class AgentDashboardComponent implements OnInit, OnDestroy {

//   escalations: Escalation[] = []; // List of pending escalations
//   selectedEscalation: Escalation | null = null; // Currently selected escalation
//   messages: EscalationMessage[] = []; // Messages in the selected escalation
//   newMessage: string = ''; // New message input
//   sseSubscription: Subscription | null = null; // SSE subscription

//   apiUrl = 'http://127.0.0.1:5000'; // Backend API URL

//   constructor(private http: HttpClient, private sseService: SseService) {}

//   ngOnInit(): void {
//     this.fetchEscalations(); // Fetch pending escalations on component initialization
//   }

//   ngOnDestroy(): void {
//     if (this.sseSubscription) {
//       this.sseSubscription.unsubscribe(); // Unsubscribe from SSE on component destruction
//     }
//     this.sseService.closeEventSource(); // Close the SSE connection
//   }

//   // Fetch pending escalations from the backend
//   fetchEscalations(): void {
//     this.http.get<Escalation[]>(`${this.apiUrl}/agent/escalations`).subscribe(
//       (data) => {
//         this.escalations = data;
//       },
//       (error) => {
//         console.error('Error fetching escalations:', error);
//       }
//     );
//   }

//   // Select an escalation and start listening for real-time updates
//   selectEscalation(escalation: Escalation): void {
//     this.selectedEscalation = escalation;
//     this.messages = []; // Clear previous messages
//     this.fetchMessages(escalation.id); // Fetch previous messages
//     this.startSSE(escalation.id); // Start SSE for real-time updates
//   }

//   // Fetch all previous messages for the selected escalation
//   fetchMessages(escalationId: string): void {
//     this.http.get<EscalationMessage[]>(`${this.apiUrl}/escalation/${escalationId}/messages`).subscribe(
//       (data) => {
//         this.messages = data; // Set the messages array to the fetched data
//       },
//       (error) => {
//         console.error('Error fetching messages:', error);
//       }
//     );
//   }

//   // Start SSE connection for real-time updates
//   startSSE(escalationId: string): void {
//     if (this.sseSubscription) {
//       this.sseSubscription.unsubscribe(); // Unsubscribe from previous SSE connection
//     }

//     const url = `${this.apiUrl}/escalation/${escalationId}/events`;
//     this.sseSubscription = this.sseService.getEventSource(url).subscribe(
//       (event: MessageEvent) => {
//         const data = JSON.parse(event.data);

//         if (data.type === 'status') {
//           // Handle status updates
//           this.handleEscalationStatus(data);
//         } else if (data.type === 'message') {
//           // Handle new messages
//           this.handleEscalationMessage(data);
//         }
//       },
//       (error) => {
//         console.error('SSE error:', error);
//       }
//     );
//   }

//   // Handle escalation status updates
//   handleEscalationStatus(status: EscalationStatus): void {
//     if (status.agent_joined) {
//       // this.messages.push({
//       //   id: 'status',
//       //   sender: 'agent',
//       //   message: 'Agent has joined the conversation. You can now chat directly.',
//       //   timestamp: new Date().toISOString()
//       // });
//     } else {
//       this.messages.push({
//         id: 'status',
//         sender: 'agent',
//         message: `Escalation status: ${status.status}`,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   // Handle new escalation messages
//   handleEscalationMessage(message: EscalationMessage): void {
//     this.messages.push(message);
//   }

//   // Join an escalation as an agent
//   joinEscalation(escalationId: string): void {
//     this.http.post(`${this.apiUrl}/agent/escalation/${escalationId}/join`, {}).subscribe(
//       () => {
//         alert('Successfully joined the escalation!');
//         this.fetchEscalations(); // Refresh the list of escalations
//         this.fetchMessages(escalationId); // Fetch messages after joining
//       },
//       (error) => {
//         console.error('Error joining escalation:', error);
//       }
//     );
//   }

//   // Delete an escalation
//   deleteEscalation(escalationId: string): void {
//     this.http.delete(`${this.apiUrl}/escalation/${escalationId}`, {}).subscribe(
//       () => {
//         this.fetchEscalations(); // Refresh the list of escalations
//       },
//       (error) => {
//         console.error('Error deleting escalation:', error);
//       }
//     );
//   }

//   // Send a message to the user in the selected escalation
//   sendMessage(): void {
//     if (!this.selectedEscalation || !this.newMessage) return;
    
//     const payload = {
//       message: this.newMessage,
//       user_id: 'agent',
//     };

//     this.http.post(`${this.apiUrl}/escalation/${this.selectedEscalation.id}/send`, payload).subscribe(
//       () => {
//         this.newMessage = '';
//         this.fetchMessages(this.selectedEscalation!.id);  // Clear the input field
//       },
//       (error) => {
//         console.error('Error sending message:', error);
//       }
//     );
//   }
// }


// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Subscription } from 'rxjs';
// import { SseService } from '../sse.service';

// interface Escalation {
//   id: string;
//   chatbot_id: string;
//   user_id: string;
//   status: string;
//   created_at: string;
// }

// interface EscalationMessage {
//   id: string;
//   sender: 'agent' | 'user';
//   message: string;
//   timestamp: string;
// }

// interface EscalationStatus {
//   status: string;
//   agent_joined: boolean;
// }

// @Component({
//   selector: 'app-agent-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './agent-dashboard.component.html',
//   styleUrls: ['./agent-dashboard.component.css']
// })
// export class AgentDashboardComponent implements OnInit, OnDestroy {

//   escalations: Escalation[] = []; // List of pending escalations
//   selectedEscalation: Escalation | null = null; // Currently selected escalation
//   messages: EscalationMessage[] = []; // Messages in the selected escalation
//   newMessage: string = ''; // New message input
//   sseSubscription: Subscription | null = null; // SSE subscription

//   apiUrl = 'http://127.0.0.1:5000'; // Backend API URL

//   constructor(private http: HttpClient, private sseService: SseService) {}

//   ngOnInit(): void {
//     this.fetchEscalations(); // Fetch pending escalations on component initialization
//   }

//   ngOnDestroy(): void {
//     if (this.sseSubscription) {
//       this.sseSubscription.unsubscribe(); // Unsubscribe from SSE on component destruction
//     }
//     this.sseService.closeEventSource(); // Close the SSE connection
//   }

//   // Fetch pending escalations from the backend
//   fetchEscalations(): void {
//     this.http.get<Escalation[]>(`${this.apiUrl}/agent/escalations`).subscribe(
//       (data) => {
//         this.escalations = data;
//       },
//       (error) => {
//         console.error('Error fetching escalations:', error);
//       }
//     );
//   }

//   // Select an escalation and start listening for real-time updates
//   selectEscalation(escalation: Escalation): void {
//     this.selectedEscalation = escalation;
//     this.messages = []; // Clear previous messages
//     this.fetchMessages(escalation.id); // Fetch previous messages
//     this.startSSE(escalation.id); // Start SSE for real-time updates
//   }

//   // Fetch all previous messages for the selected escalation
//   fetchMessages(escalationId: string): void {
//     this.http.get<EscalationMessage[]>(`${this.apiUrl}/escalation/${escalationId}/messages`).subscribe(
//       (data) => {
//         this.messages = data; // Set the messages array to the fetched data
//       },
//       (error) => {
//         console.error('Error fetching messages:', error);
//       }
//     );
//   }

//   // Start SSE connection for real-time updates
//   startSSE(escalationId: string): void {
//     if (this.sseSubscription) {
//       this.sseSubscription.unsubscribe(); // Unsubscribe from previous SSE connection
//     }

//     const url = `${this.apiUrl}/escalation/${escalationId}/events`;
//     this.sseSubscription = this.sseService.getEventSource(url).subscribe(
//       (event: MessageEvent) => {
//         const data = JSON.parse(event.data);
//         console.log('Received SSE event:', data); // Debugging log

//         if (data.type === 'status') {
//           // Handle status updates
//           this.handleEscalationStatus(data);
//         } else if (data.type === 'message') {
//           // Handle new messages (both user and agent messages)
//           this.handleEscalationMessage(data);
//         }
//       },
//       (error) => {
//         console.error('SSE error:', error);
//       }
//     );
//   }

//   // Handle escalation status updates
//   handleEscalationStatus(status: EscalationStatus): void {
//     if (status.agent_joined) {
//       // this.messages.push({
//       //   id: 'status',
//       //   sender: 'agent',
//       //   message: 'Agent has joined the conversation. You can now chat directly.',
//       //   timestamp: new Date().toISOString()
//       // });
//     } else {
//       this.messages.push({
//         id: 'status',
//         sender: 'agent',
//         message: `Escalation status: ${status.status}`,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   // Handle new escalation messages
//   handleEscalationMessage(message: EscalationMessage): void {
//     this.messages.push(message); // Add the new message to the messages array
//   }

//   // Join an escalation as an agent
//   joinEscalation(escalationId: string): void {
//     this.http.post(`${this.apiUrl}/agent/escalation/${escalationId}/join`, {}).subscribe(
//       () => {
//         alert('Successfully joined the escalation!');
//         this.fetchEscalations(); // Refresh the list of escalations
//         this.fetchMessages(escalationId); // Fetch messages after joining
//       },
//       (error) => {
//         console.error('Error joining escalation:', error);
//       }
//     );
//   }

//   // Delete an escalation
//   deleteEscalation(escalationId: string): void {
//     this.http.delete(`${this.apiUrl}/escalation/${escalationId}`, {}).subscribe(
//       () => {
//         this.fetchEscalations(); // Refresh the list of escalations
//       },
//       (error) => {
//         console.error('Error deleting escalation:', error);
//       }
//     );
//   }

//   // Send a message to the user in the selected escalation
//   sendMessage(): void {
//     if (!this.selectedEscalation || !this.newMessage) return;

//     const payload = {
//       message: this.newMessage,
//       user_id: 'agent',
//     };

//     this.http.post(`${this.apiUrl}/escalation/${this.selectedEscalation.id}/send`, payload).subscribe(
//       () => {
//         this.newMessage = ''; // Clear the input field
//       },
//       (error) => {
//         console.error('Error sending message:', error);
//       }
//     );
//   }
// }


import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SseService } from '../sse.service';

interface Escalation {
  id: string;
  chatbot_id: string;
  user_id: string;
  status: string;
  created_at: string;
}

interface EscalationMessage {
  id: string;
  sender: 'agent' | 'user';
  message: string;
  timestamp: string;
}

interface EscalationStatus {
  status: string;
  agent_joined: boolean;
}

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css']
})
export class AgentDashboardComponent implements OnInit, OnDestroy {

  escalations: Escalation[] = []; // List of pending escalations
  selectedEscalation: Escalation | null = null; // Currently selected escalation
  messages: EscalationMessage[] = []; // Messages in the selected escalation
  newMessage: string = ''; // New message input
  sseSubscription: Subscription | null = null; // SSE subscription

  apiUrl = 'http://127.0.0.1:5000'; // Backend API URL

  constructor(
    private http: HttpClient,
    private sseService: SseService,
    private ngZone: NgZone // Inject NgZone
  ) {}

  ngOnInit(): void {
    this.fetchEscalations(); // Fetch pending escalations on component initialization
  }

  ngOnDestroy(): void {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe(); // Unsubscribe from SSE on component destruction
    }
    this.sseService.closeEventSource(); // Close the SSE connection
  }

  // Fetch pending escalations from the backend
  fetchEscalations(): void {
    this.http.get<Escalation[]>(`${this.apiUrl}/agent/escalations`).subscribe(
      (data) => {
        this.escalations = data;
      },
      (error) => {
        console.error('Error fetching escalations:', error);
      }
    );
  }

  // Select an escalation and start listening for real-time updates
  selectEscalation(escalation: Escalation): void {
    this.selectedEscalation = escalation;
    this.messages = []; // Clear previous messages
    this.fetchMessages(escalation.id); // Fetch previous messages
    this.startSSE(escalation.id); // Start SSE for real-time updates
  }

  // Fetch all previous messages for the selected escalation
  fetchMessages(escalationId: string): void {
    this.http.get<EscalationMessage[]>(`${this.apiUrl}/escalation/${escalationId}/messages`).subscribe(
      (data) => {
        this.messages = data; // Set the messages array to the fetched data
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  }

  // Start SSE connection for real-time updates
  startSSE(escalationId: string): void {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe(); // Unsubscribe from previous SSE connection
    }

    const url = `${this.apiUrl}/escalation/${escalationId}/events`;
    this.sseSubscription = this.sseService.getEventSource(url).subscribe(
      (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        console.log('Received SSE event:', data); // Debugging log

        if (data.type === 'status') {
          // Handle status updates
          this.handleEscalationStatus(data);
        } else if (data.type === 'message') {
          // Handle new messages (both user and agent messages)
          this.handleEscalationMessage(data);
        }
      },
      (error) => {
        console.error('SSE error:', error);
      }
    );
  }

  // Handle escalation status updates
  handleEscalationStatus(status: EscalationStatus): void {
    if (status.agent_joined) {
      // this.messages.push({
      //   id: 'status',
      //   sender: 'agent',
      //   message: 'Agent has joined the conversation. You can now chat directly.',
      //   timestamp: new Date().toISOString()
      // });
    } else {
      this.messages.push({
        id: 'status',
        sender: 'agent',
        message: `Escalation status: ${status.status}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Handle new escalation messages
  handleEscalationMessage(message: EscalationMessage): void {
    this.ngZone.run(() => {
      this.messages.push(message); // Add the new message to the messages array
    });
  }

  // Join an escalation as an agent
  joinEscalation(escalationId: string): void {
    this.http.post(`${this.apiUrl}/agent/escalation/${escalationId}/join`, {}).subscribe(
      () => {
        alert('Successfully joined the escalation!');
        this.fetchEscalations(); // Refresh the list of escalations
        this.fetchMessages(escalationId); // Fetch messages after joining
      },
      (error) => {
        console.error('Error joining escalation:', error);
      }
    );
  }

  // Delete an escalation
  deleteEscalation(escalationId: string): void {
    this.http.delete(`${this.apiUrl}/escalation/${escalationId}`, {}).subscribe(
      () => {
        this.fetchEscalations(); // Refresh the list of escalations
      },
      (error) => {
        console.error('Error deleting escalation:', error);
      }
    );
  }

  // Send a message to the user in the selected escalation
  sendMessage(): void {
    if (!this.selectedEscalation || !this.newMessage) return;

    const payload = {
      message: this.newMessage,
      user_id: 'agent',
    };

    this.http.post(`${this.apiUrl}/escalation/${this.selectedEscalation.id}/send`, payload).subscribe(
      () => {
        this.newMessage = ''; // Clear the input field
      },
      (error) => {
        console.error('Error sending message:', error);
      }
    );
  }
}