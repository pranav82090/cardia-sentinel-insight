import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Heart, FileText, Activity, Brain, Shield, ArrowLeft } from "lucide-react";

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

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recording, setRecording] = useState<HeartRecording | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecording = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      try {
        const { data, error } = await supabase.from('heart_recordings').select('*').eq('id', id).single();
        if (error) throw error;
        setRecording(data as HeartRecording);
        document.title = `Report • ${new Date(data.recorded_at).toLocaleDateString()} | Cardia Sentinel AI`;
      } catch {
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecording();
  }, [id, navigate]);

  const getRiskLevel = (risk: number) => risk <= 7 ? "Low" : risk <= 15 ? "Moderate" : "High";
  const getRiskColor = (risk: number) => risk <= 7 ? "text-success" : risk <= 15 ? "text-warning" : "text-critical";
  const getRiskBg = (risk: number) => risk <= 7 ? "bg-success/10" : risk <= 15 ? "bg-warning/10" : "bg-critical/10";

  const getHealthScore = (rec: HeartRecording) => {
    let score = 100;
    score -= Math.abs(rec.heart_rate_avg - 75) * 0.5;
    score -= rec.attack_risk * 1.2;
    score -= rec.stress_score ? rec.stress_score * 0.4 : 0;
    return Math.max(0, Math.round(score));
  };

  const downloadReport = async () => {
    if (!recording) return;
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    let y = 25;
    doc.setFontSize(20); doc.setTextColor(20, 130, 100);
    doc.text('Cardia Sentinel AI — Clinical Report', 20, y); y += 12;
    doc.setFontSize(10); doc.setTextColor(100, 100, 100);
    doc.text(`Report ID: ${recording.id}`, 20, y); y += 6;
    doc.text(`Date: ${new Date(recording.recorded_at).toLocaleString()}`, 20, y); y += 10;
    doc.setTextColor(30, 30, 30); doc.setFontSize(12);
    doc.text(`Heart Rate: ${recording.heart_rate_avg} BPM (${recording.heart_rate_min}-${recording.heart_rate_max})`, 20, y); y += 7;
    doc.text(`Condition: ${recording.condition}`, 20, y); y += 7;
    doc.text(`Risk Level: ${getRiskLevel(recording.attack_risk)} (${recording.attack_risk}%)`, 20, y); y += 7;
    doc.text(`Stress: ${recording.stress_level || 'N/A'} (Score: ${recording.stress_score ?? '—'})`, 20, y); y += 7;
    doc.text(`AI Confidence: ${(recording.model_accuracy || 96).toFixed(1)}%`, 20, y); y += 7;
    if (recording.systolic_bp) doc.text(`Blood Pressure: ${recording.systolic_bp}/${recording.diastolic_bp} mmHg`, 20, y); y += 7;
    doc.text(`Health Score: ${getHealthScore(recording)}/100`, 20, y); y += 15;
    doc.setFontSize(8); doc.setTextColor(130, 130, 130);
    doc.text('This report is for educational purposes. Consult a healthcare provider for medical advice.', 20, 280);
    doc.save(`Cardia_Report_${recording.id.slice(0, 8)}.pdf`);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Heart className="h-6 w-6 text-primary animate-pulse" />
    </div>
  );
  if (!recording) return null;

  const healthScore = getHealthScore(recording);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
            <div className="w-px h-5 bg-border" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Clinical Report</h1>
              <p className="text-xs text-muted-foreground">ID: {recording.id.slice(0, 8)}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={downloadReport} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="stat-card text-center">
            <Heart className="h-5 w-5 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold font-mono-medical">{recording.heart_rate_avg}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Avg BPM</p>
            <p className="text-[10px] text-muted-foreground">{recording.heart_rate_min}–{recording.heart_rate_max}</p>
          </div>
          <div className={`stat-card text-center`}>
            <Shield className={`h-5 w-5 ${getRiskColor(recording.attack_risk)} mx-auto mb-2`} />
            <p className={`text-2xl font-bold ${getRiskColor(recording.attack_risk)}`}>{getRiskLevel(recording.attack_risk)}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Risk Level</p>
            <p className="text-[10px] text-muted-foreground">{recording.attack_risk}%</p>
          </div>
          <div className="stat-card text-center">
            <Brain className="h-5 w-5 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">{recording.stress_level || "—"}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Stress</p>
            <p className="text-[10px] text-muted-foreground">Score: {recording.stress_score ?? '—'}</p>
          </div>
          <div className="stat-card text-center">
            <Activity className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold font-mono-medical">{healthScore}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Health Score</p>
            <p className="text-[10px] text-muted-foreground">/100</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Recording Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Date" value={new Date(recording.recorded_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
              <InfoRow label="Time" value={new Date(recording.recorded_at).toLocaleTimeString()} />
              <InfoRow label="Condition" value={recording.condition} />
              <InfoRow label="AI Confidence" value={`${(recording.model_accuracy || 96).toFixed(1)}%`} />
              {recording.systolic_bp && <InfoRow label="Blood Pressure" value={`${recording.systolic_bp}/${recording.diastolic_bp} mmHg`} />}
            </CardContent>
          </Card>

          <Card className="border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Heart Rate" value={`${recording.heart_rate_avg} BPM (${recording.heart_rate_min}–${recording.heart_rate_max})`} />
              <InfoRow label="Risk Assessment" value={`${getRiskLevel(recording.attack_risk)} (${recording.attack_risk}%)`} />
              <InfoRow label="Stress Level" value={recording.stress_level || 'Not measured'} />
              <InfoRow label="Stress Score" value={recording.stress_score?.toString() ?? 'N/A'} />
              <InfoRow label="Health Score" value={`${healthScore}/100`} />
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-3 rounded-lg bg-warning/5 border border-warning/20">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> This AI-generated report is for educational and screening purposes only.
            Always consult a qualified healthcare provider for medical diagnosis and treatment decisions.
          </p>
        </div>
      </main>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-xs font-medium text-foreground">{value}</span>
  </div>
);

export default Report;
