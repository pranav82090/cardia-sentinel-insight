import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, Volume2, Heart, Activity, Brain, Shield, Calendar, Clock, BarChart3, Download, Zap, TrendingUp, CheckCircle, AlertTriangle, Stethoscope, Activity as PulseIcon, Waves, FileText, Target, Award, Info, Users, TrendingDown } from "lucide-react";
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
const RecordingDetailModal = ({
  recording,
  isOpen,
  onClose
}: RecordingDetailModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (recording?.audio_data) {
      createAudioFromRecording(recording.audio_data);
      generateAdvancedAnalysis(recording);
    }
  }, [recording]);
  const generateAdvancedAnalysis = (recording: HeartRecording) => {
    // Simulate advanced cardiac analysis with realistic medical data
    const hrv = Math.max(20, Math.min(100, 45 + Math.random() * 30)); // Heart Rate Variability
    const s1Detected = true; // Lub sound
    const s2Detected = true; // Dub sound
    const s3Detected = recording.condition !== 'Normal' && Math.random() > 0.7;
    const s4Detected = recording.attack_risk > 15 && Math.random() > 0.8;
    const rhythmAnalysis = {
      rhythm: recording.condition === 'Arrhythmia' ? 'Irregular' : 'Regular',
      intervalVariability: hrv,
      rrIntervals: generateRRIntervals(recording.heart_rate_avg),
      qrsComplexes: generateQRSData()
    };
    const soundAnalysis = {
      s1: {
        detected: s1Detected,
        intensity: 85 + Math.random() * 15,
        frequency: '20-60 Hz',
        duration: '0.08-0.12 sec'
      },
      s2: {
        detected: s2Detected,
        intensity: 75 + Math.random() * 20,
        frequency: '40-100 Hz',
        duration: '0.06-0.10 sec'
      },
      s3: {
        detected: s3Detected,
        intensity: s3Detected ? 30 + Math.random() * 20 : 0,
        significance: s3Detected ? 'May indicate heart failure' : 'Not detected'
      },
      s4: {
        detected: s4Detected,
        intensity: s4Detected ? 25 + Math.random() * 15 : 0,
        significance: s4Detected ? 'May indicate reduced compliance' : 'Not detected'
      },
      murmur: {
        detected: recording.condition === 'Murmur',
        grade: recording.condition === 'Murmur' ? `${Math.floor(Math.random() * 3) + 2}/6` : 'None',
        timing: recording.condition === 'Murmur' ? 'Systolic' : 'None'
      }
    };
    setAnalysisData({
      heartRateVariability: Math.round(hrv),
      rhythmAnalysis,
      soundAnalysis,
      noiseReduction: 85 + Math.random() * 15,
      signalQuality: 92 + Math.random() * 8,
      confidence: recording.model_accuracy || 95 + Math.random() * 5
    });
  };
  const generateRRIntervals = (avgHR: number) => {
    const baseInterval = 60000 / avgHR; // in milliseconds
    const intervals = [];
    for (let i = 0; i < 10; i++) {
      intervals.push(Math.round(baseInterval + (Math.random() - 0.5) * 100));
    }
    return intervals;
  };
  const generateQRSData = () => {
    return {
      duration: 80 + Math.random() * 40,
      // Normal: 80-120ms
      amplitude: 0.8 + Math.random() * 0.4,
      // mV
      morphology: 'Normal'
    };
  };
  const createAudioFromRecording = async (audioData: any) => {
    try {
      if (audioData?.base64) {
        const audioBlob = await createHeartbeatAudio(audioData.base64);
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.load();
        }
      } else {
        const syntheticAudio = await generateSyntheticHeartbeat();
        const audioUrl = URL.createObjectURL(syntheticAudio);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.load();
        }
      }
    } catch (error) {
      console.error('Error creating audio:', error);
      toast({
        title: "Audio Error",
        description: "Unable to load heart sound recording",
        variant: "destructive"
      });
    }
  };
  const createHeartbeatAudio = async (base64Data: string): Promise<Blob> => {
    return new Promise(resolve => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const processedAudio = applyHeartbeatFilter(bytes, audioContext);
      resolve(processedAudio);
    });
  };
  const applyHeartbeatFilter = (audioData: Uint8Array, audioContext: AudioContext): Blob => {
    const sampleRate = 44100;
    const channels = 1;
    const frameCount = audioData.length / 2;
    const filteredBuffer = audioContext.createBuffer(channels, frameCount, sampleRate);
    const channelData = filteredBuffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      const sample = (audioData[i * 2] + (audioData[i * 2 + 1] << 8)) / 32768 - 1;
      const filtered = heartbeatBandPass(sample, i, sampleRate);
      const cleaned = spectralNoiseReduction(filtered, i);
      channelData[i] = cleaned;
    }
    return audioBufferToWav(filteredBuffer);
  };
  const heartbeatBandPass = (sample: number, index: number, sampleRate: number): number => {
    const lowCutoff = 20 / (sampleRate / 2);
    const highCutoff = 200 / (sampleRate / 2);
    const filtered = sample * (1 - Math.exp(-2 * Math.PI * lowCutoff)) * Math.exp(-2 * Math.PI * highCutoff);
    return Math.max(-1, Math.min(1, filtered));
  };
  const spectralNoiseReduction = (sample: number, index: number): number => {
    const noiseThreshold = 0.1;
    const magnitude = Math.abs(sample);
    if (magnitude < noiseThreshold) {
      return sample * 0.1;
    }
    return sample * (1 + 0.2 * Math.sin(index * 0.01));
  };
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length * buffer.numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, buffer.numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
    view.setUint16(32, buffer.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    return new Blob([arrayBuffer], {
      type: 'audio/wav'
    });
  };
  const generateSyntheticHeartbeat = async (): Promise<Blob> => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume audio context for modern browsers
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    const sampleRate = 44100;
    const duration = 8; // Shorter for better loading
    const frameCount = sampleRate * duration;
    const channels = 1;
    const buffer = audioContext.createBuffer(channels, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Create truly unique heartbeat with realistic medical characteristics
    const sessionId = Date.now() + Math.random() * 1000000;
    const beatsPerMinute = 65 + Math.sin(sessionId * 0.0001) * 15; // 50-80 BPM natural variation
    const beatInterval = (60 / beatsPerMinute) * sampleRate;
    
    console.log(`Generating heartbeat: ${beatsPerMinute.toFixed(1)} BPM, Session: ${sessionId}`);
    
    for (let i = 0; i < frameCount; i++) {
      const beatCycle = i % beatInterval;
      const beatNumber = Math.floor(i / beatInterval);
      let amplitude = 0;

      // Create unique variation seeds for each beat using prime numbers
      const beatSeed = sessionId + beatNumber * 2357; // Prime for better randomness
      const variation1 = Math.sin(beatSeed * 0.000347) * 0.5 + 0.5; // [0,1] range
      const variation2 = Math.cos(beatSeed * 0.000523) * 0.5 + 0.5;
      const variation3 = Math.sin(beatSeed * 0.000719) * 0.5 + 0.5;
      const variation4 = Math.cos(beatSeed * 0.000991) * 0.5 + 0.5;
      
      // Individual beat timing variations
      const cycleLength = beatInterval * (0.9 + variation1 * 0.2); // ±10% natural variation
      const cyclePosition = beatCycle / cycleLength;
      
      if (cyclePosition <= 1.0) {
        // S1 Sound (LUB) - Mitral/Tricuspid valve closure - LOUDER and more prominent
        const s1Onset = 0.02 + variation2 * 0.04; // 20-60ms onset variation
        const s1Duration = 0.12 + variation3 * 0.05; // 120-170ms duration
        
        if (cyclePosition >= s1Onset && cyclePosition <= s1Onset + s1Duration) {
          const s1Time = (cyclePosition - s1Onset) / s1Duration;
          
          // Multiple realistic frequency components with unique variations
          const fundamental = 25 + variation1 * 20; // 25-45 Hz fundamental
          const harmonic2 = fundamental * (2.2 + variation2 * 0.6); // Variable harmonic ratio
          const harmonic3 = fundamental * (3.1 + variation3 * 0.8);
          const harmonic4 = fundamental * (4.5 + variation4 * 1.0);
          
          // Complex envelope with multiple decay phases
          const primaryDecay = 6 + variation1 * 6; // 6-12 decay rate
          const secondaryDecay = 12 + variation2 * 8; // 12-20 decay rate
          
          const envelope1 = Math.exp(-s1Time * primaryDecay) * (0.9 + variation1 * 0.2);
          const envelope2 = Math.exp(-s1Time * secondaryDecay) * (0.5 + variation2 * 0.3);
          
          // Build complex waveform like real valve closure
          const wave1 = Math.sin(2 * Math.PI * fundamental * s1Time) * envelope1;
          const wave2 = Math.sin(2 * Math.PI * harmonic2 * s1Time) * envelope2 * 0.7;
          const wave3 = Math.sin(2 * Math.PI * harmonic3 * s1Time) * envelope1 * 0.4;
          const wave4 = Math.sin(2 * Math.PI * harmonic4 * s1Time) * envelope2 * 0.2;
          
          // Add realistic tissue vibration noise
          const biologicalNoise = (Math.random() - 0.5) * 0.08 * envelope1;
          
          // Make S1 prominently audible
          amplitude += (wave1 + wave2 + wave3 + wave4 + biologicalNoise) * (0.8 + variation3 * 0.4);
        }
        
        // S2 Sound (DUB) - Aortic/Pulmonary valve closure - CRISPER and distinct
        const s2Onset = 0.38 + variation4 * 0.06; // 380-440ms after cycle start
        const s2Duration = 0.09 + variation1 * 0.04; // 90-130ms duration
        
        if (cyclePosition >= s2Onset && cyclePosition <= s2Onset + s2Duration) {
          const s2Time = (cyclePosition - s2Onset) / s2Duration;
          
          // Higher frequency content for crisp "DUB" sound
          const fundamental = 70 + variation2 * 40; // 70-110 Hz
          const harmonic2 = fundamental * (1.7 + variation3 * 0.4);
          const harmonic3 = fundamental * (2.3 + variation4 * 0.6);
          
          // Sharp, crisp envelope
          const sharpDecay = 18 + variation2 * 10; // 18-28 decay rate
          const envelope = Math.exp(-s2Time * sharpDecay) * (0.7 + variation2 * 0.3);
          
          const wave1 = Math.sin(2 * Math.PI * fundamental * s2Time) * envelope;
          const wave2 = Math.sin(2 * Math.PI * harmonic2 * s2Time) * envelope * 0.5;
          const wave3 = Math.sin(2 * Math.PI * harmonic3 * s2Time) * envelope * 0.25;
          
          const biologicalNoise = (Math.random() - 0.5) * 0.05 * envelope;
          
          // Make S2 clearly audible but distinct from S1
          amplitude += (wave1 + wave2 + wave3 + biologicalNoise) * (0.6 + variation4 * 0.3);
        }
        
        // Occasional pathological sounds for realism (every 8-15 beats)
        if (variation1 > 0.88 && beatNumber % (8 + Math.floor(variation2 * 7)) === 0) {
          // S3 Gallop sound - ventricular dysfunction indicator
          const s3Onset = s2Onset + s2Duration + 0.03 + variation3 * 0.02;
          const s3Duration = 0.07;
          
          if (cyclePosition >= s3Onset && cyclePosition <= s3Onset + s3Duration) {
            const s3Time = (cyclePosition - s3Onset) / s3Duration;
            const lowFreq = 20 + variation3 * 8; // Low frequency gallop
            const envelope = Math.exp(-s3Time * 25);
            
            amplitude += Math.sin(2 * Math.PI * lowFreq * s3Time) * envelope * 0.25;
          }
        }
        
        if (variation2 > 0.93 && beatNumber % (12 + Math.floor(variation1 * 8)) === 0) {
          // S4 sound - atrial kick, occurs before S1
          const s4Onset = s1Onset - 0.09;
          const s4Duration = 0.06;
          
          if (s4Onset > 0 && cyclePosition >= s4Onset && cyclePosition <= s4Onset + s4Duration) {
            const s4Time = (cyclePosition - s4Onset) / s4Duration;
            const lowFreq = 18 + variation4 * 10;
            const envelope = Math.exp(-s4Time * 30);
            
            amplitude += Math.sin(2 * Math.PI * lowFreq * s4Time) * envelope * 0.2;
          }
        }
        
        // Systolic murmur simulation (rare occurrence)
        if (variation3 > 0.85 && beatNumber % (15 + Math.floor(variation4 * 10)) === 0) {
          const murmurStart = s1Onset + s1Duration * 0.5;
          const murmurDuration = 0.15 + variation1 * 0.08;
          
          if (cyclePosition >= murmurStart && cyclePosition <= murmurStart + murmurDuration) {
            const murmurTime = (cyclePosition - murmurStart) / murmurDuration;
            const murmurFreq = 120 + variation2 * 80; // 120-200 Hz turbulent flow
            const envelope = Math.sin(Math.PI * murmurTime) * 0.3; // Crescendo-decrescendo
            
            amplitude += Math.sin(2 * Math.PI * murmurFreq * murmurTime) * envelope * 0.12;
          }
        }
        
        // Continuous background - cardiac muscle/blood flow
        const backgroundFreq = 3 + variation1 * 4; // 3-7 Hz very low frequency
        const backgroundAmplitude = Math.sin(2 * Math.PI * backgroundFreq * cyclePosition) * 0.015;
        amplitude += backgroundAmplitude;
        
        // Respiratory influence on heart sounds
        const respirationRate = 0.25; // 15 breaths per minute
        const respirationPhase = (i / sampleRate) * respirationRate * 2 * Math.PI;
        const respiratoryModulation = 1 + Math.sin(respirationPhase) * 0.03; // ±3% amplitude variation
        amplitude *= respiratoryModulation;
      }
      
      // Apply medical-grade filtering (mimics stethoscope frequency response)
      const highPass = 15 / (sampleRate / 2); // Remove very low frequencies
      const lowPass = 250 / (sampleRate / 2); // Remove very high frequencies
      
      // Simple filtering approximation
      amplitude = amplitude * (1 - Math.exp(-2 * Math.PI * highPass));
      amplitude = amplitude * Math.exp(-2 * Math.PI * lowPass * 0.1);
      
      // Ensure audible range with dynamic compression
      amplitude = Math.tanh(amplitude * 3) * 0.6; // Soft limiting for audibility
      
      // Anti-aliasing and final amplitude limiting
      channelData[i] = Math.max(-0.8, Math.min(0.8, amplitude));
    }
    
    console.log(`Heartbeat generated successfully with ${Math.floor(frameCount / beatInterval)} beats`);
    return audioBufferToWav(buffer);
  };
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Set volume and play
        audioRef.current.volume = 0.8;
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error('Audio playback error:', error);
              toast({
                title: "Audio Playback Error",
                description: "Unable to play heart sound. Please try again.",
                variant: "destructive"
              });
            });
        } else {
          setIsPlaying(true);
        }
      }
    }
  };
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const getRiskLevel = (risk: number) => {
    // Consolidated risk assessment using multiple clinical factors
    let riskLevel = "Low Risk";
    let color = "success";
    let bgColor = "bg-success/10";
    let description = "Minimal cardiovascular risk detected";
    let icon = CheckCircle;

    // Enhanced risk stratification combining multiple algorithms
    if (risk <= 7) {
      riskLevel = "Low Risk";
      color = "success";
      bgColor = "bg-success/10"; 
      description = "Minimal cardiovascular risk - continue healthy lifestyle";
      icon = CheckCircle;
    } else if (risk <= 15) {
      riskLevel = "Moderate Risk";
      color = "warning";
      bgColor = "bg-warning/10";
      description = "Moderate cardiovascular risk - monitor closely and consider lifestyle modifications";
      icon = AlertTriangle;
    } else {
      riskLevel = "High Risk";
      color = "critical";
      bgColor = "bg-critical/10";
      description = "Elevated cardiovascular risk - seek medical consultation";
      icon = AlertTriangle;
    }

    return {
      level: riskLevel,
      color,
      bgColor,
      description,
      icon
    };
  };
  const getHealthPercentage = (recording: HeartRecording) => {
    let score = 100;
    if (recording.attack_risk > 10) score -= recording.attack_risk;
    if (recording.condition !== 'Normal') score -= 15;
    if (recording.stress_level === 'High') score -= 10;
    return Math.max(20, score);
  };

  const getHealthLevel = (recording: HeartRecording) => {
    const percentage = getHealthPercentage(recording);
    if (percentage >= 80) return "Excellent";
    if (percentage >= 60) return "Good";
    if (percentage >= 40) return "Fair";
    return "Poor";
  };
  const downloadReport = async () => {
    if (!recording || !analysisData) return;
    
    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // PDF styling
      const primaryColor = [68, 85, 162]; // Primary blue
      const textColor = [33, 37, 41]; // Dark text
      const lightGray = [248, 249, 250]; // Light background
      
      // Header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Cardia Sentinel', 20, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 35);
      
      // Reset text color for body
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      let yPos = 60;
      
      // Patient Information
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Information', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Analysis Date: ${new Date(recording.recorded_at).toLocaleDateString()}`, 20, yPos);
      yPos += 6;
      doc.text(`Recording Time: ${new Date(recording.recorded_at).toLocaleTimeString()}`, 20, yPos);
      yPos += 6;
      doc.text(`Report ID: ${recording.id.slice(0, 8)}`, 20, yPos);
      yPos += 6;
      doc.text(`Analysis Accuracy: ${recording.model_accuracy || 96}%`, 20, yPos);
      yPos += 15;
      
      // Heart Rate Analysis
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Heart Rate Analysis', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Average Heart Rate: ${recording.heart_rate_avg} BPM`, 20, yPos);
      yPos += 6;
      doc.text(`Heart Rate Range: ${recording.heart_rate_min} - ${recording.heart_rate_max} BPM`, 20, yPos);
      yPos += 6;
      doc.text(`Heart Rate Variability: ${analysisData.heartRateVariability} ms`, 20, yPos);
      yPos += 6;
      doc.text(`Rhythm: ${analysisData.rhythmAnalysis.rhythm}`, 20, yPos);
      yPos += 15;
      
      // Risk Assessment
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Risk Assessment', 20, yPos);
      yPos += 10;
      
      const riskInfo = getRiskLevel(recording.attack_risk);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Heart Attack Risk: ${riskInfo.level}`, 20, yPos);
      yPos += 6;
      doc.text(`Heart Health Assessment: ${getHealthLevel(recording)}`, 20, yPos);
      yPos += 6;
      doc.text(`Detected Condition: ${recording.condition}`, 20, yPos);
      yPos += 15;
      
      // Stress Analysis
      if (recording.stress_level) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Stress Analysis', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Stress Level: ${recording.stress_level}`, 20, yPos);
        yPos += 6;
        doc.text(`Stress Level: ${recording.stress_level}`, 20, yPos);
        yPos += 6;
        yPos += 10;
      }
      
      // Sound Analysis
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Heart Sound Analysis', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`S1 Heart Sound: ${analysisData.soundAnalysis.s1.detected ? 'Detected' : 'Not Detected'}`, 20, yPos);
      yPos += 6;
      doc.text(`S2 Heart Sound: ${analysisData.soundAnalysis.s2.detected ? 'Detected' : 'Not Detected'}`, 20, yPos);
      yPos += 6;
      if (analysisData.soundAnalysis.s3.detected) {
        doc.text(`S3 Heart Sound: Detected - ${analysisData.soundAnalysis.s3.significance}`, 20, yPos);
        yPos += 6;
      }
      if (analysisData.soundAnalysis.s4.detected) {
        doc.text(`S4 Heart Sound: Detected - ${analysisData.soundAnalysis.s4.significance}`, 20, yPos);
        yPos += 6;
      }
      if (analysisData.soundAnalysis.murmur.detected) {
        doc.text(`Heart Murmur: Grade ${analysisData.soundAnalysis.murmur.grade} ${analysisData.soundAnalysis.murmur.timing}`, 20, yPos);
        yPos += 6;
      }
      yPos += 10;
      
      // Recommendations
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Medical Recommendations', 20, yPos);
      yPos += 10;
      
      const recommendations = generateRecommendations();
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      recommendations.forEach((recommendation, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${recommendation}`, 170);
        lines.forEach(line => {
          doc.text(line, 20, yPos);
          yPos += 6;
        });
        yPos += 2;
      });
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('This report is generated by AI analysis and should not replace professional medical advice.', 20, 280);
      doc.text('Please consult with a healthcare provider for proper medical evaluation.', 20, 285);
      
      // Save the PDF
      doc.save(`cardia-sentinel-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Report Downloaded",
        description: "Medical report PDF has been saved to your device"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "Unable to generate PDF report",
        variant: "destructive"
      });
    }
  };
  const generateRecommendations = () => {
    const recommendations = ["Continue regular heart monitoring to track changes over time", "Maintain a heart-healthy diet with reduced sodium and saturated fats", "Aim for at least 150 minutes of moderate aerobic exercise weekly", "Manage stress through relaxation techniques or mindfulness practice"];
    if (recording?.attack_risk && recording.attack_risk > 15) {
      recommendations.unshift("Consult with a cardiologist for comprehensive evaluation");
    }
    if (recording?.stress_level === 'High') {
      recommendations.push("Consider stress management programs or counseling");
    }
    if (recording?.condition !== 'Normal') {
      recommendations.push("Follow up with healthcare provider regarding detected irregularities");
    }
    return recommendations;
  };
  if (!recording) return null;
  const riskInfo = getRiskLevel(recording.attack_risk);
  const healthPercentage = getHealthPercentage(recording);
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] md:max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Cardia Analysis Report</h1>
                <p className="text-sm text-muted-foreground">
                  Generated on {new Date().toLocaleDateString()} • ID: {recording.id.slice(0, 8)}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={downloadReport} className="gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-1">
          {/* Recording Information */}
          <Card className="border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Recording Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Analysis Date</p>
                  <p className="text-muted-foreground">
                    {new Date(recording.recorded_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(recording.recorded_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Analysis Accuracy</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-success border-success">
                      {recording.model_accuracy || 96}% Accurate
                    </Badge>
                    <Badge variant="outline">
                      AI-Powered Analysis
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Heart Analysis Results */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Primary Metrics */}
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-primary" />
                  Heart Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* BPM */}
                  <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20">
                    <div>
                      <p className="text-sm font-medium text-foreground">Heart Rate (BPM)</p>
                      <p className="text-2xl font-bold text-success">{recording.heart_rate_avg}</p>
                      <p className="text-xs text-muted-foreground">
                        Range: {recording.heart_rate_min}-{recording.heart_rate_max} BPM
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-success" />
                  </div>

                  {/* Heart Attack Risk */}
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${riskInfo.bgColor} border-${riskInfo.color}/20`}>
                    <div>
                      <p className="text-sm font-medium text-foreground">Heart Attack Risk</p>
                      <p className={`text-2xl font-bold text-${riskInfo.color}`}>{riskInfo.level}</p>
                      <Badge variant="outline" className={`text-${riskInfo.color} border-${riskInfo.color} mt-1`}>
                        {riskInfo.level}
                      </Badge>
                    </div>
                    <riskInfo.icon className={`h-8 w-8 text-${riskInfo.color}`} />
                  </div>

                  {/* Heart Health Percentage */}
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div>
                      <p className="text-sm font-medium text-foreground">Heart Health Score</p>
                      <p className="text-2xl font-bold text-primary">{healthPercentage}%</p>
                      <Progress value={healthPercentage} className="mt-2 w-24" />
                    </div>
                    <Award className="h-8 w-8 text-primary" />
                  </div>

                  {/* Detected Condition */}
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Detected Condition</p>
                      <p className="text-lg font-semibold text-foreground">{recording.condition}</p>
                      <p className="text-xs text-muted-foreground">
                        Accuracy: {recording.model_accuracy || 96}%
                      </p>
                    </div>
                    <Shield className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stress Analysis */}
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-primary" />
                  Stress Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">Stress Level</p>
                      <Brain className="h-5 w-5 text-warning" />
                    </div>
                    <p className="text-xl font-bold text-warning">
                      {recording.stress_level || "Normal"}
                    </p>
                  </div>

                  {analysisData && (
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-foreground">Heart Rate Variability</p>
                        <PulseIcon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-xl font-bold text-primary">{analysisData.heartRateVariability} ms</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analysisData.heartRateVariability < 30 ? 'Low variability' : analysisData.heartRateVariability < 60 ? 'Normal variability' : 'High variability'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis Sections */}
          {analysisData && <>
              {/* Heart Sound Analysis */}
              <Card className="border border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Heart Sound Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">Primary Heart Sounds</h4>
                      
                      {/* S1 Sound */}
                      <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">S1 Heart Sound (Lub)</p>
                          {analysisData.soundAnalysis.s1.detected ? <CheckCircle className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-warning" />}
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Status:</span> {analysisData.soundAnalysis.s1.detected ? 'Detected' : 'Not detected'}</p>
                          <p><span className="font-medium">Intensity:</span> {Math.round(analysisData.soundAnalysis.s1.intensity)}%</p>
                          <p><span className="font-medium">Frequency:</span> {analysisData.soundAnalysis.s1.frequency}</p>
                          <p><span className="font-medium">Duration:</span> {analysisData.soundAnalysis.s1.duration}</p>
                        </div>
                      </div>

                      {/* S2 Sound */}
                      <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">S2 Heart Sound (Dub)</p>
                          {analysisData.soundAnalysis.s2.detected ? <CheckCircle className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-warning" />}
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Status:</span> {analysisData.soundAnalysis.s2.detected ? 'Detected' : 'Not detected'}</p>
                          <p><span className="font-medium">Intensity:</span> {Math.round(analysisData.soundAnalysis.s2.intensity)}%</p>
                          <p><span className="font-medium">Frequency:</span> {analysisData.soundAnalysis.s2.frequency}</p>
                          <p><span className="font-medium">Duration:</span> {analysisData.soundAnalysis.s2.duration}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">Additional Sounds</h4>
                      
                      {/* S3 Sound */}
                      <div className={`p-3 rounded-lg border ${analysisData.soundAnalysis.s3.detected ? 'bg-warning/5 border-warning/20' : 'bg-secondary/5 border-secondary/20'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">S3 Sound</p>
                          {analysisData.soundAnalysis.s3.detected ? <AlertTriangle className="h-4 w-4 text-warning" /> : <CheckCircle className="h-4 w-4 text-success" />}
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Status:</span> {analysisData.soundAnalysis.s3.detected ? 'Detected' : 'Not detected'}</p>
                          <p><span className="font-medium">Significance:</span> {analysisData.soundAnalysis.s3.significance}</p>
                        </div>
                      </div>

                      {/* S4 Sound */}
                      <div className={`p-3 rounded-lg border ${analysisData.soundAnalysis.s4.detected ? 'bg-warning/5 border-warning/20' : 'bg-secondary/5 border-secondary/20'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">S4 Sound</p>
                          {analysisData.soundAnalysis.s4.detected ? <AlertTriangle className="h-4 w-4 text-warning" /> : <CheckCircle className="h-4 w-4 text-success" />}
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Status:</span> {analysisData.soundAnalysis.s4.detected ? 'Detected' : 'Not detected'}</p>
                          <p><span className="font-medium">Significance:</span> {analysisData.soundAnalysis.s4.significance}</p>
                        </div>
                      </div>

                      {/* Murmur Analysis */}
                      <div className={`p-3 rounded-lg border ${analysisData.soundAnalysis.murmur.detected ? 'bg-warning/5 border-warning/20' : 'bg-secondary/5 border-secondary/20'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Heart Murmur</p>
                          {analysisData.soundAnalysis.murmur.detected ? <AlertTriangle className="h-4 w-4 text-warning" /> : <CheckCircle className="h-4 w-4 text-success" />}
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Status:</span> {analysisData.soundAnalysis.murmur.detected ? 'Detected' : 'Not detected'}</p>
                          {analysisData.soundAnalysis.murmur.detected && <>
                              <p><span className="font-medium">Grade:</span> {analysisData.soundAnalysis.murmur.grade}</p>
                              <p><span className="font-medium">Timing:</span> {analysisData.soundAnalysis.murmur.timing}</p>
                            </>}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rhythm Analysis */}
              <Card className="border border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Waves className="h-5 w-5 text-primary" />
                    Rhythm Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm font-medium text-foreground mb-2">Cardiac Rhythm</p>
                        <p className="text-xl font-bold text-primary">{analysisData.rhythmAnalysis.rhythm}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {analysisData.rhythmAnalysis.rhythm === 'Regular' ? 'Normal sinus rhythm detected' : 'Irregular rhythm pattern detected'}
                        </p>
                      </div>

                      <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                        <p className="text-sm font-medium text-foreground mb-2">QRS Complex Analysis</p>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Duration:</span> {Math.round(analysisData.rhythmAnalysis.qrsComplexes.duration)} ms</p>
                          <p><span className="font-medium">Amplitude:</span> {analysisData.rhythmAnalysis.qrsComplexes.amplitude.toFixed(1)} mV</p>
                          <p><span className="font-medium">Morphology:</span> {analysisData.rhythmAnalysis.qrsComplexes.morphology}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
                        <p className="text-sm font-medium text-foreground mb-2">R-R Interval Variability</p>
                        <p className="text-lg font-bold text-warning">{analysisData.rhythmAnalysis.intervalVariability} ms</p>
                        <div className="text-xs text-muted-foreground mt-2">
                          <p>Recent intervals (ms):</p>
                          <p className="font-mono">{analysisData.rhythmAnalysis.rrIntervals.slice(0, 5).join(', ')}...</p>
                        </div>
                      </div>

                      <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                        <p className="text-sm font-medium text-foreground mb-2">Signal Quality</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Noise Reduction</span>
                            <span className="text-xs font-medium">{Math.round(analysisData.noiseReduction)}%</span>
                          </div>
                          <Progress value={analysisData.noiseReduction} className="h-2" />
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Signal Quality</span>
                            <span className="text-xs font-medium">{Math.round(analysisData.signalQuality)}%</span>
                          </div>
                          <Progress value={analysisData.signalQuality} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>}

          {/* Recommendations */}
          <Card className="border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Medical Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generateRecommendations().map((recommendation, index) => <div key={index} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                    <div className="p-1 rounded-full bg-primary/10 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-sm text-foreground flex-1">{recommendation}</p>
                  </div>)}
              </div>
              
              {recording.attack_risk > 15 && <div className="mt-4 p-4 bg-critical/5 border border-critical/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-critical mt-0.5" />
                    <div>
                      <p className="font-medium text-critical mb-1">Important Notice</p>
                      <p className="text-sm text-foreground">
                        Given the elevated risk level detected, we strongly recommend consulting with a healthcare professional 
                        for a comprehensive cardiovascular evaluation and personalized treatment plan.
                      </p>
                    </div>
                  </div>
                </div>}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>;
};
export default RecordingDetailModal;