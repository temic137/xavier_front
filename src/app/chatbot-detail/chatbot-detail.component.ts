import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

interface Chatbot {
  id: string;
  name: string;
  trainedFile?: string;
}

@Component({
  selector: 'app-chatbot-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterOutlet],
  templateUrl: './chatbot-detail.component.html',
  styleUrls: ['./chatbot-detail.component.css'], 
})
export class ChatbotDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  chatbots: Chatbot[] = [];
  integrationCode: string = '';
  chatbotId: string = '';
  chatbotName: string = '';
  activeTab: string = 'analytics';
  loading: boolean = false;
  selectedFile: File | null = null;
  folderPath : string | null =null;
  WebsiteUrl : string | null =null;
  selectedChatbot!: Chatbot;
  apiUrl: string = '';
  showForm: boolean = false;
  message: string = '';
  isSuccess: boolean = true;
  isMobileMenuOpen: boolean = false;

  private routeSub: Subscription | null = null;
  private routerEventsSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Get chatbot ID from route params
    this.routeSub = this.route.params.subscribe(params => {
      this.chatbotId = params['id'];
      this.loadChatbotDetails();
    });

  }

  ngAfterViewInit() {
    this.setupMobileMenu();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.routerEventsSub) {
      this.routerEventsSub.unsubscribe();
    }
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

      // Close menu if clicking outside
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
        return of(null);
      })
    ).subscribe(chatbot => {
      if (chatbot) {
        this.chatbotName = chatbot.name;
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    
    // Close mobile menu when a tab is selected
    this.closeMobileMenu();

    // Navigate respecting parent-child route hierarchy
    switch (tab) {
      case 'train':
        this.router.navigate(['/chatbot', this.chatbotId, 'train', this.chatbotId]);
        this.isMobileMenuOpen = false;
        break;
      case 'analytics':
        this.router.navigate(['/chatbot', this.chatbotId, 'analyticsdash', this.chatbotId]);
        this.isMobileMenuOpen = false;
        break;
      case 'test':
        this.router.navigate(['/chatbot', this.chatbotId, 'chat', this.chatbotId]);
        this.isMobileMenuOpen = false;
        break;
      case 'knowledge':
        this.router.navigate(['/chatbot', this.chatbotId, 'edit', this.chatbotId]);
        this.isMobileMenuOpen = false;
        break;
      case 'integration' :
        this.router.navigate(['/chatbot', this.chatbotId, 'integration', this.chatbotId]);
        this.isMobileMenuOpen = false;
        break;
      case 'ticket' :
        this.router.navigate(['/chatbot', this.chatbotId, 'tickets', this.chatbotId]);
        this.isMobileMenuOpen = false;
        break;
      
    }
  }

  isActiveTab(tab: string): boolean {
    return this.activeTab === tab;
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
}

