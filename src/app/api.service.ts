import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse } from '@angular/common/http';
import { Ticket, TicketDetail, TicketsResponse } from './ticket.types';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';


// Add Dashboard Data Interface
export interface DashboardData {
  common_questions: {
    top_questions: Array<{
      question: string;
      count: number;
      last_asked: string;
      latest_answer: string;
    }>;
    total_questions: number;
    timeframe_days: number;
  };
  topic_clusters: {
    clusters: Array<{
      cluster_id: number;
      topic_terms: string[];
      questions: Array<{
        question: string;
        answer: string;
        asked_at: string;
      }>;
      question_count: number;
    }>;
    total_questions: number;
  };
  usage_patterns: {
    daily_trends: Array<{
      date: string;
      count: number;
    }>;
    hourly_distribution: Array<{
      hour: number;
      count: number;
    }>;
  };
  sentiment_analytics: {
    total_ratings: number;
    positive_ratings: number;
    negative_ratings: number;
    satisfaction_rate: number;
    detail_records: Array<{
      sentiment: string;
      timestamp: string;
      conversation_id: string | null;
    }>;
  };
  last_updated: string;
  timeframe_days: number;
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {


  public apiUrl ='https://xavieraiback.onrender.com';
  // public apiUrl = 'http://127.0.0.1:5000';


  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/login`, { username, password }, { withCredentials: true });
  }



  logout(){
    return this.http.post(`${this.apiUrl}/logout`,{}, { withCredentials: true });
  }



  register(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/register`, { username, password }, { withCredentials: true });
  }

  createChatbot(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create_chatbot`, { name }, { withCredentials: true });
  }

  trainChatbot(chatbotId: string, file: File | null, apiUrl: string | null, folderPath: string | null, websiteUrl: string | null): Observable<any> {
    const formData = new FormData();

    if (file) {
      formData.append('file', file);
    }

    if (apiUrl) {
      formData.append('apiUrl', apiUrl);
    }

    if (folderPath) {
      formData.append('folder_path', folderPath);
    }
    if (websiteUrl) {
      formData.append('website_url', websiteUrl);
    }

    return this.http.post(`${this.apiUrl}/train_chatbot/${chatbotId}`, formData, { withCredentials: true });
  }

  deleteChatbot(chatbotId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete_chatbot/${chatbotId}`, { withCredentials: true });
  }



  askChatbot(chatbotId: string, question: string | File, inputType: 'text' | 'audio' = 'text', conversationId?: string): Observable<any> {
    if (inputType === 'text') {
      return this.http.post(`${this.apiUrl}/chatbot/${chatbotId}/ask`, { question, conversation_id: conversationId }, { withCredentials: true });
    } else {
      const formData = new FormData();
      formData.append('audio', question as File);
      formData.append('input_type', 'audio');
      if (conversationId) {
        formData.append('conversation_id', conversationId);
      }
      return this.http.post(`${this.apiUrl}/chatbot/${chatbotId}/ask`, formData, { withCredentials: true });
    }
  }

  getChatbots(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chatbots`, { withCredentials: true });
  }
  getIntegration_code(chatbotId: string): Observable<any>{
    console.log(`Fetching integration code for chatbot: ${chatbotId}`);
    return this.http.get(`${this.apiUrl}/get_chatbot_script/${chatbotId}`, { withCredentials: false })
      .pipe(
        tap(response => console.log('Integration code response:', response)),
        catchError(error => {
          console.error('Error fetching integration code:', error);
          return throwError(() => new Error('Failed to load integration code. Please try again later.'));
        })
      );
  }

  submitFeedback(chatbotId: string, feedback: string): Observable<any> {
    const url = `${this.apiUrl}/chatbot/${chatbotId}/feedback`;
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'User-ID': "temi1"
    });
    const body = { feedback };
    return this.http.post(url, body, {
        headers,
        withCredentials: true
    });
}

  viewFeedback(): Observable<any>{
    return this.http.get(`${this.apiUrl}/chatbot/all-feedback`);

  }

  getChatbot(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/chatbot/${id}`, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error('Error fetching chatbot details:', error);
          return throwError(() => new Error('Failed to load chatbot details. Please try again later.'));
        })
      );
  }


  updateChatbot(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/chatbot/${id}`, data, { withCredentials: true });
  }

  authorizeGmail(chatbotId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/authorize_gmail/${chatbotId}`, { withCredentials: true });
  }

  processEmails(chatbotId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/process_emails/${chatbotId}`, {}, { withCredentials: true });
  }

  disableGmailIntegration(chatbotId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/disable_integration/${chatbotId}`, {}, { withCredentials: true });
  }


  getAnalyticsDashboard(chatbotId: string, days?: number): Observable<DashboardData> {
    const params = days ? `?days=${days}` : '';
    return this.http.get<DashboardData>(
      `${this.apiUrl}/analytics/dashboard/${chatbotId}${params}`,
      { withCredentials: true }
    );
  }

  getCommonQuestions(chatbotId: string, days?: number): Observable<any> {
    const params = days ? `?days=${days}` : '';
    return this.http.get(
      `${this.apiUrl}/analytics/common_questions/${chatbotId}${params}`,
      { withCredentials: true }
    );
  }

  getQuestionClusters(chatbotId: string, days?: number): Observable<any> {
    const params = days ? `?days=${days}` : '';
    return this.http.get(
      `${this.apiUrl}/analytics/question_clusters/${chatbotId}${params}`,
      { withCredentials: true }
    );
  }

  getUsagePatterns(chatbotId: string, days?: number): Observable<any> {
    const params = days ? `?days=${days}` : '';
    return this.http.get(
      `${this.apiUrl}/analytics/usage_patterns/${chatbotId}${params}`,
      { withCredentials: true }
    );
  }


