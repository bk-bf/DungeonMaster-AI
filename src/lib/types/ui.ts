// src/lib/types/ui.ts

// Button component interface
export interface ButtonProps {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	size?: 'sm' | 'md' | 'lg' | 'xl';
	disabled?: boolean;
	type?: 'button' | 'submit' | 'reset';
	loading?: boolean;
}

// Input component interface  
export interface InputProps {
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	size?: 'sm' | 'md' | 'lg';
}

// Card component interface
export interface CardProps {
	title?: string;
	padding?: 'sm' | 'md' | 'lg';
}

// Event interfaces for component events
export interface ComponentEvents {
	click: MouseEvent;
	input: Event;
	keydown: KeyboardEvent;
}
