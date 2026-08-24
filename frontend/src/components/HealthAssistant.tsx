import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, AlertOctagon, Mic, MicOff, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { useHealthAssistant } from '../hooks/useHealthAssistant';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';

const parseBold = (text: string) => {
  const parts = text.split('**');
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-bold text-white">{part}</strong>;
    }
    return part;
  });
};

const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentListType: 'ul' | 'ol' | null = null;
  let currentListItems: { prefix?: string; text: string }[] = [];
  
  const flushList = (key: string | number) => {
    if (currentListType === 'ul') {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 my-1 space-y-1 text-slate-355 select-text">
          {currentListItems.map((item, idx) => (
            <li key={idx} className="text-slate-300">{parseBold(item.text)}</li>
          ))}
        </ul>
      );
    } else if (currentListType === 'ol') {
      elements.push(
        <ol key={`ol-${key}`} className="list-decimal pl-5 my-1 space-y-1 text-slate-355 select-text">
          {currentListItems.map((item, idx) => (
            <li key={idx} className="text-slate-300">
              {item.prefix && (
                <span className="font-mono text-indigo-400 mr-1">{item.prefix}</span>
              )}
              {parseBold(item.text)}
            </li>
          ))}
        </ol>
      );
    }
    currentListItems = [];
    currentListType = null;
  };
  
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    
    // Check if line is a bullet item
    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
    
    // Check if line is a numbered item
    const numMatch = trimmed.match(/^(\d+[\).])\s+(.*)/);
    const isNum = !!numMatch;
    
    if (isBullet) {
      if (currentListType !== 'ul') {
        flushList(idx);
        currentListType = 'ul';
      }
      currentListItems.push({ text: trimmed.substring(2) });
    } else if (isNum && numMatch) {
      if (currentListType !== 'ol') {
        flushList(idx);
        currentListType = 'ol';
      }
      currentListItems.push({ prefix: numMatch[1], text: numMatch[2] });
    } else {
      if (currentListType) {
        flushList(idx);
      }
      
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-base font-bold text-white mt-4 mb-1.5 pb-0.5 border-b border-slate-800">
            {trimmed.substring(2)}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-sm font-bold text-white mt-3.5 mb-1 border-b border-slate-850 pb-0.5">
            {trimmed.substring(3)}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-xs font-semibold text-slate-350 mt-2.5 mb-1">
            {trimmed.substring(4)}
          </h3>
        );
      } else if (trimmed === '') {
        elements.push(<div key={idx} className="h-1.5" />);
      } else {
        elements.push(
          <p key={idx} className="my-1.5 text-slate-200">
            {parseBold(line)}
          </p>
        );
      }
    }
  });
  
  if (currentListType) {
    flushList('end');
  }
  
  return <div className="space-y-1">{elements}</div>;
};

interface HealthAssistantProps {
  currentVitals?: any;
  prescriptions?: any[];
  riskScore?: number;
  role?: string;
  title?: string;
}

