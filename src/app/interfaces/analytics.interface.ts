export interface ProcessedAnalytics {
  questionTrends: {
    totalQuestions: number;
    dailyAverage: number;
    weeklyGrowth: number;
    topQuestions: Array<{
      question: string;
      count: number;
      trend: 'up' | 'down' | 'stable';
      percentageChange: number;
    }>;
  };
  userEngagement: {
    peakHours: number[];
    quietHours: number[];
    busyDays: string[];
    averageQuestionsPerDay: number;
  };
  satisfaction: {
    overall: number;
    trend: 'improving' | 'declining' | 'stable';
    recentFeedback: Array<{
      sentiment: string;
      timestamp: string;
    }>;
  };
  topicInsights: {
    emergingTopics: string[];
    decliningTopics: string[];
    topicDistribution: Array<{
      topic: string;
      percentage: number;
    }>;
  };
} 