getChatbot1(chatbotId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/chatbots/${chatbotId}`, { withCredentials: true });
}

getChatbotById(chatbotId: string) {
  return this.http.get<any>(`/api/chatbots/${chatbotId}`);
}


private handleError(error: HttpErrorResponse) {
  let errorMessage = 'An error occurred';

  if (error.error instanceof ErrorEvent) {
    errorMessage = `Error: ${error.error.message}`;
  } else {
    errorMessage = error.error?.error || error.message;
  }

  return throwError(() => errorMessage);
}

getTickets(): Observable<Ticket[]> {
  return this.http.get<TicketsResponse>(`${this.apiUrl}/tickets`).pipe(
    map(response => response.tickets),
    retry(1),
    catchError(this.handleError)
  );
}

getTicketDetails(ticketId: number): Observable<TicketDetail> {
  return this.http.get<TicketDetail>(`${this.apiUrl}/ticket/${ticketId}`, { withCredentials: true }).pipe(
    retry(1),
    catchError(this.handleError)
  );
}


  getTicketsByChatbotId(chatbotId: string): Observable<Ticket[]> {
    return this.http.get<TicketsResponse>(`${this.apiUrl}/tickets/${chatbotId}`, { withCredentials: true }).pipe(
      map(response => response.tickets),
      retry(1),
      catchError(this.handleError)
    );
  }



updateTicketStatus(ticketId: number, status: string): Observable<any> {
  return this.http.patch(`${this.apiUrl}/ticket/${ticketId}/update-status`, { status }, { withCredentials: true }).pipe(
    tap((response: any) => this.getTickets()),
    catchError(this.handleError)
  );
}

updateTicketPriority(ticketId: number, priority: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/ticket/${ticketId}/priority`, { priority }, { withCredentials: true }).pipe(
    tap((response: any) => this.getTickets()),
    catchError(this.handleError)
  );
}

deleteTicket(ticketId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/ticket/delete/${ticketId}`, { withCredentials: true }).pipe(
    catchError(this.handleError)
  );
}


trainChatbotWithProgress(
  chatbotId: string,
  file: File | null,
  apiUrl: string | null,
  folderPath: string | null,
  websiteUrl: string | null
) {
  const formData = new FormData();

  if (file) {
    formData.append('file', file);
  }
  if (apiUrl) {
    formData.append('apiUrl', apiUrl);
  }
  if (folderPath) {
    formData.append('folderPath', folderPath);
  }
  if (websiteUrl) {
    formData.append('websiteUrl', websiteUrl);
  }

  // Use the chatbotId in the URL
  const url = `${this.apiUrl}/train_chatbot/${chatbotId}`;

  // Return the observable with progress events
  return this.http.post(url, formData, {
    reportProgress: true,
    observe: 'events',
    withCredentials: true
  });
}

// Lead Management Methods
submitLead(leadData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/api/leads/submit`, leadData, { withCredentials: true })
    .pipe(catchError(this.handleError));
}

getLeads(params: any = {}): Observable<any> {
  return this.http.get(`${this.apiUrl}/api/leads`, { params, withCredentials: true })
    .pipe(catchError(this.handleError));
}

getLead(leadId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/api/leads/${leadId}`, { withCredentials: true })
    .pipe(catchError(this.handleError));
}

updateLead(leadId: number, data: any): Observable<any> {
  return this.http.patch(`${this.apiUrl}/api/leads/${leadId}`, data, { withCredentials: true })
    .pipe(catchError(this.handleError));
}

deleteLead(leadId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/api/leads/${leadId}`, { withCredentials: true })
    .pipe(catchError(this.handleError));
}

// Email Service Methods
sendEmail(emailData: {
  from_email: string;
  to_email: string;
  reply_to: string;
  subject: string;
  html_content: string;
}): Observable<any> {
  return this.http.post(`${this.apiUrl}/email/send-email`, emailData, { withCredentials: true })
    .pipe(catchError(this.handleError));
}

sendTicketEmail(ticketId: number, emailData: {
  from_email: string;
  to_email: string;
  reply_to: string;
  subject?: string;
  html_content?: string;
}): Observable<any> {
  return this.http.post(`${this.apiUrl}/email/send-ticket-email/${ticketId}`, emailData, { withCredentials: true })
    .pipe(catchError(this.handleError));
}

}
