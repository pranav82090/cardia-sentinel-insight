import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Activity, 
  Brain, 
  TrendingUp, 
  Camera, 
  Mic,
  Calendar,
  Shield
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

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
        .order('recorded_at', { ascending: false })
        .limit(10);

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
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => navigate("/recording")}
            variant="cardiac"
            size="lg"
            className="h-16 gap-3"
          >
            <Mic className="h-6 w-6" />
            Record Heart Sounds
          </Button>
          <Button
            onClick={() => navigate("/camera-monitoring")}
            variant="medical"
            size="lg"
            className="h-16 gap-3"
          >
            <Camera className="h-6 w-6" />
            Camera BPM Monitor
          </Button>
        </div>

        {/* Health Metrics Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Heart Rate</p>
                  <p className="text-2xl font-bold text-foreground">{avgHeartRate} BPM</p>
                </div>
                <div className="p-3 rounded-full bg-success/10">
                  <Heart className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-foreground">{avgRisk}%</p>
                    <Badge variant="outline" className={`text-${riskInfo.color}`}>
                      {riskInfo.level}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Stress Level</p>
                  <p className="text-2xl font-bold text-foreground">
                    {recentRecording?.stress_level || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-warning/10">
                  <Brain className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Recordings</p>
                  <p className="text-2xl font-bold text-foreground">{recordings.length}</p>
                </div>
                <div className="p-3 rounded-full bg-accent/50">
                  <Activity className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Recordings */}
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
                {recordings.slice(0, 5).map((recording) => (
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
                          {new Date(recording.recorded_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {recording.condition} • {recording.heart_rate_avg} BPM
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={`text-${getRiskLevel(recording.attack_risk).color}`}
                      >
                        {recording.attack_risk}% Risk
                      </Badge>
                    </div>
                  </div>
                ))}
                {recordings.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm">
                      View All Recordings
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;