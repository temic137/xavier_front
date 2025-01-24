import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';


interface ParsedFeedback {
  id: string;
  userId: string;
  message: string;
  createdAt: Date;
  chatbotId: string;
  chatbotName: string;
}

interface ChatbotFeedback {
  chatbot_id: string;
  chatbot_name: string;
  feedback: string;
}


@Component({
  selector: 'app-feedback-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './feedback-dashboard.component.html',
  styleUrl: './feedback-dashboard.component.css'
})
export class FeedbackDashboardComponent implements OnInit{
  allFeedback: ParsedFeedback[] = [];
  filteredFeedback: ParsedFeedback[] = [];
  chatbots: ChatbotFeedback[] = [];
  searchTerm: string = '';
  selectedChatbot: string = 'all';
  timeFilter: string = 'all';
  
  feedbackStats = {
    total: 0,
    activeChatbots: 0,
    recentFeedback: 0
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadFeedback();
  }


  loadFeedback() {
    this.apiService.viewFeedback().subscribe({
      next: (response: any) => {
        this.chatbots = response.chatbots;
        this.parseFeedback();
        this.applyFilters();
        this.calculateStats();
      },
      error: (error) => {
        console.error('Failed to fetch feedback:', error);
        this.chatbots = [];
      }
    });
  }  
  private parseFeedback() {
    this.allFeedback = [];
    
    this.chatbots.forEach(chatbot => {
      if (chatbot.feedback === 'No feedback available') {
        return;
      }

      const feedbackEntries = chatbot.feedback.split('------------------------\n');
      
      feedbackEntries.forEach(entry => {
        if (!entry.trim()) return;

        const lines = entry.trim().split('\n');
        const parsedFeedback: ParsedFeedback = {
          id: lines[0].replace('Feedback ID: ', ''),
          userId: lines[1].replace('User ID: ', ''),
          message: lines[2].replace('Feedback: ', ''),
          createdAt: new Date(lines[3].replace('Created At: ', '')),
          chatbotId: chatbot.chatbot_id,
          chatbotName: chatbot.chatbot_name
        };

        this.allFeedback.push(parsedFeedback);
      });
    });

    // Sort by date, newest first
    this.allFeedback.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  applyFilters() {
    let filtered = this.allFeedback;

    if (this.selectedChatbot !== 'all') {
      filtered = filtered.filter(f => f.chatbotId === this.selectedChatbot);
    }
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.message.toLowerCase().includes(search) ||
        f.chatbotName.toLowerCase().includes(search) ||
        f.userId.toLowerCase().includes(search)
      );
    }

    const now = new Date();
    switch (this.timeFilter) {
      case 'today':
        filtered = filtered.filter(f => 
          f.createdAt.toDateString() === now.toDateString()
        );
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(f => f.createdAt >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(f => f.createdAt >= monthAgo);
        break;
    }

    this.filteredFeedback = filtered;
    this.calculateStats();
  }

  private calculateStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    this.feedbackStats = {
      total: this.allFeedback.length,
      activeChatbots: this.chatbots.filter(c => c.feedback !== 'No feedback available').length,
      recentFeedback: this.allFeedback.filter(f => f.createdAt >= last24h).length
    };
  }
}
