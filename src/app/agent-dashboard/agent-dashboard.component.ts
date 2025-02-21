import { Component, OnInit, OnDestroy, NgZone, ElementRef, ViewChild, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { SseService } from '../sse.service';
import { ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';
import { NotificationService, NotificationMessage } from '../notification.service';
import { DatePipe } from '@angular/common';
import { EscalationStatusService } from '../services/escalation-status.service';

// Add this interface for notifications
interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

interface Escalation {
  id: string;
  chatbot_id: string;
  user_id: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;  // ISO 8601 format: "2024-03-20T15:30:00Z"
  priority: 'low' | 'medium' | 'high';
  last_message_time?: string;
  selected?: boolean;
}

interface EscalationMessage {
  id: string;
  sender: 'agent' | 'user';
  message: string;
  timestamp: string;
  read?: boolean;
}

interface EscalationStatus {
  status: string;
  agent_joined: boolean;
}

interface EscalationsResponse {
  chatbot_name: string;
  escalations: Escalation[];
  total_escalations: number;
}

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './agent-dashboard.component.html',
})
export class AgentDashboardComponent implements OnInit {
  // API URL
  private apiUrl = 'http://127.0.0.1:5000';

  // Core properties
  chatbotId: string = '';
  escalations: Escalation[] = [];
  selectedEscalation: Escalation | null = null;
  messages: EscalationMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = true;

  // Modal properties
  showDeleteModal: boolean = false;
  escalationToDeleteId: string | null = null;

  // Filter and sort properties
  searchTerm: string = '';
  filterStatus: string = 'all';
  filterPriority: string = 'all';
  sortBy: 'created_at' | 'last_message_time' = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Subscription and state properties
  sseSubscription: Subscription | null = null;
  refreshSubscription: Subscription | null = null;
  isTyping: boolean = false;
  typingTimeout: any;
  private escalationsEventSource: EventSource | null = null;
  
  @ViewChild('notificationSound') notificationSound!: ElementRef<HTMLAudioElement>;
  
  userStats: any = {};
  
  agentName: string = 'John Doe'; // Replace with actual agent name
  lastWeekStats = {
    active: 12,
    pending: 8,
    resolved: 15,
    responseTime: 45
  };
  
  isScrolled = false;

  activeDropdown: 'status' | 'sort' | 'priority' | null = null;

  // Define the notifications array
  notifications: Array<{ id: number, message: string, type: string, timestamp: Date }> = [];

  selectedEscalations: Set<string> = new Set();
  isMultiSelectMode: boolean = false;

  constructor(
    private http: HttpClient,
    private sseService: SseService,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private escalationStatusService: EscalationStatusService
  ) {}

  ngOnInit(): void {
    this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
    this.fetchEscalations();
    this.startEscalationsSSE();
  }

  // ngOnDestroy(): void {
  //   // Clean up subscriptions
  //   this.cleanupSubscriptions();
  // }

  private cleanupSubscriptions(): void {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.sseService.closeEventSource();
  }

