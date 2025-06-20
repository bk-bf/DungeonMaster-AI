// src/lib/services/session.ts
import { browser } from '$app/environment';

import type {
	CampaignContext,
	ContextFile,
	EntityExtraction,
	PlayerPreferences,
	CharacterData,
	Campaign,
	Message
} from '$lib/types';

export interface SessionData {
	characterName?: string;
	characterClass?: string;
	characterLevel?: number;
	characterBackground?: string;
	playerPreferences?: PlayerPreferences;
	activeCampaignId?: string;
	lastActivity: string;
}

class SessionManager {
	private sessionKey = 'dungeonmaster-session';

	// Save session data to cookie (server-side) and localStorage (client-side)
	saveSession(sessionData: SessionData) {
		const dataWithTimestamp = {
			...sessionData,
			lastActivity: new Date().toISOString()
		};

		if (browser) {
			// Save to localStorage as backup
			localStorage.setItem(this.sessionKey, JSON.stringify(dataWithTimestamp));

			// Send to server to set cookie
			fetch('/api/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(dataWithTimestamp)
			}).catch(console.error);
		}
	}

	// Load session data from localStorage (client-side fallback)
	loadSession(): SessionData | null {
		if (!browser) return null;

		try {
			const stored = localStorage.getItem(this.sessionKey);
			if (stored) {
				const data = JSON.parse(stored);
				// Check if session is less than 30 days old
				const lastActivity = new Date(data.lastActivity);
				const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

				if (lastActivity > thirtyDaysAgo) {
					return data;
				} else {
					this.clearSession();
				}
			}
		} catch (error) {
			console.error('Failed to load session:', error);
		}

		return null;
	}

	// Clear session data
	clearSession() {
		if (browser) {
			localStorage.removeItem(this.sessionKey);
			localStorage.removeItem('dungeonmaster-campaigns');
			localStorage.removeItem('dungeonmaster-context-files');
			localStorage.removeItem('dungeonmaster-player-preferences');

			// Clear server-side cookie
			fetch('/api/session', {
				method: 'DELETE'
			}).catch(console.error);
		}
	}

	// Check if user has an active session
	hasActiveSession(): boolean {
		return this.loadSession() !== null;
	}
}

export const sessionManager = new SessionManager();
