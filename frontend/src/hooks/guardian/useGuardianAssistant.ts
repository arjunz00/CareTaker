import { useState } from 'react';

export interface ChatMessage {
  sender: 'guardian' | 'assistant';
  text: string;
}

export function useGuardianAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    setMessages(prev => [...prev, { sender: 'guardian', text: messageText }]);
    setLoading(true);
    
    try {
      const res = await fetch("/api/guardian/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'assistant', text: data.response }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { sender: 'assistant', text: "Error matching assistant channels. Try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    sendMessage
  };
}
