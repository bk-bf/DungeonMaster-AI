// Export all chat components
export { default as ChatDisplay } from './ChatDisplay.svelte';
export { default as ChatInput } from './ChatInput.svelte';
export { default as ChatHistory } from './ChatHistory.svelte';

// Export component types
export interface Message {
    id: number;
    type: 'user' | 'assistant';
    content: string;
}

export interface Campaign {
    id: string;
    name: string;
    lastMessage?: string;
    timestamp: Date;
}
