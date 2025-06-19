// src/lib/components/chat/index.ts
export { default as ChatDisplay } from './ChatDisplay.svelte';
export { default as ChatInput } from './ChatInput.svelte';
export { default as ChatHistory } from './ChatHistory.svelte';
export { campaignStore } from '$lib/stores/campaigns';

// Export component types
export interface Message {
    id: number;
    type: 'user' | 'assistant';
    content: string;
}

export interface Campaign {
    id: string;
    name: string;
    messages: Message[];
    lastMessage?: string;
    timestamp: Date;
    isActive: boolean;
}
