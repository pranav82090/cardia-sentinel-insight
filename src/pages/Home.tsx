import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Camera, Activity, Brain, Shield, Smartphone, ArrowRight, Zap, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const Home = () => {
  const features = [
    {
      icon: Heart,
      title: "Heart Sound Analysis",
      description: "AI-powered auscultation analysis detecting S1/S2/S3/S4 sounds, murmurs, and rhythm abnormalities with >98.5% accuracy.",
      tag: "AI Engine"
    },
    {
      icon: Camera,
      title: "Camera PPG Monitoring",
      description: "Photoplethysmography via phone camera measures real-time heart rate through blood flow detection.",
      tag: "PPG Tech"
    },
    {
      icon: Activity,
      title: "HRV Stress Analysis",
      description: "Heart Rate Variability (RMSSD) analysis quantifies autonomic nervous system function and stress response.",
      tag: "Clinical"
    },
    {
      icon: Brain,
      title: "Gemini AI Assessment",
      description: "Powered by Gemini AI following AHA/ACC/ESC guidelines for evidence-based cardiovascular risk stratification.",
      tag: "98.5%+ Accuracy"
    },
    {
      icon: Shield,
      title: "ASCVD & PREVENT™",
      description: "Integrated Pooled Cohort Equations and AHA PREVENT™ calculator for 10-year cardiovascular event risk.",
      tag: "ACC/AHA"
    },
    {
      icon: Smartphone,
      title: "Clinical Reports",
      description: "Generate downloadable PDF reports with clinical summaries, key findings, and AI recommendations.",
      tag: "Export Ready"
    },
  ];

  const metrics = [
    { value: "98.5%+", label: "AI Accuracy" },
    { value: "3-Step", label: "Assessment" },
    { value: "Real-time", label: "Analysis" },
    { value: "PDF", label: "Reports" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-6 text-primary border-primary/20 bg-primary/5 px-3 py-1">
              <Zap className="h-3 w-3 mr-1.5" />
              AI-Powered Cardiac Analysis Platform
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
              Cardia Sentinel
              <span className="gradient-text block mt-1">AI Platform</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              Advanced cardiovascular risk assessment using heart sound analysis,
              camera-based BPM monitoring, and AI-powered clinical insights following AHA/ACC/ESC guidelines.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Link to="/auth">
                <Button variant="cardiac" size="lg" className="gap-2 w-full sm:w-auto">
                  Start Assessment
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/recording">
                <Button variant="medical" size="lg" className="gap-2 w-full sm:w-auto">
                  <Heart className="h-4 w-4" />
                  Try Recording
                </Button>
              </Link>
            </div>

            {/* Metric pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
              {metrics.map((m, i) => (
                <div key={i} className="stat-card text-center !p-3">
                  <p className="text-lg font-bold text-foreground font-mono-medical">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Clinical-Grade Analysis Features
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Comprehensive cardiovascular assessment combining multiple diagnostic modalities with AI interpretation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="stat-card group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-muted-foreground">
                    {feature.tag}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-border/50 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              3-Step Assessment Process
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Record Heart Sounds", desc: "Place phone on chest. AI analyzes S1/S2 sounds, detects murmurs, and measures rhythm." },
              { step: "02", title: "Camera PPG Scan", desc: "Place finger on camera. PPG technology measures heart rate through blood flow detection." },
              { step: "03", title: "AI Risk Assessment", desc: "Gemini AI generates clinical report with risk level, findings, and recommendations." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-sm font-bold text-primary font-mono-medical">{item.step}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer */}
      <section className="py-20 border-t border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="stat-card !p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="shrink-0">
                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                  <img src="cardia-uploads/pranav.png" alt="Developer" className="w-full h-full object-cover rounded-full" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-foreground mb-1">About the Developer</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Born in Tirupur on August 14, 2012. Currently studying 8th grade at A.V.P Trust Public Senior Secondary School (CBSE).
                  Inspired to create Cardia Sentinel after learning that heart attacks increasingly affect younger people.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Badge variant="outline" className="text-xs">Student Developer</Badge>
                  <Badge variant="outline" className="text-xs">Tirupur, India</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border/50 bg-primary/3">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Start Monitoring Your Heart Health
          </h2>
          <p className="text-muted-foreground mb-8">
            Free AI-powered cardiovascular assessment with clinical-grade accuracy.
          </p>
          <Link to="/auth">
            <Button variant="cardiac" size="lg" className="gap-2">
              Get Started
              <Heart className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> Cardia Sentinel AI is for educational and screening purposes only. 
            Not a substitute for professional medical diagnosis. Always consult a qualified healthcare provider.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
