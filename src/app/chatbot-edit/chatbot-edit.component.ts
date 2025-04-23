import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ApiService } from '../api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JsonSearchSimpleComponent } from '../json-search-simple/json-search-simple.component';

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
  imports: [CommonModule, FormsModule, RouterModule, JsonSearchSimpleComponent],
  templateUrl: './chatbot-edit.component.html',
  styleUrl: './chatbot-edit.component.css'
})
export class ChatbotEditComponent implements OnInit, OnDestroy, AfterViewInit {
  chatbotId: string = '';
  chatbotName: string = '';
  chatbotData: string = '';
  newFAQ: FAQ = { question: '', answer: '' };
  isLoading: boolean = false;
  error: string | null = null;
  originalData: string = '';
  private destroy$ = new Subject<void>();

  // Editor mode properties
  editorMode: string = 'json';
  jsonError: string | null = null;
  showJsonSearch: boolean = false;
  jsonSearchQuery: string = '';
  jsonSearchResults: Array<{line: number, preview: string, context?: string, lineStart?: number, lineEnd?: number, path?: string[]}> = [];
  jsonSearchOptions = {
    caseSensitive: false,
    wholeWord: false,
    regex: false
  };
  currentSearchResultIndex: number = 0;
  hasExecutedSearch: boolean = false;

  // Edit modal properties
  showEditModal: boolean = false;
  editingContent: string = '';
  currentEditingResult: any = null;

