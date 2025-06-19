<script lang="ts">
	import { ChatHistory } from "$lib/components/chat";
	import { campaignStore } from "$lib/stores/campaigns";

	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
	}

	let { isOpen = true, onClose }: Props = $props();

	function handleCampaignSelected(event: CustomEvent<string>) {
		// Campaign selection is handled by the store
		console.log("Campaign selected:", event.detail);
	}
</script>

<!-- Sidebar with integrated title -->
<aside class="h-full bg-white border-r border-gray-200 flex flex-col">
	<!-- Sidebar header with DungeonMaster AI branding -->
	<div class="flex items-center justify-between p-4 border-b border-gray-200">
		<div class="flex items-center space-x-2">
			<!-- Dragon icon -->
			<div
				class="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center"
			>
				<img
					src="/dragon-logo.png"
					alt="DungeonMaster AI Logo"
					class="w-8 h-8 object-cover"
				/>
			</div>
			<h1 class="text-lg font-semibold text-gray-900">
				DungeonMaster AI
			</h1>
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

	<!-- Chat History Component with Store Integration -->
	<ChatHistory on:campaignSelected={handleCampaignSelected} />
</aside>
