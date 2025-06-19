// src/lib/types/index.ts
export interface PlayerPreferences {
	favoriteGenres?: string[];
	favoriteCharacters?: string[];
	preferredNarrativeStyle?: string;
	age?: number;
	interests?: string[];
	favoriteBooks?: string[];
	favoriteMovies?: string[];
	favoriteGames?: string[];
	personalityTraits?: string[];
	preferredThemes?: string[];
}

export interface ContextFile {
	id: string;
	filename: string;
	content: string;
	tags: string[];
	lastUpdated: Date;
	priority: number;
}

export interface EntityExtraction {
	keywords: string[];
	entities: string[];
	actionType: 'combat' | 'social' | 'exploration' | 'magic' | 'general';
}

export interface CampaignContext {
	characterName?: string;
	characterClass?: string;
	characterLevel?: number;
	characterBackground?: string;
	recentHistory: string[];
	currentLocation?: string;
	playerPreferences?: PlayerPreferences;
	contextFiles?: ContextFile[];
	entityExtraction?: EntityExtraction;
}

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
	characterName?: string;
	characterClass?: string;
	characterLevel?: number;
	characterBackground?: string;
	playerPreferences?: PlayerPreferences;
}
