import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { ApiService} from '../api.service';
import { FormsModule } from '@angular/forms';
import { Ticket,TicketDetail } from '../ticket.types';
import { Console } from 'node:console';
import { ActivatedRoute,RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

type PriorityClass = {
  [K in 'high' | 'medium' | 'low']: string;
};

@Component({
  selector: 'app-ticket-management',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './ticket-management.component.html',
  styleUrl: './ticket-management.component.css',
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('100ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('75ms ease-in', style({ transform: 'scale(0.95)', opacity: 0 }))
      ])
    ])
  ]
})
export class TicketManagementComponent {

  chatbotId: string = '';
  tickets: Ticket[] = [];
  selectedTicket: TicketDetail | null = null;
  loading = false;
  errorMessage = '';
  currentChatbotId: string | null = null;
  searchTerm: string = '';
  filterStatus: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  activeDropdownId: number | null = null;
  showStatusFilter = false;
  activePriorityDropdownId: number | null = null;
  filterPriority: string = '';
  showPriorityFilter = false;

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


  updateStatus(ticketId: number, status: string) {
    this.ticketService.updateTicketStatus(ticketId, status).subscribe({
      next: () => {
       
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (ticket) {
          ticket.status = status;
        }
        // Update selected ticket if viewing details
        if (this.selectedTicket?.ticket.id === ticketId) {
          this.selectedTicket.ticket.status = status;
        }
        //  Refresh tickets from server
        this.loadTickets();
        this.activeDropdownId = null;
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

  filteredTickets(): Ticket[] {
    let filtered = [...this.tickets];

    // Search term filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.description?.toLowerCase().includes(searchLower) ||
        ticket.id.toString().includes(searchLower)
      );
    }

    // Status filter
    if (this.filterStatus) {
      filtered = filtered.filter(ticket => 
        ticket.status.toLowerCase() === this.filterStatus.toLowerCase()
      );
    }

    // Priority filter
    if (this.filterPriority) {
      filtered = filtered.filter(ticket => 
        ticket.priority.toLowerCase() === this.filterPriority.toLowerCase()
      );
    }

    // Sort the filtered results
    return this.sortTickets(filtered);
  }

  sortTickets(tickets: Ticket[]): Ticket[] {
    if (!this.sortColumn) return tickets;

    return [...tickets].sort((a, b) => {
      let valueA = a[this.sortColumn as keyof Ticket];
      let valueB = b[this.sortColumn as keyof Ticket];

      // Handle dates
      if (this.sortColumn === 'created_at') {
        valueA = new Date(valueA as string).getTime();
        valueB = new Date(valueB as string).getTime();
      }

      if (valueA === undefined || valueB === undefined) return 0;

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  toggleDropdown(ticketId: number) {
    if (this.activeDropdownId === ticketId) {
      this.activeDropdownId = null;
    } else {
      this.activeDropdownId = ticketId;
    }
  }

  toggleStatusFilter() {
    this.showStatusFilter = !this.showStatusFilter;
  }

  setStatusFilter(status: string) {
    this.filterStatus = status;
    this.showStatusFilter = false;
  }

  togglePriorityDropdown(ticketId: number) {
    if (this.activePriorityDropdownId === ticketId) {
      this.activePriorityDropdownId = null;
    } else {
      this.activePriorityDropdownId = ticketId;
    }
  }

  updatePriority(ticketId: number, priority: string) {
    this.ticketService.updateTicketPriority(ticketId, priority).subscribe({
      next: () => {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (ticket) {
          ticket.priority = priority;
        }
        // Update selected ticket if viewing details
        if (this.selectedTicket?.ticket.id === ticketId) {
          this.selectedTicket.ticket.priority = priority;
        }
        // Refresh tickets from server
        this.loadTickets();
        this.activePriorityDropdownId = null;
      },
      error: (error) => {
        this.errorMessage = error;
        this.loadTickets();
      }
    });
  }

  togglePriorityFilter() {
    this.showPriorityFilter = !this.showPriorityFilter;
  }

  setPriorityFilter(priority: string) {
    this.filterPriority = priority;
    this.showPriorityFilter = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!event.target) return;
    
    const clickedElement = event.target as HTMLElement;
    if (!clickedElement.closest('.relative.inline-block')) {
      this.activeDropdownId = null;
      this.showStatusFilter = false;
      this.showPriorityFilter = false;
      this.activePriorityDropdownId = null;
    }
  }
}


