import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Camera, Activity, Brain, Shield, Smartphone, ArrowRight, Github, Linkedin, Mail } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import developerPhoto from "@/assets/developer-photo.jpg";
import Navbar from "@/components/Navbar";
const Home = () => {
  const features = [{
    icon: <Heart className="h-8 w-8 text-primary" />,
    title: "Heart Attack Risk Prediction",
    description: "AI-powered analysis of heart sounds to predict cardiovascular risks using advanced machine learning algorithms.",
    status: "Advanced AI"
  }, {
    icon: <Camera className="h-8 w-8 text-primary" />,
    title: "Camera-Based BPM Monitoring",
    description: "Measure your heart rate using your phone's camera and flashlight with photoplethysmography (PPG) technology.",
    status: "PPG Technology"
  }, {
    icon: <Activity className="h-8 w-8 text-primary" />,
    title: "HRV Stress Analysis",
    description: "Monitor stress levels through Heart Rate Variability analysis for comprehensive wellness assessment.",
    status: "Medical Grade"
  }, {
    icon: <Brain className="h-8 w-8 text-primary" />,
    title: "Real-time AI Insights",
    description: "Get instant health insights by Our powerful Trained Data with the 96% Accuracy.",
    status: "Real-time"
  }, {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Secure Health Data",
    description: "Your health data is encrypted and securely stored with enterprise-grade protection.",
    status: "HIPAA Compliant"
  }, {
    icon: <Smartphone className="h-8 w-8 text-primary" />,
    title: "Mobile Health Platform",
    description: "Access your health monitoring tools anywhere with our responsive web application.",
    status: "Cross-Platform"
  }];
  return <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-primary">
                  AI-Powered Heart Monitoring
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                  Cardia Sentinel
                  <span className="text-primary block">AI Platform</span>
                </h1>
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  Advanced heart attack risk prediction using AI analysis of heart sounds, 
                  camera-based BPM monitoring, and stress level assessment through HRV analysis.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth" className="flex-1 sm:flex-none">
                  <Button variant="cardiac" size="lg" className="gap-2 h-12 lg:h-14 px-6 lg:px-8 w-full sm:w-auto">
                    Start Monitoring
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/recording" className="flex-1 sm:flex-none">
                  <Button variant="medical" size="lg" className="gap-2 h-12 lg:h-14 px-6 lg:px-8 w-full sm:w-auto">
                    <Heart className="h-5 w-5" />
                    Try Recording
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  HIPAA Compliant
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  AI-Powered
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-success" />
                  Medical Grade
                </div>
              </div>
            </div>
            
            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-3xl blur-3xl" />
              <img src={heroImage} alt="Cardia Sentinel AI Heart Monitoring Interface" className="relative w-full rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Advanced Heart Monitoring Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI technology with medical-grade 
              monitoring capabilities to provide you with the most accurate health insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 lg:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2 lg:p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        {feature.icon}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {feature.status}
                      </Badge>
                    </div>
                    <h3 className="text-lg lg:text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Meet the Developer
            </h2>
            <p className="text-xl text-muted-foreground">
              Passionate about creating life-saving healthcare technology
            </p>
          </div>
          
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-card to-secondary/30">
            <CardContent className="p-6 sm:p-8 lg:p-12">
              <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-8">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-glow rounded-full blur-xl opacity-30" />
                  <img src={developerPhoto} alt="Developer Profile" className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover ring-4 ring-primary/20" />
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-4">
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground">
                    Personal Information
                  </h3>
                  <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                    I was born in Tirupur on August 14, 2012, and I'm currently studying in 8th grade at A.V.P Trust Public Senior Secondary School (CBSE) in 2025, Gandhi Nagar, Tirupur.
                  </p>
                  <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                    I have a passion for software engineering, and I was inspired to create the CardiacSentinel application after learning that heart attacks are increasingly affecting people at younger ages. This concerning trend motivated me to develop an AI-powered solution that could help detect heart conditions early and potentially save lives.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Born:</strong> August 14, 2012</p>
                    <p><strong>Location:</strong> Tirupur</p>
                  </div>
                  
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-primary/10 via-primary-glow/10 to-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Start Monitoring Your Heart Health Today
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground">
              Join thousands of users who trust Cardia Sentinel AI for their cardiovascular health monitoring.
            </p>
            <Link to="/auth">
              <Button variant="cardiac" size="lg" className="gap-2 h-12 lg:h-14 px-6 lg:px-8">
                Get Started Free
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>;
};
export default Home;