import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowUp,
  Bot,
  MessageSquarePlus,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button, IconButton } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ChatBubble, SafetyMark } from '../../components/ui/ChatBubble';
import { Sheet } from '../../components/ui/Overlay';
import { Skeleton } from '../../components/ui/Skeleton';
import { Toast, useToast } from '../../components/ui/Toast';
import { Caps, Meta } from '../../components/ui/Text';
import { errorText, get, post } from '../../lib/api';
import { fmtDateTime } from '../../lib/format';
import { softScrollIntoView } from '../../lib/scroll';
import { cn } from '../../lib/cn';

const PROMPTS = [
  'What does my lipid panel mean?',
  'Why is my blood pressure above target?',
  'What should I ask at my next visit?',
  'Explain my medicines in plain words',
];

const URGENCY = {
  EMERGENCY: { tone: 'critical', label: 'Emergency guidance', icon: AlertOctagon },
  HIGH: { tone: 'watch', label: 'Safety interception', icon: AlertTriangle },
};

const ConversationList = ({ conversations, activeId, onSelect, onNew, loading = false, className = '' }) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <Button variant="vellum" icon={MessageSquarePlus} block onClick={onNew}>
      New conversation
    </Button>
    <Caps className="px-1 pb-1 pt-4">Recent chats</Caps>
    {loading ? (
      <div className="space-y-1.5 px-1 py-1" role="status" aria-busy="true">
        <span className="sr-only">Loading your conversations</span>
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} className="h-10 w-full" />
        ))}
      </div>
    ) : conversations.length === 0 ? (
      <p className="px-1 py-2 text-b3 leading-relaxed text-sand-600">
        Your conversations will be listed here once you ask something.
      </p>
    ) : (
      <ul className="space-y-0.5">
        {conversations.map((conversation) => {
          const active = conversation.id === activeId;
          return (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => onSelect(conversation.id)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'w-full min-h-touch rounded-ctl3 px-3 py-2.5 text-left transition-colors duration-150',
                  active ? 'bg-petrol-50' : 'hover:bg-sand-100'
                )}
              >
                <span className={cn('block truncate text-b3', active ? 'font-semibold text-petrol-900' : 'font-medium text-sand-800')}>
                  {conversation.title}
                </span>
                <span className="v3-num mt-0.5 block font-mono3 text-m4 text-sand-500">
                  {fmtDateTime(conversation.created_at)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

const SourceList = ({ sources, className = '' }) => (
  <div className={className}>
    <Caps>Where this came from</Caps>
    {sources.length === 0 ? (
      <p className="mt-3 text-b3 leading-relaxed text-sand-600">
        Ask something and the parts of your record used to answer will be listed here, by name.
      </p>
    ) : (
      <ul className="mt-3 space-y-2">
        {sources.map((source) => (
          <li
            key={source}
            className="rounded-ctl3 border border-petrol-200 bg-petrol-50 px-3 py-2.5 text-b3 font-medium text-petrol-900"
          >
            {source}
          </li>
        ))}
      </ul>
    )}
    <div className="mt-5 border-t border-sand-200 pt-4">
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sand-500" strokeWidth={2} />
        <p className="text-b4 leading-relaxed text-sand-600">
          Every answer passes a safety check. Dosing, emergencies and diagnosis questions are
          refused on purpose, and the refusal is shown rather than hidden.
        </p>
      </div>
    </div>
  </div>
);

export const AIAssistant = () => {
  const { toast, show, clear } = useToast();
  const [conversations, setConversations] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sheet, setSheet] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const sources = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((message) => message.role === 'assistant');
    return lastAssistant?.context_used || [];
  }, [messages]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await get('/api/v1/ai/conversations');
        if (!alive) return;
        setConversations(list);
        if (list.length > 0) {
          const detail = await get(`/api/v1/ai/conversations/${list[0].id}`);
          if (!alive) return;
          setCurrentId(detail.id);
          setMessages(detail.messages);
        }
      } catch {
        /* An empty inbox is the same experience as a failed list load here. */
      } finally {
        if (alive) setLoadingHistory(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0 || sending) softScrollIntoView(endRef.current, 'end');
  }, [messages, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentId]);

  const openConversation = async (id) => {
    setSheet(null);
    if (id === currentId) return;
    try {
      const detail = await get(`/api/v1/ai/conversations/${id}`);
      setCurrentId(detail.id);
      setMessages(detail.messages);
    } catch (err) {
      show(errorText(err, 'Could not open that conversation.'), 'critical');
    }
  };

  const newConversation = () => {
    setSheet(null);
    setCurrentId(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  const send = async (event) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: 'user', content: text }]);
    setSending(true);

    try {
      const res = await post('/api/v1/ai/chat', { conversation_id: currentId, message: text });
      setCurrentId(res.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: res.message,
          context_used: res.context_used,
          disclaimer: res.disclaimer,
          urgency: res.urgency,
          created_at: new Date().toISOString(),
        },
      ]);
      get('/api/v1/ai/conversations').then(setConversations).catch(() => {});
    } catch (err) {
      show(errorText(err, 'The assistant is not responding right now. Try again in a moment.'), 'critical');
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const onPrompt = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <AppShell role="PATIENT">
      <Page width="wide">
        <PageHeader
          title="Ask Sync AI"
          description="Answers built from your own reports, medicines, and readings. Every answer lists what it used."
          actions={
            <>
              <Button variant="vellum" icon={MessagesSquare} className="xl:hidden" onClick={() => setSheet('chats')}>
                Chats ({conversations.length})
              </Button>
              <Button variant="vellum" icon={Sparkles} className="hidden sm:inline-flex 2xl:hidden" onClick={() => setSheet('sources')}>
                Sources ({sources.length})
              </Button>
              <Button icon={MessageSquarePlus} className="hidden xl:inline-flex" onClick={newConversation}>
                New conversation
              </Button>
            </>
          }
        />

        {/* A chat is a workspace, not a page. Below xl the page scrolls normally;
            from xl the panel is pinned to the viewport and the transcript scrolls
            inside it, so the composer never leaves the screen and the answer column
            keeps a readable measure instead of being squeezed between two rails. */}
        <div className="grid gap-5 xl:grid-cols-[236px_minmax(0,1fr)] 2xl:grid-cols-[236px_minmax(0,1fr)_248px]">
          <aside className="hidden xl:block">
            <div className="v3-sticky">
              <ConversationList
                conversations={conversations}
                activeId={currentId}
                onSelect={openConversation}
                onNew={newConversation}
                loading={loadingHistory}
              />
            </div>
          </aside>

          <Card
            pad="none"
            className="flex min-h-[560px] flex-col overflow-hidden xl:h-[calc(100dvh-var(--v3-strip-h)-var(--v3-topbar-h)-180px)] xl:min-h-[520px]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-sand-200 px-5 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tile3 bg-petrol-600 text-white">
                  <Bot className="h-4 w-4" strokeWidth={2.1} />
                </span>
                <div className="min-w-0">
                  <p className="text-d5 text-sand-950">Sync AI</p>
                  <Meta>Answers from your record only</Meta>
                </div>
              </div>
              <SafetyMark />
            </div>

            <div className="relative min-h-0 flex-1">
              <div
                role="log"
                aria-live="polite"
                aria-label="Conversation"
                className="h-full space-y-5 overflow-y-auto px-5 py-6 sm:px-7"
              >
                {messages.length === 0 && !sending ? (
                  <div className="mx-auto max-w-md py-6">
                    <div className="text-center">
                      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-card3 bg-petrol-50 text-petrol-700">
                        <Sparkles className="h-5 w-5" strokeWidth={2} />
                      </span>
                    <h2 className="mt-4 text-d4 font-light text-sand-950">Ask anything about your own health</h2>
                    <p className="mt-2 text-b2 leading-relaxed text-sand-600">
                      Plain questions work best. The answer will name the records it read.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => onPrompt(prompt)}
                        className="min-h-10 rounded-full border border-sand-300 bg-bone-raised px-3.5 text-b3 font-medium text-sand-700 transition-colors duration-150 hover:border-petrol-300 hover:text-petrol-800"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const urgency = message.urgency ? URGENCY[message.urgency] : null;
                  const UrgencyIcon = urgency?.icon;
                  const isLatestAssistant =
                    message.role === 'assistant' &&
                    index === messages.length - 1;
                  return (
                    <ChatBubble
                      key={message.id}
                      role={message.role}
                      // Sources ride the latest answer only. The rail already holds
                      // the full list, and repeating pills under every bubble is
                      // noise the reader has to skip past.
                      sources={isLatestAssistant ? message.context_used : undefined}
                      time={message.role === 'assistant' && message.created_at ? fmtDateTime(message.created_at) : undefined}
                      meta={
                        urgency ? (
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-m4 font-semibold uppercase tracking-caps',
                              urgency.tone === 'critical'
                                ? 'border-sig-critical-100 bg-sig-critical-50 text-sig-critical-700'
                                : 'border-sig-watch-100 bg-sig-watch-50 text-sig-watch-700'
                            )}
                          >
                            <UrgencyIcon className="h-3 w-3" strokeWidth={2.4} />
                            {urgency.label}
                          </span>
                        ) : message.role === 'assistant' ? (
                          <SafetyMark />
                        ) : undefined
                      }
                    >
                      {message.content}
                    </ChatBubble>
                  );
                })
              )}

              {sending && (
                <div role="status" className="flex items-center gap-3 text-sand-600">
                  <span className="flex h-8 w-8 items-center justify-center rounded-tile3 bg-petrol-50 text-petrol-700">
                    <Bot className="h-4 w-4" strokeWidth={2.1} />
                  </span>
                  <span className="flex items-center gap-1.5 text-b3">
                    Reading your records
                    <span className="flex gap-1" aria-hidden>
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="h-1.5 w-1.5 animate-pulse rounded-full bg-petrol-400"
                          style={{ animationDelay: `${dot * 160}ms` }}
                        />
                      ))}
                    </span>
                  </span>
                </div>
              )}
              <div ref={endRef} />
              </div>

              {/* Content fades under the chrome instead of being cut by it. Two
                  fixed gradients, no layout, no repaint on scroll. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-bone-raised to-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-bone-raised to-transparent"
              />
            </div>

            <form onSubmit={send} className="border-t border-sand-200 p-4">
              <label htmlFor="assistant-input" className="sr-only">
                Ask about your health
              </label>
              <div className="flex items-end gap-2.5">
                <textarea
                  id="assistant-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask about your health"
                  className="max-h-32 min-h-touch flex-1 resize-none rounded-ctl3 border border-sand-300 bg-bone-raised px-3.5 py-3 text-b2 leading-relaxed text-sand-950 transition-[border-color,box-shadow] placeholder:text-sand-400 focus:border-petrol-500 focus:outline-none focus:ring-4 focus:ring-petrol-500/12"
                />
                <IconButton
                  label="Send message"
                  icon={ArrowUp}
                  variant="petrol"
                  disabled={!input.trim() || sending}
                  type="submit"
                />
              </div>
              <p className="mt-2.5 text-b4 leading-relaxed text-sand-500">
                Enter sends, Shift and Enter starts a new line. Urgent symptoms belong with a doctor
                or an emergency service.
              </p>
            </form>
          </Card>

          <aside className="hidden 2xl:block">
            <Card pad="lg" className="v3-sticky">
              <SourceList sources={sources} />
            </Card>
          </aside>
        </div>
      </Page>

      <Sheet open={sheet === 'chats'} onClose={() => setSheet(null)} title="Your conversations">
        <ConversationList
          conversations={conversations}
          activeId={currentId}
          onSelect={openConversation}
          onNew={newConversation}
          loading={loadingHistory}
        />
      </Sheet>
      <Sheet open={sheet === 'sources'} onClose={() => setSheet(null)} title="Sources used">
        <SourceList sources={sources} />
      </Sheet>

      <Toast toast={toast} onClose={clear} />
    </AppShell>
  );
};

export default AIAssistant;
