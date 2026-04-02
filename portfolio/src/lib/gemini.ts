/**
 * Gemini AI integration — routed through Supabase Edge Function.
 * 
 * The API key lives server-side as a Supabase secret.
 * This module calls the edge function proxy instead of the Gemini SDK directly.
 */

export type ChatIntent = 'hire' | 'explore';

// Supabase Edge Function URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/gemini-chat`;

interface ChatHistoryEntry {
    role: 'user' | 'model';
    parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
}

interface ChatSession {
    intent: ChatIntent;
    history: ChatHistoryEntry[];
    sendMessage: (parts: Array<string | { inlineData: { data: string; mimeType: string } }>) => Promise<{
        response: { text: () => string };
    }>;
}

async function callEdgeFunction(body: Record<string, unknown>): Promise<string> {
    const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.text();
        console.error('Edge function error:', res.status, errorData);

        if (res.status === 429) {
            const error = new Error('Rate limit exceeded');
            (error as unknown as Record<string, unknown>).status = 429;
            throw error;
        }

        throw new Error(`Edge function error: ${res.status}`);
    }

    const data = await res.json();
    return data.text || '';
}

export async function createChatSession(intent: ChatIntent): Promise<ChatSession> {
    const history: ChatHistoryEntry[] = [];

    const session: ChatSession = {
        intent,
        history,
        sendMessage: async (parts) => {
            // Convert parts to the format the edge function expects
            const formattedParts = parts.map(p => {
                if (typeof p === 'string') return p;
                return p;
            });

            // Build history for the edge function (previous conversation turns)
            const historyForApi = history.map(entry => ({
                role: entry.role === 'model' ? 'assistant' : 'user',
                parts: entry.parts,
            }));

            const responseText = await callEdgeFunction({
                action: 'chat',
                intent,
                history: historyForApi,
                parts: formattedParts,
            });

            // Add user message to history
            const userParts = parts.map(p => {
                if (typeof p === 'string') return { text: p };
                return p;
            });
            history.push({ role: 'user', parts: userParts });

            // Add assistant response to history
            history.push({ role: 'model', parts: [{ text: responseText }] });

            return {
                response: {
                    text: () => responseText,
                },
            };
        },
    };

    return session;
}

export async function generateAvatarReaction(question: string, aiResponse: string): Promise<string> {
    try {
        const text = await callEdgeFunction({
            action: 'avatar-reaction',
            question,
            aiResponse,
        });
        return text.trim();
    } catch (err) {
        console.error("Avatar reaction error", err);
        return "Good question! 🌟";
    }
}