  startEscalationsSSE(): void {
    if (this.escalationsEventSource) {
      this.escalationsEventSource.close();
    }
  
    this.escalationsEventSource = new EventSource(
      `${this.apiUrl}/agent/escalations/${this.chatbotId}/events`
    );
  
    this.escalationsEventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received SSE data:', data);
      
      if (data.type === 'escalations_update') {
        this.ngZone.run(() => {
          // Check for new escalations
          data.escalations.forEach((newEsc: Escalation) => {
            const existingEscalation = this.escalations.find(e => e.id === newEsc.id);
            if (!existingEscalation) {
              // Use the new notification service
              this.notificationService.showNotification(
                `New escalation received from user ${newEsc.user_id}`,
                'info'
              );
            }
            
            // Update escalations list
            const index = this.escalations.findIndex(e => e.id === newEsc.id);
            if (index !== -1) {
              this.escalations[index] = { ...this.escalations[index], ...newEsc };
            } else {
              this.escalations.unshift(newEsc);
            }
          });
  
          this.escalations = [...this.escalations].sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          
          // Update the pending status based on count
          const pendingCount = this.getPendingCount();
          console.log('Pending count:', pendingCount);
          this.escalationStatusService.setPendingStatus(pendingCount);
        });
      }
    };
  }

  private ensureISODate(dateStr: string): string {
    try {
      // If it's already a valid ISO string, return it
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(dateStr)) {
        return dateStr;
      }
      
      // Try to parse and convert to ISO
      const date = new Date(dateStr);
      if (isFinite(date.getTime())) {
        return date.toISOString();
      }
      
      return dateStr; // Return original if can't convert
    } catch {
      return dateStr;
    }
  }

  fetchEscalations(): void {
    this.isLoading = true;
    
    this.http.get<EscalationsResponse>(`${this.apiUrl}/agent/escalations/${this.chatbotId}`).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          // Normalize dates in the response
          const normalizedEscalations = response.escalations.map(esc => ({
            ...esc,
            created_at: this.ensureISODate(esc.created_at),
            last_message_time: esc.last_message_time ? this.ensureISODate(esc.last_message_time) : undefined
          }));
          
          this.escalations = normalizedEscalations;
          
          // Update pending status after loading escalations
          const pendingCount = this.getPendingCount();
          this.escalationStatusService.setPendingStatus(pendingCount);
          
          this.isLoading = false;
        });
      },
      error: (error) => {
        console.error('Error fetching escalations:', error);
        this.escalations = [];
        this.isLoading = false;
        this.escalationStatusService.setPendingStatus(0);
      }
    });
  }

  getFilteredEscalations(): Escalation[] {
    return this.escalations.filter(escalation => {
      // Convert search term to lowercase for case-insensitive comparison
      const searchTermLower = this.searchTerm?.toLowerCase() || '';
      
      // Ensure escalation.id is converted to string before comparison
      const matchesSearch = this.searchTerm ? 
        (String(escalation.id).toLowerCase().includes(searchTermLower) ||
         String(escalation.user_id).toLowerCase().includes(searchTermLower)) : true;
      
      const matchesStatus = this.filterStatus === 'all' ? true : 
        escalation.status === this.filterStatus;
      
      const matchesPriority = this.filterPriority === 'all' ? true :
        escalation.priority === this.filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  selectEscalation(escalation: Escalation): void {
    this.selectedEscalation = escalation;
    this.messages = [];
    this.fetchMessages(escalation.id);
    this.startSSE(escalation.id);
  }

  fetchMessages(escalationId: string): void {
    this.http.get<EscalationMessage[]>(`${this.apiUrl}/escalation/${escalationId}/messages`).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.messages = Array.isArray(data) ? data : [];
        });
      },
      error: (error) => {
        console.error('Error fetching messages:', error);
        this.messages = [];
      }
    });
  }

  startSSE(escalationId: string): void {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }

    const url = `${this.apiUrl}/escalation/${escalationId}/events`;
    this.sseSubscription = this.sseService.getEventSource(url).subscribe({
      next: (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        this.ngZone.run(() => {
          if (data.type === 'message') {
            this.handleEscalationMessage(data);
          }
        });
      },
      error: (error) => {
        console.error('SSE error:', error);
      }
    });
  }

  handleEscalationMessage(message: EscalationMessage): void {
    this.messages = [...this.messages, message];
  }

  joinEscalation(escalationId: string): void {
    this.http.post(`${this.apiUrl}/agent/escalation/${escalationId}/join`, {}).subscribe({
      next: () => {
        this.fetchEscalations();
        this.fetchMessages(escalationId);
      },
      error: (error) => {
        console.error('Error joining escalation:', error);
      }
    });
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700';
      case 'in_progress': return 'bg-emerald-50 text-emerald-700';
      case 'resolved': return 'bg-blue-50 text-blue-700';
      case 'closed': return 'bg-gray-50 text-gray-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  }

  onTyping(): void {
    this.isTyping = true;
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
    }, 1000);
  }

  exportChatHistory(): void {
    if (!this.selectedEscalation) return;

    const doc = new jsPDF();
    let yPos = 20;

    // Add header
    doc.setFontSize(16);
    doc.text(`Chat History - Case #${this.selectedEscalation.id}`, 20, yPos);
    yPos += 20;

    // Add metadata
    doc.setFontSize(12);
    doc.text(`Status: ${this.selectedEscalation.status}`, 20, yPos);
    yPos += 10;
    doc.text(`Priority: ${this.selectedEscalation.priority}`, 20, yPos);
    yPos += 10;
    doc.text(`Created: ${new Date(this.selectedEscalation.created_at).toLocaleString()}`, 20, yPos);
    yPos += 20;

    // Add messages with proper type annotations
    doc.setFontSize(12);
    this.messages.forEach(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const text = `${timestamp} - ${msg.sender}: ${msg.message}`;
      
      // Explicitly type the splitTextToSize return value as string[]
      const lines: string[] = doc.splitTextToSize(text, 170);
      lines.forEach((line: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 20, yPos);
        yPos += 10;
      });
    });

    doc.save(`chat-history-${this.selectedEscalation.id}.pdf`);
  }

  updateEscalationStatus(status: 'resolved' | 'closed'): void {
    if (!this.selectedEscalation) return;

    const escalationId = this.selectedEscalation.id;
    const payload = { status };

    this.http.put(`${this.apiUrl}/escalation/${escalationId}/status`, payload).subscribe({
        next: () => {
            // Update the local state
            const escalation = this.selectedEscalation;
            if (escalation) {
                escalation.status = status;
                this.selectedEscalation = { ...escalation };
            }

            // Update the escalation in the list
            const index = this.escalations.findIndex(e => e.id === escalationId);
            if (index !== -1) {
                this.escalations[index] = { ...this.escalations[index], status };
            }
        },
        error: (error) => {
            console.error('Error updating escalation status:', error);
        }
    });
}

  sendMessage(): void {
    if (!this.selectedEscalation || !this.newMessage.trim()) {
      return;
    }

    const payload = {
      message: this.newMessage.trim(),
      user_id: 'agent'
    };

    this.http.post(`${this.apiUrl}/escalation/${this.selectedEscalation.id}/send`, payload).subscribe({
      next: () => {
        this.newMessage = '';
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
  }

  showDeleteConfirmation(escalationId: string): void {
    this.escalationToDeleteId = escalationId;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.escalationToDeleteId = null;
  }

  confirmDelete(): void {
    if (this.escalationToDeleteId) {
      this.deleteEscalation(this.escalationToDeleteId);
    } else {
      const deletePromises = Array.from(this.selectedEscalations).map(id => 
        this.http.delete(`${this.apiUrl}/escalation/${id}`).toPromise()
      );

      Promise.all(deletePromises)
        .then(() => {
          this.fetchEscalations();
          this.selectedEscalations.clear();
          this.isMultiSelectMode = false;
        })
        .catch(error => {
          console.error('Error deleting escalations:', error);
        });
    }
    this.showDeleteModal = false;
    this.escalationToDeleteId = null;
  }

  deleteEscalation(escalationId: string): void {
    this.http.delete(`${this.apiUrl}/escalation/${escalationId}`).subscribe({
      next: () => {
        this.fetchEscalations();
        if (this.selectedEscalation?.id === escalationId) {
          this.selectedEscalation = null;
          this.messages = [];
        }
      },
      error: (error) => {
        console.error('Error deleting escalation:', error);
      }
    });
  }

  getActiveCount(): number {
    return this.escalations.filter(e => e.status === 'in_progress').length;
  }

  getPendingCount(): number {
    return this.escalations.filter(e => e.status === 'pending').length;
  }

  getResolvedCount(): number {
    return this.escalations.filter(e => e.status === 'resolved').length;
  }

  getTimeSince(dateStr: string): string {
    try {
      if (!dateStr) {
        return 'No date';
      }

      // Parse the ISO date string
      const date = new Date(dateStr);
      
      // Validate the date
      if (!isFinite(date.getTime())) {
        console.error('Invalid date:', dateStr);
        return 'Invalid date';
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      // Within last minute
      if (diffSecs < 60) {
        return 'Just now';
      }

      // Within last hour
      if (diffMins < 60) {
        return `${diffMins}m ago`;
      }

      // Within last day
      if (diffHours < 24) {
        const mins = diffMins % 60;
        return mins > 0 ? `${diffHours}h ${mins}m ago` : `${diffHours}h ago`;
      }

      // Within last week
      if (diffDays < 7) {
        const hours = diffHours % 24;
        return hours > 0 ? `${diffDays}d ${hours}h ago` : `${diffDays}d ago`;
      }

      // More than a week ago - show actual date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });

    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Date error';
    }
  }

  isUrgent(escalation: Escalation): boolean {
    return escalation.priority === 'high' && 
           (escalation.status === 'pending' || escalation.status === 'in_progress');
  }

  needsAttention(escalation: Escalation): boolean {
    const hoursSinceLastMessage = this.getHoursSinceLastMessage(escalation);
    return hoursSinceLastMessage > 1 && escalation.status === 'in_progress';
  }

  getHoursSinceLastMessage(escalation: Escalation): number {
    if (!escalation.last_message_time) return 0;
    return (new Date().getTime() - new Date(escalation.last_message_time).getTime()) / (1000 * 60 * 60);
  }

  getLastSeen(): string {
    return '2 minutes ago';
  }

  getUserBrowser(): string {
    return 'Chrome 91.0';
  }

  getMessageCount(): number {
    return this.messages.length;
  }

  getAverageResponseTime(): string {
    return '35'; // Replace with actual calculation
  }

  getActiveChangePercent(): number {
    const currentActive = this.getActiveCount();
    const percentChange = ((currentActive - this.lastWeekStats.active) / this.lastWeekStats.active) * 100;
    return Math.round(percentChange);
  }

  getPendingChangePercent(): number {
    const currentPending = this.getPendingCount();
    const percentChange = ((currentPending - this.lastWeekStats.pending) / this.lastWeekStats.pending) * 100;
    return Math.round(percentChange);
  }

  getResolvedChangePercent(): number {
    const currentResolved = this.getResolvedCount();
    const percentChange = ((currentResolved - this.lastWeekStats.resolved) / this.lastWeekStats.resolved) * 100;
    return Math.round(percentChange);
  }

  getResponseTimeChangePercent(): number {
    const currentTime = parseInt(this.getAverageResponseTime());
    const percentChange = ((currentTime - this.lastWeekStats.responseTime) / this.lastWeekStats.responseTime) * 100;
    return Math.round(percentChange);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 0;
  }

  getTotalCount(): number {
    return this.getActiveCount() + this.getPendingCount() + this.getResolvedCount();
  }

  toggleDropdown(dropdown: 'status' | 'sort' | 'priority') {
    this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
  }

  // Add click handler to close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.activeDropdown = null;
    }
  }

  // Method to remove a notification
  removeNotification(notificationId: number): void {
    this.notifications = this.notifications.filter(notification => notification.id !== notificationId);
  }

  toggleSelectMode(): void {
    this.isMultiSelectMode = !this.isMultiSelectMode;
    if (!this.isMultiSelectMode) {
      this.selectedEscalations.clear();
    }
  }

  toggleEscalationSelection(event: Event, escalationId: string): void {
    event.stopPropagation(); // Prevent triggering selectEscalation
    if (this.selectedEscalations.has(escalationId)) {
      this.selectedEscalations.delete(escalationId);
    } else {
      this.selectedEscalations.add(escalationId);
    }
  }

  getDeleteConfirmationText(): string {
    return this.escalationToDeleteId ? 
      'Are you sure you want to delete this escalation?' : 
      `Are you sure you want to delete ${this.selectedEscalations.size} escalations?`;
  }

  deleteSelectedEscalations(): void {
    if (this.selectedEscalations.size === 0) return;
    
    this.showDeleteModal = true;
    this.escalationToDeleteId = null; // We'll use selectedEscalations instead
  }
}




