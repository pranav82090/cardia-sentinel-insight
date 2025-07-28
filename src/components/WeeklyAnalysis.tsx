import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Heart,
  Shield,
  Brain,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  BarChart3,
  Clock,
  Zap,
  Award,
  FileText,
  Download
} from "lucide-react";

interface HeartRecording {
  id: string;
  recorded_at: string;
  heart_rate_avg: number;
  heart_rate_min: number;
  heart_rate_max: number;
  attack_risk: number;
  stress_level: string | null;
  stress_score: number | null;
  condition: string;
  model_accuracy: number | null;
}

interface WeeklyAnalysisProps {
  recordings: HeartRecording[];
}

interface DailyData {
  date: Date;
  heartRate: number;
  heartRateMin: number;
  heartRateMax: number;
  risk: number;
  stressScore: number;
  recordingCount: number;
  hasData: boolean;
  conditions: string[];
  averageAccuracy: number;
}

interface WeeklyStats {
  dailyData: DailyData[];
  avgHeartRate: number;
  avgRisk: number;
  recordingFrequency: number;
  heartRateTrend: string;
  riskTrend: string;
  mostCommonStress: string;
  conditionHealth: number;
  totalRecordings: number;
  riskDistribution: { level: string; count: number; percentage: number }[];
  streakDays: number;
  improvementScore: number;
  consistencyScore: number;
  heartRateVariability: number;
  weeklyGoals: {
    recordingTarget: boolean;
    riskReduction: boolean;
    stressManagement: boolean;
    consistency: boolean;
  };
}

