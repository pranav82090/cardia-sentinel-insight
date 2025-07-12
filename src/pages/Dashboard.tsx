import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Activity, 
  Brain, 
  TrendingUp, 
  Camera, 
  Mic,
  Calendar,
  Shield,
  Eye,
  MessageCircle,
  BarChart3
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import RecordingDetailModal from "@/components/RecordingDetailModal";
import HealthChatbot from "@/components/HealthChatbot";
import WeeklyAnalysis from "@/components/WeeklyAnalysis";

interface HeartRecording {
  id: string;
  recorded_at: string;
  heart_rate_avg: number;
  heart_rate_min: number;
  heart_rate_max: number;
  attack_risk: number;
  condition: string;
  stress_level: string | null;
  stress_score: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  audio_data: any;
  model_accuracy: number | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [recordings, setRecordings] = useState<HeartRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState<HeartRecording | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await fetchRecordings(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchRecordings(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchRecordings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('heart_recordings')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      setRecordings(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching recordings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecentRecording = () => recordings[0];
  const getAverageHeartRate = () => {
    if (recordings.length === 0) return 0;
    return Math.round(recordings.reduce((sum, r) => sum + r.heart_rate_avg, 0) / recordings.length);
  };
  const getAverageRisk = () => {
    if (recordings.length === 0) return 0;
    return Math.round(recordings.reduce((sum, r) => sum + r.attack_risk, 0) / recordings.length);
  };

  const getRiskLevel = (risk: number) => {
    if (risk < 20) return { level: "Low", color: "success" };
    if (risk < 50) return { level: "Moderate", color: "warning" };
    return { level: "High", color: "critical" };
  };

  const handleViewRecording = (recording: HeartRecording) => {
    setSelectedRecording(recording);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Heart className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your health dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const recentRecording = getRecentRecording();
  const avgHeartRate = getAverageHeartRate();
  const avgRisk = getAverageRisk();
  const riskInfo = getRiskLevel(avgRisk);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
            Health Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Professional cardiovascular health monitoring.
          </p>
        </div>

        {/* Quick Actions - Glassmorphism Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate("/recording")}
            className="glass-card glass-hover h-20 rounded-2xl flex items-center justify-center gap-4 text-foreground font-medium text-lg group"
          >
            <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <span>Record Heart Sounds</span>
          </button>
          <button
            onClick={() => navigate("/camera-monitoring")}
            className="glass-card glass-hover h-20 rounded-2xl flex items-center justify-center gap-4 text-foreground font-medium text-lg group"
          >
            <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <span>Camera BPM Monitor</span>
          </button>
        </div>

        {/* Health Metrics Overview - Glassmorphism Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="glass-card glass-hover rounded-2xl p-4 sm:p-6">
            <div className="text-center space-y-2">
              <div className="p-3 rounded-xl bg-success/20 w-fit mx-auto">
                <Heart className="h-6 w-6 text-success" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Avg Heart Rate</p>
              <p className="text-2xl font-bold text-foreground">{avgHeartRate}</p>
              <p className="text-xs text-muted-foreground">BPM</p>
            </div>
          </div>

          <div className="glass-card glass-hover rounded-2xl p-4 sm:p-6">
            <div className="text-center space-y-2">
              <div className="p-3 rounded-xl bg-primary/20 w-fit mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Risk Level</p>
              <p className="text-2xl font-bold text-foreground">{avgRisk}%</p>
              <Badge 
                variant="outline" 
                className={`text-${riskInfo.color} border-${riskInfo.color}/30 bg-${riskInfo.color}/10 text-xs mt-1`}
              >
                {riskInfo.level}
              </Badge>
            </div>
          </div>

          <div className="glass-card glass-hover rounded-2xl p-4 sm:p-6">
            <div className="text-center space-y-2">
              <div className="p-3 rounded-xl bg-warning/20 w-fit mx-auto">
                <Brain className="h-6 w-6 text-warning" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Stress Level</p>
              <p className="text-xl font-bold text-foreground truncate">
                {recentRecording?.stress_level || "Normal"}
              </p>
            </div>
          </div>

          <div className="glass-card glass-hover rounded-2xl p-4 sm:p-6">
            <div className="text-center space-y-2">
              <div className="p-3 rounded-xl bg-accent/20 w-fit mx-auto">
                <Activity className="h-6 w-6 text-accent-foreground" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Records</p>
              <p className="text-2xl font-bold text-foreground">{recordings.length}</p>
              <p className="text-xs text-muted-foreground">96% Accuracy</p>
            </div>
          </div>
        </div>

        {/* Main Content Tabs - Glassmorphism */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="w-full overflow-x-auto pb-2">
            <div className="glass-card rounded-2xl p-2 min-w-[320px]">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-transparent h-auto gap-2">
                <TabsTrigger 
                  value="overview" 
                  className="gap-2 text-sm px-4 py-3 bg-transparent data-[state=active]:bg-primary/20 data-[state=active]:text-foreground text-muted-foreground rounded-xl transition-all"
                >
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="recordings" 
                  className="gap-2 text-sm px-4 py-3 bg-transparent data-[state=active]:bg-primary/20 data-[state=active]:text-foreground text-muted-foreground rounded-xl transition-all"
                >
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Recordings</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analysis" 
                  className="gap-2 text-sm px-4 py-3 bg-transparent data-[state=active]:bg-primary/20 data-[state=active]:text-foreground text-muted-foreground rounded-xl transition-all"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analysis</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="chatbot" 
                  className="gap-2 text-sm px-4 py-3 bg-transparent data-[state=active]:bg-primary/20 data-[state=active]:text-foreground text-muted-foreground rounded-xl transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Assistant</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Recent Health Recordings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recordings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto mb-4">
                      <Heart className="h-16 w-16 text-primary/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No recordings yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start monitoring your heart health by creating your first recording.
                    </p>
                    <button
                      onClick={() => navigate("/recording")}
                      className="glass-card glass-hover px-6 py-3 rounded-xl flex items-center gap-2 mx-auto text-foreground font-medium"
                    >
                      <Mic className="h-4 w-4 text-primary" />
                      Create First Recording
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recordings.slice(0, 3).map((recording) => (
                      <div
                        key={recording.id}
                        className="glass-card glass-hover rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-xl bg-primary/20">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {new Date(recording.recorded_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {recording.condition} • {recording.heart_rate_avg} BPM • 96% Accuracy
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className={`text-${getRiskLevel(recording.attack_risk).color} border-${getRiskLevel(recording.attack_risk).color}/30 bg-${getRiskLevel(recording.attack_risk).color}/10 text-xs`}
                          >
                            {recording.attack_risk}% Risk
                          </Badge>
                          <button
                            onClick={() => handleViewRecording(recording)}
                            className="glass-card glass-hover px-4 py-2 rounded-lg flex items-center gap-2 text-foreground text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>
          </TabsContent>

          {/* All Recordings Tab */}
          <TabsContent value="recordings" className="space-y-6">
            <Card className="border border-border shadow-medical bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  All Health Recordings
                  <Badge variant="outline" className="ml-auto border-primary/20">
                    {recordings.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recordings.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No recordings yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start monitoring your heart health by creating your first recording.
                    </p>
                    <Button
                      onClick={() => navigate("/recording")}
                      variant="cardiac"
                      className="gap-2 shadow-medical"
                    >
                      <Mic className="h-4 w-4" />
                      Create First Recording
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {recordings.map((recording) => (
                      <div
                        key={recording.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors gap-3 sm:gap-4 border border-border/50"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground text-sm sm:text-base">
                              {new Date(recording.recorded_at).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {recording.condition} • {recording.heart_rate_avg} BPM • {new Date(recording.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 96% Accuracy
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 shrink-0">
                          <div className="flex flex-col sm:text-right">
                            <Badge 
                              variant="outline" 
                              className={`text-${getRiskLevel(recording.attack_risk).color} border-${getRiskLevel(recording.attack_risk).color} mb-1 text-xs w-fit`}
                            >
                              {recording.attack_risk}% Risk
                            </Badge>
                          </div>
                          <Button
                            onClick={() => handleViewRecording(recording)}
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto shadow-sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="sm:hidden">View</span>
                            <span className="hidden sm:inline">View Report</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 7-Day Analysis Tab */}
          <TabsContent value="analysis">
            <WeeklyAnalysis recordings={recordings} />
          </TabsContent>

          {/* Health Chatbot Tab */}
          <TabsContent value="chatbot">
            <HealthChatbot userRecordings={recordings} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Recording Detail Modal */}
      <RecordingDetailModal
        recording={selectedRecording}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRecording(null);
        }}
      />
    </div>
  );
};

export default Dashboard;