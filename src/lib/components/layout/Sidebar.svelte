<script lang="ts">
	import { ChatHistory } from "$lib/components/chat";
	import { campaignStore } from "$lib/stores/campaigns";
	import { contextFileManager } from "$lib/services/contextFiles";

	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
	}

	let { isOpen = true, onClose }: Props = $props();

	// Get character sheet data using Svelte 5 $derived
	const characterFiles = $derived(contextFileManager.getAllFiles());
	const characterSheet = $derived(
		characterFiles.find((f) => f.id === "character_sheet"),
	);
	const characterData = $derived(
		characterSheet ? parseCharacterInfo(characterSheet.content) : null,
	);

	function parseCharacterInfo(markdown: string) {
		const nameMatch = markdown.match(/\*\*Name\*\*:\s*(.+)/);
		const classMatch = markdown.match(/\*\*Class\*\*:\s*(.+)/);
		const levelMatch = markdown.match(/\*\*Level\*\*:\s*(\d+)/);

		return {
			name: nameMatch?.[1]?.trim() || "Unknown",
			class: classMatch?.[1]?.trim() || "Unknown",
			level: levelMatch?.[1] ? parseInt(levelMatch[1]) : 1,
		};
	}

	function handleCampaignSelected(event: CustomEvent<string>) {
		console.log("Campaign selected:", event.detail);
	}
</script>

<!-- Minimal sidebar design maximizing screen space -->
<aside class="h-full bg-white border-r border-gray-200 flex flex-col">
	<!-- Minimal header - only mobile close button when needed -->
	<div class="flex items-center justify-end p-2 lg:hidden">
		<button
			type="button"
			class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
			onclick={onClose}
			aria-label="Close sidebar"
		>
			<svg
				class="w-5 h-5"
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

	<!-- Compact character info panel -->
	{#if characterData}
		<div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
			<div class="flex items-center space-x-3">
				<!-- Small character avatar/icon -->
				<div
					class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center"
				>
					<span class="text-red-600 text-sm font-semibold">
						{characterData.name.charAt(0).toUpperCase()}
					</span>
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-gray-900 truncate">
						{characterData.name}
					</p>
					<p class="text-xs text-gray-500">
						Level {characterData.level}
						{characterData.class}
					</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Chat History Component - takes remaining space -->
	<div class="flex-1 overflow-hidden">
		<ChatHistory on:campaignSelected={handleCampaignSelected} />
	</div>
</aside>
