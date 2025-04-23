import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TicketManagementComponent } from '../ticket-management/ticket-management.component';
import { LeadsManagementComponent } from '../leads-management/leads-management.component';

@Component({
  selector: 'app-escalation',
  standalone: true,
  imports: [CommonModule, TicketManagementComponent, LeadsManagementComponent],
  templateUrl: './escalation.component.html',
  styleUrls: ['./escalation.component.css']
})
export class EscalationComponent implements OnInit {
  chatbotId: string = '';
  activeTab: string = 'tickets';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.chatbotId = params['id'];
      console.log('Escalation component initialized with chatbotId:', this.chatbotId);
    });
  }
}
