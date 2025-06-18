import { writable } from 'svelte/store';

// Create a basic writable store for chat messages
export const messages = writable([]);

// Create a writable store for loading state
export const isLoading = writable(false);
