import { Component, OnInit, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import * as d3 from 'd3';
import * as echarts from 'echarts';
import { format } from 'date-fns';

// Keep the original interface as is since it matches the API
interface DailyTrend {
  date: string;
  count: number;
}

interface HourlyDistribution {
  hour: number;
  count: number;
}

// Create a new interface for the processed question data
interface ProcessedQuestion {
  question: string;
  count: number;
  last_asked: string;
  latest_answer: string;
  trend: 'up' | 'down' | 'neutral';
}

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
    daily_trends: DailyTrend[];
    hourly_distribution: HourlyDistribution[];
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

type TrendDirection = 'up' | 'down' | 'neutral';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css'],
})
export class AnalyticsDashboardComponent implements OnInit, AfterViewInit {
  dashboardData: DashboardData | null = null;
  processedQuestions: ProcessedQuestion[] = [];
  chatbotId: string = '';
  isBrowser: boolean;
  private resizeObserver: ResizeObserver | null = null;
  private chartContainer: HTMLElement | null = null;
  private charts: { [key: string]: echarts.ECharts } = {};
  private cleanupFunctions: (() => void)[] = [];
  @ViewChild('questionTrendsChart') questionTrendsChartElement!: ElementRef;
  @ViewChild('topicDistributionChart') topicDistributionChartElement!: ElementRef;
  @ViewChild('hourlyActivityChart') hourlyActivityChartElement!: ElementRef;
  
  private questionTrendsChart: echarts.ECharts | null = null;
  private topicDistributionChart: echarts.ECharts | null = null;
  private hourlyActivityChart: echarts.ECharts | null = null;

