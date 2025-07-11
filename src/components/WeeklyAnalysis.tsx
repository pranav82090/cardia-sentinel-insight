import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Info
} from "lucide-react";

interface HeartRecording {
  id: string;
  recorded_at: string;
  heart_rate_avg: number;
  attack_risk: number;
  stress_level: string | null;
  condition: string;
}

interface WeeklyAnalysisProps {
  recordings: HeartRecording[];
}

const WeeklyAnalysis = ({ recordings }: WeeklyAnalysisProps) => {
  const [weeklyData, setWeeklyData] = useState<any>(null);

  useEffect(() => {
    if (recordings.length > 0) {
      analyzeWeeklyData(recordings);
    }
  }, [recordings]);

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

    // Calculate daily averages
    const dailyData = [];
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
        const avgRisk = dayRecordings.reduce((sum, r) => sum + r.attack_risk, 0) / dayRecordings.length;
        
        dailyData.push({
          date: dayStart,
          heartRate: Math.round(avgHeartRate),
          risk: Math.round(avgRisk),
          recordingCount: dayRecordings.length,
          hasData: true
        });
      } else {
        dailyData.push({
          date: dayStart,
          heartRate: 0,
          risk: 0,
          recordingCount: 0,
          hasData: false
        });
      }
    }

    // Calculate trends
    const dataWithValues = dailyData.filter(d => d.hasData);
    let heartRateTrend = 'stable';
    let riskTrend = 'stable';

    if (dataWithValues.length >= 2) {
      const firstHalf = dataWithValues.slice(0, Math.floor(dataWithValues.length / 2));
      const secondHalf = dataWithValues.slice(Math.floor(dataWithValues.length / 2));
      
      const firstAvgHR = firstHalf.reduce((sum, d) => sum + d.heartRate, 0) / firstHalf.length;
      const secondAvgHR = secondHalf.reduce((sum, d) => sum + d.heartRate, 0) / secondHalf.length;
      
      const firstAvgRisk = firstHalf.reduce((sum, d) => sum + d.risk, 0) / firstHalf.length;
      const secondAvgRisk = secondHalf.reduce((sum, d) => sum + d.risk, 0) / secondHalf.length;

      if (secondAvgHR > firstAvgHR + 5) heartRateTrend = 'increasing';
      else if (secondAvgHR < firstAvgHR - 5) heartRateTrend = 'decreasing';

      if (secondAvgRisk > firstAvgRisk + 10) riskTrend = 'increasing';
      else if (secondAvgRisk < firstAvgRisk - 10) riskTrend = 'decreasing';
    }

    // Calculate overall metrics
    const avgHeartRate = Math.round(weeklyRecordings.reduce((sum, r) => sum + r.heart_rate_avg, 0) / weeklyRecordings.length);
    const avgRisk = Math.round(weeklyRecordings.reduce((sum, r) => sum + r.attack_risk, 0) / weeklyRecordings.length);
    const recordingFrequency = weeklyRecordings.length;
    
    // Stress level analysis
    const stressLevels = weeklyRecordings.filter(r => r.stress_level).map(r => r.stress_level);
    const mostCommonStress = stressLevels.length > 0 ? 
      stressLevels.sort((a, b) => 
        stressLevels.filter(v => v === a).length - stressLevels.filter(v => v === b).length
      ).pop() : 'Normal';

    // Condition analysis
    const conditions = weeklyRecordings.map(r => r.condition);
    const normalCount = conditions.filter(c => c === 'Normal').length;
    const conditionHealth = (normalCount / conditions.length) * 100;

    setWeeklyData({
      dailyData,
      avgHeartRate,
      avgRisk,
      recordingFrequency,
      heartRateTrend,
      riskTrend,
      mostCommonStress,
      conditionHealth,
      totalRecordings: weeklyRecordings.length
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-critical" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-success" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
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
    if (risk < 20) return { level: "Low", color: "success" };
    if (risk < 50) return { level: "Moderate", color: "warning" };
    return { level: "High", color: "critical" };
  };

  const getRecommendations = () => {
    if (!weeklyData) return [];

    const recommendations = [];

    if (weeklyData.recordingFrequency < 3) {
      recommendations.push({
        type: 'info',
        icon: Info,
        title: 'Increase Recording Frequency',
        message: 'Record your heart sounds daily for more accurate weekly analysis and better trend detection.'
      });
    }

    if (weeklyData.riskTrend === 'increasing') {
      recommendations.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Rising Risk Trend',
        message: 'Your heart attack risk has been trending upward. Consider consulting with a healthcare provider.'
      });
    }

    if (weeklyData.heartRateTrend === 'increasing') {
      recommendations.push({
        type: 'warning',
        icon: Heart,
        title: 'Elevated Heart Rate',
        message: 'Your heart rate has been trending higher. Ensure adequate rest and consider stress management techniques.'
      });
    }

    if (weeklyData.conditionHealth > 80) {
      recommendations.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Good Heart Health',
        message: 'Your heart recordings show consistent normal conditions. Keep up the good work!'
      });
    }

    if (weeklyData.mostCommonStress === 'High') {
      recommendations.push({
        type: 'warning',
        icon: Brain,
        title: 'High Stress Levels',
        message: 'High stress has been detected frequently. Consider stress reduction activities like meditation or exercise.'
      });
    }

    return recommendations;
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
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Weekly Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Record your heart sounds daily for 7 days to see comprehensive weekly analysis.
            </p>
            <Badge variant="outline">Need at least 1 recording in the last 7 days</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskInfo = getRiskLevel(weeklyData.avgRisk);
  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            7-Day Heart Health Analysis
            <Badge variant="outline" className="ml-auto">
              {weeklyData.totalRecordings} recordings
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Weekly Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <Heart className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Avg Heart Rate</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-xl font-bold text-foreground">{weeklyData.avgHeartRate}</p>
                {getTrendIcon(weeklyData.heartRateTrend)}
              </div>
              <p className={`text-xs ${getTrendColor(weeklyData.heartRateTrend)}`}>
                {weeklyData.heartRateTrend}
              </p>
            </div>

            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-warning/10 to-warning/5">
              <Shield className="h-6 w-6 text-warning mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Avg Risk Level</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-xl font-bold text-foreground">{weeklyData.avgRisk}%</p>
                {getTrendIcon(weeklyData.riskTrend)}
              </div>
              <Badge variant="outline" className={`text-xs text-${riskInfo.color}`}>
                {riskInfo.level}
              </Badge>
            </div>

            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5">
              <Brain className="h-6 w-6 text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Stress Level</p>
              <p className="text-lg font-semibold text-foreground">{weeklyData.mostCommonStress}</p>
              <p className="text-xs text-muted-foreground">Most Common</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5">
              <Activity className="h-6 w-6 text-accent-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Heart Health</p>
              <p className="text-xl font-bold text-foreground">{Math.round(weeklyData.conditionHealth)}%</p>
              <p className="text-xs text-muted-foreground">Normal Readings</p>
            </div>
          </div>

          {/* Daily Progress */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Daily Recording Progress</h3>
            {weeklyData.dailyData.map((day: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm text-muted-foreground">
                  {day.date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1">
                  <Progress 
                    value={day.hasData ? 100 : 0} 
                    className="h-2"
                  />
                </div>
                <div className="w-32 text-right text-sm">
                  {day.hasData ? (
                    <span className="text-foreground">
                      {day.heartRate} BPM • {day.risk}% risk
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No recording</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Health Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    rec.type === 'warning' ? 'bg-warning/5 border-warning/20' :
                    rec.type === 'success' ? 'bg-success/5 border-success/20' :
                    'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <rec.icon className={`h-5 w-5 mt-0.5 ${
                      rec.type === 'warning' ? 'text-warning' :
                      rec.type === 'success' ? 'text-success' :
                      'text-primary'
                    }`} />
                    <div>
                      <h4 className="font-medium text-foreground mb-1">{rec.title}</h4>
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