  // Structured editor properties
  structuredData: ChatbotDataItem[] = [];
  selectedDataIndex: number | null = null;
  showAddDataTypeModal: boolean = false;
  addingDataTypeForIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private Apiservice: ApiService
  ) { }

  ngOnInit() {
    this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
    this.loadChatbotData();
  }

  ngAfterViewInit() {
    // Initialize the JSON search component after the view is initialized
    setTimeout(() => {
      this.executeJsonSearch();
    }, 100);
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

          // Initialize structured data
          this.structuredData = JSON.parse(this.chatbotData);
          if (this.structuredData.length > 0) {
            this.selectedDataIndex = 0;
          }
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
      this.jsonError = null;
    } catch (error: any) {
      this.jsonError = error.message || 'Invalid JSON format';
    }
  }

  // JSON Editor Methods
  validateJson() {
    try {
      JSON.parse(this.chatbotData);
      this.jsonError = null;
      alert('JSON is valid!');
    } catch (error: any) {
      this.jsonError = error.message;
    }
  }

  onJsonChange() {
    // Clear any previous errors when the user starts typing
    this.jsonError = null;
  }

  searchInJson() {
    this.showJsonSearch = true;
    this.jsonSearchResults = [];
    this.jsonSearchQuery = '';
    this.hasExecutedSearch = false;
  }

  closeJsonSearch() {
    this.showJsonSearch = false;
  }

  closeAllModals() {
    this.showJsonSearch = false;
    this.showEditModal = false;
    this.showAddDataTypeModal = false;
  }

  // Reference to the JSON search component
  @ViewChild('jsonSearchComponent') jsonSearchComponent!: JsonSearchSimpleComponent;

  executeJsonSearch() {
    // If we have a reference to the JSON search component, update its data
    if (this.jsonSearchComponent) {
      // Update the component's data
      this.jsonSearchComponent.jsonData = this.chatbotData;

      // If there's an active search query, re-run the search
      if (this.jsonSearchComponent.searchQuery && this.jsonSearchComponent.searchQuery.trim()) {
        // Use setTimeout to ensure the component has time to update
        setTimeout(() => {
          this.jsonSearchComponent.searchInJson();
        }, 50);
      }
    }
  }

  selectSearchResult(index: number) {
    this.currentSearchResultIndex = index;
    this.highlightSearchResult(this.jsonSearchResults[index]);
  }

  navigateToPreviousSearchResult() {
    if (this.currentSearchResultIndex > 0) {
      this.currentSearchResultIndex--;
      this.highlightSearchResult(this.jsonSearchResults[this.currentSearchResultIndex]);
    }
  }

  navigateToNextSearchResult() {
    if (this.currentSearchResultIndex < this.jsonSearchResults.length - 1) {
      this.currentSearchResultIndex++;
      this.highlightSearchResult(this.jsonSearchResults[this.currentSearchResultIndex]);
    }
  }

  highlightSearchResult(result: {line: number, preview: string, lineStart?: number, lineEnd?: number}) {
    // Get the textarea element
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    // Calculate position
    const lines = this.chatbotData.split('\n');
    let startPosition = 0;
    let endPosition = 0;

    // If we have block information, highlight the whole block
    if (result.lineStart !== undefined && result.lineEnd !== undefined) {
      // Calculate start position
      for (let i = 0; i < result.lineStart - 1; i++) {
        startPosition += lines[i].length + 1; // +1 for the newline character
      }

      // Calculate end position
      for (let i = 0; i < result.lineEnd; i++) {
        endPosition += lines[i].length + 1; // +1 for the newline character
      }
      endPosition--; // Adjust for the last newline
    } else {
      // Just highlight the single line
      for (let i = 0; i < result.line - 1; i++) {
        startPosition += lines[i].length + 1; // +1 for the newline character
      }
      endPosition = startPosition + lines[result.line - 1].length;
    }

    // Set selection range to highlight the line or block
    textarea.focus();
    textarea.setSelectionRange(startPosition, endPosition);

    // Scroll to the position
    const lineHeight = 18; // Approximate line height in pixels
    textarea.scrollTop = (result.line - 5) * lineHeight; // Scroll to show a few lines above
  }

  editSearchResult(result: any, event: Event) {
    event.stopPropagation(); // Prevent triggering the parent click handler

    // Get the content to edit
    const lines = this.chatbotData.split('\n');
    let content = '';

    if (result.lineStart !== undefined && result.lineEnd !== undefined) {
      // Get the whole block
      for (let i = result.lineStart - 1; i < result.lineEnd; i++) {
        content += lines[i] + (i < result.lineEnd - 1 ? '\n' : '');
      }
    } else {
      // Just get the single line
      content = lines[result.line - 1];
    }

    this.editingContent = content;
    this.currentEditingResult = result;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingContent = '';
    this.currentEditingResult = null;
  }

  saveEditedContent() {
    if (!this.currentEditingResult) return;

    const lines = this.chatbotData.split('\n');
    const result = this.currentEditingResult;

    if (result.lineStart !== undefined && result.lineEnd !== undefined) {
      // Replace the whole block
      const before = lines.slice(0, result.lineStart - 1).join('\n');
      const after = lines.slice(result.lineEnd).join('\n');
      this.chatbotData = before + (before ? '\n' : '') + this.editingContent + (after ? '\n' : '') + after;
    } else {
      // Replace just the single line
      lines[result.line - 1] = this.editingContent;
      this.chatbotData = lines.join('\n');
    }

    // Close the modal
    this.closeEditModal();

    // Re-run the search to update results
    this.executeJsonSearch();

    // Validate the JSON
    try {
      JSON.parse(this.chatbotData);
      this.jsonError = null;
    } catch (error: any) {
      this.jsonError = error.message;
    }
  }

  deleteSearchResult(searchResult: any, event: Event) {
    event.stopPropagation(); // Prevent triggering the parent click handler

    if (!confirm('Are you sure you want to delete this content?')) return;

    const lines = this.chatbotData.split('\n');

    if (searchResult.lineStart !== undefined && searchResult.lineEnd !== undefined) {
      // Delete the whole block
      const beforeText: string = lines.slice(0, searchResult.lineStart - 1).join('\n');
      const afterText: string = lines.slice(searchResult.lineEnd).join('\n');

      // Handle comma at the end of the previous line or beginning of the next line
      let fixedBeforeText: string = beforeText;
      let fixedAfterText: string = afterText;

      // Case 1: If the previous line ends with a comma and the next line starts with a closing bracket
      if (beforeText && afterText && beforeText.trim().endsWith(',') &&
          (afterText.trim().startsWith('}') || afterText.trim().startsWith(']'))) {
        // Remove the comma
        fixedBeforeText = beforeText.replace(/,\s*$/, '');
      }
      // Case 2: If we're removing an element that's not the last one in an array
      else if (beforeText && afterText &&
               !beforeText.trim().endsWith(',') &&
               !afterText.trim().startsWith('}') &&
               !afterText.trim().startsWith(']')) {
        // Check if the previous line is part of an array element
        const prevLineIsArrayElement = /[\[{]|".*":|\d+:|true|false|null/.test(beforeText.trim());
        const nextLineIsArrayElement = /[\]},]|".*":|\d+:|true|false|null/.test(afterText.trim());

        if (prevLineIsArrayElement && nextLineIsArrayElement) {
          // Add a comma if needed
          if (!beforeText.trim().endsWith(',') && !beforeText.trim().endsWith('[') && !beforeText.trim().endsWith('{')) {
            fixedBeforeText = beforeText + ',';
          }
        }
      }

      // Combine the parts
      const resultText: string = fixedBeforeText + (fixedBeforeText && fixedAfterText ? '\n' : '') + fixedAfterText;
      this.chatbotData = resultText;
    } else {
      // Delete just the single line
      lines.splice(searchResult.line - 1, 1);
      this.chatbotData = lines.join('\n');
    }

    // Validate the JSON
    try {
      JSON.parse(this.chatbotData);
      this.jsonError = null;
    } catch (error: any) {
      // If parsing fails, try a more aggressive fix
      try {
        // Try to parse the JSON to understand the structure
        const originalJson = JSON.parse(this.originalData);
        // Reserialize it to ensure proper formatting
        this.chatbotData = JSON.stringify(originalJson, null, 2);
        this.jsonError = null;
      } catch (fallbackError: any) {
        // If all else fails, show the error
        this.jsonError = error.message;
      }
    }

    // Re-run the search to update results
    this.executeJsonSearch();
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

  // JSON Search Methods
  handleJsonEdit(event: {content: string, lineStart: number, lineEnd: number}) {
    const lines = this.chatbotData.split('\n');
    const beforeText: string = lines.slice(0, event.lineStart - 1).join('\n');
    const afterText: string = lines.slice(event.lineEnd).join('\n');
    this.chatbotData = beforeText + (beforeText ? '\n' : '') + event.content + (afterText ? '\n' : '') + afterText;

    // Validate the JSON
    try {
      JSON.parse(this.chatbotData);
      this.jsonError = null;
    } catch (error: any) {
      this.jsonError = error.message;
    }
  }

  // Direct JSON delete method - improved implementation
  directDeleteJson(event: {lineStart: number, lineEnd: number}) {
    console.log('Direct delete JSON called with:', event);

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }

    // Get the lines of the JSON data
    const lines = this.chatbotData.split('\n');

    // Extract the parts before and after the section to delete
    const beforeText: string = lines.slice(0, event.lineStart - 1).join('\n');
    const afterText: string = lines.slice(event.lineEnd).join('\n');

    // Handle comma at the end of the previous line or beginning of the next line
    let fixedBeforeText: string = beforeText;
    let fixedAfterText: string = afterText;

    // Case 1: If the previous line ends with a comma and the next line starts with a closing bracket
    if (beforeText && afterText && beforeText.trim().endsWith(',') &&
        (afterText.trim().startsWith('}') || afterText.trim().startsWith(']'))) {
      // Remove the comma
      fixedBeforeText = beforeText.replace(/,\s*$/, '');
    }
    // Case 2: If we're removing an element that's not the last one in an array
    else if (beforeText && afterText &&
             !beforeText.trim().endsWith(',') &&
             !afterText.trim().startsWith('}') &&
             !afterText.trim().startsWith(']')) {
      // Check if the previous line is part of an array element
      const prevLineIsArrayElement = /[\[{]|".*":|\d+:|true|false|null/.test(beforeText.trim());
      const nextLineIsArrayElement = /[\]},]|".*":|\d+:|true|false|null/.test(afterText.trim());

      if (prevLineIsArrayElement && nextLineIsArrayElement) {
        // Add a comma if needed
        if (!beforeText.trim().endsWith(',') && !beforeText.trim().endsWith('[') && !beforeText.trim().endsWith('{')) {
          fixedBeforeText = beforeText + ',';
        }
      }
    }

    // Combine the parts
    const resultText: string = fixedBeforeText + (fixedBeforeText && fixedAfterText ? '\n' : '') + fixedAfterText;
    console.log('New JSON data:', resultText);

    // Update the chatbot data
    this.chatbotData = resultText;

    // Validate the JSON
    try {
      JSON.parse(this.chatbotData);
      this.jsonError = null;
    } catch (error: any) {
      console.error('JSON validation error:', error);
      this.jsonError = error.message;

      // If parsing fails, try a more aggressive fix
      try {
        // Try to parse the JSON to understand the structure
        const originalJson = JSON.parse(this.originalData);
        // Reserialize it to ensure proper formatting
        this.chatbotData = JSON.stringify(originalJson, null, 2);
        this.jsonError = null;
      } catch (fallbackError: any) {
        // If all else fails, show the error
        console.error('Fallback JSON fix failed:', fallbackError);
        this.jsonError = error.message;
      }
    }

    // Force update the JSON search component with the new data
    // Use a more reliable approach to update the component
    if (this.jsonSearchComponent) {
      console.log('Updating JSON search component with new data');

      // First clear the search component's data
      this.jsonSearchComponent.jsonData = '';

      // Then update with the new data after a short delay
      setTimeout(() => {
        this.jsonSearchComponent.jsonData = this.chatbotData;

        // If there was an active search, re-run it
        if (this.jsonSearchComponent.searchQuery && this.jsonSearchComponent.searchQuery.trim()) {
          setTimeout(() => {
            console.log('Re-running search after deletion');
            this.jsonSearchComponent.searchInJson();
          }, 100);
        }
      }, 50);
    }
  }

  handleJsonDelete(event: {lineStart: number, lineEnd: number}) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this content?')) return;

    const lines = this.chatbotData.split('\n');
    const beforeText: string = lines.slice(0, event.lineStart - 1).join('\n');
    const afterText: string = lines.slice(event.lineEnd).join('\n');

    // Handle comma at the end of the previous line or beginning of the next line
    let fixedBeforeText: string = beforeText;
    let fixedAfterText: string = afterText;

    // Case 1: If the previous line ends with a comma and the next line starts with a closing bracket
    if (beforeText && afterText && beforeText.trim().endsWith(',') &&
        (afterText.trim().startsWith('}') || afterText.trim().startsWith(']'))) {
      // Remove the comma
      fixedBeforeText = beforeText.replace(/,\s*$/, '');
    }
    // Case 2: If we're removing an element that's not the last one in an array
    else if (beforeText && afterText &&
             !beforeText.trim().endsWith(',') &&
             !afterText.trim().startsWith('}') &&
             !afterText.trim().startsWith(']')) {
      // Check if the previous line is part of an array element
      const prevLineIsArrayElement = /[\[{]|".*":|\d+:|true|false|null/.test(beforeText.trim());
      const nextLineIsArrayElement = /[\]},]|".*":|\d+:|true|false|null/.test(afterText.trim());

      if (prevLineIsArrayElement && nextLineIsArrayElement) {
        // Add a comma if needed
        if (!beforeText.trim().endsWith(',') && !beforeText.trim().endsWith('[') && !beforeText.trim().endsWith('{')) {
          fixedBeforeText = beforeText + ',';
        }
      }
    }

    // Combine the parts
    const resultText: string = fixedBeforeText + (fixedBeforeText && fixedAfterText ? '\n' : '') + fixedAfterText;

    // Try to parse the JSON to see if it's valid
    try {
      JSON.parse(resultText);
      this.chatbotData = resultText;
      this.jsonError = null;
    } catch (error: any) {
      // If parsing fails, try a more aggressive fix
      try {
        // Try to parse the JSON to understand the structure
        const originalJson = JSON.parse(this.chatbotData);
        // Reserialize it to ensure proper formatting
        this.chatbotData = JSON.stringify(originalJson, null, 2);
        this.jsonError = null;
      } catch (fallbackError: any) {
        // If all else fails, show the error
        this.jsonError = error.message;
        // Keep the original data to allow manual fixing
        this.chatbotData = resultText;
      }
    }

    // Re-run the search to update results
    this.executeJsonSearch();
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
    if (!this.newFAQ.question || !this.newFAQ.answer) {
      this.error = "Question and answer cannot be empty";
      return;
    }

    try {
      let parsedData: ChatbotDataItem[];

      // Initialize with default structure if empty
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

      // Ensure parsedData is an array
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }

      const faqEntry = {
        page: 'FAQ',
        text: `Q: ${this.newFAQ.question}\nA: ${this.newFAQ.answer}`
      };

      // Logic to add the FAQ to the appropriate data structure
      let added = false;

      // First, try to find and add to existing data structures in order of priority
      for (const item of parsedData) {
        // Option 1: Add to web_data if it exists
        if (item.web_data?.sections && Array.isArray(item.web_data.sections)) {
          // Try to find a FAQ section first
          let faqSection = item.web_data.sections.find(s =>
            s.heading.toLowerCase().includes('faq') ||
            s.heading.toLowerCase().includes('frequently asked') ||
            s.heading.toLowerCase().includes('questions')
          );

          // If FAQ section exists, add to it
          if (faqSection) {
            if (!Array.isArray(faqSection.content)) {
              faqSection.content = [];
            }
            faqSection.content.push(this.newFAQ.question + "\n" + this.newFAQ.answer);
            added = true;
            break;
          }
          // Otherwise create a new FAQ section
          else {
            item.web_data.sections.push({
              heading: "Frequently Asked Questions",
              content: [`Q: ${this.newFAQ.question}\nA: ${this.newFAQ.answer}`]
            });
            added = true;
            break;
          }
        }

        // Option 2: Add to pdf_data if it exists
        else if (item.pdf_data && Array.isArray(item.pdf_data)) {
          item.pdf_data.push(faqEntry);
          added = true;
          break;
        }

        // Option 3: Add to db_data if it exists
        else if (item.db_data && Array.isArray(item.db_data)) {
          item.db_data.push({
            question: this.newFAQ.question,
            answer: this.newFAQ.answer
          });
          added = true;
          break;
        }

        // Option 4: Add to folder_data if it exists
        else if (item.folder_data && Array.isArray(item.folder_data)) {
          item.folder_data.push(faqEntry);
          added = true;
          break;
        }
      }

      // If no suitable existing structure was found, create a new one
      if (!added) {
        // Default to pdf_data if nothing else exists
        if (!parsedData[0]) {
          parsedData[0] = {};
        }

        // Create pdf_data array if it doesn't exist
        if (!parsedData[0].pdf_data) {
          parsedData[0].pdf_data = [];
        }

        parsedData[0].pdf_data.push(faqEntry);
      }

      // Update the chatbot data
      this.chatbotData = JSON.stringify(parsedData, null, 2);

      // Reset form
      this.newFAQ = { question: '', answer: '' };

      // Show success message (optional)
      setTimeout(() => {
        this.error = null;
      }, 3000);

    } catch (error) {
      console.error('Error adding FAQ', error);
      this.error = 'Failed to add FAQ';
    }
  }

  saveChatbot() {
    // Validate JSON before saving
    try {
      JSON.parse(this.chatbotData);
    } catch (error: any) {
      this.error = `Cannot save invalid JSON: ${error.message}`;
      return;
    }

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

  // Editor Mode Methods
  setEditorMode(mode: string) {
    // We only support JSON mode now
    this.editorMode = 'json';
  }

  // Structured Editor Methods
  getDataIndices(): number[] {
    return this.structuredData ? Array.from({ length: this.structuredData.length }, (_, i) => i) : [];
  }

  selectDataIndex(index: number) {
    this.selectedDataIndex = index;
  }

  addNewDataSource() {
    if (!this.structuredData) {
      this.structuredData = [];
    }

    this.structuredData.push({
      pdf_data: []
    });

    this.selectedDataIndex = this.structuredData.length - 1;
  }

  removeDataSource(index: number) {
    if (confirm('Are you sure you want to remove this data source?')) {
      this.structuredData.splice(index, 1);

      if (this.structuredData.length === 0) {
        this.selectedDataIndex = null;
      } else if (this.selectedDataIndex === index || this.selectedDataIndex! >= this.structuredData.length) {
        this.selectedDataIndex = this.structuredData.length - 1;
      }
    }
  }

  // PDF Data Methods
  hasPdfData(index: number): boolean {
    return !!this.structuredData[index]?.pdf_data;
  }

  getPdfData(index: number): any[] {
    return this.structuredData[index]?.pdf_data || [];
  }

  addPdfEntry(index: number) {
    if (!this.structuredData[index]) {
      return;
    }

    if (!this.structuredData[index].pdf_data) {
      this.structuredData[index].pdf_data = [];
    }

    this.structuredData[index].pdf_data!.push({
      page: 'New Page',
      text: 'Enter content here'
    });
  }

  removePdfEntry(dataIndex: number, entryIndex: number) {
    if (this.structuredData[dataIndex] && this.structuredData[dataIndex].pdf_data) {
      this.structuredData[dataIndex].pdf_data!.splice(entryIndex, 1);
    }
  }

  // Web Data Methods
  hasWebData(index: number): boolean {
    return !!this.structuredData[index]?.web_data;
  }

  getWebData(index: number): any {
    if (!this.structuredData[index]) {
      return { url: '', title: '', sections: [] };
    }

    if (!this.structuredData[index].web_data) {
      this.structuredData[index].web_data = {
        url: '',
        title: '',
        sections: []
      };
    }
    return this.structuredData[index].web_data!;
  }

  getWebSections(index: number): any[] {
    return this.getWebData(index).sections || [];
  }

  addWebSection(index: number) {
    if (!this.structuredData[index]) {
      return;
    }

    if (!this.structuredData[index].web_data) {
      this.structuredData[index].web_data = {
        url: '',
        title: '',
        sections: []
      };
    }

    if (!this.structuredData[index].web_data!.sections) {
      this.structuredData[index].web_data!.sections = [];
    }

    const sections = this.structuredData[index].web_data!.sections;
    if (sections) {
      sections.push({
        heading: 'New Section',
        content: ['Enter content here']
      });
    }
  }

  removeWebSection(dataIndex: number, sectionIndex: number) {
    if (!this.structuredData[dataIndex]) {
      return;
    }
    const sections = this.structuredData[dataIndex].web_data?.sections;
    if (sections) {
      sections.splice(sectionIndex, 1);
    }
  }

  addWebSectionContent(dataIndex: number, sectionIndex: number) {
    const section = this.structuredData[dataIndex].web_data?.sections?.[sectionIndex];
    if (section && section.content) {
      section.content.push('');
    }
  }

  removeWebSectionContent(dataIndex: number, sectionIndex: number, contentIndex: number) {
    const section = this.structuredData[dataIndex].web_data?.sections?.[sectionIndex];
    if (section && section.content) {
      section.content.splice(contentIndex, 1);
    }
  }

  // DB Data Methods
  hasDbData(index: number): boolean {
    return !!this.structuredData[index]?.db_data;
  }

  getDbData(index: number): any[] {
    return this.structuredData[index]?.db_data || [];
  }

  addDbEntry(index: number) {
    if (!this.structuredData[index]) {
      return;
    }

    if (!this.structuredData[index].db_data) {
      this.structuredData[index].db_data = [];
    }

    this.structuredData[index].db_data!.push({
      question: 'New Question',
      answer: 'Enter answer here'
    });
  }

  removeDbEntry(dataIndex: number, entryIndex: number) {
    if (this.structuredData[dataIndex] && this.structuredData[dataIndex].db_data) {
      this.structuredData[dataIndex].db_data!.splice(entryIndex, 1);
    }
  }

  // Folder Data Methods
  hasFolderData(index: number): boolean {
    return !!this.structuredData[index]?.folder_data;
  }

  getFolderData(index: number): any[] {
    return this.structuredData[index]?.folder_data || [];
  }

  addFolderEntry(index: number) {
    if (!this.structuredData[index]) {
      return;
    }

    if (!this.structuredData[index].folder_data) {
      this.structuredData[index].folder_data = [];
    }

    this.structuredData[index].folder_data!.push({
      filename: 'New File',
      content: 'Enter content here'
    });
  }

  removeFolderEntry(dataIndex: number, entryIndex: number) {
    if (this.structuredData[dataIndex] && this.structuredData[dataIndex].folder_data) {
      this.structuredData[dataIndex].folder_data!.splice(entryIndex, 1);
    }
  }

  // Data Type Modal Methods
  openAddDataTypeModal() {
    this.addingDataTypeForIndex = 0; // Default to first data source
    this.showAddDataTypeModal = true;
  }

  addDataType(index: number) {
    this.addingDataTypeForIndex = index;
    this.showAddDataTypeModal = true;
  }

  closeAddDataTypeModal() {
    this.showAddDataTypeModal = false;
    this.addingDataTypeForIndex = null;
  }

  addDataTypeToSource(type: 'pdf_data' | 'web_data' | 'db_data' | 'folder_data') {
    if (this.addingDataTypeForIndex === null) return;

    const index = this.addingDataTypeForIndex;
    if (!this.structuredData[index]) return;

    switch (type) {
      case 'pdf_data':
        if (!this.structuredData[index].pdf_data) {
          this.structuredData[index].pdf_data = [];
        }
        break;
      case 'web_data':
        if (!this.structuredData[index].web_data) {
          this.structuredData[index].web_data = {
            url: '',
            title: '',
            sections: []
          };
        }
        break;
      case 'db_data':
        if (!this.structuredData[index].db_data) {
          this.structuredData[index].db_data = [];
        }
        break;
      case 'folder_data':
        if (!this.structuredData[index].folder_data) {
          this.structuredData[index].folder_data = [];
        }
        break;
    }

    this.closeAddDataTypeModal();
  }

  // Helper Methods
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}