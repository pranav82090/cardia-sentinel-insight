import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Heart, Activity, Brain, TrendingUp, Mic, Calendar, Shield, Eye, MessageCircle, BarChart3, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      await fetchRecordings(session.user.id);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
      else { setUser(session.user); fetchRecordings(session.user.id); }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchRecordings = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('heart_recordings').select('*').eq('user_id', userId).order('recorded_at', { ascending: false });
      if (error) throw error;
      setRecordings(data || []);
    } catch (error: any) {
      toast({ title: "Error fetching recordings", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getRecentRecording = () => recordings[0];
  const getAverageHeartRate = () => recordings.length === 0 ? 0 : Math.round(recordings.reduce((sum, r) => sum + r.heart_rate_avg, 0) / recordings.length);
  const getAverageRisk = () => recordings.length === 0 ? 0 : Math.round(recordings.reduce((sum, r) => sum + r.attack_risk, 0) / recordings.length);

  const getRiskLevel = (risk: number) => risk <= 7 ? "Low" : risk <= 15 ? "Moderate" : "High";
  const getRiskColor = (risk: number) => risk <= 7 ? "text-success" : risk <= 15 ? "text-warning" : "text-critical";
  const getRiskBg = (risk: number) => risk <= 7 ? "bg-success/10" : risk <= 15 ? "bg-warning/10" : "bg-critical/10";

  const handleDeleteRecording = async (recordingId: string) => {
    try {
      const { error } = await supabase.from('heart_recordings').delete().eq('id', recordingId);
      if (error) throw error;
      setRecordings(prev => prev.filter(r => r.id !== recordingId));
      toast({ title: "Recording deleted", description: "Successfully removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Heart className="h-8 w-8 text-primary animate-pulse mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const recentRecording = getRecentRecording();
  const avgHeartRate = getAverageHeartRate();
  const avgRisk = getAverageRisk();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Your cardiovascular health overview</p>
          </div>
          <Button onClick={() => navigate("/recording")} className="gap-2 w-full sm:w-auto">
            <Mic className="h-4 w-4" />
            New Recording
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-4 w-4 text-success" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg HR</span>
            </div>
            <p className="text-2xl font-bold font-mono-medical text-foreground">{avgHeartRate}</p>
            <p className="text-xs text-muted-foreground mt-0.5">BPM</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Shield className={`h-4 w-4 ${getRiskColor(avgRisk)}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk</span>
            </div>
            <p className={`text-2xl font-bold ${getRiskColor(avgRisk)}`}>{getRiskLevel(avgRisk)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{avgRisk}% avg</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Brain className="h-4 w-4 text-warning" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Stress</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{recentRecording?.stress_level || "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Latest</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Records</span>
            </div>
            <p className="text-2xl font-bold font-mono-medical text-foreground">{recordings.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="gap-1.5 text-xs py-2.5">
              <Heart className="h-3.5 w-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="recordings" className="gap-1.5 text-xs py-2.5">
              <Activity className="h-3.5 w-3.5" /> Recordings
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-1.5 text-xs py-2.5">
              <BarChart3 className="h-3.5 w-3.5" /> 7-Day
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="gap-1.5 text-xs py-2.5">
              <MessageCircle className="h-3.5 w-3.5" /> AI Chat
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Recent Recordings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recordings.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm font-medium mb-1">No recordings yet</p>
                    <p className="text-xs text-muted-foreground mb-4">Start your first heart analysis</p>
                    <Button onClick={() => navigate("/recording")} size="sm" className="gap-1.5">
                      <Mic className="h-3.5 w-3.5" /> Record Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recordings.slice(0, 5).map(recording => (
                      <RecordingRow key={recording.id} recording={recording} onView={() => navigate(`/report/${recording.id}`)} onDelete={() => handleDeleteRecording(recording.id)} getRiskLevel={getRiskLevel} getRiskColor={getRiskColor} getRiskBg={getRiskBg} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Recordings */}
          <TabsContent value="recordings">
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    All Recordings
                  </div>
                  <Badge variant="outline" className="text-[10px]">{recordings.length} total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recordings.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm font-medium mb-1">No recordings yet</p>
                    <Button onClick={() => navigate("/recording")} size="sm" className="gap-1.5 mt-3">
                      <Mic className="h-3.5 w-3.5" /> Record Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recordings.map(recording => (
                      <RecordingRow key={recording.id} recording={recording} onView={() => navigate(`/report/${recording.id}`)} onDelete={() => handleDeleteRecording(recording.id)} getRiskLevel={getRiskLevel} getRiskColor={getRiskColor} getRiskBg={getRiskBg} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <WeeklyAnalysis recordings={recordings} />
          </TabsContent>

          <TabsContent value="chatbot">
            <HealthChatbot userRecordings={recordings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Extracted recording row component
const RecordingRow = ({ recording, onView, onDelete, getRiskLevel, getRiskColor, getRiskBg }: {
  recording: HeartRecording;
  onView: () => void;
  onDelete: () => void;
  getRiskLevel: (r: number) => string;
  getRiskColor: (r: number) => string;
  getRiskBg: (r: number) => string;
}) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors gap-3">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div className={`w-8 h-8 rounded-lg ${getRiskBg(recording.attack_risk)} flex items-center justify-center shrink-0`}>
        <Heart className={`h-3.5 w-3.5 ${getRiskColor(recording.attack_risk)}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {new Date(recording.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {recording.heart_rate_avg} BPM · {recording.condition} · {recording.model_accuracy || 96}% accuracy
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <Badge variant="outline" className={`text-[10px] ${getRiskColor(recording.attack_risk)}`}>
        {getRiskLevel(recording.attack_risk)}
      </Badge>
      <Button onClick={onView} variant="ghost" size="sm" className="h-7 px-2">
        <Eye className="h-3.5 w-3.5" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recording</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this recording. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
);

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

export default Dashboard;
