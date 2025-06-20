// src/lib/stores/campaigns.ts
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { sessionManager } from '$lib/services/session';
import type {
	CampaignContext,
	ContextFile,
	EntityExtraction,
	PlayerPreferences,
	CharacterData,
	Campaign,
	Message
} from '$lib/types';

interface CampaignStore {
	campaigns: Campaign[];
	activeCampaignId: string | null;
}

// Create persisted store that survives browser sessions
function createPersistedCampaignStore() {
	// Load from session first, then localStorage
	let initial: CampaignStore;

	if (browser) {
		const sessionData = sessionManager.loadSession();
		const stored = localStorage.getItem('dungeonmaster-campaigns');

		if (sessionData && stored) {
			const campaigns = JSON.parse(stored);
			initial = {
				campaigns: campaigns.campaigns || [],
				activeCampaignId: sessionData.activeCampaignId || campaigns.activeCampaignId
			};
		} else {
			initial = { campaigns: [], activeCampaignId: null };
		}
	} else {
		initial = { campaigns: [], activeCampaignId: null };
	}

	const { subscribe, set, update } = writable<CampaignStore>(initial);
	// Subscribe to changes and persist to localStorage
	if (browser) {
		subscribe((value) => {
			localStorage.setItem('dungeonmaster-campaigns', JSON.stringify(value));

			// Update session with current state
			const activeCampaign = value.campaigns.find(c => c.id === value.activeCampaignId);
			if (activeCampaign) {
				sessionManager.saveSession({
					characterName: activeCampaign.characterName,
					characterClass: activeCampaign.characterClass,
					characterLevel: activeCampaign.characterLevel,
					characterBackground: activeCampaign.characterBackground,
					playerPreferences: activeCampaign.playerPreferences,
					activeCampaignId: value.activeCampaignId ?? undefined,
					lastActivity: new Date().toISOString()
				});
			}
		});
	}

	return {
		subscribe,
		set,
		update,

		// Create new campaign
		createCampaign: (name: string) => {
			const newCampaign: Campaign = {
				id: crypto.randomUUID(),
				name: name || `New Campaign ${Date.now()}`,
				messages: [
					{
						id: 1,
						type: 'assistant',
						content: `Welcome to **${name}**! Your adventure begins now. What would you like to do?`
					}
				],
				lastMessage: 'Your adventure begins now...',
				timestamp: new Date(),
				isActive: true
			};

			update(store => ({
				campaigns: [newCampaign, ...store.campaigns.map(c => ({ ...c, isActive: false }))],
				activeCampaignId: newCampaign.id
			}));

			return newCampaign.id;
		},

		// Clear all data and session
		clearAllData: () => {
			sessionManager.clearSession();
			set({ campaigns: [], activeCampaignId: null });
		},

		// Restore session data
		restoreFromSession: async () => {
			try {
				// Try to load from server cookie first
				const response = await fetch('/api/session');
				const data = await response.json();

				if (data.session) {
					// Session found, restore data
					return data.session;
				}

				// Fallback to localStorage session
				return sessionManager.loadSession();
			} catch (error) {
				console.error('Failed to restore session:', error);
				return sessionManager.loadSession();
			}
		},

		// Switch to existing campaign
		selectCampaign: (campaignId: string) => {
			update(store => ({
				...store,
				campaigns: store.campaigns.map(c => ({
					...c,
					isActive: c.id === campaignId
				})),
				activeCampaignId: campaignId
			}));
		},

		// Add message to active campaign
		addMessage: (message: Omit<Message, 'id'>) => {
			update(store => {
				const activeCampaign = store.campaigns.find(c => c.id === store.activeCampaignId);
				if (!activeCampaign) return store;

				const newMessage: Message = {
					...message,
					id: Date.now()
				};

				return {
					...store,
					campaigns: store.campaigns.map(campaign =>
						campaign.id === store.activeCampaignId
							? {
								...campaign,
								messages: [...campaign.messages, newMessage],
								lastMessage: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
								timestamp: new Date()
							}
							: campaign
					)
				};
			});
		},

		// Update active campaign with character information
		updateCampaignCharacter: (characterInfo: {
			name: string;
			class: string;
			background: string;
			preferences: PlayerPreferences;
			creationMethod?: 'standard' | 'quick' | 'random'; // ✅ Add this line
		}) => {
			update(store => ({
				...store,
				campaigns: store.campaigns.map(campaign =>
					campaign.id === store.activeCampaignId
						? {
							...campaign,
							characterName: characterInfo.name,
							characterClass: characterInfo.class,
							characterBackground: characterInfo.background,
							playerPreferences: characterInfo.preferences,
							creationMethod: characterInfo.creationMethod // ✅ Add this line
						}
						: campaign
				)
			}));
		},

		// Rename campaign
		renameCampaign: (campaignId: string, newName: string) => {
			update(store => ({
				...store,
				campaigns: store.campaigns.map(campaign =>
					campaign.id === campaignId
						? { ...campaign, name: newName }
						: campaign
				)
			}));
		},

		// Delete campaign
		deleteCampaign: (campaignId: string) => {
			update(store => {
				const filteredCampaigns = store.campaigns.filter(c => c.id !== campaignId);

				// If deleting active campaign, switch to first available
				let newActiveCampaignId = store.activeCampaignId;
				if (store.activeCampaignId === campaignId) {
					newActiveCampaignId = filteredCampaigns.length > 0 ? filteredCampaigns[0].id : null;
				}

				return {
					campaigns: filteredCampaigns.map(c => ({
						...c,
						isActive: c.id === newActiveCampaignId
					})),
					activeCampaignId: newActiveCampaignId
				};
			});
		},

		// Export campaign data
		exportCampaign: (campaignId?: string) => {
			const store = get(campaignStore);
			const targetId = campaignId || store.activeCampaignId;
			const campaign = store.campaigns.find(c => c.id === targetId);

			if (!campaign) return null;

			const exportData = {
				campaign,
				exportDate: new Date().toISOString(),
				version: '1.0'
			};

			return JSON.stringify(exportData, null, 2);
		},

		// Import campaign from JSON
		importCampaign: (campaignData: any) => {
			const importedCampaign: Campaign = {
				...campaignData,
				id: crypto.randomUUID(), // Generate new ID to avoid conflicts
				timestamp: new Date(campaignData.timestamp),
				isActive: true
			};

			update(store => {
				// Deactivate other campaigns
				store.campaigns.forEach(c => c.isActive = false);

				// Add imported campaign
				store.campaigns.push(importedCampaign);
				store.activeCampaignId = importedCampaign.id;

				return store;
			});

			return importedCampaign.id;
		},
		// Clear all campaign history
		clearHistory: () => {
			set({ campaigns: [], activeCampaignId: null });
			if (browser) {
				localStorage.removeItem('dungeonmaster-campaigns');
				localStorage.removeItem('dungeonmaster-context-files');
				localStorage.removeItem('dungeonmaster-player-preferences');
			}
		},

		// Get active campaign
		getActiveCampaign: (store: CampaignStore) => {
			return store.campaigns.find(c => c.id === store.activeCampaignId) || null;
		}
	};
}

export const campaignStore = createPersistedCampaignStore();