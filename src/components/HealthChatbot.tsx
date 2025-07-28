import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Heart,
  Activity,
  Brain,
  Shield,
  Stethoscope,
  Clock
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'info' | 'warning';
}

interface HealthChatbotProps {
  userRecordings?: any[];
}

const HealthChatbot = ({ userRecordings = [] }: HealthChatbotProps) => {
  const getRiskLevel = (risk: number) => {
    if (risk <= 10) return "Low";
    if (risk <= 19) return "Moderate";
    return "High";
  };
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your Health AI Assistant. I can help you with:\n\n• Analyzing your specific heart recordings and metrics\n• Interpreting your personalized health data\n• Providing insights based on your recording history\n• Comprehensive cardiovascular health guidance\n• App features and advanced analytics\n\nI have access to your recording data and can provide personalized insights. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'info'
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const healthKnowledgeBase = {
    heartRate: {
      normal: "A normal resting heart rate for adults ranges from 60-100 beats per minute. Athletes may have lower rates (40-60 bpm).",
      high: "A heart rate above 100 bpm at rest (tachycardia) may indicate stress, dehydration, medication effects, or heart conditions.",
      low: "A heart rate below 60 bpm (bradycardia) may be normal for athletes or could indicate heart rhythm issues."
    },
    riskFactors: {
      high: "High cardiovascular risk factors include: high blood pressure, smoking, diabetes, high cholesterol, family history, obesity, and sedentary lifestyle.",
      prevention: "Heart disease prevention includes: regular exercise, healthy diet, maintaining healthy weight, not smoking, limiting alcohol, managing stress."
    },
    symptoms: {
      warning: "Seek immediate medical attention for: chest pain, shortness of breath, irregular heartbeat, dizziness, fainting, or severe fatigue.",
      normal: "Common heart sounds include lub-dub rhythm. Murmurs aren't always concerning but should be evaluated by a doctor."
    },
    lifestyle: {
      diet: "Heart-healthy diet: fruits, vegetables, whole grains, lean proteins, fish, nuts. Limit processed foods, salt, and saturated fats.",
      exercise: "Aim for 150 minutes of moderate aerobic activity weekly, plus strength training twice a week."
    }
  };

  const generateBotResponse = (userMessage: string): Message => {
    const message = userMessage.toLowerCase();
    let response = "";
    let type: 'text' | 'info' | 'warning' = 'text';

    // Enhanced personalized responses with user data analysis
    if (message.includes('my report') || message.includes('my recording') || message.includes('analyze') || message.includes('my data')) {
      if (userRecordings.length > 0) {
        const latest = userRecordings[0];
        const avgHR = userRecordings.reduce((sum, r) => sum + (r.heart_rate_avg || 0), 0) / userRecordings.length;
        const avgRisk = userRecordings.reduce((sum, r) => sum + (r.attack_risk || 0), 0) / userRecordings.length;
        const avgStress = userRecordings.reduce((sum, r) => sum + (r.stress_level || 0), 0) / userRecordings.length;
        
        response = `📊 **Your Heart Health Analysis:**\n\n**Latest Recording:**\n• Heart Rate: ${latest.heart_rate_avg || 'N/A'} BPM\n• Attack Risk: ${getRiskLevel(latest.attack_risk || 0)}\n• Condition: ${latest.condition || 'Normal'}\n• Stress Level: ${latest.stress_level || 'Low'}\n\n**Overall Trends (${userRecordings.length} recordings):**\n• Average HR: ${Math.round(avgHR)} BPM\n• Average Risk: ${getRiskLevel(Math.round(avgRisk))}\n• Average Stress: ${avgStress.toFixed(1)}\n\n**Clinical Insights:**\n${avgRisk > 30 ? '⚠️ Elevated risk detected - consider lifestyle modifications' : '✅ Risk levels appear manageable'}\n${avgHR > 100 ? '⚠️ High resting heart rate pattern' : avgHR < 60 ? 'ℹ️ Lower heart rate - common in athletes' : '✅ Normal heart rate range'}`;
        type = avgRisk > 30 ? 'warning' : 'info';
      } else {
        response = "I don't see any recordings in your profile yet. Please record your heart sounds first:\n\n1. Go to Recording page\n2. Follow the guided recording process\n3. Get instant AI analysis\n4. Return here for personalized insights!";
        type = 'info';
      }
    }
    else if (message.includes('recording') || message.includes('how to record')) {
      response = "🎙️ **Recording Your Heart Sounds:**\n\n**Step-by-Step Guide:**\n1. Navigate to Recording page\n2. Ensure quiet environment\n3. Place phone on chest (left side)\n4. Click 'Start Recording'\n5. Breathe normally for 15-30 seconds\n6. Click 'Stop' and wait for AI analysis\n\n**Pro Tips:**\n• Use in quiet room for best results\n• Phone positioning is crucial\n• Multiple recordings improve accuracy\n• Best times: morning/evening when relaxed";
      type = 'info';
    }
    else if (message.includes('accuracy') || message.includes('noise') || message.includes('ai')) {
      response = "🤖 **Advanced AI Technology:**\n\n**Core Features:**\n• 95%+ accuracy in heart sound detection\n• Advanced noise filtering algorithms\n• Real-time signal processing\n• Machine learning pattern recognition\n• Continuous improvement through usage\n\n**Analysis Capabilities:**\n• S1, S2, S3, S4 heart sound detection\n• Murmur identification\n• Rhythm irregularity detection\n• Risk assessment algorithms\n• Stress level evaluation";
      type = 'info';
    }
    else if (message.includes('risk') || message.includes('heart attack') || message.includes('cardiovascular')) {
      if (userRecordings.length > 0) {
        const avgRisk = userRecordings.reduce((sum, r) => sum + (r.attack_risk || 0), 0) / userRecordings.length;
        const riskTrend = userRecordings.length > 1 ? 
          (userRecordings[0].attack_risk || 0) - (userRecordings[userRecordings.length - 1].attack_risk || 0) : 0;
        
        response = `🫀 **Your Cardiovascular Risk Assessment:**\n\n**Current Status:**\n• Average Risk: ${getRiskLevel(Math.round(avgRisk))}\n• Risk Category: ${avgRisk < 20 ? 'Low' : avgRisk < 40 ? 'Moderate' : 'High'}\n• Trend: ${riskTrend > 0 ? '📈 Increasing' : riskTrend < 0 ? '📉 Decreasing' : '➡️ Stable'}\n\n**Risk Factors to Monitor:**\n${healthKnowledgeBase.riskFactors.high}\n\n**Prevention Strategy:**\n${healthKnowledgeBase.riskFactors.prevention}\n\n${avgRisk > 40 ? '⚠️ **Important:** High risk detected. Please consult healthcare provider.' : '✅ Keep monitoring and maintain healthy habits.'}`;
        type = avgRisk > 40 ? 'warning' : 'info';
      } else {
        response = `🫀 **Cardiovascular Risk Information:**\n\n**Common Risk Factors:**\n${healthKnowledgeBase.riskFactors.high}\n\n**Prevention Methods:**\n${healthKnowledgeBase.riskFactors.prevention}\n\nRecord your heart sounds to get personalized risk assessment!`;
        type = 'info';
      }
    }
    else if (message.includes('heart rate') || message.includes('bpm') || message.includes('pulse')) {
      if (userRecordings.length > 0) {
        const hrData = userRecordings.map(r => r.heart_rate_avg || 0).filter(hr => hr > 0);
        const avgHR = hrData.reduce((sum, hr) => sum + hr, 0) / hrData.length;
        const minHR = Math.min(...hrData);
        const maxHR = Math.max(...hrData);
        
        response = `💓 **Your Heart Rate Analysis:**\n\n**Personal Data:**\n• Average: ${Math.round(avgHR)} BPM\n• Range: ${minHR} - ${maxHR} BPM\n• Recordings: ${hrData.length}\n\n**Clinical Reference:**\n${healthKnowledgeBase.heartRate.normal}\n\n**Your Status:**\n${avgHR > 100 ? '⚠️ Above normal range - consider medical consultation' : avgHR < 60 ? 'ℹ️ Below normal - common in athletes or may need evaluation' : '✅ Within normal range'}\n\n**Recommendations:**\n• Monitor trends over time\n• Note any symptoms during high/low readings\n• Record at consistent times for better tracking`;
        type = avgHR > 100 || avgHR < 50 ? 'warning' : 'info';
      } else {
        response = `💓 **Heart Rate Information:**\n\n${healthKnowledgeBase.heartRate.normal}\n\n${healthKnowledgeBase.heartRate.high}\n\n${healthKnowledgeBase.heartRate.low}\n\nRecord your heart sounds to get personalized heart rate analysis!`;
        type = 'info';
      }
    }
    else if (message.includes('symptoms') || message.includes('chest pain') || message.includes('emergency') || message.includes('urgent')) {
      response = `🚨 **Emergency Warning:**\n\n${healthKnowledgeBase.symptoms.warning}\n\n**When to Call 911:**\n• Severe chest pain or pressure\n• Difficulty breathing\n• Loss of consciousness\n• Severe dizziness\n• Irregular heartbeat with symptoms\n\n**Important:** This app is for monitoring only and should never replace emergency medical care or professional diagnosis.`;
      type = 'warning';
    }
    else if (message.includes('diet') || message.includes('food') || message.includes('nutrition') || message.includes('eat')) {
      response = `🥗 **Heart-Healthy Nutrition:**\n\n**Recommended Foods:**\n${healthKnowledgeBase.lifestyle.diet}\n\n**Daily Guidelines:**\n• 5-9 servings fruits/vegetables\n• 2-3 servings fish per week\n• Limit sodium to 2,300mg daily\n• Choose whole grains over refined\n• Stay hydrated (8 glasses water)\n\n**Foods to Limit:**\n• Processed meats\n• Trans fats\n• Excess alcohol\n• High-sodium foods\n• Sugary beverages`;
      type = 'info';
    }
    else if (message.includes('exercise') || message.includes('workout') || message.includes('fitness') || message.includes('activity')) {
      response = `🏃‍♂️ **Exercise for Heart Health:**\n\n**Weekly Goals:**\n${healthKnowledgeBase.lifestyle.exercise}\n\n**Recommended Activities:**\n• Brisk walking\n• Swimming\n• Cycling\n• Dancing\n• Strength training 2x/week\n\n**Getting Started:**\n• Start slowly if inactive\n• Warm up and cool down\n• Monitor heart rate during exercise\n• Listen to your body\n• Stay consistent\n\n⚠️ Always consult your doctor before starting new exercise programs.`;
      type = 'info';
    }
    else if (message.includes('stress') || message.includes('anxiety') || message.includes('mental')) {
      if (userRecordings.length > 0) {
        const avgStress = userRecordings.reduce((sum, r) => sum + (r.stress_level || 0), 0) / userRecordings.length;
        response = `🧘‍♀️ **Your Stress Analysis:**\n\n**Current Status:**\n• Average Stress Level: ${avgStress.toFixed(1)}/10\n• Category: ${avgStress < 3 ? 'Low' : avgStress < 6 ? 'Moderate' : 'High'}\n\n**Stress Management:**\n• Deep breathing exercises\n• Regular meditation\n• Adequate sleep (7-9 hours)\n• Regular physical activity\n• Social connections\n• Professional support if needed\n\n${avgStress > 6 ? '⚠️ High stress levels detected. Consider stress management techniques.' : '✅ Stress levels appear manageable.'}`;
        type = avgStress > 6 ? 'warning' : 'info';
      } else {
        response = "🧘‍♀️ **Stress & Heart Health:**\n\nChronic stress can impact cardiovascular health. Effective management includes:\n\n• Regular exercise\n• Meditation/mindfulness\n• Adequate sleep\n• Social support\n• Professional counseling\n• Relaxation techniques\n\nRecord your heart sounds to track how stress affects your cardiovascular metrics!";
        type = 'info';
      }
    }
    else if (message.includes('7 day') || message.includes('week') || message.includes('trend') || message.includes('analysis')) {
      response = "📈 **7-Day Heart Health Analysis:**\n\n**Comprehensive Tracking:**\n• Heart rate variability trends\n• Risk assessment patterns\n• Stress level monitoring\n• Recovery indicators\n• Rhythm analysis\n• Progressive health scoring\n\n**Advanced Features:**\n• AI-powered pattern recognition\n• Predictive health insights\n• Personalized recommendations\n• Clinical-grade reporting\n• Trend visualization\n\n**Best Practices:**\n• Record daily at same time\n• Note activities/symptoms\n• Consistent environment\n• Track lifestyle factors";
      type = 'info';
    }
    else if (message.includes('hello') || message.includes('hi') || message.includes('help') || message.includes('start')) {
      const recordingCount = userRecordings.length;
      response = `👋 **Hello! Welcome to your Health AI Assistant**\n\n**I can help you with:**\n• Analyzing your ${recordingCount} heart recordings\n• Explaining your personalized health metrics\n• Providing evidence-based health guidance\n• Understanding app features and analytics\n• Answering cardiovascular health questions\n\n**Quick Actions:**\n${recordingCount > 0 ? '• "Analyze my report" - Get detailed insights\n• "Show my trends" - View health patterns' : '• "How to record" - Get started with recordings'}\n• "Heart rate info" - Learn about BPM\n• "Risk factors" - Understand cardiovascular risks\n\nWhat would you like to explore?`;
      type = 'info';
    }
    else {
      response = "🤖 **I'm your personalized Health AI Assistant!**\n\n**I can analyze:**\n• Your specific heart recordings and data\n• Personal health trends and patterns\n• Risk assessments and recommendations\n• Cardiovascular health guidance\n\n**Try asking:**\n• \"Analyze my latest report\"\n• \"What's my heart rate trend?\"\n• \"Explain my risk level\"\n• \"Show me my stress patterns\"\n• \"How to improve my heart health?\"\n\n**General Topics:**\n• Symptoms and when to seek care\n• Diet and exercise recommendations\n• App features and functionality\n\nWhat specific aspect of your heart health interests you?";
      type = 'info';
    }

    return {
      id: Date.now().toString(),
      content: response,
      sender: 'bot',
      timestamp: new Date(),
      type
    };
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const quickActions = [
    { text: "Analyze my report", icon: Activity },
    { text: "Explain my risk level", icon: Shield },
    { text: "Show my heart rate trends", icon: Heart },
    { text: "7-day analysis insights", icon: Clock },
    { text: "How to record", icon: Stethoscope },
    { text: "Stress analysis", icon: Brain },
  ];

  return (
    <Card className="border-0 shadow-lg h-[600px] md:h-[700px] flex flex-col">
      <CardHeader className="pb-3 px-4 md:px-6">
        <CardTitle className="flex items-center gap-2 text-sm md:text-base">
          <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          Health AI Assistant
          <Badge variant="outline" className="ml-auto text-xs">
            {userRecordings.length > 0 ? `${userRecordings.length} Records` : '24/7 Available'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4 md:px-6" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[85%] md:max-w-[80%] space-y-1`}>
                  <div className={`rounded-lg p-2 md:p-3 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : message.type === 'warning'
                      ? 'bg-destructive/10 text-foreground border border-destructive/20'
                      : message.type === 'info'
                      ? 'bg-primary/5 text-foreground border border-primary/10'
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    <p className="text-xs md:text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground px-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="px-4 md:px-6 py-3 border-t bg-secondary/20">
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-1 md:gap-2 mb-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputMessage(action.text);
                  setTimeout(sendMessage, 100);
                }}
                className="text-xs justify-start md:justify-center h-8 md:h-9 px-2 md:px-3"
              >
                <action.icon className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{action.text}</span>
              </Button>
            ))}
          </div>
          
          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your heart health or reports..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 text-sm"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputMessage.trim() || isTyping}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthChatbot;