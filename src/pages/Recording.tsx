import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Upload,
  Heart,
  Activity,
  Brain,
  Camera,
  Flashlight,
  User
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

const Recording = () => {
  const [user, setUser] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [bpm, setBpm] = useState<number | null>(null);
  const [hrv, setHrv] = useState<number | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
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
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      toast({
        title: "Recording started",
        description: "Speak clearly or place the device near your chest to record heart sounds.",
      });
    } catch (error) {
      toast({
        title: "Error accessing microphone",
        description: "Please allow microphone access to record audio.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording completed",
        description: "Your audio has been recorded. You can now analyze it.",
      });
    }
  };

  const startCameraMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        
        // Simulate PPG monitoring
        setTimeout(() => {
          setBpm(72 + Math.floor(Math.random() * 20)); // Simulated BPM 72-92
          setHrv(25 + Math.floor(Math.random() * 30)); // Simulated HRV 25-55ms
        }, 3000);

        toast({
          title: "Camera monitoring started",
          description: "Place your finger over the camera lens for PPG monitoring.",
        });
      }
    } catch (error) {
      toast({
        title: "Error accessing camera",
        description: "Please allow camera access for PPG monitoring.",
        variant: "destructive",
      });
    }
  };

  const stopCameraMonitoring = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      setBpm(null);
      setHrv(null);

      toast({
        title: "Camera monitoring stopped",
        description: "PPG monitoring has been stopped.",
      });
    }
  };

  const analyzeRecording = async () => {
    if (!audioBlob || !user) return;

    setIsAnalyzing(true);

    try {
      // Convert audio to base64 for API submission
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Simulate API analysis (in production, this would call your edge function)
        const mockResults = {
          heart_rate_avg: 75 + Math.floor(Math.random() * 20),
          heart_rate_min: 65 + Math.floor(Math.random() * 10),
          heart_rate_max: 85 + Math.floor(Math.random() * 25),
          attack_risk: Math.floor(Math.random() * 100),
          condition: ["Normal", "Arrhythmia", "Murmur"][Math.floor(Math.random() * 3)],
          stress_level: ["Low", "Moderate", "High"][Math.floor(Math.random() * 3)],
          stress_score: Math.floor(Math.random() * 100),
          systolic_bp: bpm ? 120 + Math.floor(Math.random() * 20) : null,
          diastolic_bp: bpm ? 80 + Math.floor(Math.random() * 10) : null,
        };

        // Save to database
        const { error } = await supabase
          .from('heart_recordings')
          .insert({
            user_id: user.id,
            heart_rate_avg: mockResults.heart_rate_avg,
            heart_rate_min: mockResults.heart_rate_min,
            heart_rate_max: mockResults.heart_rate_max,
            attack_risk: mockResults.attack_risk,
            condition: mockResults.condition,
            stress_level: mockResults.stress_level,
            stress_score: mockResults.stress_score,
            systolic_bp: mockResults.systolic_bp,
            diastolic_bp: mockResults.diastolic_bp,
            ppg_heart_rate: bpm,
            audio_data: { base64: base64Audio.substring(0, 100) } // Truncated for demo
          });

        if (error) throw error;

        setAnalysisResults(mockResults);
        
        toast({
          title: "Analysis completed",
          description: "Your heart recording has been analyzed and saved.",
        });
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Heart Health Recording
          </h1>
          <p className="text-muted-foreground">
            Record heart sounds and monitor vital signs using advanced AI analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Audio Recording Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                Heart Sound Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${
                  isRecording 
                    ? 'bg-critical animate-pulse shadow-lg' 
                    : 'bg-primary hover:bg-primary/90'
                }`}>
                  {isRecording ? (
                    <MicOff className="h-8 w-8 text-critical-foreground" />
                  ) : (
                    <Mic className="h-8 w-8 text-primary-foreground" />
                  )}
                </div>
                
                {isRecording && (
                  <div className="mt-4">
                    <p className="text-2xl font-mono font-bold text-foreground">
                      {formatTime(recordingTime)}
                    </p>
                    <Progress value={(recordingTime / 30) * 100} className="mt-2" />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    variant="cardiac"
                    className="flex-1 gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    variant="emergency"
                    className="flex-1 gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Stop Recording
                  </Button>
                )}
              </div>

              {audioBlob && !isRecording && (
                <div className="space-y-3">
                  <audio
                    controls
                    src={URL.createObjectURL(audioBlob)}
                    className="w-full"
                  />
                  <Button
                    onClick={analyzeRecording}
                    disabled={isAnalyzing}
                    variant="medical"
                    className="w-full gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Activity className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Analyze Recording
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Camera PPG Monitoring Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                PPG Heart Rate Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-48 rounded-lg bg-secondary object-cover"
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                  width="640"
                  height="480"
                />
                
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary/80 rounded-lg">
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Camera not active</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!cameraActive ? (
                  <Button
                    onClick={startCameraMonitoring}
                    variant="medical"
                    className="flex-1 gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Start PPG Monitor
                  </Button>
                ) : (
                  <Button
                    onClick={stopCameraMonitoring}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Stop Monitor
                  </Button>
                )}
              </div>

              {(bpm || hrv) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-success/10">
                    <Heart className="h-6 w-6 text-success mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">BPM</p>
                    <p className="text-2xl font-bold text-foreground">{bpm}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-warning/10">
                    <Brain className="h-6 w-6 text-warning mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">HRV</p>
                    <p className="text-2xl font-bold text-foreground">{hrv}ms</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        {analysisResults && (
          <Card className="border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-lg bg-primary/10">
                  <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Avg Heart Rate</p>
                  <p className="text-2xl font-bold text-foreground">{analysisResults.heart_rate_avg} BPM</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <Activity className="h-8 w-8 text-secondary-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Condition</p>
                  <p className="text-lg font-semibold text-foreground">{analysisResults.condition}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning/10">
                  <Brain className="h-8 w-8 text-warning mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Stress Level</p>
                  <p className="text-lg font-semibold text-foreground">{analysisResults.stress_level}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-critical/10">
                  <Badge 
                    variant="outline" 
                    className="text-critical border-critical mb-2 text-xs"
                  >
                    RISK ASSESSMENT
                  </Badge>
                  <p className="text-2xl font-bold text-critical">{analysisResults.attack_risk}%</p>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="cardiac"
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Recording;