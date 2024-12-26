// import { Component } from '@angular/core';
// import { ApiService } from '../api.service';
// import { ActivatedRoute, RouterModule } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';


// interface WebSection {
//   heading: string;
//   content: string[];
// }

// interface WebData {
//   url: string;
//   title: string;
//   sections: WebSection[];
// }

// interface ChatbotDataStructure {
//   pdf_data: any[];
//   db_data: any[];
//   folder_data: any[];
//   web_data: WebData;
// }

//  // Define the interface for the structure of each item in formattedData
//  interface ChatbotDataItem {
//   pdf_data?: any[];
//   db_data?: any[];
//   folder_data?: any[];
//   web_data?: {
//     url?: string;
//     title?: string;
//     sections?: any[];
//   };
// }

// @Component({
//   selector: 'app-chatbot-edit',
//   standalone: true,
//   imports: [CommonModule,FormsModule,RouterModule],
//   templateUrl: './chatbot-edit.component.html',
//   styleUrl: './chatbot-edit.component.css'
// })
// export class ChatbotEditComponent {

//   chatbotId: string = '';
//   chatbotName: string = '';
//   chatbotData: string = '';

//   constructor(
//     private route: ActivatedRoute,
//     private Apiservice: ApiService
//   ) { }

//   ngOnInit() {
//     this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
//     this.loadChatbotData();
//   }

  
//   loadChatbotData() {
//     this.Apiservice.getChatbot(this.chatbotId).subscribe(
//       (data) => {
//         this.chatbotName = data.name;

       

        

//         this.chatbotData = data.data;
//       },
//       (error) => console.error('Error loading chatbot data', error)
//     );
//   }

//   saveChatbot() {
//     this.Apiservice.updateChatbot(this.chatbotId, { data: this.chatbotData }).subscribe(
//       () => alert('Chatbot data saved successfully'),
//       (error) => console.error('Error saving chatbot data', error)
//     );
//   }
// }


import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface WebSection {
  heading: string;
  content: string[];
}

interface WebData {
  url: string;
  title: string;
  sections: WebSection[];
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
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './chatbot-edit.component.html',
  styleUrl: './chatbot-edit.component.css'
})
export class ChatbotEditComponent {
  chatbotId: string = '';
  chatbotName: string = '';
  chatbotData: string = '';

  constructor(
    private route: ActivatedRoute,
    private Apiservice: ApiService
  ) { }

  ngOnInit() {
    this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
    this.loadChatbotData();
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
      // Apply custom consolidation if provided
      if (customConsolidation) {
        const consolidatedSection = customConsolidation(section);
        if (!consolidatedSection) return;
        section = consolidatedSection;
      }
  
      // Clean content if it's an array
      let cleanedContent = section.content;
      if (Array.isArray(cleanedContent)) {
        cleanedContent = Array.from(new Set(
          cleanedContent
            .map(item => typeof item === 'string' ? item.trim() : item)
            .filter(item => !filterEmpty || (typeof item === 'string' ? item !== '' : true))
        ));
      }
  
      // Determine the unique identifier
      const uniqueValue = String(section[uniqueBy]);
  
      // Skip if already seen or content is empty
      if (seenValues.has(uniqueValue) || 
          (filterEmpty && (!cleanedContent || cleanedContent.length === 0))) {
        return;
      }
  
      // Create new section with cleaned content
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

      // Check and extract populated lists
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
        // Clean and consolidate sections
        const cleanedSections = this.cleanAndConsolidateSections(entry.web_data.sections);

        populatedEntry.web_data = {
          url: entry.web_data.url,
          title: entry.web_data.title,
          sections: cleanedSections
        };
      }

      return populatedEntry;
    }).filter(entry => 
      // Remove entries that have no populated lists
      Object.keys(entry).length > 0 && 
      (!entry.pdf_data || entry.pdf_data.length > 0) &&
      (!entry.db_data || entry.db_data.length > 0) &&
      (!entry.folder_data || entry.folder_data.length > 0) &&
      (!entry.web_data?.sections || entry.web_data.sections.length > 0)
    );
  }
  
  loadChatbotData() {
    this.Apiservice.getChatbot(this.chatbotId).subscribe(
      (data) => {
        this.chatbotName = data.name;

        try {
          // Parse the original chatbot data
          const parsedData = JSON.parse(data.data);
          
          // Extract only populated lists
          const populatedListsData = this.extractPopulatedLists(parsedData);
          
          // Update chatbotData with stringified populated lists
          this.chatbotData = JSON.stringify(populatedListsData, null, 2);
        } catch (error) {
          console.error('Error processing chatbot data', error);
        }
      },
      (error) => console.error('Error loading chatbot data', error)
    );
  }

  saveChatbot() {
    this.Apiservice.updateChatbot(this.chatbotId, { data: this.chatbotData }).subscribe(
      () => alert('Chatbot data saved successfully'),
      (error) => console.error('Error saving chatbot data', error)
    );
  }
}