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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your Health AI Assistant. I can help you with:\n\n• Understanding your heart recordings\n• Interpreting your health metrics\n• General cardiovascular health advice\n• App features and functionality\n\nHow can I assist you today?",
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

    // App-specific responses
    if (message.includes('recording') || message.includes('how to record')) {
      response = "To record your heart sounds:\n\n1. Go to the Recording page\n2. Click 'Start Recording'\n3. Place your phone near your chest or use a stethoscope\n4. Record for 15-30 seconds\n5. Click 'Analyze Recording' to get AI insights\n\nThe app uses advanced noise removal and aims for 95%+ accuracy!";
      type = 'info';
    }
    else if (message.includes('accuracy') || message.includes('noise')) {
      response = "Our app features:\n\n• Advanced noise removal algorithms\n• 95%+ accuracy in heart sound analysis\n• Self-learning AI that improves over time\n• Real-time PPG monitoring\n• Comprehensive risk assessment\n\nThe accuracy improves with each recording as our AI learns from your specific heart patterns.";
      type = 'info';
    }
    else if (message.includes('risk') || message.includes('heart attack')) {
      if (userRecordings.length > 0) {
        const avgRisk = userRecordings.reduce((sum, r) => sum + r.attack_risk, 0) / userRecordings.length;
        response = `Based on your ${userRecordings.length} recordings, your average heart attack risk is ${Math.round(avgRisk)}%.\n\n${healthKnowledgeBase.riskFactors.high}\n\nFor personalized advice, consult with a healthcare provider.`;
        type = avgRisk > 50 ? 'warning' : 'info';
      } else {
        response = `${healthKnowledgeBase.riskFactors.high}\n\n${healthKnowledgeBase.riskFactors.prevention}`;
        type = 'info';
      }
    }
    else if (message.includes('heart rate') || message.includes('bpm')) {
      response = `${healthKnowledgeBase.heartRate.normal}\n\n${healthKnowledgeBase.heartRate.high}\n\n${healthKnowledgeBase.heartRate.low}`;
      type = 'info';
    }
    else if (message.includes('symptoms') || message.includes('chest pain') || message.includes('emergency')) {
      response = `⚠️ ${healthKnowledgeBase.symptoms.warning}\n\nThis app is for monitoring purposes only and should not replace professional medical care.`;
      type = 'warning';
    }
    else if (message.includes('diet') || message.includes('food') || message.includes('nutrition')) {
      response = `${healthKnowledgeBase.lifestyle.diet}\n\nConsider consulting with a nutritionist for personalized dietary advice.`;
      type = 'info';
    }
    else if (message.includes('exercise') || message.includes('workout') || message.includes('fitness')) {
      response = `${healthKnowledgeBase.lifestyle.exercise}\n\nAlways consult your doctor before starting a new exercise program.`;
      type = 'info';
    }
    else if (message.includes('7 day') || message.includes('week') || message.includes('trend')) {
      response = "The 7-day analysis feature tracks your heart health trends over a week, including:\n\n• Average heart rate patterns\n• Risk level changes\n• Stress level variations\n• Recovery trends\n• Recommendations based on patterns\n\nRecord daily for the most accurate weekly insights!";
      type = 'info';
    }
    else if (message.includes('hello') || message.includes('hi') || message.includes('help')) {
      response = "Hello! I'm here to help with your cardiovascular health questions. I can explain your recordings, provide general heart health advice, or guide you through app features. What would you like to know?";
      type = 'info';
    }
    else {
      response = "I'm here to help with cardiovascular health and app-related questions. You can ask me about:\n\n• Your heart recordings and results\n• General heart health information\n• App features and how to use them\n• Risk factors and prevention\n• When to seek medical care\n\nWhat specific topic interests you?";
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
    { text: "How to record heart sounds?", icon: Stethoscope },
    { text: "Explain my risk level", icon: Shield },
    { text: "Heart rate information", icon: Heart },
    { text: "7-day analysis", icon: Clock },
  ];

  return (
    <Card className="border-0 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Health AI Assistant
          <Badge variant="outline" className="ml-auto">24/7 Available</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
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
                
                <div className={`max-w-[80%] space-y-1`}>
                  <div className={`rounded-lg p-3 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : message.type === 'warning'
                      ? 'bg-critical/10 text-foreground border border-critical/20'
                      : message.type === 'info'
                      ? 'bg-primary/5 text-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
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
        <div className="px-6 py-3 border-t">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputMessage(action.text);
                  setTimeout(sendMessage, 100);
                }}
                className="text-xs"
              >
                <action.icon className="h-3 w-3 mr-1" />
                {action.text}
              </Button>
            ))}
          </div>
          
          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your heart health..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!inputMessage.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthChatbot;