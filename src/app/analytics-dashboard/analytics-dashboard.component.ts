import { Component, OnInit, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import * as echarts from 'echarts';
import { format } from 'date-fns';

interface DailyTrend { 
  date: string; 
  count: number; 
}

interface HourlyDistribution { 
  hour: number; 
  count: number; 
}

interface DashboardData {
  common_questions: {
    top_questions: Array<{ question: string; count: number; last_asked: string; latest_answer: string; }>;
    total_questions: number;
    timeframe_days: number;
  };
  topic_clusters: {
    clusters: Array<{ cluster_id: number; topic_terms: string[]; questions: Array<{ question: string; answer: string; asked_at: string; }>; question_count: number; }>;
    total_questions: number;
  };
  usage_patterns: { 
    daily_trends: DailyTrend[]; 
    hourly_distribution: HourlyDistribution[]; 
  };
  sentiment_analytics: {
    total_ratings: number;
    positive_ratings: number;
    negative_ratings: number;
    satisfaction_rate: number;
    detail_records: Array<{ sentiment: string; timestamp: string; conversation_id: string | null; }>;
  };
  last_updated: string;
  timeframe_days: number;
}

type TrendDirection = 'up' | 'down' | 'neutral';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit, AfterViewInit {
  dashboardData: DashboardData | null = null;
  chatbotId: string = '';
  isBrowser: boolean;
  timeframeDays: number = 30;

  @ViewChild('questionTrendsChart') questionTrendsChartElement!: ElementRef;
  @ViewChild('topicDistributionChart') topicDistributionChartElement!: ElementRef;
  @ViewChild('hourlyActivityChart') hourlyActivityChartElement!: ElementRef;

  private questionTrendsChart: echarts.ECharts | null = null;
  private topicDistributionChart: echarts.ECharts | null = null;
  private hourlyActivityChart: echarts.ECharts | null = null;
  private cleanupFunctions: (() => void)[] = [];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initializeCharts();
      const resizeHandler = () => this.resizeCharts();
      window.addEventListener('resize', resizeHandler);
      this.cleanupFunctions.push(() => window.removeEventListener('resize', resizeHandler));
    }
  }

  ngOnDestroy(): void {
    if (this.questionTrendsChart) this.questionTrendsChart.dispose();
    if (this.topicDistributionChart) this.topicDistributionChart.dispose();
    if (this.hourlyActivityChart) this.hourlyActivityChart.dispose();
    this.cleanupFunctions.forEach(cleanup => cleanup());
  }

  loadDashboardData(): void {
    this.apiService.getAnalyticsDashboard(this.chatbotId).subscribe({
      next: (data) => {
        this.dashboardData = data;
        if (this.isBrowser) {
          setTimeout(() => this.initializeCharts(), 0);
        }
      },
      error: (error) => console.error('Error loading dashboard data:', error),
    });
  }

  onTimeframeChange(event: Event): void {
    this.timeframeDays = +(event.target as HTMLSelectElement).value;
    this.loadDashboardData();
  }

  initializeCharts(): void {
    if (!this.dashboardData) return;
    this.initializeQuestionTrendsChart();
    this.initializeTopicDistributionChart();
    this.initializeHourlyActivityChart();
  }

  resizeCharts(): void {
    this.questionTrendsChart?.resize();
    this.topicDistributionChart?.resize();
    this.hourlyActivityChart?.resize();
  }

  initializeQuestionTrendsChart(): void {
    if (this.questionTrendsChartElement && this.dashboardData) {
      this.questionTrendsChart = echarts.init(this.questionTrendsChartElement.nativeElement);
      const trendsData = this.dashboardData.usage_patterns.daily_trends.map(item => [
        new Date(item.date).getTime(),
        item.count,
      ]) || [];
  
      const option = {
        grid: { top: '10%', right: '5%', left: '5%', bottom: '15%', containLabel: true },
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => `${format(new Date(params[0].value[0]), 'MMM d, yyyy')}: ${params[0].value[1]} questions`,
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // Original white tooltip
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: [8, 12],
          textStyle: { color: '#374151' }, // Original dark gray text
        },
        dataZoom: [
          {
            type: 'slider',
            start: 0,
            end: 100,
            height: 20,
            backgroundColor: '#d1d5db', // Light gray background
            fillerColor: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#9ca3af' }, // Gray-400
              { offset: 1, color: '#6b7280' }  // Gray-500
            ]), // Greyish gradient for slider fill
            borderColor: '#e5e7eb',
            textStyle: { color: '#374151' }, // Original dark gray
            handleStyle: { color: '#9ca3af' }, // Gray handle
          },
          { type: 'inside' }
        ],
        xAxis: {
          type: 'time',
          axisLabel: { 
            formatter: (value: number) => format(new Date(value), 'MMM d'), 
            rotate: window.innerWidth < 768 ? 45 : 0, 
            fontSize: window.innerWidth < 768 ? 10 : 12,
            color: '#6b7280' // Original gray
          },
          axisLine: { lineStyle: { color: '#e5e7eb' } }, // Original light gray
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, // Original light gray dashed
          axisLabel: { 
            fontSize: window.innerWidth < 768 ? 10 : 12, 
            color: '#6b7280' // Original gray
          },
        },
        series: [{
          name: 'Daily Questions',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: trendsData,
          lineStyle: { 
            color: '#000000', // Black line
            width: 2 
          },
          areaStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(107, 114, 128, 0.3)' }, // Gray-500 with opacity
              { offset: 1, color: 'rgba(107, 114, 128, 0)' }   // Fade to transparent
            ]) 
          },
        }],
      };
      this.questionTrendsChart.setOption(option);
    }
  }

  initializeTopicDistributionChart(): void {
    if (this.topicDistributionChartElement && this.dashboardData) {
      this.topicDistributionChart = echarts.init(this.topicDistributionChartElement.nativeElement);

      const sortedClusters = [...this.dashboardData.topic_clusters.clusters].sort((a, b) => b.question_count - a.question_count);
      const topClusters = sortedClusters.slice(0, 5);
      const otherClusters = sortedClusters.slice(5);

      const othersCount = otherClusters.reduce((sum, cluster) => sum + cluster.question_count, 0);

      const pieData = [
        ...topClusters.map(cluster => ({
          value: cluster.question_count,
          name: cluster.topic_terms[0], 
        })),
        ...(othersCount > 0 ? [{ value: othersCount, name: 'Others' }] : []),
      ];

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} questions ({d}%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: [8, 12],
          textStyle: { color: '#374151' },
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          data: pieData,
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}',
            fontSize: window.innerWidth < 768 ? 10 : 12,
            color: '#374151',
            overflow: 'truncate',
            ellipsis: '...',
            maxWidth: 100,
          },
          labelLine: {
            length: 10,
            length2: 10,
            smooth: true,
          },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' },
          },
        }],
      };
      this.topicDistributionChart.setOption(option);
    }
  }

  initializeHourlyActivityChart(): void {
    if (this.hourlyActivityChartElement && this.dashboardData) {
      this.hourlyActivityChart = echarts.init(this.hourlyActivityChartElement.nativeElement);
      const hourlyData = Array(24).fill(0);
      this.dashboardData.usage_patterns.hourly_distribution.forEach(item => {
        if (item.hour >= 0 && item.hour < 24) hourlyData[item.hour] = item.count;
      });

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => `<div class="font-sans p-2"><div class="font-medium text-gray-900">${params[0].dataIndex}:00 - ${(params[0].dataIndex + 1) % 24}:00</div><div class="mt-1 text-gray-600">${params[0].value} questions</div></div>`,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: [8, 12],
          textStyle: { color: '#374151' },
        },
        grid: { left: '8%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
        xAxis: {
          type: 'category',
          data: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
          axisLabel: { interval: window.innerWidth < 768 ? 2 : 1, fontSize: window.innerWidth < 768 ? 10 : 11, color: '#6b7280' },
          axisTick: { alignWithLabel: true, lineStyle: { color: '#e5e7eb' } },
          axisLine: { lineStyle: { color: '#e5e7eb' } },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
          axisLabel: { fontSize: window.innerWidth < 768 ? 10 : 11, color: '#6b7280', formatter: (value: number) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value) },
        },
        series: [{
          name: 'Questions',
          type: 'bar',
          data: hourlyData,
          barWidth: '60%',
          itemStyle: { color: '#000000', borderRadius: [4, 4, 0, 0] },
          emphasis: { itemStyle: { color: '#333333' } },
        }],
      };
      this.hourlyActivityChart.setOption(option);
    }
  }

  getPeakHour(): string {
    if (!this.dashboardData?.usage_patterns?.hourly_distribution?.length) return 'N/A';
    const peakHourData = this.dashboardData.usage_patterns.hourly_distribution.reduce(
      (max, current) => (current.count > max.count ? current : max),
      this.dashboardData.usage_patterns.hourly_distribution[0]
    );
    return String(peakHourData.hour).padStart(2, '0');
  }

  getTopTopic(): string {
    if (!this.dashboardData?.topic_clusters?.clusters?.length) return 'N/A';
    const topCluster = this.dashboardData.topic_clusters.clusters.reduce(
      (max, curr) => (curr.question_count > max.question_count ? curr : max),
      this.dashboardData.topic_clusters.clusters[0]
    );
    return topCluster.topic_terms[0] || 'N/A';
  }

  getTrendClass(count: number): string {
    if (count > 10) return 'text-green-500';
    if (count > 5) return 'text-yellow-500';
    return 'text-gray-500';
  }

  getTrendIcon(count: number): string {
    if (count > 10) return '↑';
    if (count > 5) return '→';
    return '↓';
  }

  getCircumference(): number { 
    return 2 * Math.PI * 68; 
  }

  getDashOffset(rate: number): number { 
    return this.getCircumference() - (rate / 100) * this.getCircumference(); 
  }

  getSatisfactionColor(rate: number): string { 
    return rate >= 70 ? '#22c55e' : rate >= 40 ? '#f59e0b' : '#ef4444'; 
  }

  getSatisfactionGradient(rate: number): string {
    return rate >= 70 ? 'from-green-500 to-green-600 bg-clip-text text-transparent' : 
           rate >= 40 ? 'from-amber-500 to-amber-600 bg-clip-text text-transparent' : 
                       'from-red-500 to-red-600 bg-clip-text text-transparent';
  }

  getNeutralRatings(): number {
    const total = this.dashboardData?.sentiment_analytics?.total_ratings || 0;
    const positive = this.dashboardData?.sentiment_analytics?.positive_ratings || 0;
    const negative = this.dashboardData?.sentiment_analytics?.negative_ratings || 0;
    return total - (positive + negative);
  }

  exportData(): void {
    if (!this.dashboardData) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      timeframe: `Last ${this.timeframeDays} Days`,
      metrics: {
        total_questions: this.dashboardData.common_questions.total_questions,
        satisfaction_rate: this.dashboardData.sentiment_analytics.satisfaction_rate,
        positive_ratings: this.dashboardData.sentiment_analytics.positive_ratings,
        negative_ratings: this.dashboardData.sentiment_analytics.negative_ratings
      },
      top_questions: this.dashboardData.common_questions.top_questions,
      topic_clusters: this.dashboardData.topic_clusters.clusters,
      daily_trends: this.dashboardData.usage_patterns.daily_trends,
      hourly_distribution: this.dashboardData.usage_patterns.hourly_distribution,
      sentiment_details: this.dashboardData.sentiment_analytics.detail_records
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `analytics-dashboard-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}