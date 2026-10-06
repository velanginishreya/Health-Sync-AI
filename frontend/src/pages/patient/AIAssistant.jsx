import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bot, Send, User, Cpu, ShieldCheck, Info, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Panel, PanelHeader, StatusPill, Button } from '../../components/ui';

export const AIAssistant = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [contextUsed, setContextUsed] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/v1/ai/conversations');
      setConversations(res.data);
      if (res.data.length > 0 && !currentConvId) {
        loadConversation(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversation = async (convId) => {
    setCurrentConvId(convId);
    try {
      const res = await axios.get(`/api/v1/ai/conversations/${convId}`);
      setMessages(res.data.messages || []);
      const lastAsst = [...(res.data.messages || [])].reverse().find(m => m.role === 'assistant');
      if (lastAsst?.context_used) {
        setContextUsed(lastAsst.context_used);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (queryText) => {
    const text = queryText || inputMessage;
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await axios.post('/api/v1/ai/chat', {
        conversation_id: currentConvId,
        message: text
      });

      setCurrentConvId(res.data.conversation_id);
      setContextUsed(res.data.context_used || []);

      const asstMsg = {
        role: 'assistant',
        content: res.data.message,
        context_used: res.data.context_used,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, asstMsg]);
      fetchConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col md:flex-row gap-4">
      {/* Left Sidebar: Conversations History */}
      <Panel className="w-full md:w-64 p-4 flex flex-col shrink-0 max-h-64 md:max-h-none">
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          className="w-full mb-3"
          onClick={() => { setCurrentConvId(null); setMessages([]); setContextUsed([]); }}
        >
          New AI conversation
        </Button>

        <span className="instrument-label block mb-2 px-1">Recent discussions</span>
        <div className="space-y-1 overflow-y-auto flex-1 pr-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => loadConversation(c.id)}
              className={`p-2.5 rounded-control text-xs cursor-pointer truncate transition ${
                currentConvId === c.id
                  ? 'bg-accent-50 text-accent-700 font-semibold border border-accent-200'
                  : 'text-ink-600 hover:bg-surface-sunken border border-transparent'
              }`}
            >
              {c.title}
            </div>
          ))}
        </div>
      </Panel>

      {/* Center Panel: Active Chat Stream */}
      <Panel className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="p-4 border-b border-line flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-control bg-ink-950 text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ink-900">AI health assistant</h2>
              <span className="text-[11px] text-ink-500 block truncate">Personalized RAG context engine</span>
            </div>
          </div>

          <StatusPill variant="good" className="hidden sm:inline-flex shrink-0">Safety filter active</StatusPill>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-card bg-accent-50 text-accent-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink-800">Ask Health Sync AI</h3>
                <p className="text-xs text-ink-500 max-w-sm mx-auto mt-1">
                  Ask questions about your blood test parameters, active medications, vital trends, or diet.
                </p>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto pt-2">
                {[
                  "What does my latest blood report mean?",
                  "Why might my blood pressure be changing?",
                  "Give me a diet plan based on my profile",
                  "Should I double my medicine?"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-xs bg-surface-sunken hover:bg-accent-50 hover:text-accent-700 text-ink-700 px-3 py-1.5 rounded-full border border-line transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 sm:gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-control bg-ink-950 text-white flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" strokeWidth={2} />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-card p-4 text-xs leading-relaxed space-y-2 ${
                  m.role === 'user'
                    ? 'bg-accent-600 text-white'
                    : 'bg-surface-raised border border-line text-ink-800 shadow-panel'
                }`}>
                  <div className="whitespace-pre-wrap font-sans space-y-1 break-words">
                    {m.content}
                  </div>

                  {m.role === 'assistant' && (
                    <div className="pt-2.5 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-medium">
                      <span className="flex items-center gap-1.5 text-[10px] text-ink-500">
                        <Info className="w-3 h-3 shrink-0" strokeWidth={2} /> Educational context, not a medical diagnosis
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-status-good-600 font-semibold">
                        <ShieldCheck className="w-3 h-3 shrink-0" strokeWidth={2} /> Verified by safety layer
                      </span>
                    </div>
                  )}
                </div>


                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-control bg-ink-800 text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" strokeWidth={2} />
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-accent-600 font-medium p-2">
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> AI is retrieving authorized Digital Twin context…
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-line bg-surface-sunken/50 rounded-b-card">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your health context…"
              className="flex-1 min-w-0 px-4 py-2.5 text-xs border border-line rounded-control focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-surface-raised transition"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              disabled={loading || !inputMessage.trim()}
              className="shrink-0 !px-3"
              aria-label="Send message"
            />
          </form>
        </div>
      </Panel>

      {/* Right Panel: Digital Twin Context Used (Core Explainability USP) */}
      <Panel className="w-full md:w-72 p-4 shrink-0 flex flex-col space-y-4 max-h-64 md:max-h-none">
        <PanelHeader
          className="border-b border-line pb-2"
          label="Explainable AI data sources"
          title={
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-accent-600" strokeWidth={2} /> Context used (RAG)
            </span>
          }
        />

        <div className="space-y-2 flex-1 overflow-y-auto">
          {contextUsed.length > 0 ? (
            contextUsed.map((src, idx) => (
              <div key={idx} className="bg-accent-50 border border-accent-100 p-2.5 rounded-control flex items-center gap-2 text-xs font-semibold text-accent-900">
                <Cpu className="w-4 h-4 text-accent-600 shrink-0" strokeWidth={2} />
                <span className="readout font-normal truncate">{src}</span>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-ink-400 p-3 text-center bg-surface-sunken rounded-control border border-line">
              Context sources will appear dynamically when asking questions.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
};
