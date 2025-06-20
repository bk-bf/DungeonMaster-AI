import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// In-memory storage for development (replace with database in production)
const promptStore = new Map<number, { prompt: string; response: string; timestamp: Date }>();

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { messageId, prompt, response } = await request.json();

        promptStore.set(messageId, {
            prompt,
            response,
            timestamp: new Date()
        });

        return json({ success: true });
    } catch (error) {
        console.error('Error storing prompt:', error);
        return json({ error: 'Failed to store prompt' }, { status: 500 });
    }
};

export const GET: RequestHandler = async ({ url }) => {
    try {
        const messageId = parseInt(url.searchParams.get('messageId') || '0');

        const promptData = promptStore.get(messageId);

        if (!promptData) {
            return json({ error: 'Prompt not found' }, { status: 404 });
        }

        return json({
            messageId,
            prompt: promptData.prompt,
            response: promptData.response,
            timestamp: promptData.timestamp
        });
    } catch (error) {
        console.error('Error fetching prompt:', error);
        return json({ error: 'Failed to fetch prompt' }, { status: 500 });
    }
};