<script lang="ts">
	import { ChatHistory } from "$lib/components/chat";
	import type { Campaign } from "$lib/components/chat";

	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
	}

	let { isOpen = true, onClose }: Props = $props();

	let campaigns: Campaign[] = [
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
	];

	let activeCampaignId = "1";

	function handleSelectCampaign(event: CustomEvent<string>) {
		activeCampaignId = event.detail;
		console.log("Selected campaign:", event.detail);
	}

	function handleNewCampaign() {
		const newCampaign: Campaign = {
			id: Date.now().toString(),
			name: `New Campaign ${campaigns.length + 1}`,
			timestamp: new Date(),
		};
		campaigns = [newCampaign, ...campaigns];
		activeCampaignId = newCampaign.id;
	}

	function handleDeleteCampaign(event: CustomEvent<string>) {
		const campaignId = event.detail;
		campaigns = campaigns.filter((c) => c.id !== campaignId);
		if (activeCampaignId === campaignId && campaigns.length > 0) {
			activeCampaignId = campaigns[0].id;
		}
	}
</script>

<!-- Sidebar with integrated title -->
<aside class="h-full bg-white border-r border-gray-200 flex flex-col">
	<!-- Sidebar header with DragonMaster AI branding -->
	<div class="flex items-center justify-between p-4 border-b border-gray-200">
		<div class="flex items-center space-x-2">
			<!-- Dragon icon -->
			<div
				class="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center"
			>
				<img
					src="/dragon-logo.png"
					alt="DragonMaster AI Logo"
					class="w-8 h-8 object-cover"
				/>
			</div>
			<h1 class="text-lg font-semibold text-gray-900">DragonMaster AI</h1>
		</div>

		<!-- Mobile close button -->
		<button
			type="button"
			class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
			onclick={onClose}
			aria-label="Close sidebar"
		>
			<svg
				class="w-5 h-5 flex-shrink-0"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
	</div>

	<!-- Chat History Component -->
	<ChatHistory
		{campaigns}
		{activeCampaignId}
		on:selectCampaign={handleSelectCampaign}
		on:newCampaign={handleNewCampaign}
		on:deleteCampaign={handleDeleteCampaign}
	/>
</aside>
