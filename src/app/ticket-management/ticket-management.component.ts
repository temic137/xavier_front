import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService} from '../api.service';
import { FormsModule } from '@angular/forms';
import { Ticket,TicketDetail } from '../ticket.types';
import { Console } from 'node:console';
import { ActivatedRoute,RouterModule } from '@angular/router';

type PriorityClass = {
  [K in 'high' | 'medium' | 'low']: string;
};

@Component({
  selector: 'app-ticket-management',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './ticket-management.component.html',
  styleUrl: './ticket-management.component.css'
})
export class TicketManagementComponent {

  chatbotId: string = '';
  tickets: Ticket[] = [];
  selectedTicket: TicketDetail | null = null;
  loading = false;
  errorMessage = '';
  currentChatbotId: string | null = null;
  constructor(private ticketService: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
    this.loadTickets();
  }


  loadTickets() {
    this.loading = true;
    this.errorMessage = '';
  
    if (!this.chatbotId) {
      this.loading = false;
      return;
    }
  
    this.ticketService.getTicketsByChatbotId(this.chatbotId).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.errorMessage = error;
        this.loading = false;
      }
    });
  }


  clearError() {
    this.errorMessage = '';
  }

  viewDetails(ticketId: number) {
    this.ticketService.getTicketDetails(ticketId).subscribe({
      next: (ticketDetail) => {
        this.selectedTicket = ticketDetail;
      },
      error: (error) => {
        this.errorMessage = error;
      }
    });
  }

  // updateStatus(ticketId: number, status: string) {
  //   this.ticketService.updateTicketStatus(ticketId, status).subscribe({
  //     next: () => {
  //       // Success handling
  //     },
  //     error: (error) => {
  //       this.errorMessage = error;
  //       this.loadTickets(); // Reload tickets to revert UI
  //     }
  //   });
  // }


  updateStatus(ticketId: number, status: string) {
    this.ticketService.updateTicketStatus(ticketId, status).subscribe({
      next: () => {
        // Update local ticket status
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (ticket) {
          ticket.status = status;
        }
        // Update selected ticket if viewing details
        if (this.selectedTicket?.ticket.id === ticketId) {
          this.selectedTicket.ticket.status = status;
        }
        // Optional: Refresh tickets from server
        this.loadTickets();
      },
      error: (error) => {
        this.errorMessage = error;
        this.loadTickets();
      }
    });
  }

  deleteTicket(ticketId: number) {
    if (confirm('Are you sure you want to delete this ticket?')) {
      this.ticketService.deleteTicket(ticketId).subscribe({
        next: () => {
          this.tickets = this.tickets.filter(ticket => ticket.id !== ticketId);
        },
        error: (error) => {
          this.errorMessage = error;
        }
      });
    }
  }

  closeDetails() {
    this.selectedTicket = null;
  }

  getPriorityClass(priority: string): string {
    const classes = {
      high: 'text-red-600 font-semibold',
      medium: 'text-yellow-600 font-semibold',
      low: 'text-green-600 font-semibold'
    };
    return classes[priority.toLowerCase() as keyof typeof classes] || 'text-gray-600';
  }
}


