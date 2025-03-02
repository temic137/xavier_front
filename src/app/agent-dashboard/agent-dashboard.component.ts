import { Component, OnInit, OnDestroy, NgZone, ElementRef, ViewChild, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import Pusher from 'pusher-js'; // Default import instead of namespace
import { jsPDF } from 'jspdf';
import { NotificationService, NotificationMessage } from '../notification.service';
import { EscalationStatusService } from '../services/escalation-status.service';
import { DatePipe } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
// Define interfaces
interface Escalation {
  id: string;
  chatbot_id: string;
  user_id: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
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
export class AgentDashboardComponent implements OnInit{
  // API URL and Pusher setup
  private apiUrl = 'http://localhost:5000';
  private pusherKey = '43bd6f1835e5bb8165d8'; // Replace with your actual Pusher app key
  private pusherCluster = 'us3'; // Replace with your actual Pusher cluster
  private pusher: Pusher;
  private destroy$ = new Subject<void>();

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

  // State properties
  isTyping: boolean = false;
  typingTimeout: any;

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
  // notifications: Array<{ id: number, message: string, type: string, timestamp: Date }> = [];
  selectedEscalations: Set<string> = new Set();
  isMultiSelectMode: boolean = false;

  // Update this line in your component
  notifications: Array<{ 
    id: number, 
    message: string, 
    type: 'info' | 'success' | 'warning' | 'error', 
    timestamp: Date 
  }> = [];

  escalationNotifications: NotificationMessage[] = [];
  notificationCount: number = 0;
  showNotificationDropdown: boolean = false;
  private notificationsSubscription: Subscription | null = null;

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private escalationStatusService: EscalationStatusService,
    private datePipe: DatePipe
  ) {
    // Initialize Pusher with environment variables
    this.pusher = new Pusher(this.pusherKey, {
      cluster: this.pusherCluster,
      // encrypted: true
    });
  }

  ngOnInit(): void {
    this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
    this.fetchEscalations();
    this.startPusherEscalations();
    // Note: Removed subscribeToEscalations call unless it's defined in EscalationStatusService

    // Subscribe to notifications
  this.notificationService.getNotifications()
  .pipe(takeUntil(this.destroy$))
  .subscribe(notifications => {
    this.notifications = notifications.map(notification => ({
      id: parseInt(notification.id),
      message: notification.message,
      type: notification.type,
      timestamp: notification.timestamp
    }));
  });
  this.subscribeToNotifications();
  if (typeof document !== 'undefined') {
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }
  }

  // ngOnDestroy(): void {
  //   if (this.pusher) {
  //     this.pusher.unsubscribe(`chatbot-${this.chatbotId}-escalations`);
  //     if (this.selectedEscalation) {
  //       this.pusher.unsubscribe(`escalation-${this.selectedEscalation.id}`);
  //     }
  //     this.pusher.disconnect();
  //   }
  //   if (this.typingTimeout) {
  //     clearTimeout(this.typingTimeout);
  //   }
  // }

  ngOnDestroy(): void {
    if (this.pusher) {
      this.pusher.unsubscribe(`chatbot-${this.chatbotId}-escalations`);
      if (this.selectedEscalation) {
        this.pusher.unsubscribe(`escalation-${this.selectedEscalation.id}`);
      }
      this.pusher.disconnect();
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.onDocumentClick.bind(this));
    }
  }

  startPusherEscalations(): void {
    const channel = this.pusher.subscribe(`chatbot-${this.chatbotId}-escalations`);
    channel.bind('escalation-update', (data: { type: string; escalations: Escalation[] }) => {
      this.ngZone.run(() => {
        console.log('Received Pusher escalation update:', data);
        data.escalations.forEach((newEsc: Escalation) => {
          const existingEscalation = this.escalations.find(e => e.id === newEsc.id);
          if (!existingEscalation) {
            // Use the notification service to broadcast the escalation to all components
            // The sound will play automatically when a notification is shown
            this.notificationService.showNotification(
              `New escalation received from user ${newEsc.user_id}`,
              'info'
            );
          }
          const index = this.escalations.findIndex(e => e.id === newEsc.id);
          if (index !== -1) {
            this.escalations[index] = { ...this.escalations[index], ...newEsc };
          } else {
            this.escalations.unshift(newEsc);
          }
        });
        this.escalations = [...this.escalations].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const pendingCount = this.getPendingCount();
        this.escalationStatusService.setPendingStatus(pendingCount);
      });
    });
    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher subscription error for escalations:', error);
      this.notificationService.showNotification('Failed to connect to real-time updates', 'error');
    });
  }

  handleJoinClick(escalation: Escalation): void {
    this.joinEscalation(escalation.id);
    this.selectEscalation(escalation);
  }

  private ensureISODate(dateStr: string): string {
    try {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(dateStr)) {
        return dateStr;
      }
      const date = new Date(dateStr);
      if (isFinite(date.getTime())) {
        return date.toISOString();
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  }

  fetchEscalations(): void {
    this.isLoading = true;
    this.http.get<EscalationsResponse>(`${this.apiUrl}/agent/escalations/${this.chatbotId}`).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          const normalizedEscalations = response.escalations.map(esc => ({
            ...esc,
            created_at: this.ensureISODate(esc.created_at),
            last_message_time: esc.last_message_time ? this.ensureISODate(esc.last_message_time) : undefined
          }));
          this.escalations = normalizedEscalations;
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
        this.notificationService.showNotification('Failed to load escalations', 'error');
      }
    });
  }

  getFilteredEscalations(): Escalation[] {
    return this.escalations.filter(escalation => {
      const searchTermLower = this.searchTerm?.toLowerCase() || '';
      const matchesSearch = this.searchTerm ?
        (String(escalation.id).toLowerCase().includes(searchTermLower) ||
         String(escalation.user_id).toLowerCase().includes(searchTermLower)) : true;
      const matchesStatus = this.filterStatus === 'all' ? true : escalation.status === this.filterStatus;
      const matchesPriority = this.filterPriority === 'all' ? true : escalation.priority === this.filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  selectEscalation(escalation: Escalation): void {
    if (this.selectedEscalation) {
      this.pusher.unsubscribe(`escalation-${this.selectedEscalation.id}`);
    }
    this.selectedEscalation = escalation;
    this.messages = [];
    this.fetchMessages(escalation.id);
    this.startPusherMessages(escalation.id);
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
        this.notificationService.showNotification('Failed to load messages', 'error');
      }
    });
  }

  startPusherMessages(escalationId: string): void {
    const channel = this.pusher.subscribe(`escalation-${escalationId}`);
    channel.bind('new-message', (data: EscalationMessage) => {
      this.ngZone.run(() => {
        if (!this.messages.some(m => m.id === data.id)) {
          this.messages = [...this.messages, data];
        }
      });
    });
    channel.bind('status-update', (data: { type: string; status: string; agent_joined: boolean }) => {
      this.ngZone.run(() => {
        if (this.selectedEscalation) {
          const validStatus = ['pending', 'in_progress', 'resolved', 'closed'].includes(data.status)
            ? data.status as 'pending' | 'in_progress' | 'resolved' | 'closed'
            : this.selectedEscalation.status;
          this.selectedEscalation.status = validStatus;
          this.escalations = this.escalations.map(e =>
            e.id === this.selectedEscalation!.id ? { ...e, status: validStatus } : e
          );
        }
      });
    });
    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher subscription error for messages:', error);
      this.notificationService.showNotification('Failed to connect to message updates', 'error');
    });
  }

  joinEscalation(escalationId: string): void {
    this.http.post(`${this.apiUrl}/agent/escalation/${escalationId}/join`, {}).subscribe({
      next: () => {
        this.fetchEscalations();
        this.fetchMessages(escalationId);
      },
      error: (error) => {
        console.error('Error joining escalation:', error);
        this.notificationService.showNotification('Failed to join escalation', 'error');
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

    doc.setFontSize(16);
    doc.text(`Chat History - Case #${this.selectedEscalation.id}`, 20, yPos);
    yPos += 20;

    doc.setFontSize(12);
    doc.text(`Status: ${this.selectedEscalation.status}`, 20, yPos);
    yPos += 10;
    doc.text(`Priority: ${this.selectedEscalation.priority}`, 20, yPos);
    yPos += 10;
    doc.text(`Created: ${new Date(this.selectedEscalation.created_at).toLocaleString()}`, 20, yPos);
    yPos += 20;

    doc.setFontSize(12);
    this.messages.forEach(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const text = `${timestamp} - ${msg.sender}: ${msg.message}`;
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
        const escalation = this.selectedEscalation;
        if (escalation) {
          escalation.status = status;
          this.selectedEscalation = { ...escalation };
        }
        const index = this.escalations.findIndex(e => e.id === escalationId);
        if (index !== -1) {
          this.escalations[index] = { ...this.escalations[index], status };
        }
      },
      error: (error) => {
        console.error('Error updating escalation status:', error);
        this.notificationService.showNotification('Failed to update status', 'error');
      }
    });
  }

  sendMessage(): void {
    if (!this.selectedEscalation || !this.newMessage.trim()) return;

    const payload = { message: this.newMessage.trim() };
    this.http.post(`${this.apiUrl}/escalation/${this.selectedEscalation.id}/send`, payload).subscribe({
      next: () => {
        this.newMessage = '';
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.notificationService.showNotification('Failed to send message', 'error');
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
    } else if (this.selectedEscalations.size > 0) {
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
          this.notificationService.showNotification('Failed to delete escalations', 'error');
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
          this.pusher.unsubscribe(`escalation-${escalationId}`);
        }
      },
      error: (error) => {
        console.error('Error deleting escalation:', error);
        this.notificationService.showNotification('Failed to delete escalation', 'error');
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
      if (!dateStr) return 'No date';
      const date = new Date(dateStr);
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

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) {
        const mins = diffMins % 60;
        return mins > 0 ? `${diffHours}h ${mins}m ago` : `${diffHours}h ago`;
      }
      if (diffDays < 7) {
        const hours = diffHours % 24;
        return hours > 0 ? `${diffDays}d ${hours}h ago` : `${diffDays}d ago`;
      }
      return this.datePipe.transform(date, 'MMM d, h:mm a') || 'Date error';
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Date error';
    }
  }

  isUrgent(escalation: Escalation): boolean {
    return escalation.priority === 'high' && (escalation.status === 'pending' || escalation.status === 'in_progress');
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
    return '2 minutes ago'; // Placeholder
  }

  getUserBrowser(): string {
    return 'Chrome 91.0'; // Placeholder
  }

  getMessageCount(): number {
    return this.messages.length;
  }

  getAverageResponseTime(): string {
    return '35'; // Placeholder
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.activeDropdown = null;
    }
    if (!target.closest('.notification-container')) {
      this.showNotificationDropdown = false;
    }
  }

  removeNotification(id: number): void {
    this.notificationService.removeNotification(id.toString());
  }

  toggleSelectMode(): void {
    this.isMultiSelectMode = !this.isMultiSelectMode;
    if (!this.isMultiSelectMode) {
      this.selectedEscalations.clear();
    }
  }

  toggleEscalationSelection(event: Event, escalationId: string): void {
    event.stopPropagation();
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
    this.escalationToDeleteId = null;
  }

  subscribeToNotifications() {
    this.notificationsSubscription = this.notificationService.getNotifications().subscribe(notifications => {
      this.escalationNotifications = notifications;
      this.notificationCount = notifications.length;
    });
  }
  
  toggleNotificationDropdown(event: Event) {
    event.stopPropagation();
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }
}
