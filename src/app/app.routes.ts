// import { Routes } from '@angular/router';
// import { LoginComponent } from './login/login.component';
// import { RegisterComponent } from './register/register.component';
// import { ChatbotListComponent } from './chatbot-list/chatbot-list.component';
// import { ChatbotChatComponent } from './chatbot-chat/chatbot-chat.component';
// import { ChatbotEditComponent } from './chatbot-edit/chatbot-edit.component';
// import { GmailIntegrationComponent } from './gmail-integration/gmail-integration.component';
// import { LandingComponent } from './landing/landing.component';
// import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
// import { ChatbotDetailComponent } from './chatbot-detail/chatbot-detail.component';
// import { TrainComponent } from './train/train.component';
// import { IntegrationComponent } from './integration/integration.component';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { FeedbackDashboardComponent } from './feedback-dashboard/feedback-dashboard.component';
// import { ContactComponent } from './contact/contact.component';
// import { CareersComponent } from './careers/careers.component';
// import { AboutComponent } from './about/about.component';
// import { TicketManagementComponent } from './ticket-management/ticket-management.component';
// import { AgentDashboardComponent } from './agent-dashboard/agent-dashboard.component';


// export const routes: Routes = [
//     { path: '', component: LandingComponent },
//     { path: 'login', component: LoginComponent },
//     { path: 'register', component: RegisterComponent },
//     { path: 'chatbots', component: ChatbotListComponent },
//     { path: 'admin/dashboard', component : FeedbackDashboardComponent},
//     { path: 'contact', component:ContactComponent},
//     { path: 'careers', component:CareersComponent},
//     { path: 'about', component:AboutComponent},
    
//     { 
//         path: 'chatbot/:id', 
//         component: ChatbotDetailComponent,
//         children: [
//             { path: '', redirectTo: 'analyticsdash', pathMatch: 'full' },
//             { path: 'analyticsdash/:id', component: AnalyticsDashboardComponent },
//             { path: 'train/:id', component: TrainComponent},
//             { path: 'chat/:id', component: ChatbotChatComponent },
//             { path: 'edit/:id', component: ChatbotEditComponent },
//             { path: 'integration/:id', component: IntegrationComponent },
//             { path: 'gmail-integration/:id', component: GmailIntegrationComponent },
//             { path: 'tickets/:id', component: TicketManagementComponent },
//             { path: 'agent-dash/:id', component: AgentDashboardComponent },
                    
//         ]
//     },   
// ];

// export const routeProviders = [
//     provideAnimations()
//   ];



import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ChatbotListComponent } from './chatbot-list/chatbot-list.component';
import { ChatbotChatComponent } from './chatbot-chat/chatbot-chat.component';
import { ChatbotEditComponent } from './chatbot-edit/chatbot-edit.component';
import { GmailIntegrationComponent } from './gmail-integration/gmail-integration.component';
import { LandingComponent } from './landing/landing.component';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { ChatbotDetailComponent } from './chatbot-detail/chatbot-detail.component';
import { TrainComponent } from './train/train.component';
import { IntegrationComponent } from './integration/integration.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FeedbackDashboardComponent } from './feedback-dashboard/feedback-dashboard.component';
import { ContactComponent } from './contact/contact.component';
import { CareersComponent } from './careers/careers.component';
import { AboutComponent } from './about/about.component';
import { TicketManagementComponent } from './ticket-management/ticket-management.component';
import { AgentDashboardComponent } from './agent-dashboard/agent-dashboard.component';
import { ChatbotCustomizeComponent } from './chatbot-customize/chatbot-customize.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'chatbots', component: ChatbotListComponent },
  { path: 'admin/dashboard', component: FeedbackDashboardComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'careers', component: CareersComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'chatbot/:id',
    component: ChatbotDetailComponent,
    children: [
      { path: '', redirectTo: 'analyticsdash', pathMatch: 'full' },
      { path: 'analyticsdash/:id', component: AnalyticsDashboardComponent },
      { path: 'train/:id', component: TrainComponent },
      { path: 'chat/:id', component: ChatbotChatComponent },
      { path: 'edit/:id', component: ChatbotEditComponent },
      { path: 'integration/:id', component: IntegrationComponent },
      { path: 'gmail-integration/:id', component: GmailIntegrationComponent },
      { path: 'chatbot-customize/:id', component: ChatbotCustomizeComponent },
      { 
        path: 'support',
        children: [
          { path: '', redirectTo: 'agent-dash/:id', pathMatch: 'full' },
          { path: 'agent-dash/:id', component: AgentDashboardComponent },
          { path: 'tickets/:id', component: TicketManagementComponent },
          
        ]
      },
      // Keep these for backward compatibility
      { path: 'agent-dash/:id', component: AgentDashboardComponent },
      { path: 'tickets/:id', component: TicketManagementComponent },
      
    ]
  },
];

export const routeProviders = [
  provideAnimations()
];