export default function HealthAssistant({
  currentVitals = {},
  prescriptions = [],
  riskScore = 0,
  role = 'patient',
  title
}: HealthAssistantProps) {
  const [input, setInput] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const { messages, typing, sendMessage } = useHealthAssistant(currentVitals, prescriptions, riskScore, role);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    transcript,
    isSpeaking,
    hasSpeechSupport,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  } = useVoiceAssistant((finalText) => {
    setInput(finalText);
  });

  // Sync transcript to input field when listening
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const roleQuestions: Record<string, string[]> = {
    patient: [
      "What does my SpO₂ mean?",
      "Explain my prescription.",
      "Summarize my recent health trends.",
      "What should I ask my doctor?"
    ],
    guardian: [
      "Summarize current vitals status.",
      "Check medication adherence.",
      "What happens during an emergency alert?",
      "Explain privacy consent permissions."
    ],
    doctor: [
      "Summarize clinical risk score factors.",
      "Review prescription adherence log.",
      "How to export longitudinal Excel reports?",
      "Check emergency escalation override."
    ],
    volunteer: [
      "Show CPR & First-Aid protocol.",
      "How to accept an incident dispatch?",
      "How to verify Proof of Care?",
      "What to do on false alarm?"
    ],
    college: [
      "Show campus emergency protocol.",
      "Review dorm telemetry aggregates.",
      "How are student credits calculated?",
      "Check student health center referrals."
    ]
  };

  const suggestedQuestions = roleQuestions[role.toLowerCase()] || roleQuestions.patient;
  const displayTitle = title || `AegisNet ${role.charAt(0).toUpperCase() + role.slice(1)} Assistant`;

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend) return;
    
    if (isListening) stopListening();
    setInput('');

    const reply = await sendMessage(textToSend);
    if (autoSpeak && reply) {
      speakText(reply);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleAutoSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setAutoSpeak(!autoSpeak);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[540px] shadow-xl overflow-hidden">
      
      {/* Header */}
      <div className="bg-slate-950/80 border-b border-slate-850 px-5 py-3.5 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-950/60 border border-indigo-900 text-indigo-400 rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{displayTitle}</h4>
            <span className="text-[9px] text-slate-500 font-mono block mt-0.5">RAG Context & Voice Enabled</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* TTS Auto-speak toggle button */}
          <button
            onClick={toggleAutoSpeak}
            title={autoSpeak ? "Disable Voice Output" : "Enable Voice Output"}
            className={`p-1.5 rounded-lg border text-xs transition ${
              autoSpeak || isSpeaking
                ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {isSpeaking ? (
              <Volume2 className="w-4 h-4 animate-pulse text-indigo-400" />
            ) : autoSpeak ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">
            {role.toUpperCase()} RAG
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3.5 bg-slate-950/20">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <div 
              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-950/20 font-medium'
                  : msg.isCritical
                    ? 'bg-rose-950/40 border border-rose-900/60 text-rose-300 rounded-tl-none alarm-alert-active'
                    : 'bg-slate-900 border border-slate-850 text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.isCritical && (
                <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1 border-b border-rose-900/40 pb-1">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  EMERGENCY ADVISORY
                </div>
              )}
              {renderMarkdown(msg.text)}

              {msg.retrievedSources && msg.retrievedSources.length > 0 && (
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[8px] text-slate-400 flex items-center gap-1 font-mono uppercase">
                    <BookOpen className="w-2.5 h-2.5 text-indigo-400" /> Grounded RAG:
                  </span>
                  {msg.retrievedSources.map((src, i) => (
                    <span key={i} className="text-[8px] bg-slate-950 border border-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 px-1">
              <span className="text-[8px] text-slate-500 font-mono">{msg.timestamp}</span>
              {msg.sender === 'assistant' && (
                <button
                  onClick={() => speakText(msg.text)}
                  className="text-[9px] text-slate-500 hover:text-indigo-400 transition font-mono flex items-center gap-0.5"
                  title="Read message aloud"
                >
                  <Volume2 className="w-2.5 h-2.5" /> Speak
                </button>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="mr-auto items-start max-w-[80%] flex flex-col">
            <div className="bg-slate-900 border border-slate-850 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Questions Grid */}
      <div className="bg-slate-950/40 border-t border-slate-850 p-2.5 flex flex-wrap gap-2 select-none">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(q);
              sendMessage(q).then((reply) => {
                if (autoSpeak && reply) speakText(reply);
              });
            }}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white rounded-lg px-2.5 py-1 text-[10px] font-semibold transition active:scale-95 text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input controls */}
      <div className="bg-slate-900 border-t border-slate-850 p-3 flex gap-2 items-center">
        {/* Microphone Button (Speech-to-Text) */}
        {hasSpeechSupport && (
          <button
            onClick={toggleMic}
            title={isListening ? "Stop listening" : "Start voice input"}
            className={`p-2 rounded-xl transition flex items-center justify-center shrink-0 border ${
              isListening
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={isListening ? "Listening... speak clearly" : `Ask AegisNet ${role} RAG assistant...`}
          className={`flex-1 bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none placeholder-slate-500 ${
            isListening ? 'border-rose-600/60 ring-1 ring-rose-500/30' : 'border-slate-800 focus:border-indigo-500'
          }`}
        />

        <button
          onClick={handleSend}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition active:scale-95 flex items-center justify-center shadow-lg shadow-indigo-600/10 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
