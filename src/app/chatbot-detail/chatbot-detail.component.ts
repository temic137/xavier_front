import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { EscalationStatusService } from '../services/escalation-status.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService, NotificationMessage } from '../notification.service';

interface Chatbot {
  id: string;
  name: string;
  trainedFile?: string;
}

@Component({
  selector: 'app-chatbot-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterOutlet],
  providers: [EscalationStatusService],
  templateUrl: './chatbot-detail.component.html',
  styleUrls: ['./chatbot-detail.component.css'], 
})
export class ChatbotDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  chatbots: Chatbot[] = [];
  integrationCode: string = '';
  chatbotId: string = '';
  chatbotName: string = '';
  activeTab: string = 'analytics';
  activeSupportTab: string = 'escalations'; // New property for support sub-navigation
  loading: boolean = false;
  selectedFile: File | null = null;
  folderPath: string | null = null;
  WebsiteUrl: string | null = null;
  selectedChatbot!: Chatbot;
  private apiUrl = 'http://127.0.0.1:5000';  // Make sure this matches your API URL
  showForm: boolean = false;
  message: string = '';
  isSuccess: boolean = true;
  isMobileMenuOpen: boolean = false;
  hasPendingEscalations: boolean = false;

  // Notification related properties
  escalationNotifications: NotificationMessage[] = [];
  notificationCount: number = 0;
  showNotificationDropdown: boolean = false;
  private notificationsSubscription: Subscription | null = null;

  private routeSub: Subscription | null = null;
  private routerEventsSub: Subscription | null = null;
  private escalationStatusSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private escalationStatusService: EscalationStatusService,
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.chatbotId = params['id'];
      if (this.chatbotId) {
        this.loadChatbotDetails();
        this.fetchInitialEscalationStatus();
      }
    });

    // Subscribe to route changes to update active tabs
    this.routerEventsSub = this.router.events.subscribe(() => {
      const url = this.router.url;
      if (url.includes('/agent-dash')) {
        this.activeTab = 'support';
        this.activeSupportTab = 'escalations';
      } else if (url.includes('/tickets')) {
        this.activeTab = 'support';
        this.activeSupportTab = 'tickets';
      }
    });

    // Subscribe to escalation status changes
    this.escalationStatusSub = this.escalationStatusService.getPendingStatus()
      .subscribe(hasPending => {
        console.log('Component received pending status update:', hasPending); // Debug log
        this.hasPendingEscalations = hasPending;
      });

    // Subscribe to notifications
    this.notificationsSubscription = this.notificationService.getNotifications()
      .subscribe(notifications => {
        this.escalationNotifications = notifications;
        this.notificationCount = notifications.length;
      });
  }

  ngAfterViewInit() {
    this.setupMobileMenu();
    
    // Add document click handler - check if running in browser
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.onDocumentClick.bind(this));
    }
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.routerEventsSub) {
      this.routerEventsSub.unsubscribe();
    }
    if (this.escalationStatusSub) {
      this.escalationStatusSub.unsubscribe();
    }
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
    
    // Remove document click handler - check if running in browser
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.onDocumentClick.bind(this));
    }
  }

  toggleNotificationDropdown(event: Event) {
    event.stopPropagation();
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }
  
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container')) {
      this.showNotificationDropdown = false;
    }
  }
  
  removeNotification(id: string) {
    this.notificationService.removeNotification(id);
  }

  setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuToggle && mobileMenuClose && mobileMenu) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileMenu.classList.remove('-translate-x-full');
        this.isMobileMenuOpen = true;
      });

      mobileMenuClose.addEventListener('click', () => {
        this.closeMobileMenu();
      });

      document.addEventListener('click', (event) => {
        if (this.isMobileMenuOpen && 
            !mobileMenu.contains(event.target as Node) && 
            !mobileMenuToggle.contains(event.target as Node)) {
          this.closeMobileMenu();
        }
      });
    }
  }

  closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.add('-translate-x-full');
      this.isMobileMenuOpen = false;
    }
  }

  loadChatbotDetails() {
    this.loading = true;
    this.apiService.getChatbot(this.chatbotId).pipe(
      finalize(() => (this.loading = false)),
      catchError(error => {
        console.error('Failed to load chatbot details', error);
        
        // Show a friendly error message to the user
        if (error.status === 500) {
          this.notificationService.showNotification(
            'Server error: Failed to load chatbot details. Please try again later.',
            'error'
          );
        } else if (error.status === 404) {
          this.notificationService.showNotification(
            'Chatbot not found. It may have been deleted.',
            'error'
          );
        } else {
          this.notificationService.showNotification(
            'Failed to load chatbot details. Please check your connection.',
            'error'
          );
        }
        
        return of(null);
      })
    ).subscribe(chatbot => {
      if (chatbot) {
        this.chatbotName = chatbot.name;
      } else {
        // Handle case when chatbot is null (after error)
        this.chatbotName = 'Unknown Chatbot';
      }
    });
  }

  setActiveTab(tab: string, subtab?: string) {
    this.activeTab = tab;
    if (tab !== 'support') {
      this.activeSupportTab = ''; // Reset support subtab when switching to a different main tab
    } else if (subtab) {
      this.activeSupportTab = subtab;
    }
    this.closeMobileMenu();

    switch (tab) {
      case 'train':
        this.router.navigate(['/chatbot', this.chatbotId, 'train', this.chatbotId]);
        break;
      case 'analytics':
        this.router.navigate(['/chatbot', this.chatbotId, 'analyticsdash', this.chatbotId]);
        break;
      case 'test':
        this.router.navigate(['/chatbot', this.chatbotId, 'chat', this.chatbotId]);
        break;
      case 'knowledge':
        this.router.navigate(['/chatbot', this.chatbotId, 'edit', this.chatbotId]);
        break;
      case 'integration':
        this.router.navigate(['/chatbot', this.chatbotId, 'integration', this.chatbotId]);
        break;
      case 'customize':
          this.router.navigate(['/chatbot', this.chatbotId, 'chatbot-customize', this.chatbotId]);
          break;
        case 'support':
          // If no subtab is specified, default to escalations
          if (!subtab) {
            this.activeSupportTab = 'escalations';
            this.router.navigate(['/chatbot', this.chatbotId, 'agent-dash', this.chatbotId]);
          } else {
            this.activeSupportTab = subtab;
            if (subtab === 'tickets') {
              this.router.navigate(['/chatbot', this.chatbotId, 'tickets', this.chatbotId]);
            } else {
              this.router.navigate(['/chatbot', this.chatbotId, 'agent-dash', this.chatbotId]);
            }
          }
          break;
    }
    this.isMobileMenuOpen = false;
  }

  isActiveTab(tab: string): boolean {
    return this.activeTab === tab;
  }

  isActiveSupportTab(tab: string): boolean {
    return this.activeSupportTab === tab;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  hideForm() {
    this.showForm = false;
    this.apiUrl = '';
    this.selectedFile = null;
  }

  private fetchInitialEscalationStatus() {
    if (!this.chatbotId) return;

    console.log('Fetching initial escalation status for chatbot:', this.chatbotId); // Debug log

    this.http.get<any>(`${this.apiUrl}/agent/escalations/${this.chatbotId}`).subscribe({
      next: (response) => {
        console.log('Received escalation response:', response); // Debug log
        if (response && response.escalations) {
          const pendingCount = response.escalations.filter(
            (e: any) => e.status === 'pending'
          ).length;
          console.log('Pending escalations count:', pendingCount); // Debug log
          this.escalationStatusService.setPendingStatus(pendingCount);
        }
      },
      error: (error) => {
        console.error('Error fetching initial escalation status:', error);
        this.escalationStatusService.setPendingStatus(0);
      }
    });
  }
}