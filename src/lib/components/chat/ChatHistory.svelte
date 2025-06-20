<script lang="ts">
	import { campaignStore } from "$lib/stores/campaigns";
	import { createEventDispatcher } from "svelte";
	import CharacterSheetModal from "$lib/components/character/CharacterSheetModal.svelte";

	const dispatch = createEventDispatcher<{
		campaignSelected: string;
	}>();

	let editingCampaignId: string | null = null;
	let editingName = "";
	let showCharacterSheet = false; // ✅ State for character sheet modal

	function createNewCampaign() {
		const campaignId = campaignStore.createCampaign(
			`New Campaign ${new Date().toLocaleDateString()}`,
		);
		dispatch("campaignSelected", campaignId);
	}

	function selectCampaign(campaignId: string) {
		// Only select if not in editing mode
		if (editingCampaignId !== campaignId) {
			campaignStore.selectCampaign(campaignId);
			dispatch("campaignSelected", campaignId);
		}
	}

	function startEditing(campaign: any, event: Event) {
		event.stopPropagation(); // Prevent parent click
		editingCampaignId = campaign.id;
		editingName = campaign.name;
	}

	function saveEdit() {
		if (editingCampaignId && editingName.trim()) {
			campaignStore.renameCampaign(editingCampaignId, editingName.trim());
		}
		editingCampaignId = null;
		editingName = "";
	}

	function cancelEdit() {
		editingCampaignId = null;
		editingName = "";
	}

	function deleteCampaign(campaignId: string, event: Event) {
		event.stopPropagation();
		if (confirm("Are you sure you want to delete this campaign?")) {
			campaignStore.deleteCampaign(campaignId);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter") {
			event.preventDefault();
			saveEdit();
		} else if (event.key === "Escape") {
			event.preventDefault();
			cancelEdit();
		}
		// Don't stop propagation for other keys - let them work normally
	}

	function handleInputClick(event: Event) {
		event.stopPropagation(); // Prevent parent campaign selection
	}

	function handleInputBlur() {
		// Save when clicking outside
		saveEdit();
	}

	// ✅ Function to open character sheet modal
	function openCharacterSheet(event: Event) {
		event.preventDefault();
		console.log("🎭 Opening character sheet modal");
		showCharacterSheet = true;
	}

	// ✅ Function to close character sheet modal
	function closeCharacterSheet() {
		console.log("🎭 Closing character sheet modal");
		showCharacterSheet = false;
	}
</script>

<!-- ✅ Use {#if} block for proper Svelte transitions -->
{#if showCharacterSheet}
	<CharacterSheetModal on:close={closeCharacterSheet} />
{/if}

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
				class="w-4 h-4"
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

			{#each $campaignStore.campaigns as campaign (campaign.id)}
				<div
					class="group flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors {campaign.isActive
						? 'bg-red-100 text-red-900'
						: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'} {editingCampaignId ===
					campaign.id
						? ''
						: 'cursor-pointer'}"
					onclick={() => selectCampaign(campaign.id)}
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
								{#if editingCampaignId === campaign.id}
									<!-- Editing mode with proper event handling -->
									<input
										bind:value={editingName}
										onkeydown={handleKeydown}
										onblur={handleInputBlur}
										onclick={handleInputClick}
										class="w-full bg-white border border-red-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
										autofocus
									/>
								{:else}
									<!-- Display mode -->
									<p class="font-medium truncate">
										{campaign.name}
									</p>
									{#if campaign.lastMessage}
										<p
											class="text-xs text-gray-500 truncate"
										>
											{campaign.lastMessage}
										</p>
									{/if}
								{/if}
							</div>
						</div>
					</div>

					<!-- Action buttons -->
					<div
						class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
					>
						{#if editingCampaignId !== campaign.id}
							<!-- Edit button -->
							<button
								type="button"
								onclick={(e) => startEditing(campaign, e)}
								class="p-1 text-gray-400 hover:text-red-500 transition-colors"
								aria-label="Rename campaign"
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
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</button>

							<!-- Delete button -->
							<button
								type="button"
								onclick={(e) => deleteCampaign(campaign.id, e)}
								class="p-1 text-gray-400 hover:text-red-500 transition-colors"
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
						{/if}
					</div>
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

			<!-- ✅ Updated Character Sheet button to open modal -->
			<button
				type="button"
				onclick={openCharacterSheet}
				class="w-full group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
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
			</button>

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
