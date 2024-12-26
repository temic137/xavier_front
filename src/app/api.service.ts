import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';



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
    timeframe_days: number;
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
    timeframe_days: number;
  };
  last_updated: string;
  timeframe_days: number;
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5000';  // Update this to your Flask backend URL

  // private apiUrl = 'http://127.0.0.1:8000';
   
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

  // askChatbot(chatbotId: string, question: string): Observable<any> {
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   return this.http.post(`${this.apiUrl}/chatbot/${chatbotId}/ask`, { question }, { withCredentials: true });
  // }

  askChatbot(chatbotId: string, question: string | File, inputType: 'text' | 'audio' = 'text'): Observable<any> {
    if (inputType === 'text') {
      return this.http.post(`${this.apiUrl}/chatbot/${chatbotId}/ask`, { question }, { withCredentials: true });
    } else {
      const formData = new FormData();
      formData.append('audio', question as File);
      formData.append('input_type', 'audio');
      return this.http.post(`${this.apiUrl}/chatbot/${chatbotId}/ask`, formData, { withCredentials: true });
    }
  }

  getChatbots(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chatbots`, { withCredentials: true });
  }
  getIntegration_code(chatbotId: string): Observable<any>{
    return this.http.get(`${this.apiUrl}/get_chatbot_script/${chatbotId}`,{ withCredentials: true });
  }
  submitFeedback(chatbotId: string, feedback: string,): Observable<any> {
    const url = `${this.apiUrl}/chatbot/${chatbotId}/feedback`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'User-ID': "temi2"
    });
    const body = { feedback };

    return this.http.post(url, body, { headers });
  }
  viewFeedback(): Observable<any>{
    return this.http.get(`${this.apiUrl}/chatbot/all-feedback`,{ withCredentials: true });
   
  }

  getChatbot(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/chatbot/${id}`, { withCredentials: true });
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

  // Add this method to the ApiService class
getChatbot1(chatbotId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/chatbots/${chatbotId}`, { withCredentials: true });
}

getChatbotById(chatbotId: string) {
  return this.http.get<any>(`/api/chatbots/${chatbotId}`);
}

}

