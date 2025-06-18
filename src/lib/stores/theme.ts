import { writable } from 'svelte/store';

// Create a writable store for theme state
export const darkMode = writable(false);

// Create a writable store for sidebar state
export const sidebarOpen = writable(false);