  constructor(
    private ApiService: ApiService,
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
      this.setupResizeObserver();
      this.initializeCharts();
      
      // Use ResizeObserver for better performance
      const resizeObserver = new ResizeObserver(() => {
        Object.values(this.charts).forEach(chart => chart.resize());
      });
      
      document.querySelectorAll('.chart-container').forEach(el => {
        resizeObserver.observe(el);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.cleanupFunctions) {
      this.cleanupFunctions.forEach(cleanup => cleanup());
    }
    if (this.questionTrendsChart) {
      this.questionTrendsChart.dispose();
    }
    if (this.topicDistributionChart) {
      this.topicDistributionChart.dispose();
    }
    if (this.hourlyActivityChart) {
      this.hourlyActivityChart.dispose();
    }
  }

  private setupResizeObserver(): void {
    this.chartContainer = document.getElementById('dailyTrendsChart');
    if (this.chartContainer && window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(entries => {
        if (entries.length > 0 && this.dashboardData) {
          this.createDailyTrendsChart(this.dashboardData.usage_patterns.daily_trends);
          this.createHourlyDistributionChart(this.dashboardData.usage_patterns.hourly_distribution);
        }
      });
      this.resizeObserver.observe(this.chartContainer);
    }
  }

  private loadDashboardData() {
    this.ApiService.getAnalyticsDashboard(this.chatbotId).subscribe({
      next: (data) => {
        this.dashboardData = data;
        if (data.common_questions?.top_questions) {
          this.processedQuestions = data.common_questions.top_questions.map(question => {
            const daysSinceAsked = (new Date().getTime() - new Date(question.last_asked).getTime()) / (1000 * 60 * 60 * 24);
            
            let trend: 'up' | 'down' | 'neutral';
            if (daysSinceAsked < 1) {
              trend = 'up';
            } else if (daysSinceAsked < 3) {
              trend = 'neutral';
            } else {
              trend = 'down';
            }
            
            return { ...question, trend };
          });
        }
        if (this.isBrowser) {
          setTimeout(() => {
            this.reinitializeCharts();
          }, 0);
        }
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  private getTrendDirection(count: number): TrendDirection {
    if (count > 0) return 'up';
    if (count < 0) return 'down';
    return 'neutral';
  }

  getTrendClass(count: number): string {
    const trend = this.getTrendDirection(count);
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  getTrendIcon(count: number): string {
    const trend = this.getTrendDirection(count);
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  }

  initializeCharts(): void {
    if (!this.dashboardData) return;
    
    this.initializeQuestionTrendsChart();
    this.initializeTopicDistributionChart();
    this.initializeHourlyActivityChart();
  }

  private initializeQuestionTrendsChart() {
    if (this.questionTrendsChartElement) {
      this.questionTrendsChart = echarts.init(this.questionTrendsChartElement.nativeElement);
      
      // Transform the data into the format ECharts expects
      const trendsData = this.dashboardData?.usage_patterns?.daily_trends?.map(item => ([
        new Date(item.date).getTime(),
        item.count
      ])) || [];

      const option = {
        grid: {
          top: '5%',
          right: '3%',
          left: '3%',
          bottom: '15%', // Increased bottom margin for x-axis labels
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params: any) {
            const date = new Date(params[0].value[0]);
            return `${date.toLocaleDateString()}: ${params[0].value[1]} questions`;
          }
        },
        xAxis: {
          type: 'time',
          boundaryGap: false,
          axisLabel: {
            formatter: (value: number) => {
              return format(new Date(value), 'MMM d');
            },
            interval: 'auto',
            rotate: window.innerWidth < 768 ? 45 : 0, // Rotate labels on mobile
            fontSize: window.innerWidth < 768 ? 10 : 12
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: window.innerWidth < 768 ? 10 : 12
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: [{
          name: 'Daily Questions',
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          data: trendsData,
          lineStyle: {
            color: '#6366f1',
            width: window.innerWidth < 768 ? 2 : 3
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: 'rgba(99, 102, 241, 0.2)'
              }, {
                offset: 1,
                color: 'rgba(99, 102, 241, 0.01)'
              }]
            }
          }
        }]
      };

      this.questionTrendsChart.setOption(option);
    }
  }

  createDailyTrendsChart(data: DailyTrend[]): void {
    if (!data.length) return;

    const container = d3.select('#dailyTrendsChart');
    container.selectAll('*').remove();

    // Get the actual container width
    const containerElement = container.node() as HTMLElement;
    if (!containerElement) return;

    const containerWidth = containerElement.getBoundingClientRect().width || 600;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = Math.max(containerWidth - margin.left - margin.right, 0);
    const height = 400 - margin.top - margin.bottom;

    // Create SVG with proper viewBox and preserveAspectRatio
    const svg = container
      .append('svg')
      .attr('width', '100%')
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates and ensure they're valid
    const parseDate = d3.timeParse('%Y-%m-%d');
    const validData = data.filter(d => {
      const parsedDate = parseDate(d.date);
      return parsedDate !== null;
    });

    if (!validData.length) return;

    // Set up scales with proper domains
    const x = d3
      .scaleTime()
      .domain(d3.extent(validData, d => parseDate(d.date)) as [Date, Date])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(validData, d => d.count) || 0])
      .nice()
      .range([height, 0]);

    // Add X axis with proper formatting
    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(Math.max(width / 100, 5))
          .tickFormat(d3.timeFormat('%b %d') as any)
      );

    // Add Y axis
    svg
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

    // Create area with proper date parsing
    const area = d3
      .area<DailyTrend>()
      .x(d => x(parseDate(d.date) as Date))
      .y0(height)
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX);

    // Add the area
    svg
      .append('path')
      .datum(validData)
      .attr('class', 'area')
      .attr('fill', '#005ad5')
      .attr('opacity', 0.2)
      .attr('d', area);

    // Add the line
    const line = d3
      .line<DailyTrend>()
      .x(d => x(parseDate(d.date) as Date))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(validData)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', '#121ee9')
      .attr('stroke-width', 2)
      .attr('d', line);
  }