const WeeklyAnalysis = ({ recordings }: WeeklyAnalysisProps) => {
  const [weeklyData, setWeeklyData] = useState<WeeklyStats | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  useEffect(() => {
    if (recordings.length > 0) {
      analyzeWeeklyData(recordings);
    }
  }, [recordings]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const analyzeWeeklyData = (data: HeartRecording[]) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filter recordings from last 7 days
    const weeklyRecordings = data.filter(recording => 
      new Date(recording.recorded_at) >= sevenDaysAgo
    );

    if (weeklyRecordings.length === 0) {
      setWeeklyData(null);
      return;
    }

    // Calculate daily averages with enhanced metrics
    const dailyData: DailyData[] = [];
    let streakDays = 0;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayRecordings = weeklyRecordings.filter(r => {
        const recordingDate = new Date(r.recorded_at);
        return recordingDate >= dayStart && recordingDate <= dayEnd;
      });

      if (dayRecordings.length > 0) {
        const avgHeartRate = dayRecordings.reduce((sum, r) => sum + r.heart_rate_avg, 0) / dayRecordings.length;
        const avgHeartRateMin = dayRecordings.reduce((sum, r) => sum + r.heart_rate_min, 0) / dayRecordings.length;
        const avgHeartRateMax = dayRecordings.reduce((sum, r) => sum + r.heart_rate_max, 0) / dayRecordings.length;
        const avgRisk = dayRecordings.reduce((sum, r) => sum + r.attack_risk, 0) / dayRecordings.length;
        const avgStress = dayRecordings.filter(r => r.stress_score).reduce((sum, r) => sum + (r.stress_score || 0), 0) / dayRecordings.filter(r => r.stress_score).length || 0;
        const avgAccuracy = dayRecordings.reduce((sum, r) => sum + (r.model_accuracy || 96), 0) / dayRecordings.length;
        
        dailyData.push({
          date: dayStart,
          heartRate: Math.round(avgHeartRate),
          heartRateMin: Math.round(avgHeartRateMin),
          heartRateMax: Math.round(avgHeartRateMax),
          risk: Math.round(avgRisk),
          stressScore: Math.round(avgStress),
          recordingCount: dayRecordings.length,
          hasData: true,
          conditions: dayRecordings.map(r => r.condition),
          averageAccuracy: Math.round(avgAccuracy)
        });
        
        streakDays++;
      } else {
        dailyData.push({
          date: dayStart,
          heartRate: 0,
          heartRateMin: 0,
          heartRateMax: 0,
          risk: 0,
          stressScore: 0,
          recordingCount: 0,
          hasData: false,
          conditions: [],
          averageAccuracy: 0
        });
        if (i !== 0) streakDays = 0; // Reset streak unless it's today
      }
    }

    // Advanced trend analysis
    const dataWithValues = dailyData.filter(d => d.hasData);
    let heartRateTrend = 'stable';
    let riskTrend = 'stable';

    if (dataWithValues.length >= 3) {
      // Use linear regression for more accurate trend detection
      const heartRateSlope = calculateSlope(dataWithValues.map((d, i) => [i, d.heartRate]));
      const riskSlope = calculateSlope(dataWithValues.map((d, i) => [i, d.risk]));
      
      if (heartRateSlope > 2) heartRateTrend = 'increasing';
      else if (heartRateSlope < -2) heartRateTrend = 'decreasing';
      
      if (riskSlope > 3) riskTrend = 'increasing';
      else if (riskSlope < -3) riskTrend = 'decreasing';
    }

    // Calculate heart rate variability
    const heartRates = dataWithValues.map(d => d.heartRate);
    const hrv = heartRates.length > 1 ? calculateStandardDeviation(heartRates) : 0;

    // Risk distribution analysis
    const riskDistribution = [
      { level: 'Low (1-10%)', count: 0, percentage: 0 },
      { level: 'Moderate (11-19%)', count: 0, percentage: 0 },
      { level: 'Danger (20%+)', count: 0, percentage: 0 }
    ];

    weeklyRecordings.forEach(r => {
      if (r.attack_risk <= 10) riskDistribution[0].count++;
      else if (r.attack_risk <= 19) riskDistribution[1].count++;
      else riskDistribution[2].count++;
    });

    riskDistribution.forEach(item => {
      item.percentage = Math.round((item.count / weeklyRecordings.length) * 100);
    });

    // Calculate scores
    const avgHeartRate = Math.round(weeklyRecordings.reduce((sum, r) => sum + r.heart_rate_avg, 0) / weeklyRecordings.length);
    const avgRisk = Math.round(weeklyRecordings.reduce((sum, r) => sum + r.attack_risk, 0) / weeklyRecordings.length);
    const recordingFrequency = weeklyRecordings.length;
    
    // Improvement score (based on trend improvements)
    let improvementScore = 50; // Base score
    if (heartRateTrend === 'stable') improvementScore += 20;
    if (riskTrend === 'decreasing') improvementScore += 30;
    if (streakDays >= 5) improvementScore += 20;
    if (avgRisk <= 10) improvementScore += 20;
    improvementScore = Math.min(100, improvementScore);

    // Consistency score
    const consistencyScore = Math.min(100, (recordingFrequency / 7) * 100);

    // Stress level analysis
    const stressLevels = weeklyRecordings.filter(r => r.stress_level).map(r => r.stress_level);
    const mostCommonStress = stressLevels.length > 0 ? 
      stressLevels.sort((a, b) => 
        stressLevels.filter(v => v === a).length - stressLevels.filter(v => v === b).length
      ).pop() : 'Normal';

    // Condition analysis
    const conditions = weeklyRecordings.map(r => r.condition);
    const normalCount = conditions.filter(c => c === 'Normal').length;
    const conditionHealth = Math.round((normalCount / conditions.length) * 100);

    // Weekly goals assessment
    const weeklyGoals = {
      recordingTarget: recordingFrequency >= 5, // At least 5 recordings per week
      riskReduction: avgRisk <= 15 || riskTrend === 'decreasing',
      stressManagement: mostCommonStress !== 'High',
      consistency: consistencyScore >= 70
    };

    setWeeklyData({
      dailyData,
      avgHeartRate,
      avgRisk,
      recordingFrequency,
      heartRateTrend,
      riskTrend,
      mostCommonStress: mostCommonStress || 'Normal',
      conditionHealth,
      totalRecordings: weeklyRecordings.length,
      riskDistribution,
      streakDays,
      improvementScore,
      consistencyScore,
      heartRateVariability: Math.round(hrv),
      weeklyGoals
    });
  };

  const calculateSlope = (points: number[][]) => {
    const n = points.length;
    const sumX = points.reduce((sum, point) => sum + point[0], 0);
    const sumY = points.reduce((sum, point) => sum + point[1], 0);
    const sumXY = points.reduce((sum, point) => sum + point[0] * point[1], 0);
    const sumXX = points.reduce((sum, point) => sum + point[0] * point[0], 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  };

  const calculateStandardDeviation = (values: number[]) => {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  };

  const getTrendIcon = (trend: string, isRisk: boolean = false) => {
    switch (trend) {
      case 'increasing': 
        return isRisk ? 
          <TrendingUp className="h-4 w-4 text-critical" /> : 
          <TrendingUp className="h-4 w-4 text-warning" />;
      case 'decreasing': 
        return <TrendingDown className="h-4 w-4 text-success" />;
      default: 
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string, isRisk: boolean = false) => {
    if (trend === 'stable') return 'text-muted-foreground';
    if (isRisk) {
      return trend === 'increasing' ? 'text-critical' : 'text-success';
    } else {
      return trend === 'increasing' ? 'text-warning' : 'text-success';
    }
  };

  const getRiskLevel = (risk: number) => {
    if (risk <= 10) return "Low";
    if (risk <= 19) return "Moderate";
    return "High";
  };

  const getAvgRiskLevel = (risk: number) => {
    if (risk <= 10) return "Low";
    if (risk <= 19) return "Moderate";
    return "High";
  };

  const getRiskLevelInfo = (risk: number) => {
    if (risk <= 10) return { level: "Low", color: "success", description: "Minimal risk" };
    if (risk <= 19) return { level: "Moderate", color: "warning", description: "Moderate risk" };
    return { level: "Danger", color: "critical", description: "High risk" };
  };

  const getHealthScore = () => {
    if (!weeklyData) return 0;
    return Math.round((weeklyData.improvementScore + weeklyData.consistencyScore + weeklyData.conditionHealth) / 3);
  };

  const generateRecommendations = () => {
    if (!weeklyData) return [];

    const recommendations = [];

    if (weeklyData.recordingFrequency < 5) {
      recommendations.push({
        type: 'info',
        icon: Target,
        title: 'Increase Recording Frequency',
        message: `Record daily for better insights. Current: ${weeklyData.recordingFrequency}/7 days. Target: 5+ recordings per week.`,
        priority: 'high'
      });
    }

    if (weeklyData.riskTrend === 'increasing') {
      recommendations.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Rising Risk Trend Detected',
        message: 'Your cardiovascular risk has been increasing. Consider lifestyle changes and consult your healthcare provider.',
        priority: 'critical'
      });
    }

    if (weeklyData.heartRateVariability > 20) {
      recommendations.push({
        type: 'warning',
        icon: Heart,
        title: 'High Heart Rate Variability',
        message: `HRV: ${weeklyData.heartRateVariability} BPM. This may indicate stress or irregular patterns. Monitor closely.`,
        priority: 'medium'
      });
    }

    if (weeklyData.streakDays >= 7) {
      recommendations.push({
        type: 'success',
        icon: Award,
        title: 'Perfect Recording Streak!',
        message: `Amazing! You've recorded for ${weeklyData.streakDays} consecutive days. Keep up the excellent monitoring habits.`,
        priority: 'low'
      });
    }

    if (weeklyData.conditionHealth < 70) {
      recommendations.push({
        type: 'warning',
        icon: Shield,
        title: 'Abnormal Conditions Detected',
        message: `Only ${weeklyData.conditionHealth}% of recordings show normal conditions. Consider medical consultation.`,
        priority: 'high'
      });
    }

    if (weeklyData.mostCommonStress === 'High') {
      recommendations.push({
        type: 'warning',
        icon: Brain,
        title: 'Persistent High Stress',
        message: 'High stress levels detected frequently. Try relaxation techniques, exercise, or stress management programs.',
        priority: 'medium'
      });
    }

    if (weeklyData.improvementScore >= 80) {
      recommendations.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Excellent Health Progress',
        message: `Health score: ${weeklyData.improvementScore}/100. Your cardiovascular health is showing great improvement!`,
        priority: 'low'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  };

  const exportWeeklyReport = () => {
    if (!weeklyData) return;
    
    const report = {
      weeklyAnalysis: {
        generatedAt: new Date().toISOString(),
        period: '7 days',
        totalRecordings: weeklyData.totalRecordings,
        avgHeartRate: weeklyData.avgHeartRate,
        avgRisk: weeklyData.avgRisk,
        healthScore: getHealthScore(),
        improvementScore: weeklyData.improvementScore,
        consistencyScore: weeklyData.consistencyScore,
        riskDistribution: weeklyData.riskDistribution,
        recommendations: generateRecommendations()
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heart-health-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!weeklyData) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            7-Day Heart Health Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-3">No Weekly Data Available</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start your heart health journey by recording daily for at least 3 days to unlock comprehensive weekly analysis and insights.
            </p>
            <div className="space-y-2">
              <Badge variant="outline" className="mb-4">Need at least 1 recording in the last 7 days</Badge>
              <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Daily tracking recommended
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Advanced analytics
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskInfo = getRiskLevel(weeklyData.avgRisk);
  const recommendations = generateRecommendations();
  const healthScore = getHealthScore();

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Health Score */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-success/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">7-Day Heart Health Analysis</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Advanced AI-powered cardiac monitoring • {weeklyData.totalRecordings} recordings analyzed
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{healthScore}</div>
              <div className="text-xs text-muted-foreground">Health Score</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportWeeklyReport}
                className="mt-2 gap-1"
              >
                <Download className="h-3 w-3" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-4 text-center">
            <Heart className="h-6 w-6 text-success mx-auto mb-2" />
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-2xl font-bold text-foreground">{weeklyData.avgHeartRate}</span>
              {getTrendIcon(weeklyData.heartRateTrend)}
            </div>
            <p className="text-xs text-muted-foreground">Avg Heart Rate</p>
            <p className={`text-xs ${getTrendColor(weeklyData.heartRateTrend)}`}>
              {weeklyData.heartRateTrend}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 text-warning mx-auto mb-2" />
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-2xl font-bold text-foreground">{getAvgRiskLevel(weeklyData.avgRisk)}</span>
              {getTrendIcon(weeklyData.riskTrend, true)}
            </div>
            <p className="text-xs text-muted-foreground">Avg Risk</p>
            <Badge variant="outline" className={`text-xs text-${getRiskLevelInfo(weeklyData.avgRisk).color}`}>
              {getRiskLevelInfo(weeklyData.avgRisk).level}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4 text-center">
            <Brain className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-lg font-bold text-foreground mb-1">{weeklyData.mostCommonStress}</div>
            <p className="text-xs text-muted-foreground">Stress Level</p>
            <p className="text-xs text-muted-foreground">Most Common</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-4 text-center">
            <Activity className="h-6 w-6 text-accent-foreground mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground mb-1">{weeklyData.conditionHealth}%</div>
            <p className="text-xs text-muted-foreground">Normal Readings</p>
            <p className="text-xs text-muted-foreground">Health Status</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-secondary/10 to-secondary/5">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 text-secondary-foreground mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground mb-1">{weeklyData.streakDays}</div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
            <p className="text-xs text-muted-foreground">Consistency</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Progress Visualization */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Daily Recording Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.dailyData.map((day, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {day.date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-muted-foreground">
                      {day.recordingCount} recording{day.recordingCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Progress 
                    value={day.hasData ? 100 : 0} 
                    className="h-3"
                  />
                  {day.hasData && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>💓 {day.heartRate} BPM ({day.heartRateMin}-{day.heartRateMax})</span>
                      <span>⚠️ {getRiskLevel(day.risk)} risk</span>
                      <span>🎯 {day.averageAccuracy}% accuracy</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution & Goals */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Risk Analysis & Weekly Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Risk Distribution */}
              <div>
                <h4 className="font-medium mb-3">Risk Distribution</h4>
                <div className="space-y-2">
                  {weeklyData.riskDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.level}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              index === 0 ? 'bg-success' : 
                              index === 1 ? 'bg-warning' : 'bg-critical'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Goals */}
              <div>
                <h4 className="font-medium mb-3">Weekly Goals Achievement</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg text-center ${
                    weeklyData.weeklyGoals.recordingTarget ? 'bg-success/10' : 'bg-warning/10'
                  }`}>
                    <div className={`text-lg ${
                      weeklyData.weeklyGoals.recordingTarget ? 'text-success' : 'text-warning'
                    }`}>
                      {weeklyData.weeklyGoals.recordingTarget ? '✓' : '○'}
                    </div>
                    <p className="text-xs">Recording Target</p>
                  </div>
                  
                  <div className={`p-3 rounded-lg text-center ${
                    weeklyData.weeklyGoals.riskReduction ? 'bg-success/10' : 'bg-warning/10'
                  }`}>
                    <div className={`text-lg ${
                      weeklyData.weeklyGoals.riskReduction ? 'text-success' : 'text-warning'
                    }`}>
                      {weeklyData.weeklyGoals.riskReduction ? '✓' : '○'}
                    </div>
                    <p className="text-xs">Risk Management</p>
                  </div>
                  
                  <div className={`p-3 rounded-lg text-center ${
                    weeklyData.weeklyGoals.stressManagement ? 'bg-success/10' : 'bg-warning/10'
                  }`}>
                    <div className={`text-lg ${
                      weeklyData.weeklyGoals.stressManagement ? 'text-success' : 'text-warning'
                    }`}>
                      {weeklyData.weeklyGoals.stressManagement ? '✓' : '○'}
                    </div>
                    <p className="text-xs">Stress Control</p>
                  </div>
                  
                  <div className={`p-3 rounded-lg text-center ${
                    weeklyData.weeklyGoals.consistency ? 'bg-success/10' : 'bg-warning/10'
                  }`}>
                    <div className={`text-lg ${
                      weeklyData.weeklyGoals.consistency ? 'text-success' : 'text-warning'
                    }`}>
                      {weeklyData.weeklyGoals.consistency ? '✓' : '○'}
                    </div>
                    <p className="text-xs">Consistency</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Metrics */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Advanced Cardiovascular Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="text-2xl font-bold text-primary mb-1">{weeklyData.improvementScore}/100</div>
              <p className="text-sm text-muted-foreground">Improvement Score</p>
              <Progress value={weeklyData.improvementScore} className="mt-2" />
            </div>
            
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5">
              <div className="text-2xl font-bold text-success mb-1">{weeklyData.consistencyScore}/100</div>
              <p className="text-sm text-muted-foreground">Consistency Score</p>
              <Progress value={weeklyData.consistencyScore} className="mt-2" />
            </div>
            
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-warning/10 to-warning/5">
              <div className="text-2xl font-bold text-warning mb-1">{weeklyData.heartRateVariability}</div>
              <p className="text-sm text-muted-foreground">Heart Rate Variability</p>
              <p className="text-xs text-muted-foreground mt-1">Lower is generally better</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI-Powered Health Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.type === 'warning' || rec.priority === 'critical' ? 'bg-warning/5 border-warning border-l-warning' :
                    rec.type === 'success' ? 'bg-success/5 border-success border-l-success' :
                    'bg-primary/5 border-primary border-l-primary'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      rec.type === 'warning' || rec.priority === 'critical' ? 'bg-warning/10' :
                      rec.type === 'success' ? 'bg-success/10' :
                      'bg-primary/10'
                    }`}>
                      <rec.icon className={`h-5 w-5 ${
                        rec.type === 'warning' || rec.priority === 'critical' ? 'text-warning' :
                        rec.type === 'success' ? 'text-success' :
                        'text-primary'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{rec.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            rec.priority === 'critical' ? 'text-critical border-critical' :
                            rec.priority === 'high' ? 'text-warning border-warning' :
                            rec.priority === 'medium' ? 'text-primary border-primary' :
                            'text-muted-foreground'
                          }`}
                        >
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeeklyAnalysis;