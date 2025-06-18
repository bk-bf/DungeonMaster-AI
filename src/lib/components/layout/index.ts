// src/lib/components/layout/index.ts

// Export layout components
export { default as Header } from './Header.svelte';
export { default as Sidebar } from './Sidebar.svelte';
export { default as Container } from './Container.svelte';

// Export layout component types
export interface HeaderProps {
	title?: string;
	showMenuButton?: boolean;
	onMenuToggle?: () => void;
}

export interface SidebarProps {
	isOpen?: boolean;
	onClose?: () => void;
}

export interface ContainerProps {
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
	padding?: 'none' | 'sm' | 'md' | 'lg';
	centered?: boolean;
}
