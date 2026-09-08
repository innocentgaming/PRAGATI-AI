'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { sendChatMessage } from '@/lib/api';
import { 
  Bot, Send, User, Sparkles, BookOpen, 
  CheckCircle2, ExternalLink, ShieldAlert, ArrowRight, CornerDownLeft 
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{
    document_title: string;
    document_type: string;
    section?: string;
    page?: number;
    excerpt: string;
  }>;
  suggested_actions?: string[];
  timestamp: string;
}

const PRESET_QUERIES = [
  "Why is Project PRJ-001 high risk?",
  "Which railway projects have the highest delay probability?",
  "What are the top cost escalation drivers across infrastructure?",
  "Show projects with more than 20% predicted cost overrun.",
  "Summarize the latest monitoring status for Dedicated Freight Corridor (PRJ-002)."
];

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "### 🏛️ PRAGATI AI Decision-Support Intelligence\n\nI am the specialized infrastructure monitoring assistant for the **Ministry of Statistics and Programme Implementation (MoSPI)**.\n\nAll responses are strictly grounded in indexed PAIMANA/OCMS records, monthly IPMD returns, and validated machine learning inference with verifiable source citations.\n\nHow may I assist your infrastructure review today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(textToSend, sessionId);
      if (res.session_id) setSessionId(res.session_id);

      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: res.message,
        citations: res.citations || [],
        suggested_actions: res.suggested_actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: "I encountered a connection error while retrieving project records. Please ensure the backend service is running.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] gov-card overflow-hidden shadow-sm relative bg-white">
      
      {/* Assistant Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">PRAGATI AI Project Intelligence</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Grounded & Zero-Hallucination
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Direct RAG & Predictive Inference over PAIMANA / OCMS Knowledge Base
            </p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold ${
              msg.role === 'user' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-blue-300'
            }`}>
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div className={`space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`p-4 rounded-lg text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-700 text-white font-medium shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-sm space-y-2'
              }`}>
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>
              </div>

              {/* Citations Chips */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold uppercase tracking-wider">
                    <BookOpen className="h-3 w-3 text-blue-700" />
                    Sources:
                  </span>
                  {msg.citations.map((c, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => setSelectedCitation(c)}
                      className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-mono flex items-center gap-1 transition-colors"
                    >
                      <span>[{c.document_title.substring(0, 26)}...]</span>
                      <ExternalLink className="h-2.5 w-2.5 text-blue-600" />
                    </button>
                  ))}
                </div>
              )}

              {/* Suggested Follow-up Actions */}
              {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {msg.suggested_actions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleSend(act)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-full text-[10px] text-slate-700 font-medium transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>{act}</span>
                      <ArrowRight className="h-2.5 w-2.5 text-blue-700" />
                    </button>
                  ))}
                </div>
              )}

              <div className="text-[10px] text-slate-400 font-mono">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-2xl">
            <div className="h-7 w-7 rounded-md bg-slate-800 text-blue-300 flex items-center justify-center">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              <span>Retrieving indexed project documents & executing SHAP feature attribution...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Preset Query Chips */}
      {messages.length < 3 && (
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex-shrink-0">
            Suggested Queries:
          </span>
          {PRESET_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-300 text-slate-700 text-[11px] rounded whitespace-nowrap transition-colors shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3.5 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2.5"
        >
          <input
            type="text"
            placeholder="Ask about project risks, delay predictions, cost escalation drivers, or state comparisons..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-md px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* Citation Slide-over */}
      {selectedCitation && (
        <div className="absolute inset-y-0 right-0 w-80 bg-white border-l border-slate-200 p-5 shadow-xl z-20 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>Verified Source Citation</span>
              </span>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Document Title</div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">{selectedCitation.document_title}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Section / Page</div>
              <div className="text-xs font-mono text-slate-600 mt-0.5">{selectedCitation.section} (Page {selectedCitation.page || 1})</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Source Excerpt</div>
              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 mt-1 leading-relaxed italic">
                "{selectedCitation.excerpt}"
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400 font-mono text-center">
            Grounded Vector Provenance
          </div>
        </div>
      )}

    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading PRAGATI AI Assistant...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
