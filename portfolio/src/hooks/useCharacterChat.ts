import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Project } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'crew';
  content: string;
}

interface GeminiHistoryEntry {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface UseCharacterChatOptions {
  project: Project;
}

interface UseCharacterChatReturn {
  messages: ChatMessage[];
  characterBubble: string | null;
  isLoading: boolean;
  isListening: boolean;
  sendMessage: (text: string) => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  clearMessages: () => void;
}

/**
 * Extract a concise text summary from a project's canvas elements
 * so the AI can answer questions specifically about the current project.
 */
function buildProjectContext(project: Project): string {
  const lines: string[] = [];
  lines.push(`Project: "${project.title}"`);
  lines.push(`Category: ${project.category} · Year: ${project.year}`);
  lines.push(`Description: ${project.description}`);
  if (project.tags.length) lines.push(`Tags: ${project.tags.join(', ')}`);

  const els = project.canvasElements;

  // Case-study cards (overview, user goals, etc.)
  for (const el of els) {
    if (el.type === 'case-study-card') {
      const d = el.data;
      lines.push(`\n— ${d.title} (${d.subtitle})`);
      lines.push(`  ${d.description}`);
      if (d.metrics?.length) {
        lines.push(`  Metrics: ${d.metrics.map(m => `${m.label}: ${m.value}`).join(' · ')}`);
      }
    }
  }

  // Quote blocks (personas / problem statements)
  for (const el of els) {
    if (el.type === 'quote-block') {
      const d = el.data;
      lines.push(`\nQuote — ${d.author}${d.role ? ` (${d.role})` : ''}: ${d.quote}`);
    }
  }

  // Sticky notes (problems, insights)
  const stickyTexts = els
    .filter(el => el.type === 'sticky-note')
    .map(el => (el as any).data.content as string);
  if (stickyTexts.length) {
    lines.push(`\nKey notes: ${stickyTexts.join(' | ')}`);
  }

  // Process steps
  const processSteps = els.filter(el => el.type === 'process-step');
  if (processSteps.length) {
    lines.push('\nDesign process:');
    for (const el of processSteps) {
      const d = (el as any).data;
      lines.push(`  Step ${d.stepNumber}: ${d.title} — ${d.description}`);
    }
  }

  // Metric cards
  const metrics = els.filter(el => el.type === 'metric-card');
  if (metrics.length) {
    lines.push('\nImpact metrics:');
    for (const el of metrics) {
      const d = (el as any).data;
      lines.push(`  ${d.label}: ${d.value}${d.change ? ` (${d.change})` : ''}`);
    }
  }

  // Flow diagrams
  for (const el of els) {
    if (el.type === 'flow-diagram') {
      const d = el.data;
      lines.push(`\nFlow: ${d.title}${d.subtitle ? ` — ${d.subtitle}` : ''}`);
    }
  }

  // User flow steps
  const flowSteps = els.filter(el => el.type === 'user-flow-step');
  if (flowSteps.length) {
    lines.push('\nUser flow phases:');
    for (const el of flowSteps) {
      const d = (el as any).data;
      lines.push(`  ${d.label}: ${d.description || ''}`);
    }
  }

  // Data dimensions
  const dims = els.filter(el => el.type === 'data-dimension');
  if (dims.length) {
    lines.push('\nData constraints:');
    for (const el of dims) {
      const d = (el as any).data;
      lines.push(`  ${d.highlight}: min ${d.min}, max ${d.max}, typical ${d.typical}`);
    }
  }

  // Section labels for structure
  const sections = els
    .filter(el => el.type === 'section-label')
    .map(el => (el as any).data.title as string);
  if (sections.length) {
    lines.push(`\nSections in this case study: ${sections.join(' → ')}`);
  }

  return lines.join('\n');
}

export function useCharacterChat({ project }: UseCharacterChatOptions): UseCharacterChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [characterBubble, setCharacterBubble] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyRef = useRef<GeminiHistoryEntry[]>([]);
  const projectRef = useRef(project);
  projectRef.current = project;
  const contextSentRef = useRef(false);

  // Clear chat history when project changes
  useEffect(() => {
    setMessages([]);
    setCharacterBubble(null);
    historyRef.current = [];
    contextSentRef.current = false;
  }, [project.id]);

  // Cleanup bubble timer on unmount
  useEffect(() => {
    return () => {
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    };
  }, []);

  const showBubble = useCallback((text: string) => {
    setCharacterBubble(text);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => setCharacterBubble(null), 7000);
  }, []);

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    utterance.volume = 0.85;
    // Prefer a friendly voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google UK English Female') || v.name.includes('Karen'));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Build the message to send — include project context on the first message
    let messageToSend = trimmed;
    if (!contextSentRef.current) {
      const ctx = buildProjectContext(projectRef.current);
      messageToSend = `[CONTEXT: The user is currently viewing the following project on the portfolio canvas. Answer their question specifically about this project. Keep responses concise (2-3 sentences max) and friendly.]\n\n${ctx}\n\n[USER QUESTION]: ${trimmed}`;
      contextSentRef.current = true;
    }

    try {
      const { data, error } = await supabase!.functions.invoke('gemini-chat', {
        body: {
          action: 'chat',
          intent: 'explore',
          history: historyRef.current,
          parts: [messageToSend],
        },
      });

      if (error) throw error;

      const responseText: string = data?.text ?? "Hmm, I couldn't think of an answer right now 🤔";

      // Update history for context
      historyRef.current = [
        ...historyRef.current,
        { role: 'user', parts: [{ text: trimmed }] },
        { role: 'model', parts: [{ text: responseText }] },
      ];
      // Keep history bounded to last 10 exchanges (20 entries)
      if (historyRef.current.length > 20) {
        historyRef.current = historyRef.current.slice(-20);
      }

      const crewMsg: ChatMessage = { id: `c-${Date.now()}`, role: 'crew', content: responseText };
      setMessages(prev => [...prev, crewMsg]);
      showBubble(responseText);
      speakText(responseText);
    } catch (err) {
      console.error('[useCharacterChat] Error:', err);
      const errMsg: ChatMessage = { id: `e-${Date.now()}`, role: 'crew', content: "Uh oh, something went wrong on my end 😅" };
      setMessages(prev => [...prev, errMsg]);
      showBubble("Uh oh, something went wrong on my end 😅");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, showBubble, speakText]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const recognition: any = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (e: any) => {
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      if (transcript.trim()) {
        sendMessage(transcript.trim());
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, stopListening, sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCharacterBubble(null);
    historyRef.current = [];
  }, []);

  return { messages, characterBubble, isLoading, isListening, sendMessage, startListening, stopListening, clearMessages };
}
