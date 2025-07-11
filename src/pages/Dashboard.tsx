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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Health Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your latest cardiovascular health overview.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => navigate("/recording")}
            variant="cardiac"
            size="lg"
            className="h-16 gap-3 text-base"
          >
            <Mic className="h-6 w-6" />
            <span>Record Heart Sounds</span>
          </Button>
          <Button
            onClick={() => navigate("/camera-monitoring")}
            variant="medical"
            size="lg"
            className="h-16 gap-3 text-base"
          >
            <Camera className="h-6 w-6" />
            <span>Camera BPM Monitor</span>
          </Button>
        </div>

        {/* Health Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Heart Rate</p>
                  <p className="text-xl lg:text-2xl font-bold text-foreground">{avgHeartRate}</p>
                  <p className="text-xs text-muted-foreground">BPM</p>
                </div>
                <div className="p-2 lg:p-3 rounded-full bg-success/10">
                  <Heart className="h-5 w-5 lg:h-6 lg:w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl lg:text-2xl font-bold text-foreground">{avgRisk}%</p>
                    <Badge 
                      variant="outline" 
                      className={`text-${riskInfo.color} text-xs`}
                    >
                      {riskInfo.level}
                    </Badge>
                  </div>
                </div>
                <div className="p-2 lg:p-3 rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Stress Level</p>
                  <p className="text-lg lg:text-2xl font-bold text-foreground">
                    {recentRecording?.stress_level || "N/A"}
                  </p>
                </div>
                <div className="p-2 lg:p-3 rounded-full bg-warning/10">
                  <Brain className="h-5 w-5 lg:h-6 lg:w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Records</p>
                  <p className="text-xl lg:text-2xl font-bold text-foreground">{recordings.length}</p>
                </div>
                <div className="p-2 lg:p-3 rounded-full bg-accent/50">
                  <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 min-w-fit">
              <TabsTrigger value="overview" className="gap-2 text-sm">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="recordings" className="gap-2 text-sm">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Recordings</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-2 text-sm">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">7-Day Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="chatbot" className="gap-2 text-sm">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Health Assistant</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Recent Recordings Summary */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Recent Health Recordings
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
                      className="gap-2"
                    >
                      <Mic className="h-4 w-4" />
                      Create First Recording
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recordings.slice(0, 3).map((recording) => (
                      <div
                        key={recording.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-primary/10 shrink-0">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">
                              {new Date(recording.recorded_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {recording.condition} • {recording.heart_rate_avg} BPM
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:shrink-0">
                          <Badge 
                            variant="outline" 
                            className={`text-${getRiskLevel(recording.attack_risk).color} text-xs`}
                          >
                            {recording.attack_risk}% Risk
                          </Badge>
                          <Button
                            onClick={() => handleViewRecording(recording)}
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Recordings Tab */}
          <TabsContent value="recordings" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  All Health Recordings
                  <Badge variant="outline" className="ml-auto">
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
                      className="gap-2"
                    >
                      <Mic className="h-4 w-4" />
                      Create First Recording
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recordings.map((recording) => (
                      <div
                        key={recording.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {new Date(recording.recorded_at).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {recording.condition} • {recording.heart_rate_avg} BPM • {new Date(recording.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <Badge 
                              variant="outline" 
                              className={`text-${getRiskLevel(recording.attack_risk).color} mb-1`}
                            >
                              {recording.attack_risk}% Risk
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              Accuracy: {recording.model_accuracy || 95}%
                            </p>
                          </div>
                          <Button
                            onClick={() => handleViewRecording(recording)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Report
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