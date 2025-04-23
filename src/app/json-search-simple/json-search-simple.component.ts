import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-search-simple',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './json-search-simple.component.html',
  styleUrl: './json-search-simple.component.css'
})
export class JsonSearchSimpleComponent {
  private _jsonData: string = '';

  @Input()
  set jsonData(value: string) {
    console.log('JSON data updated in search component');

    // Only update if the data has actually changed
    if (this._jsonData !== value) {
      this._jsonData = value;

      // If there's an active search, re-run it with the new data
      if (this.searchQuery && this.searchQuery.trim()) {
        console.log('Re-running search with new data');
        // Use a slightly longer timeout to ensure the data is fully updated
        setTimeout(() => {
          // Clear existing results first
          this.searchResults = [];
          // Then run the search
          this.searchInJson();
        }, 100);
      }
    }
  }

  get jsonData(): string {
    return this._jsonData;
  }
  @Output() onEdit = new EventEmitter<{content: string, lineStart: number, lineEnd: number}>();
  @Output() onDelete = new EventEmitter<{lineStart: number, lineEnd: number}>();

  searchQuery: string = '';
  searchResults: Array<{line: number, preview: string, lineStart: number, lineEnd: number}> = [];
  selectedResultIndex: number = -1;
  showEditModal: boolean = false;
  editingContent: string = '';
  currentEditingResult: any = null;

  searchInJson() {
    console.log('Searching in JSON with query:', this.searchQuery);

    if (!this.searchQuery.trim() || !this.jsonData) {
      this.searchResults = [];
      this.selectedResultIndex = -1;
      return this.searchResults;
    }

    // Clear existing results
    this.searchResults = [];
    const lines = this.jsonData.split('\n');
    const query = this.searchQuery.toLowerCase();

    console.log(`Searching through ${lines.length} lines of JSON data`);

    // Track unique blocks to avoid duplicates
    const processedBlocks = new Set<string>();

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(query)) {
        console.log(`Found match at line ${index + 1}: ${line.trim()}`);

        // Find the logical block this line belongs to
        let blockStart = index;
        let blockEnd = index;

        // Look for the start of the block (opening brace or bracket)
        let bracketBalance = 0;
        for (let i = index; i >= 0; i--) {
          const char = lines[i].trim().charAt(0);
          if (char === '{' || char === '[') {
            if (bracketBalance === 0) {
              blockStart = i;
              break;
            }
            bracketBalance--;
          } else if (lines[i].trim().endsWith('}') || lines[i].trim().endsWith(']')) {
            bracketBalance++;
          }
        }

        // Look for the end of the block (closing brace or bracket)
        bracketBalance = 0;
        for (let i = index; i < lines.length; i++) {
          const lastChar = lines[i].trim().charAt(lines[i].trim().length - 1);
          if (lastChar === '}' || lastChar === ']') {
            if (bracketBalance === 0) {
              blockEnd = i;
              break;
            }
            bracketBalance--;
          } else if (lines[i].trim().startsWith('{') || lines[i].trim().startsWith('[')) {
            bracketBalance++;
          }
        }

        // Create a unique key for this block to avoid duplicates
        const blockKey = `${blockStart}-${blockEnd}`;
        if (processedBlocks.has(blockKey)) {
          // Skip this result as we've already processed this block
          return;
        }
        processedBlocks.add(blockKey);

        // Create a preview
        let preview = line.trim();
        if (preview.length > 100) {
          preview = preview.substring(0, 100) + '...';
        }

        console.log(`Adding result with lineStart: ${blockStart + 1}, lineEnd: ${blockEnd + 1}`);

        this.searchResults.push({
          line: index + 1,
          preview,
          lineStart: blockStart + 1,
          lineEnd: blockEnd + 1
        });
      }
    });

    console.log(`Found ${this.searchResults.length} search results`);

    // Select the first result if available
    this.selectedResultIndex = this.searchResults.length > 0 ? 0 : -1;

    // Return the search results for external use
    return this.searchResults;
  }

  highlightSearchResult(result: {line: number, preview: string, lineStart: number, lineEnd: number}) {
    this.selectedResultIndex = this.searchResults.indexOf(result);
  }

  editResult(result: any, event: Event) {
    event.stopPropagation();

    const lines = this.jsonData.split('\n');
    let content = '';

    // Get the content of the block
    for (let i = result.lineStart - 1; i < result.lineEnd; i++) {
      content += lines[i] + (i < result.lineEnd - 1 ? '\n' : '');
    }

    this.editingContent = content;
    this.currentEditingResult = result;
    this.showEditModal = true;
  }

  deleteResult(result: any, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    console.log('Delete result called with:', result);

    // Ensure we have valid line numbers for deletion
    const deleteParams = {
      lineStart: result.lineStart || result.line,
      lineEnd: result.lineEnd || result.line
    };

    console.log('Emitting delete event with params:', deleteParams);

    // Emit the delete event to the parent component
    // The confirmation dialog is now handled in the parent component
    this.onDelete.emit(deleteParams);

    // We'll let the parent component handle the actual deletion and update
    // The search results will be updated when the jsonData property is updated
    // and the searchInJson method is called again
  }

  saveEditedContent() {
    if (!this.currentEditingResult) return;

    this.onEdit.emit({
      content: this.editingContent,
      lineStart: this.currentEditingResult.lineStart,
      lineEnd: this.currentEditingResult.lineEnd
    });

    this.closeEditModal();
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingContent = '';
    this.currentEditingResult = null;
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedResultIndex = -1;
  }

  /**
   * Format the JSON preview to be more readable
   * Removes quotes, colons, and other JSON syntax to make it more human-readable
   */
  formatPreview(preview: string): string {
    if (!preview) return '';

    // Remove JSON syntax characters
    let formatted = preview
      .replace(/[{\[\]}]/g, '') // Remove braces and brackets
      .replace(/"([^"]+)":/g, '$1:') // Remove quotes around property names
      .replace(/,/g, ' | '); // Replace commas with pipes for better readability

    // Handle common JSON patterns
    if (formatted.includes('page:') && formatted.includes('text:')) {
      // This is likely a PDF entry
      const page = formatted.match(/page:\s*"([^"]+)"/)?.[1] || '';
      const text = formatted.match(/text:\s*"([^"]+)"/)?.[1] || '';
      return `📄 ${page}: ${text}`;
    }

    if (formatted.includes('question:') && formatted.includes('answer:')) {
      // This is likely a FAQ entry
      const question = formatted.match(/question:\s*"([^"]+)"/)?.[1] || '';
      const answer = formatted.match(/answer:\s*"([^"]+)"/)?.[1] || '';
      return `❓ ${question}\n💬 ${answer}`;
    }

    if (formatted.includes('heading:') && formatted.includes('content:')) {
      // This is likely a web section
      const heading = formatted.match(/heading:\s*"([^"]+)"/)?.[1] || '';
      return `📝 ${heading}`;
    }

    if (formatted.includes('filename:') && formatted.includes('content:')) {
      // This is likely a folder entry
      const filename = formatted.match(/filename:\s*"([^"]+)"/)?.[1] || '';
      return `📁 ${filename}`;
    }

    // If no specific pattern is detected, just clean up the JSON syntax
    return formatted
      .replace(/"/g, '') // Remove remaining quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}