  createHourlyDistributionChart(data: HourlyDistribution[]): void {
    const container = d3.select('#hourlyDistributionChart');
    const containerWidth = (container.node() as HTMLElement)?.getBoundingClientRect().width || 250;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = containerWidth - margin.left - margin.right;
    // Reduced height for a more compact chart
    const height = 350 - margin.top - margin.bottom;

    // Clear any existing chart
    container.selectAll('*').remove();

    // Create SVG element with viewBox for responsiveness
    const svg = container
      .append('svg')
      .attr('viewBox', `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales with increased padding and alignment
    const x = d3
      .scaleBand()
      .domain(data.map((d: HourlyDistribution) => `${d.hour}:00`))
      .range([0, width])
      // Increased padding to make bars slimmer
      .padding(0.0);  // Increased from 0.2 to 0.6

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d: HourlyDistribution) => d.count) as number])
      .nice()
      .range([height, 0]);

    // Add X axis with rotated labels for better spacing
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Add Y axis
    svg
      .append('g')
      .call(d3.axisLeft(y));

    // Add bars with reduced width
    svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: HourlyDistribution) => {
        const xPos = x(`${d.hour}:00`) as number;
        // Optional: adjust bar position within band for even slimmer appearance
        return xPos + (x.bandwidth() * 0.1);
      })
      .attr('y', (d: HourlyDistribution) => y(d.count))
      // Reduce the width of bars by using a percentage of the bandwidth
      .attr('width', x.bandwidth() * 0.8)  // Use 80% of the available bandwidth
      .attr('height', (d: HourlyDistribution) => height - y(d.count))
      .attr('rx', 25)  // Reduced corner radius for slimmer bars
      .attr('ry', 25)
      .attr('fill', '#121ee9');
  }

  createSatisfactionArc(satisfactionRate: number): void {
    const container = d3.select('#satisfactionArc');
    
    // Clear any existing chart
    container.selectAll('*').remove();
    
    // Use smaller dimensions that match the actual arc size needed
    const size = 95; // Reduced base size
    const radius = size * 0.4; // Radius now takes up less of the total size
    const thickness = 5;
    
    // Calculate the actual space needed - just enough for the arc and text
    const margin = thickness + 10; // Small margin for padding
    const viewBoxSize = (radius + margin) * 1.5; // Total size with margin included
    
    // Create SVG element with precise viewBox
    const svg = container
      .append('svg')
      .attr('viewBox', `0 0 ${viewBoxSize} ${viewBoxSize}`)
      .attr('width', '55%')
      .attr('height', '50%')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${viewBoxSize/2},${viewBoxSize/2})`);
  
    // Background arc (full circle)
    const backgroundArc = d3
      .arc()
      .innerRadius(radius - thickness)
      .outerRadius(radius)
      .startAngle(0)
      .endAngle(2 * Math.PI)
      .cornerRadius(thickness / 2);
  
    svg
      .append('path')
      .attr('d', backgroundArc({} as any))
      .attr('fill', '#e0e0e0');
  
    // Foreground arc (animated satisfaction arc)
    const foregroundArc = d3
      .arc()
      .innerRadius(radius - thickness)
      .outerRadius(radius)
      .startAngle(0)
      .cornerRadius(thickness / 2);
  
    // Determine the color based on satisfactionRate
    let arcColor: string;
    if (satisfactionRate < 40) {
      arcColor = '#ff0000';
    } else if (satisfactionRate < 70) {
      arcColor = '#ffa500';
    } else {
      arcColor = '#00a80a';
    }
  
    const arcPath = svg
      .append('path')
      .attr('fill', arcColor)
      .attr('opacity', 0.8);
  
    // Animate the arc
    arcPath
      .transition()
      .duration(2000)
      .attrTween('d', () => {
        const interpolate = d3.interpolate(0, (satisfactionRate / 100) * 2 * Math.PI);
        return (t: number) => {
          foregroundArc.endAngle(interpolate(t));
          return foregroundArc({} as any) || '';
        };
      });
  
    // Add text in the center with adjusted size
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', `${radius * 0.3}px`) // Proportional font size
      .style('fill', arcColor)
      .text(`${satisfactionRate}%`);
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  private initializeTopicDistributionChart() {
    if (this.topicDistributionChartElement) {
      this.topicDistributionChart = echarts.init(this.topicDistributionChartElement.nativeElement);
      const option = {
        tooltip: {
          trigger: 'item'
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: this.dashboardData?.topic_clusters.clusters.map(cluster => ({
            value: cluster.question_count,
            name: cluster.topic_terms[0]
          })) || []
        }]
      };
      this.topicDistributionChart.setOption(option);
    }
  }

