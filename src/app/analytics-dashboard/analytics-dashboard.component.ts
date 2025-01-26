// // analytics-dashboard.component.ts
// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Chart } from 'chart.js/auto';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { Observable } from 'rxjs';

// import { ActivatedRoute, RouterLink } from '@angular/router';
// import { ApiService } from '../api.service';

// interface DashboardData {
//   common_questions: {
//     top_questions: Array<{
//       question: string;
//       count: number;
//       last_asked: string;
//       latest_answer: string;
//     }>;
//     total_questions: number;
//   };
//   topic_clusters: {
//     clusters: Array<{
//       cluster_id: number;
//       topic_terms: string[];
//       questions: Array<{
//         question: string;
//         answer: string;
//         asked_at: string;
//       }>;
//       question_count: number;
//     }>;
//   };
//   usage_patterns: {
//     daily_trends: Array<{
//       date: string;
//       count: number;
//     }>;
//     hourly_distribution: Array<{
//       hour: number;
//       count: number;
//     }>;
//   };
// }

// @Component({
//   selector: 'app-analytics-dashboard',
//   standalone: true,
//   imports: [FormsModule,CommonModule,RouterLink],
//   templateUrl: './analytics-dashboard.component.html',
//   styleUrl: './analytics-dashboard.component.css'
    
// })
// export class AnalyticsDashboardComponent implements OnInit {
//   dashboardData: DashboardData | null = null;
//   chatbotId: string = '';
  

//   constructor(private http: HttpClient, private ApiService:ApiService, private route:ActivatedRoute) {}

//   private apiUrl = 'http://localhost:5000';
//   ngOnInit() {
//     this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
//     this.getdashboard()

//   }


//   getdashboard(){
//     this.ApiService.getAnalyticsDashboard(this.chatbotId).subscribe(
//       (data) => {
//         this.dashboardData = data;
//         this.initializeCharts();
//       },
//       (error) => console.error('Error fetching dashboard data:', error)
//     );
//   }


//   initializeCharts() {
//     if (!this.dashboardData) return;

//     // Daily Trends Chart
//     new Chart('dailyTrendsChart', {
//       type: 'line',
//       data: {
//         labels: this.dashboardData.usage_patterns.daily_trends.map(d => this.formatDate(d.date)),
//         datasets: [{
//           label: 'Questions per Day',
//           data: this.dashboardData.usage_patterns.daily_trends.map(d => d.count),
//           borderColor: 'rgb(59, 130, 246)',
//           tension: 0.1
//         }]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//           legend: {
//             display: false
//           }
//         }
//       }
//     });

//     // Hourly Distribution Chart
//     new Chart('hourlyDistributionChart', {
//       type: 'bar',
//       data: {
//         labels: this.dashboardData.usage_patterns.hourly_distribution.map(h => `${h.hour}:00`),
//         datasets: [{
//           label: 'Questions per Hour',
//           data: this.dashboardData.usage_patterns.hourly_distribution.map(h => h.count),
//           backgroundColor: 'rgb(147, 51, 234)'
//         }]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//           legend: {
//             display: false
//           }
//         }
//       }
//     });
//   }

//   getPeakHour(): number {
//     if (!this.dashboardData?.usage_patterns?.hourly_distribution?.length) return 0;
    
//     const peakHourData = this.dashboardData.usage_patterns.hourly_distribution.reduce(
//       (max, current) => current.count > max.count ? current : max,
//       this.dashboardData.usage_patterns.hourly_distribution[0]
//     );
    
//     return peakHourData.hour;
//   }

//   formatDate(dateString: string): string {
//     return new Date(dateString).toLocaleDateString();
//   }
// }


import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface DashboardData {
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

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CanvasJSAngularChartsModule,FormsModule,CommonModule], // Import CanvasJS module here
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css'],
})
export class AnalyticsDashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  chatbotId: string = '';

  // Chart options for CanvasJS
  public dailyTrendsChartOptions: any;
  public hourlyDistributionChartOptions: any;
  public sentimentChartOptions: any;

  constructor(
    private http: HttpClient,
    private ApiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
    this.getdashboard();
  }

  getdashboard() {
    this.ApiService.getAnalyticsDashboard(this.chatbotId).subscribe(
      (data) => {
        this.dashboardData = data;
        this.initializeCharts();
      },
      (error) => console.error('Error fetching dashboard data:', error)
    );
  }

  initializeCharts() {
    if (!this.dashboardData) {
      console.error('Dashboard data is not available.');
      return;
    }
  
    console.log('Dashboard Data:', this.dashboardData);
  
    // Daily Trends Chart
    this.dailyTrendsChartOptions = {
      animationEnabled: true,
      title: {
        text: 'Daily Question Trends',
      },
      axisX: {
        title: 'Date',
        valueFormatString: 'DD MMM',
      },
      axisY: {
        title: 'Questions',
      },
      data: [
        {
          type: 'line',
          dataPoints: this.dashboardData?.usage_patterns?.daily_trends?.map((d) => ({
            x: new Date(d.date),
            y: d.count,
          })) || [], // Fallback to an empty array if data is undefined
        },
      ],
    };
  
    console.log('Daily Trends Chart Options:', this.dailyTrendsChartOptions);
  
    // Hourly Distribution Chart
    this.hourlyDistributionChartOptions = {
      animationEnabled: true,
      title: {
        text: 'Hourly Distribution',
      },
      axisX: {
        title: 'Hour',
      },
      axisY: {
        title: 'Questions',
      },
      data: [
        {
          type: 'column',
          dataPoints: this.dashboardData?.usage_patterns?.hourly_distribution?.map((h) => ({
            label: `${h.hour}:00`,
            y: h.count,
          })) || [], // Fallback to an empty array if data is undefined
        },
      ],
    };
  
    console.log('Hourly Distribution Chart Options:', this.hourlyDistributionChartOptions);
  
    // Sentiment Chart
    this.sentimentChartOptions = {
      animationEnabled: true,
      title: {
        text: 'User Sentiment Analysis',
      },
      data: [
        {
          type: 'pie',
          startAngle: -90,
          indexLabel: '{label}: {y}',
          dataPoints: [
            { label: 'Positive', y: this.dashboardData?.sentiment_analytics?.positive_ratings || 0 },
            { label: 'Negative', y: this.dashboardData?.sentiment_analytics?.negative_ratings || 0 },
          ],
        },
      ],
    };
  
    console.log('Sentiment Chart Options:', this.sentimentChartOptions);
  }

  getPeakHour(): number {
    if (!this.dashboardData?.usage_patterns?.hourly_distribution?.length) return 0;

    const peakHourData = this.dashboardData.usage_patterns.hourly_distribution.reduce(
      (max, current) => (current.count > max.count ? current : max),
      this.dashboardData.usage_patterns.hourly_distribution[0]
    );

    return peakHourData.hour;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}