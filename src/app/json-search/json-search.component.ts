import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './json-search.component.html',
  styleUrls: ['./json-search.component.css']
})
export class JsonSearchComponent {
  @Input() jsonData: string = '';
  @Output() onEdit = new EventEmitter<{content: string, lineStart: number, lineEnd: number}>();
  @Output() onDelete = new EventEmitter<{lineStart: number, lineEnd: number}>();
  @ViewChild('jsonTextarea') jsonTextarea!: ElementRef;

  searchQuery: string = '';
  searchResults: Array<{line: number, preview: string, lineStart: number, lineEnd: number}> = [];
  selectedResultIndex: number = -1;
  showEditModal: boolean = false;
  editingContent: string = '';
  currentEditingResult: any = null;

  searchInJson() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    this.searchResults = [];
    const lines = this.jsonData.split('\n');
    const query = this.searchQuery.toLowerCase();

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(query)) {
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

        // Create a preview
        let preview = line.trim();
        if (preview.length > 100) {
          preview = preview.substring(0, 100) + '...';
        }

        this.searchResults.push({
          line: index + 1,
          preview,
          lineStart: blockStart + 1,
          lineEnd: blockEnd + 1
        });
      }
    });

    if (this.searchResults.length > 0) {
      this.selectedResultIndex = 0;
      this.highlightSearchResult(this.searchResults[0]);
    }
  }

  highlightSearchResult(result: {line: number, preview: string, lineStart: number, lineEnd: number}) {
    if (!this.jsonTextarea) return;
    
    const textarea = this.jsonTextarea.nativeElement;
    const lines = this.jsonData.split('\n');
    let startPosition = 0;
    let endPosition = 0;

    // Calculate start position
    for (let i = 0; i < result.lineStart - 1; i++) {
      startPosition += lines[i].length + 1; // +1 for the newline character
    }

    // Calculate end position
    for (let i = 0; i < result.lineEnd; i++) {
      endPosition += lines[i].length + 1; // +1 for the newline character
    }
    endPosition--; // Adjust for the last newline

    // Set selection range to highlight the block
    textarea.focus();
    textarea.setSelectionRange(startPosition, endPosition);

    // Scroll to the position
    const lineHeight = 18; // Approximate line height in pixels
    textarea.scrollTop = (result.line - 5) * lineHeight; // Scroll to show a few lines above
  }

  selectResult(index: number) {
    this.selectedResultIndex = index;
    this.highlightSearchResult(this.searchResults[index]);
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
    
    if (confirm('Are you sure you want to delete this content?')) {
      this.onDelete.emit({
        lineStart: result.lineStart,
        lineEnd: result.lineEnd
      });
      
      // Remove the result from the search results
      this.searchResults = this.searchResults.filter(r => 
        r.lineStart !== result.lineStart || r.lineEnd !== result.lineEnd
      );
      
      if (this.searchResults.length > 0 && this.selectedResultIndex >= this.searchResults.length) {
        this.selectedResultIndex = this.searchResults.length - 1;
        this.highlightSearchResult(this.searchResults[this.selectedResultIndex]);
      } else if (this.searchResults.length === 0) {
        this.selectedResultIndex = -1;
      }
    }
  }

  saveEditedContent() {
    if (!this.currentEditingResult) return;
    
    this.onEdit.emit({
      content: this.editingContent,
      lineStart: this.currentEditingResult.lineStart,
      lineEnd: this.currentEditingResult.lineEnd
    });
    
    this.closeEditModal();
    
    // Update the search result preview
    const lines = this.editingContent.split('\n');
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      const preview = firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
      
      const resultIndex = this.searchResults.findIndex(r => 
        r.lineStart === this.currentEditingResult.lineStart && 
        r.lineEnd === this.currentEditingResult.lineEnd
      );
      
      if (resultIndex >= 0) {
        this.searchResults[resultIndex].preview = preview;
      }
    }
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
}
