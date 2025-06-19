// src/lib/stores/campaigns.ts
import { writable } from 'svelte/store';
import type { Message } from '$lib/components/chat';

export interface Campaign {
    id: string;
    name: string;
    messages: Message[];
    lastMessage?: string;
    timestamp: Date;
    isActive: boolean;
}

interface CampaignStore {
    campaigns: Campaign[];
    activeCampaignId: string | null;
}

const defaultStore: CampaignStore = {
    campaigns: [
        {
            id: '1',
            name: 'The Whispering Woods',
            messages: [
                { id: 1, type: 'assistant', content: 'Welcome to your **D&D adventure**! I am your AI Dungeon Master. What would you like to do?' }
            ],
            lastMessage: 'Welcome to your D&D adventure!',
            timestamp: new Date(),
            isActive: true
        }
    ],
    activeCampaignId: '1'
};

function createCampaignStore() {
    const { subscribe, set, update } = writable<CampaignStore>(defaultStore);

    return {
        subscribe,

        // Create new campaign
        createCampaign: (name: string) => {
            const newCampaign: Campaign = {
                id: Date.now().toString(),
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
                isActive: false
            };

            update(store => ({
                campaigns: [newCampaign, ...store.campaigns.map(c => ({ ...c, isActive: false }))],
                activeCampaignId: newCampaign.id
            }));

            return newCampaign.id;
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

        // Get active campaign
        getActiveCampaign: (store: CampaignStore) => {
            return store.campaigns.find(c => c.id === store.activeCampaignId) || null;
        }
    };
}

export const campaignStore = createCampaignStore();
