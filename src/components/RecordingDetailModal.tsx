import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Download
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (recording?.audio_data) {
      // Simulate audio blob from base64 data
      const mockAudioUrl = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmNACggvuOPz8b9lFg";
      
      if (audioRef.current) {
        audioRef.current.src = mockAudioUrl;
        audioRef.current.load();
      }
    }
  }, [recording]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Heart Recording Analysis Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recording Info Header */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {new Date(recording.recorded_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(recording.recorded_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  Accuracy: {recording.model_accuracy || 95}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Audio Player */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-primary" />
                Heart Sound Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={togglePlayPause}
                  variant="outline"
                  size="lg"
                  className="rounded-full p-3"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <Progress value={(currentTime / duration) * 100} className="h-2" />
                </div>
                
                <Button variant="outline" size="sm">
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

          {/* Vital Signs */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Vital Signs Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5">
                  <Heart className="h-8 w-8 text-success mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">Heart Rate</p>
                  <p className="text-2xl font-bold text-foreground mb-2">{recording.heart_rate_avg} BPM</p>
                  <div className="text-xs text-muted-foreground">
                    Range: {recording.heart_rate_min}-{recording.heart_rate_max} BPM
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">Condition</p>
                  <p className="text-xl font-semibold text-foreground mb-2">{recording.condition}</p>
                  <Badge variant="outline" className={`text-${riskInfo.color}`}>
                    {riskInfo.level} Risk
                  </Badge>
                </div>

                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-warning/10 to-warning/5">
                  <Brain className="h-8 w-8 text-warning mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">Stress Level</p>
                  <p className="text-xl font-semibold text-foreground mb-2">
                    {recording.stress_level || "Normal"}
                  </p>
                  {recording.stress_score && (
                    <div className="text-xs text-muted-foreground">
                      Score: {recording.stress_score}/100
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card className={`border-0 shadow-sm ${riskInfo.bgColor}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Heart Attack Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-foreground mb-2">{recording.attack_risk}%</p>
                  <Badge variant="outline" className={`text-${riskInfo.color} border-${riskInfo.color}`}>
                    {riskInfo.level} Risk Level
                  </Badge>
                </div>
                <div className="text-right">
                  <Progress 
                    value={recording.attack_risk} 
                    className="w-32 mb-2" 
                  />
                  <p className="text-sm text-muted-foreground">Risk Percentage</p>
                </div>
              </div>
              
              {recording.attack_risk > 50 && (
                <div className="p-4 rounded-lg bg-critical/10 border border-critical/20">
                  <p className="text-sm text-critical font-medium mb-2">⚠️ High Risk Detected</p>
                  <p className="text-xs text-muted-foreground">
                    Please consult with a healthcare professional for further evaluation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blood Pressure (if available) */}
          {(recording.systolic_bp || recording.diastolic_bp) && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Blood Pressure Reading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6">
                  <p className="text-4xl font-bold text-foreground mb-2">
                    {recording.systolic_bp || "--"}/{recording.diastolic_bp || "--"}
                  </p>
                  <p className="text-sm text-muted-foreground">mmHg</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingDetailModal;