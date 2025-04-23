import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../api.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, NotificationMessage } from '../notification.service';
import { Subscription } from 'rxjs';

interface Chatbot {
  id: string;
  name: string;
}

@Component({
  selector: 'app-chatbot-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
  templateUrl: './chatbot-list.component.html',
  styleUrls: ['./chatbot-list.component.css'],
})
export class ChatbotListComponent implements OnInit, OnDestroy {
  chatbots: Chatbot[] = [];
  filteredChatbots: Chatbot[] = [];
  message: string = '';
  isSuccess: boolean = true;
  showModal: boolean = false;
  newChatbotName: string = '';
  showDeleteModal: boolean = false;
  chatbotToDeleteId: string | null = null;
  isLoading: boolean = true;
  searchTerm: string = '';
  
  // Notification related properties
  escalationNotifications: NotificationMessage[] = [];
  notificationCount: number = 0;
  showNotificationDropdown: boolean = false;
  private notificationsSubscription: Subscription | null = null;

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.fetchChatbots();
    this.subscribeToNotifications();
    
    // Click handler to close notification dropdown when clicking outside
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.onDocumentClick.bind(this));
    }
  }

  ngOnDestroy() {
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
    
    // Remove event listener
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.onDocumentClick.bind(this));
    }
  }

  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container')) {
      this.showNotificationDropdown = false;
    }
  }

  toggleNotificationDropdown(event: Event) {
    event.stopPropagation();
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  subscribeToNotifications() {
    this.notificationsSubscription = this.notificationService.getNotifications().subscribe(notifications => {
      this.escalationNotifications = notifications;
      this.notificationCount = notifications.length;
    });
  }

  removeNotification(id: string) {
    this.notificationService.removeNotification(id);
  }

  fetchChatbots() {
    this.isLoading = true;
    this.apiService.getChatbots().subscribe({
      next: (response) => {
        this.chatbots = response;
        this.filteredChatbots = [...this.chatbots];
        this.isLoading = false;
      },
      error: () => {
        this.showErrorMessage('Failed to fetch chatbots');
        this.isLoading = false;
      },
    });
  }

  searchChatbots(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = searchValue;
    this.filteredChatbots = this.chatbots.filter(chatbot => 
      chatbot.name.toLowerCase().includes(searchValue)
    );
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredChatbots = [...this.chatbots];
  }

  toggleModal() {
    this.showModal = !this.showModal;
    this.newChatbotName = '';
  }

  createChatbot() {
    if (this.newChatbotName.trim()) {
      this.apiService.createChatbot(this.newChatbotName).subscribe({
        next: () => {
          this.showSuccessMessage('Chatbot created successfully');
          this.fetchChatbots();
          this.toggleModal();
        },
        error: () => {
          this.showErrorMessage('Failed to create chatbot');
        },
      });
    } else {
      this.showErrorMessage('Chatbot name cannot be empty');
    }
  }

  deleteChatbot(chatbotId: string) {
    this.chatbotToDeleteId = chatbotId;
    this.showDeleteModal = true;
  }

  toggleDeleteModal(show: boolean) {
    this.showDeleteModal = show;
    this.chatbotToDeleteId = null;
  }

  confirmDelete() {
    if (this.chatbotToDeleteId) {
      this.apiService.deleteChatbot(this.chatbotToDeleteId).subscribe({
        next: () => {
          this.showSuccessMessage('Chatbot deleted successfully');
          this.fetchChatbots();
        },
        error: () => {
          this.showErrorMessage('Failed to delete chatbot');
        }
      });
    }
    this.showDeleteModal = false;
    this.chatbotToDeleteId = null;
  }

  logout1() {
    this.apiService.logout().subscribe(() => {
      console.log('Logged out successfully');
      this.router.navigate(['/']);
    });
  }

  private showSuccessMessage(message: string) {
    this.message = message;
    this.isSuccess = true;
    this.clearMessageAfterDelay();
  }

  private showErrorMessage(message: string) {
    this.message = message;
    this.isSuccess = false;
    this.clearMessageAfterDelay();
  }

  private clearMessageAfterDelay() {
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}
