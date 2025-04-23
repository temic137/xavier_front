import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  chatbot_id: string;
  created_at: string;
  status: string;
  notes: string;
}

@Component({
  selector: 'app-leads-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leads-management.component.html',
  styleUrls: ['./leads-management.component.css']
})
export class LeadsManagementComponent implements OnInit {
  @Input() chatbotId: string = '';
  
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  selectedLead: Lead | null = null;
  
  statusFilter: string = 'all';
  searchTerm: string = '';
  
  message: string = '';
  isSuccess: boolean = true;
  isLoading: boolean = false;
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit() {
    this.loadLeads();
  }
  
  loadLeads() {
    this.isLoading = true;
    
    let params = {};
    if (this.chatbotId) {
      params = { chatbot_id: this.chatbotId };
    }
    
    this.apiService.getLeads(params).subscribe({
      next: (leads: Lead[]) => {
        this.leads = leads;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.showErrorMessage('Failed to load leads');
        this.isLoading = false;
      }
    });
  }
  
  applyFilters() {
    let filtered = [...this.leads];
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === this.statusFilter);
    }
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(term) || 
        lead.email.toLowerCase().includes(term) || 
        (lead.phone && lead.phone.includes(term)) ||
        (lead.message && lead.message.toLowerCase().includes(term))
      );
    }
    
    this.filteredLeads = filtered;
  }
  
  selectLead(lead: Lead) {
    this.selectedLead = { ...lead };
  }
  
  updateLead() {
    if (!this.selectedLead) return;
    
    this.apiService.updateLead(this.selectedLead.id, {
      status: this.selectedLead.status,
      notes: this.selectedLead.notes
    }).subscribe({
      next: () => {
        this.showSuccessMessage('Lead updated successfully');
        // Update the lead in the local array
        const index = this.leads.findIndex(l => l.id === this.selectedLead!.id);
        if (index !== -1) {
          this.leads[index] = { ...this.selectedLead! };
          this.applyFilters();
        }
        this.selectedLead = null;
      },
      error: () => {
        this.showErrorMessage('Failed to update lead');
      }
    });
  }
  
  deleteLead(id: number) {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    this.apiService.deleteLead(id).subscribe({
      next: () => {
        this.showSuccessMessage('Lead deleted successfully');
        this.leads = this.leads.filter(lead => lead.id !== id);
        this.applyFilters();
        if (this.selectedLead && this.selectedLead.id === id) {
          this.selectedLead = null;
        }
      },
      error: () => {
        this.showErrorMessage('Failed to delete lead');
      }
    });
  }
  
  cancelEdit() {
    this.selectedLead = null;
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
    }, 5000);
  }
}
