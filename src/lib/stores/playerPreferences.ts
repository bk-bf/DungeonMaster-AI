// src/lib/stores/playerPreferences.ts
import { writable } from 'svelte/store';
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

interface PlayerPreferencesStore {
	preferences: PlayerPreferences | null;
	isCollected: boolean;
}

const defaultStore: PlayerPreferencesStore = {
	preferences: null,
	isCollected: false
};

function createPlayerPreferencesStore() {
	const { subscribe, set, update } = writable<PlayerPreferencesStore>(defaultStore);

	return {
		subscribe,

		// Save player preferences
		setPreferences: (preferences: PlayerPreferences) => {
			update(store => {
				const newStore = {
					preferences,
					isCollected: true
				};

				// Save to localStorage
				if (browser) {
					localStorage.setItem('dungeonmaster-player-preferences', JSON.stringify(newStore));
				}

				return newStore;
			});
		},

		// Load preferences from localStorage
		loadPreferences: () => {
			if (browser) {
				try {
					const stored = localStorage.getItem('dungeonmaster-player-preferences');
					if (stored) {
						const parsed = JSON.parse(stored);
						set(parsed);
						return parsed.preferences;
					}
				} catch (error) {
					console.error('Failed to load player preferences:', error);
				}
			}
			return null;
		},

		// Import preferences from JSON data
		importPreferences: (preferences: PlayerPreferences) => {
			const newStore = {
				preferences,
				isCollected: true
			};

			set(newStore);

			if (browser) {
				localStorage.setItem('dungeonmaster-player-preferences', JSON.stringify(newStore));
			}
		},

		// Clear preferences
		clearPreferences: () => {
			set(defaultStore);
			if (browser) {
				localStorage.removeItem('dungeonmaster-player-preferences');
			}
		},

		// Update specific preference
		updatePreference: (key: keyof PlayerPreferences, value: any) => {
			update(store => {
				if (!store.preferences) return store;

				const updatedPreferences = {
					...store.preferences,
					[key]: value
				};

				const newStore = {
					...store,
					preferences: updatedPreferences
				};

				if (browser) {
					localStorage.setItem('dungeonmaster-player-preferences', JSON.stringify(newStore));
				}

				return newStore;
			});
		}
	};
}

export const playerPreferencesStore = createPlayerPreferencesStore();