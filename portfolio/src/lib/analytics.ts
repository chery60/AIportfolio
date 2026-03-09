import { supabase } from './supabase';

interface ChatMessageLog {
    role: string;
    content: string;
}

export async function saveConversationLog(intent: string, messages: ChatMessageLog[]) {
    // 1. Silent return if no meaningful conversation happened (e.g. just the first prompt)
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return;

    // 2. Save directly to Supabase table
    try {
        if (supabase) {
            await supabase.from('chat_conversations').insert([{
                intent,
                conversation: messages,
                created_at: new Date().toISOString()
            }]);
        }
    } catch (err) {
        console.warn('Silent fallback: Supabase logging failed');
    }

    // 3. Email dispatch via Web3Forms (if key is provided)
    try {
        const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
        if (!accessKey) return; // Ignore if no email key

        const formattedTranscript = messages
            .map(m => `[${m.role.toUpperCase()}]\n${m.content}`)
            .join('\n\n-------------------\n\n');

        await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                access_key: accessKey,
                subject: `New Portfolio Chat: Visitor (${intent.toUpperCase()})`,
                from_name: 'Portfolio AI Bot',
                to: 'kc60488charan@gmail.com',
                message: `A visitor just completed a chat session with an intent of: ${intent}.\n\nHere is the transcript:\n\n${formattedTranscript}`
            }),
        });
    } catch (err) {
        console.warn('Silent fallback: Web3Forms email failed');
    }
}
