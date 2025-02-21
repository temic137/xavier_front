import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface WebSection {
  heading: string;
  content: string[];
}

interface WebData {
  url: string;
  title: string;
  sections: WebSection[];
}

interface FAQ {
  question: string;
  answer: string;
}

interface ChatbotDataItem {
  pdf_data?: any[];
  db_data?: any[];
  folder_data?: any[];
  web_data?: {
    url?: string;
    title?: string;
    sections?: any[];
  };
}

@Component({
  selector: 'app-chatbot-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chatbot-edit.component.html',
  styleUrl: './chatbot-edit.component.css'
})
export class ChatbotEditComponent implements OnInit, OnDestroy {
  chatbotId: string = '';
  chatbotName: string = '';
  chatbotData: string = '';
  newFAQ: FAQ = { question: '', answer: '' };
  isLoading: boolean = false;
  error: string | null = null;
  originalData: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private Apiservice: ApiService
  ) { }

  ngOnInit() {
    this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
    this.loadChatbotData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cleanAndConsolidateSections<T extends { heading: string, content: any[] }>(
    sections: T[],
    options: {
      uniqueBy?: keyof T,
      filterEmpty?: boolean,
      customConsolidation?: (section: T) => T | null
    } = {}
  ): T[] {
    const {
      uniqueBy = 'heading' as keyof T,
      filterEmpty = true,
      customConsolidation
    } = options;

    const uniqueSections: T[] = [];
    const seenValues = new Set<string>();

    sections.forEach(section => {
      if (customConsolidation) {
        const consolidatedSection = customConsolidation(section);
        if (!consolidatedSection) return;
        section = consolidatedSection;
      }

      let cleanedContent = section.content;
      if (Array.isArray(cleanedContent)) {
        cleanedContent = Array.from(new Set(
          cleanedContent
            .map(item => typeof item === 'string' ? item.trim() : item)
            .filter(item => !filterEmpty || (typeof item === 'string' ? item !== '' : true))
        ));
      }

      const uniqueValue = String(section[uniqueBy]);

      if (seenValues.has(uniqueValue) ||
        (filterEmpty && (!cleanedContent || cleanedContent.length === 0))) {
        return;
      }

      const uniqueSection = {
        ...section,
        content: cleanedContent
      };

      uniqueSections.push(uniqueSection);
      seenValues.add(uniqueValue);
    });

    return uniqueSections;
  }

  extractPopulatedLists(data: ChatbotDataItem[]): ChatbotDataItem[] {
    return data.map((entry, index) => {
      const populatedEntry: ChatbotDataItem = {};

    
      if (entry.pdf_data && entry.pdf_data.length > 0) {
        populatedEntry.pdf_data = entry.pdf_data;
      }

      if (entry.db_data && entry.db_data.length > 0) {
        populatedEntry.db_data = entry.db_data;
      }

      if (entry.folder_data && entry.folder_data.length > 0) {
        populatedEntry.folder_data = entry.folder_data;
      }

      if (entry.web_data?.sections && entry.web_data.sections.length > 0) {
        const cleanedSections = this.cleanAndConsolidateSections(entry.web_data.sections);

        populatedEntry.web_data = {
          url: entry.web_data.url,
          title: entry.web_data.title,
          sections: cleanedSections
        };
      }

      return populatedEntry;
    }).filter(entry =>
     
      Object.keys(entry).length > 0 &&
      (!entry.pdf_data || entry.pdf_data.length > 0) &&
      (!entry.db_data || entry.db_data.length > 0) &&
      (!entry.folder_data || entry.folder_data.length > 0) &&
      (!entry.web_data?.sections || entry.web_data.sections.length > 0)
    );
  }

  loadChatbotData() {
    this.isLoading = true;
    this.error = null;
    
    this.Apiservice.getChatbot(this.chatbotId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.chatbotName = data.name;
        try {
          const parsedData = JSON.parse(data.data);
          const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
          const populatedListsData = this.extractPopulatedLists(dataArray);
          this.chatbotData = JSON.stringify(populatedListsData, null, 2);
          this.originalData = this.chatbotData;
        } catch (error) {
          this.error = 'Error processing chatbot data';
          console.error(error);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load chatbot data';
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  formatJson() {
    try {
      const parsed = JSON.parse(this.chatbotData);
      this.chatbotData = JSON.stringify(parsed, null, 2);
    } catch (error) {
      this.error = 'Invalid JSON format';
    }
  }

  clearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      this.chatbotData = JSON.stringify([{ pdf_data: [] }], null, 2);
    }
  }

  getFAQCount(): number {
    try {
      const data = JSON.parse(this.chatbotData);
      return data[0]?.pdf_data?.length || 0;
    } catch {
      return 0;
    }
  }

  getDataSize(): string {
    return (new Blob([this.chatbotData]).size / 1024).toFixed(2);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.chatbotData).then(
      () => alert('Copied to clipboard!'),
      () => alert('Failed to copy')
    );
  }

  hasChanges(): boolean {
    return this.chatbotData !== this.originalData;
  }

  revertChanges() {
    if (confirm('Are you sure you want to revert all changes?')) {
      this.chatbotData = this.originalData;
    }
  }

  addFAQ() {
    try {
      let parsedData: ChatbotDataItem[];
  
     
      if (!this.chatbotData || this.chatbotData.trim() === '') {
       
        parsedData = [{ pdf_data: [] }];
      } else {
       
        try {
          parsedData = JSON.parse(this.chatbotData);
        } catch (error) {
          
          console.error('Error parsing chatbotData, initializing with default structure', error);
          parsedData = [{ pdf_data: [] }];
        }
      }
  
      
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }
  
     
      if (!parsedData[0]) {
        parsedData[0] = { pdf_data: [] };
      }
      if (!parsedData[0].pdf_data) {
        parsedData[0].pdf_data = [];
      }
  
      
      parsedData[0].pdf_data.push({
        page: 'file', 
        text: `Q: ${this.newFAQ.question}\nA: ${this.newFAQ.answer}` 
      });
  
      
      this.chatbotData = JSON.stringify(parsedData, null, 2);
  
      this.newFAQ = { question: '', answer: '' };
    } catch (error) {
      console.error('Error adding FAQ', error);
    }
  }

  saveChatbot() {
    this.isLoading = true;
    this.error = null;

    this.Apiservice.updateChatbot(this.chatbotId, { data: this.chatbotData }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        alert('Chatbot data saved successfully');
        this.originalData = this.chatbotData;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to save chatbot data';
        console.error(error);
        this.isLoading = false;
      }
    });
  }
}