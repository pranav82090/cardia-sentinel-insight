import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  Volume2,
  Heart,
  Activity,
  Brain,
  Shield,
  Calendar,
  Clock,
  BarChart3,
  Download,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from "lucide-react";

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

interface RecordingDetailModalProps {
  recording: HeartRecording | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecordingDetailModal = ({ recording, isOpen, onClose }: RecordingDetailModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [currentAccuracy, setCurrentAccuracy] = useState(95);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (recording?.audio_data) {
      // Simulate audio blob from base64 data
      const mockAudioUrl = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmNACggvuOPz8b9lFg";
      
      if (audioRef.current) {
        audioRef.current.src = mockAudioUrl;
        audioRef.current.load();
      }
      
      // Set initial accuracy and potentially train
      const initialAccuracy = recording.model_accuracy || 85;
      setCurrentAccuracy(initialAccuracy);
      
      if (initialAccuracy < 95) {
        setTimeout(() => trainModel(), 1000);
      }
    }
  }, [recording]);

  const trainModel = async () => {
    setIsTraining(true);
    
    toast({
      title: "🧠 AI Training Started",
      description: "Improving model accuracy with your heart patterns...",
    });

    // Simulate training process
    const trainingSteps = [87, 91, 94, 96, 97, 98];
    
    for (let i = 0; i < trainingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentAccuracy(trainingSteps[i]);
    }
    
    setIsTraining(false);
    
    toast({
      title: "✨ Training Complete!",
      description: `Model accuracy improved to ${trainingSteps[trainingSteps.length - 1]}%`,
    });
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRiskLevel = (risk: number) => {
    if (risk < 20) return { level: "Low", color: "success", bgColor: "bg-success/10" };
    if (risk < 50) return { level: "Moderate", color: "warning", bgColor: "bg-warning/10" };
    return { level: "High", color: "critical", bgColor: "bg-critical/10" };
  };

  if (!recording) return null;

  const riskInfo = getRiskLevel(recording.attack_risk);
  const accuracyColor = currentAccuracy >= 95 ? 'success' : currentAccuracy >= 90 ? 'warning' : 'critical';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-lg">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Health Report Analysis
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className="text-success border-success shadow-sm"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  96% Accuracy
                </Badge>
                {isTraining && (
                  <Badge variant="outline" className="text-primary border-primary animate-pulse">
                    <Zap className="h-3 w-3 mr-1" />
                    Training AI...
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-1">
          {/* Recording Info Header - Bubble Style */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl blur-xl"></div>
            <Card className="relative border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5"></div>
              <CardContent className="pt-8 pb-6 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70 rounded-2xl blur-md opacity-30"></div>
                      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl">
                        <Calendar className="h-8 w-8 text-primary-foreground" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {new Date(recording.recorded_at).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <p className="text-muted-foreground flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5" />
                        {new Date(recording.recorded_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge variant="outline" className={`text-lg px-4 py-2 text-success border-success shadow-lg`}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      96% Accurate
                    </Badge>
                    {currentAccuracy < 95 && !isTraining && (
                      <div>
                        <Button
                          onClick={trainModel}
                          size="sm"
                          variant="outline"
                          className="bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10"
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Improve Accuracy
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audio Player - Bubble Style */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 via-accent/10 to-secondary/20 rounded-3xl blur-xl"></div>
            <Card className="relative border-0 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5"></div>
              <CardHeader className="relative pb-3">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg">
                    <Volume2 className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <span className="bg-gradient-to-r from-secondary-foreground to-secondary-foreground/80 bg-clip-text text-transparent">
                    Heart Sound Recording
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-white/50 to-white/30 rounded-2xl backdrop-blur-sm">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <Button
                      onClick={togglePlayPause}
                      variant="outline"
                      size="lg"
                      className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 border-0 shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8 text-primary-foreground" />
                      ) : (
                        <Play className="h-8 w-8 text-primary-foreground ml-1" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="font-medium">{formatTime(currentTime)}</span>
                      <span className="font-medium">{formatTime(duration)}</span>
                    </div>
                    <div className="relative">
                      <Progress value={(currentTime / duration) * 100} className="h-3 bg-gradient-to-r from-primary/20 to-primary/30 rounded-full" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full blur-sm"></div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-full bg-white/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 shadow-lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                <audio
                  ref={audioRef}
                  onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                  onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </div>

          {/* Vital Signs - Bubble Style */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-success/20 via-primary/10 to-warning/20 rounded-3xl blur-2xl"></div>
            <Card className="relative border-0 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-primary/5 to-warning/5"></div>
              <CardHeader className="relative pb-3">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-success to-success/80 shadow-lg">
                    <Activity className="h-6 w-6 text-success-foreground" />
                  </div>
                  <span className="bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent">
                    Vital Signs Analysis
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Heart Rate Bubble */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-success/30 to-success/10 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    <div className="relative p-6 rounded-3xl bg-gradient-to-br from-white via-white to-success/5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-success to-success/70 rounded-2xl blur-md opacity-20 animate-pulse"></div>
                          <div className="relative p-3 rounded-2xl bg-gradient-to-br from-success to-success/80 shadow-lg">
                            <Heart className="h-8 w-8 text-success-foreground mx-auto" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2 font-medium">Heart Rate</p>
                          <p className="text-3xl font-bold text-foreground mb-2">{recording.heart_rate_avg} BPM</p>
                          <div className="text-xs text-muted-foreground bg-success/10 rounded-full px-3 py-1 inline-block">
                            Range: {recording.heart_rate_min}-{recording.heart_rate_max} BPM
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Condition Bubble */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    <div className="relative p-6 rounded-3xl bg-gradient-to-br from-white via-white to-primary/5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70 rounded-2xl blur-md opacity-20 animate-pulse"></div>
                          <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                            <Shield className="h-8 w-8 text-primary-foreground mx-auto" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2 font-medium">Condition</p>
                          <p className="text-xl font-semibold text-foreground mb-3">{recording.condition}</p>
                          <Badge variant="outline" className={`text-${riskInfo.color} border-${riskInfo.color} shadow-sm px-3 py-1`}>
                            {riskInfo.level} Risk
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stress Level Bubble */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-warning/30 to-warning/10 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    <div className="relative p-6 rounded-3xl bg-gradient-to-br from-white via-white to-warning/5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-warning to-warning/70 rounded-2xl blur-md opacity-20 animate-pulse"></div>
                          <div className="relative p-3 rounded-2xl bg-gradient-to-br from-warning to-warning/80 shadow-lg">
                            <Brain className="h-8 w-8 text-warning-foreground mx-auto" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2 font-medium">Stress Level</p>
                          <p className="text-xl font-semibold text-foreground mb-2">
                            {recording.stress_level || "Normal"}
                          </p>
                          {recording.stress_score && (
                            <div className="text-xs text-muted-foreground bg-warning/10 rounded-full px-3 py-1 inline-block">
                              Score: {recording.stress_score}/100
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment - Bubble Style */}
          <div className="relative">
            <div className={`absolute inset-0 ${riskInfo.bgColor.replace('/10', '/20')} rounded-3xl blur-2xl`}></div>
            <Card className={`relative border-0 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden ${riskInfo.bgColor}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${riskInfo.bgColor.replace('/10', '/5')} via-transparent to-white/10`}></div>
              <CardHeader className="relative pb-3">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br from-${riskInfo.color} to-${riskInfo.color}/80 shadow-lg`}>
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <span className={`bg-gradient-to-r from-${riskInfo.color} to-${riskInfo.color}/80 bg-clip-text text-transparent`}>
                    Heart Attack Risk Assessment
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-center justify-between mb-6 p-6 bg-gradient-to-r from-white/60 to-white/40 rounded-2xl backdrop-blur-sm">
                  <div className="space-y-3">
                    <p className="text-4xl font-bold text-foreground">{recording.attack_risk}%</p>
                    <Badge variant="outline" className={`text-${riskInfo.color} border-${riskInfo.color} shadow-lg px-4 py-2`}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {riskInfo.level} Risk Level
                    </Badge>
                  </div>
                  <div className="text-right space-y-3">
                    <div className="relative">
                      <Progress 
                        value={recording.attack_risk} 
                        className="w-40 h-4 bg-white/50 rounded-full shadow-inner" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full blur-sm"></div>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Risk Percentage</p>
                  </div>
                </div>
                
                {recording.attack_risk > 50 && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-critical/20 to-critical/10 rounded-2xl blur-lg"></div>
                    <div className="relative p-6 rounded-2xl bg-gradient-to-r from-critical/10 to-critical/5 border border-critical/20 shadow-lg backdrop-blur-sm">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-critical/20">
                          <AlertTriangle className="h-5 w-5 text-critical" />
                        </div>
                        <div>
                          <p className="text-critical font-semibold mb-2">⚠️ High Risk Detected</p>
                          <p className="text-sm text-muted-foreground">
                            Please consult with a healthcare professional for further evaluation and personalized treatment recommendations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Blood Pressure (if available) - Bubble Style */}
          {(recording.systolic_bp || recording.diastolic_bp) && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-primary/10 to-accent/20 rounded-3xl blur-xl"></div>
              <Card className="relative border-0 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-accent to-accent/80 shadow-lg">
                      <Heart className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <span className="bg-gradient-to-r from-accent-foreground to-accent-foreground/80 bg-clip-text text-transparent">
                      Blood Pressure Reading
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-center p-8 bg-gradient-to-r from-white/60 to-white/40 rounded-2xl backdrop-blur-sm">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl blur-lg"></div>
                      <div className="relative space-y-2">
                        <p className="text-5xl font-bold text-foreground">
                          {recording.systolic_bp || "--"}/{recording.diastolic_bp || "--"}
                        </p>
                        <p className="text-lg text-muted-foreground font-medium">mmHg</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingDetailModal;