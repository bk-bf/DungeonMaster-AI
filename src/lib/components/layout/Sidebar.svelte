<script lang="ts">
	import { ChatHistory } from "$lib/components/chat";
	import { contextFileManager } from "$lib/services/contextFiles";
	import { onMount } from "svelte";

	interface Props {
		onClose?: () => void;
		sessionRestored?: boolean;
	}

	interface ContextFile {
		id: string;
		content: string;
	}

	interface CharacterData {
		name: string;
		class: string;
		level: number;
	}

	let { onClose, sessionRestored = false }: Props = $props();

	// ✅ Use reactive state instead of $derived for better persistence
	let characterFiles = $state<ContextFile[]>([]);
	let characterData = $state<CharacterData | null>(null);

	// ✅ Reactive update when files change
	$effect(() => {
		const files = contextFileManager.getAllFiles();
		characterFiles = files;

		const characterSheet = files.find((f) => f.id === "character_sheet");
		characterData = characterSheet
			? parseCharacterInfo(characterSheet.content)
			: null;

		console.log("📋 Character files updated:", files.length);
		console.log("👤 Character data:", characterData);
	});

	// ✅ Force refresh on mount to ensure data is loaded
	onMount(() => {
		console.log("🔄 Sidebar mounted, refreshing character data...");

		// Small delay to ensure context files are loaded
		setTimeout(() => {
			const files = contextFileManager.getAllFiles();
			characterFiles = files;

			const characterSheet = files.find(
				(f) => f.id === "character_sheet",
			);
			characterData = characterSheet
				? parseCharacterInfo(characterSheet.content)
				: null;

			console.log("📋 Sidebar force refresh - Files:", files.length);
			console.log("👤 Sidebar force refresh - Character:", characterData);
		}, 100);
	});

	function parseCharacterInfo(markdown: string) {
		if (!markdown) {
			console.log("⚠️ No markdown content to parse");
			return null;
		}

		console.log(
			"📝 Parsing character info from markdown:",
			markdown.substring(0, 100) + "...",
		);

		const nameMatch = markdown.match(/\*\*Name\*\*:\s*(.+)/);
		const classMatch = markdown.match(/\*\*Class\*\*:\s*(.+)/);
		const levelMatch = markdown.match(/\*\*Level\*\*:\s*(\d+)/);

		const result = {
			name: nameMatch?.[1]?.trim() || "Unknown",
			class: classMatch?.[1]?.trim() || "Unknown",
			level: levelMatch?.[1] ? parseInt(levelMatch[1]) : 1,
		};

		console.log("✅ Parsed character data:", result);
		return result;
	}

	function handleCampaignSelected(event: CustomEvent<string>) {
		console.log("Campaign selected:", event.detail);
	}

	// ✅ Add a manual refresh function for debugging
	function refreshCharacterData() {
		console.log("🔄 Manual character data refresh triggered");
		const files = contextFileManager.getAllFiles();
		characterFiles = files;

		const characterSheet = files.find((f) => f.id === "character_sheet");
		characterData = characterSheet
			? parseCharacterInfo(characterSheet.content)
			: null;

		console.log("📋 Manual refresh - Files:", files.length);
		console.log("👤 Manual refresh - Character:", characterData);
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
		<div class="lg:hidden">
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
	</div>

	<!-- ✅ Enhanced character info panel with better persistence -->
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

				<!-- Session restored indicator -->
				{#if sessionRestored}
					<div
						class="flex-shrink-0"
						title="Session restored from previous visit"
					>
						<div class="w-2 h-2 bg-green-500 rounded-full"></div>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<!-- ✅ Debug info when character data is missing -->
		<div class="px-4 py-3 border-b border-gray-100 bg-yellow-50">
			<div class="text-xs text-yellow-700">
				<p>Character data not loaded</p>
				<p>Files: {characterFiles.length}</p>
				{#if characterFiles.length > 0}
					<p>
						File IDs: {characterFiles.map((f) => f.id).join(", ")}
					</p>
				{/if}
				<button
					onclick={refreshCharacterData}
					class="mt-1 text-yellow-800 underline"
				>
					Refresh
				</button>
			</div>
		</div>
	{/if}

	<!-- Chat History Component - takes remaining space -->
	<div class="flex-1 overflow-hidden">
		<ChatHistory on:campaignSelected={handleCampaignSelected} />
	</div>
</aside>
