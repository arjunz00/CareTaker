import { useState } from 'react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isCritical?: boolean;
  retrievedSources?: string[];
}

export function useHealthAssistant(
  currentVitals: any = {}, 
  prescriptions: any[] = [], 
  riskScore: number = 0,
  role: string = 'patient'
) {
  const roleWelcomeMessages: Record<string, string> = {
    patient: "Hello! I am your AegisNet Patient Care Assistant. I can explain your wearable sensors, analyze wellness trends, or clarify medication safety. How can I assist you today?",
    guardian: "Welcome Guardian! I am your Family Telemetry Assistant. Ask me for patient status summaries, remote alert reviews, or caregiver action protocols.",
    doctor: "Greetings Doctor. I am your Clinical Decision RAG Assistant. I can summarize patient longitudinal history, risk score factors, and clinical guidelines.",
    volunteer: "First Responder Assistant active. Ask me for CPR/First-Aid protocols, scene navigation guidelines, or Proof-of-Care verification procedures.",
    college: "Campus Health Assistant online. Ask me about dorm telemetry aggregations, emergency dispatch escalation, or student wellness policies."
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: 'assistant',
      text: roleWelcomeMessages[role.toLowerCase()] || roleWelcomeMessages.patient,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [typing, setTyping] = useState(false);

  const sendMessage = async (text: string): Promise<string> => {
    if (!text.trim()) return '';

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role,
          message: text,
          context: {
            vitals: currentVitals,
            prescriptions: prescriptions,
            risk_score: riskScore
          }
        })
      });

      if (!res.ok) {
        let errDetail = `Server error (${res.status} ${res.statusText})`;
        try {
          const errData = await res.json();
          errDetail = errData.error || errData.detail || errData.message || errDetail;
        } catch (_) {}
        throw new Error(errDetail);
      }

      const data = await res.json();
      if (data.status === "error") {
        throw new Error(data.error || "RAG engine returned an error.");
      }

      const answerText = data.answer || data.response || "No response generated.";
      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'assistant',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCritical: data.is_critical || data.isCritical,
        retrievedSources: data.sources || data.retrieved_sources || data.retrievedSources
      };

      setMessages(prev => [...prev, replyMsg]);
      return answerText;
    } catch (e: any) {
      console.error("[Chat Assistant Error]:", e);
      const errorText = `⚠️ Care Gateway Error: ${e.message || "Failed to communicate with Care Assistant"}`;
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return errorText;
    } finally {
      setTyping(false);
    }

  };

  return {
    messages,
    typing,
    sendMessage
  };
}
