import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { ApiService} from '../api.service';
import { FormsModule } from '@angular/forms';
import { Ticket, TicketDetail } from '../ticket.types';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

type PriorityClass = {
  [K in 'high' | 'medium' | 'low']: string;
};

@Component({
  selector: 'app-ticket-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ticket-management.component.html',
  styleUrl: './ticket-management.component.css',
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class TicketManagementComponent {

  @Input() chatbotId: string = '';
  tickets: Ticket[] = [];
  selectedTicket: TicketDetail | null = null;
  editingTicket: Ticket | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';
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

  // Email related properties
  showEmailModal = false;
  emailData = {
    from_email: '',
    to_email: '',
    reply_to: '',
    subject: '',
    html_content: ''
  };
  sendingEmail = false;

  constructor(private ticketService: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    if (!this.chatbotId) {
      this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
    }
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
        // Add customer_name property if it doesn't exist
        this.tickets = tickets.map(ticket => ({
          ...ticket,
          customer_name: ticket.customer_name || 'Customer'
        }));
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

  clearSuccess() {
    this.successMessage = '';
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

  createNewTicket() {
    // This is a placeholder for the new ticket creation functionality
    // You would typically open a modal or navigate to a new ticket form
    alert('New ticket creation functionality will be implemented here.');
    // Example implementation could be:
    // this.router.navigate(['/tickets/new'], { queryParams: { chatbotId: this.chatbotId } });
  }

  openEditModal(ticket: Ticket, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    // Create a copy of the ticket to avoid direct mutation
    this.editingTicket = { ...ticket };
  }

  closeEditModal() {
    this.editingTicket = null;
  }

  saveTicketChanges() {
    if (!this.editingTicket) return;

    // Update status if changed
    if (this.editingTicket.status !== this.tickets.find(t => t.id === this.editingTicket!.id)?.status) {
      this.updateStatus(this.editingTicket.id, this.editingTicket.status);
    }

    // Update priority if changed
    if (this.editingTicket.priority !== this.tickets.find(t => t.id === this.editingTicket!.id)?.priority) {
      this.updatePriority(this.editingTicket.id, this.editingTicket.priority);
    }

    // Close the modal
    this.closeEditModal();

    // If we're viewing the details, refresh them
    if (this.selectedTicket && this.selectedTicket.ticket.id === this.editingTicket.id) {
      this.viewDetails(this.editingTicket.id);
    }
  }

  get totalTickets(): number {
    return this.tickets.length;
  }

  get openTicketsCount(): number {
    return this.tickets.filter(t => t.status === 'open').length;
  }

  get inProgressTicketsCount(): number {
    return this.tickets.filter(t => t.status === 'in_progress').length;
  }

  get resolvedTicketsCount(): number {
    return this.tickets.filter(t => t.status === 'resolved').length;
  }

  // Email related methods
  openEmailModal(ticket: Ticket) {
    // Initialize email data with default values
    this.emailData = {
      from_email: 'Support Team', // Default sender name (will be shown as the sender)
      to_email: '', // Will be filled by the user
      reply_to: 'support@yourbusiness.com', // Default reply-to address
      subject: `Regarding Ticket #${ticket.id}: ${ticket.subject}`,
      html_content: this.generateDefaultEmailContent(ticket)
    };
    this.showEmailModal = true;
  }

  closeEmailModal() {
    this.showEmailModal = false;
    this.sendingEmail = false;
  }

  generateDefaultEmailContent(ticket: Ticket): string {
    return `
      <p>Dear Customer,</p>
      <p>Thank you for contacting our support team. We are writing regarding your ticket:</p>
      <p><strong>Ticket #${ticket.id}: ${ticket.subject}</strong></p>
      <p><strong>Status:</strong> ${ticket.status}</p>
      <p><strong>Priority:</strong> ${ticket.priority}</p>
      <p>We appreciate your patience as we work to address your concerns.</p>
      <p>Best regards,<br>Support Team</p>
    `;
  }

  sendEmail() {
    this.sendingEmail = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedTicket) {
      this.errorMessage = 'No ticket selected';
      this.sendingEmail = false;
      return;
    }

    // Validate email data
    if (!this.emailData.from_email || !this.emailData.to_email) {
      this.errorMessage = 'Sender and recipient emails are required';
      this.sendingEmail = false;
      return;
    }

    this.ticketService.sendTicketEmail(this.selectedTicket.ticket.id, this.emailData).subscribe({
      next: (response) => {
        this.successMessage = 'Email sent successfully';
        this.sendingEmail = false;
        // Close the modal after a short delay
        setTimeout(() => this.closeEmailModal(), 2000);
      },
      error: (error) => {
        this.errorMessage = `Failed to send email: ${error}`;
        this.sendingEmail = false;
      }
    });
  }
}


