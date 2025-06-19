<script lang="ts">
    import { createEventDispatcher } from "svelte";

    interface Campaign {
        id: string;
        name: string;
        lastMessage?: string;
        timestamp: Date;
    }

    interface Props {
        campaigns?: Campaign[];
        activeCampaignId?: string;
    }

    let {
        campaigns = [
            {
                id: "1",
                name: "The Whispering Woods",
                lastMessage: "You step into the forest...",
                timestamp: new Date(),
            },
            {
                id: "2",
                name: "Dragon's Lair Quest",
                lastMessage: "The dragon roars...",
                timestamp: new Date(Date.now() - 86400000),
            },
        ],
        activeCampaignId = "1",
    }: Props = $props();

    const dispatch = createEventDispatcher<{
        selectCampaign: string;
        newCampaign: void;
        deleteCampaign: string;
    }>();

    function selectCampaign(campaignId: string) {
        dispatch("selectCampaign", campaignId);
    }

    function createNewCampaign() {
        dispatch("newCampaign");
    }

    function deleteCampaign(campaignId: string, event: Event) {
        event.stopPropagation();
        dispatch("deleteCampaign", campaignId);
    }
</script>

<!-- Chat History Section -->
<div class="flex flex-col h-full">
    <!-- New Campaign Button -->
    <div class="p-4">
        <button
            type="button"
            onclick={createNewCampaign}
            class="w-full flex items-center justify-center px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 focus:outline-none transition-colors"
        >
            <svg
                class="mr-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
            </svg>
            New Campaign
        </button>
    </div>

    <!-- Campaign History -->
    <div class="flex-1 overflow-y-auto px-4">
        <div class="space-y-1">
            <h3
                class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
            >
                Recent Campaigns
            </h3>

            {#each campaigns as campaign (campaign.id)}
                <div
                    class="group flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors {campaign.id ===
                    activeCampaignId
                        ? 'bg-red-100 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}"
                    onclick={() => selectCampaign(campaign.id)}
                    onkeydown={(e) =>
                        e.key === "Enter" && selectCampaign(campaign.id)}
                    role="button"
                    tabindex="0"
                >
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2">
                            <svg
                                class="w-4 h-4 text-gray-400 group-hover:text-gray-500 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                            <div class="flex-1 min-w-0">
                                <p class="font-medium truncate">
                                    {campaign.name}
                                </p>
                                {#if campaign.lastMessage}
                                    <p class="text-xs text-gray-500 truncate">
                                        {campaign.lastMessage}
                                    </p>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <!-- Delete button -->
                    <button
                        type="button"
                        onclick={(e) => deleteCampaign(campaign.id, e)}
                        class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        aria-label="Delete campaign"
                    >
                        <svg
                            class="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>
            {/each}
        </div>
    </div>

    <!-- Tools Section -->
    <div class="border-t border-gray-200 p-4">
        <div class="space-y-1">
            <h3
                class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
            >
                Tools
            </h3>
            <a
                href="#"
                class="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-gray-900 hover:bg-gray-100"
            >
                <svg
                    class="mr-3 w-4 h-4 text-gray-400 group-hover:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
                Character Sheet
            </a>
            <a
                href="#"
                class="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-gray-900 hover:bg-gray-100"
            >
                <svg
                    class="mr-3 w-4 h-4 text-gray-400 group-hover:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
                Quest Log
            </a>
        </div>
    </div>
</div>