  private initializeHourlyActivityChart() {
    if (this.hourlyActivityChartElement) {
      this.hourlyActivityChart = echarts.init(this.hourlyActivityChartElement.nativeElement);
      
      // Create a 24-hour array with default values of 0
      const hourlyData = Array(24).fill(0);
      
      // Fill in the actual data
      this.dashboardData?.usage_patterns.hourly_distribution.forEach(item => {
        if (item.hour >= 0 && item.hour < 24) {
          hourlyData[item.hour] = item.count;
        }
      });

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params: any) => {
            const hour = params[0].dataIndex;
            const count = params[0].value;
            const nextHour = (hour + 1) % 24;
            const timeString = `${String(hour).padStart(2, '0')}:00 - ${String(nextHour).padStart(2, '0')}:00`;
            return `<div class="font-sans p-2">
              <div class="font-medium text-gray-900">${timeString}</div>
              <div class="mt-1 text-gray-600">${count} questions</div>
            </div>`;
          },
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          textStyle: {
            color: '#374151'
          },
          padding: [8, 12]
        },
        grid: {
          left: '8%',
          right: '4%',
          bottom: '12%',
          top: '8%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
          axisLabel: {
            interval: window.innerWidth < 768 ? 2 : 1,
            fontSize: window.innerWidth < 768 ? 10 : 11,
            color: '#6b7280',
            formatter: (value: string) => value.split(':')[0]
          },
          axisTick: {
            alignWithLabel: true,
            length: 4,
            lineStyle: {
              color: '#e5e7eb'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#e5e7eb'
            }
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              type: 'dashed'
            }
          },
          axisLabel: {
            fontSize: window.innerWidth < 768 ? 10 : 11,
            color: '#6b7280',
            formatter: (value: number) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}k`;
              }
              return value;
            }
          }
        },
        series: [{
          name: 'Questions',
          type: 'bar',
          data: hourlyData,
          barWidth: '60%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#4f46e5' },  // Indigo-600
              { offset: 1, color: '#6366f1' }   // Indigo-500
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#4338ca' }, // Indigo-700
                { offset: 1, color: '#4f46e5' }  // Indigo-600
              ])
            }
          }
        }]
      };

      this.hourlyActivityChart.setOption(option);

      // Handle resize
      const handleResize = () => {
        this.hourlyActivityChart?.resize();
        // Update label interval based on screen width
        const currentOption = this.hourlyActivityChart?.getOption();
        if (currentOption && currentOption['xAxis']) {
          const xAxis = currentOption['xAxis'] as any[];
          if (xAxis[0] && xAxis[0].axisLabel) {
            xAxis[0].axisLabel.interval = window.innerWidth < 768 ? 2 : 1;
            this.hourlyActivityChart?.setOption({
              ...currentOption,
              xAxis: xAxis
            });
          }
        }
      };

      window.addEventListener('resize', handleResize);
      this.cleanupFunctions.push(() => window.removeEventListener('resize', handleResize));
    }
  }

  getPeakHour(): string {
    if (!this.dashboardData?.usage_patterns?.hourly_distribution?.length) return 'N/A';

    const peakHourData = this.dashboardData.usage_patterns.hourly_distribution.reduce(
      (max, current) => current.count > max.count ? current : max,
      this.dashboardData.usage_patterns.hourly_distribution[0]
    );

    return `${String(peakHourData.hour).padStart(2, '0')}`;
  }

  private reinitializeCharts() {
    if (this.questionTrendsChart) {
      this.questionTrendsChart.dispose();
    }
    if (this.topicDistributionChart) {
      this.topicDistributionChart.dispose();
    }
    if (this.hourlyActivityChart) {
      this.hourlyActivityChart.dispose();
    }
    
    this.initializeCharts();
  }

  // Get the circle's circumference
  getCircumference(): number {
    return 2 * Math.PI * 68; // 68 is the radius of our circle
  }

  // Calculate the dash offset based on the satisfaction rate
  getDashOffset(rate: number): number {
    const circumference = this.getCircumference();
    return circumference - (rate / 100) * circumference;
  }

  // Get color based on satisfaction rate
  getSatisfactionColor(rate: number): string {
    if (rate >= 70) return '#22c55e'; // green-500
    if (rate >= 40) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  }

  // Get gradient classes based on satisfaction rate
  getSatisfactionGradient(rate: number): string {
    if (rate >= 70) {
      return 'from-green-500 to-green-600 bg-clip-text text-transparent';
    }
    if (rate >= 40) {
      return 'from-amber-500 to-amber-600 bg-clip-text text-transparent';
    }
    return 'from-red-500 to-red-600 bg-clip-text text-transparent';
  }

  // Get neutral ratings count
  getNeutralRatings(): number {
    const total = this.dashboardData?.sentiment_analytics?.total_ratings || 0;
    const positive = this.dashboardData?.sentiment_analytics?.positive_ratings || 0;
    const negative = this.dashboardData?.sentiment_analytics?.negative_ratings || 0;
    return total - (positive + negative);
  }
}
