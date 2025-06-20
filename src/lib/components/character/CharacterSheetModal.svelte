<!-- src/lib/components/character/CharacterSheetModal.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { fly } from "svelte/transition";
	import { marked } from "marked";
	import { contextFileManager } from "$lib/services/contextFiles";

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	let renderedHTML = "";
	let isLoading = true;
	let modalWidth = 0; // For transition calculation

	// Get character sheet data
	$: contextFiles = contextFileManager.getAllFiles();
	$: characterSheet = contextFiles.find((f) => f.id === "character_sheet");

	// Configure marked for enhanced GitHub-style rendering with emoji support
	onMount(() => {
		marked.setOptions({
			breaks: true,
			gfm: true,
			//sanitize: false,
			//smartypants: true,
			// Enable emoji parsing
			renderer: new marked.Renderer(),
		});
	});

	// Reactive statement to render markdown when character sheet changes
	$: if (characterSheet?.content) {
		renderMarkdown(characterSheet.content);
	} else {
		renderedHTML =
			'<div class="no-content"><h2>No Character Sheet Found</h2><p>Create a character to view your character sheet.</p></div>';
		isLoading = false;
	}

	async function renderMarkdown(content: string) {
		try {
			const result = await marked(content);
			renderedHTML = result;
			isLoading = false;
		} catch (error) {
			console.error("Failed to render markdown:", error);
			renderedHTML =
				'<p class="error">Error rendering character sheet</p>';
			isLoading = false;
		}
	}

	// Handle escape key to close
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			dispatch("close");
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- ✅ Slide-in panel from left without backdrop -->

<div
	class="fixed inset-y-0 left-80 z-50 w-2/3 max-w-4xl slide-panel"
	bind:clientWidth={modalWidth}
	transition:fly={{ x: -modalWidth, duration: 300, opacity: 1 }}
>
	<div
		class="bg-white h-full flex flex-col shadow-2xl border-r border-gray-200"
	>
		<!-- GitHub-style file header -->
		<div class="file-header">
			<div class="file-info">
				<svg
					class="file-icon w-4 h-4"
					fill="currentColor"
					viewBox="0 0 16 16"
				>
					<path
						d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"
					/>
				</svg>
				<span>character_sheet.md</span>
			</div>
			<div class="flex items-center space-x-4">
				<span class="text-xs">Markdown</span>
				<button
					onclick={() => dispatch("close")}
					class="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
					aria-label="Close character sheet"
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
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Content area with GitHub-style markdown -->
		<div class="flex-1 overflow-y-auto bg-white">
			{#if isLoading}
				<div class="flex items-center justify-center h-full">
					<div
						class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"
					></div>
				</div>
			{:else}
				<div class="github-markdown">
					{@html renderedHTML}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Enhanced GitHub-style CSS with D&D optimizations -->
<style>
	.github-markdown {
		box-sizing: border-box;
		min-width: 200px;
		max-width: 980px;
		margin: 0 auto;
		padding: 45px;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans",
			Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
		font-size: 14px; /* Slightly smaller for more content */
		line-height: 1.5;
		word-wrap: break-word;
		background-color: #ffffff;
		color: #1f2328;
	}

	.github-markdown h1 {
		padding-bottom: 0.3em;
		font-size: 2em;
		border-bottom: 1px solid #d1d9e0;
		margin-top: 0;
		margin-bottom: 16px;
		font-weight: 600;
		line-height: 1.25;
		color: #1f2328;
	}

	.github-markdown h2 {
		padding-bottom: 0.3em;
		font-size: 1.5em;
		border-bottom: 1px solid #d1d9e0;
		margin-top: 24px;
		margin-bottom: 16px;
		font-weight: 600;
		line-height: 1.25;
		color: #1f2328;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.github-markdown h3 {
		font-size: 1.25em;
		margin-top: 24px;
		margin-bottom: 16px;
		font-weight: 600;
		line-height: 1.25;
		color: #1f2328;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.github-markdown p {
		margin-top: 0;
		margin-bottom: 8px; /* Compact paragraph spacing for character info */
	}

	.github-markdown ul,
	.github-markdown ol {
		margin-top: 0;
		margin-bottom: 16px;
		padding-left: 2em;
	}

	.github-markdown li {
		margin-bottom: 4px; /* Better list styling for equipment and features */
		line-height: 1.4;
	}

	.github-markdown strong {
		font-weight: 600;
		color: #1f2328;
	}

	.github-markdown em {
		font-style: italic;
		color: #656d76;
	}

	.github-markdown code {
		padding: 0.2em 0.4em;
		margin: 0;
		font-size: 85%;
		white-space: break-spaces;
		background-color: #f6f8fa;
		border-radius: 6px;
		font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas,
			"Liberation Mono", Menlo, monospace;
		color: #1f2328;
	}

	.github-markdown pre {
		padding: 16px;
		overflow: auto;
		font-size: 85%;
		line-height: 1.45;
		color: #1f2328;
		background-color: #f6f8fa;
		border-radius: 6px;
		margin-top: 0;
		margin-bottom: 16px;
	}

	/* Enhanced table styling for D&D stats */
	.github-markdown table {
		border-spacing: 0;
		border-collapse: collapse;
		width: 100%;
		margin: 16px 0;
		font-size: 14px;
		max-width: 100%;
		overflow: auto;
		display: table; /* Override block display */
	}

	.github-markdown table th {
		font-weight: 600;
		background-color: #f6f8fa;
		text-align: center;
		padding: 8px 12px;
		border: 1px solid #d1d9e0;
	}

	.github-markdown table td {
		text-align: center;
		padding: 6px 12px;
		border: 1px solid #d1d9e0;
	}

	.github-markdown table tr {
		background-color: #ffffff;
		border-top: 1px solid #d1d9e0;
	}

	.github-markdown table tr:nth-child(2n) {
		background-color: #f6f8fa;
	}

	/* Add a specific class for ability score tables if needed */
	.github-markdown .ability-table {
		max-width: 500px;
		margin: 16px auto;
	}

	/* Highlight important stats */
	.github-markdown table td:first-child {
		font-weight: 500;
		text-align: left;
		padding-left: 16px;
	}

	/* Better spacing for sections */
	.github-markdown h2 + ul,
	.github-markdown h3 + ul {
		margin-top: 8px;
	}

	.github-markdown blockquote {
		padding: 0 1em;
		color: #656d76;
		border-left: 0.25em solid #d1d9e0;
		margin-top: 0;
		margin-bottom: 16px;
	}

	.github-markdown hr {
		height: 0.25em;
		padding: 0;
		margin: 24px 0;
		background-color: #d1d9e0;
		border: 0;
	}

	.error {
		color: #d1242f;
		background-color: #fff8f8;
		padding: 16px;
		border-radius: 6px;
		border: 1px solid #f85149;
	}

	.no-content {
		text-align: center;
		padding: 48px 16px;
		color: #656d76;
	}

	.no-content h2 {
		color: #1f2328;
		margin-bottom: 8px;
	}

	.file-header {
		background-color: #f6f8fa;
		border-bottom: 1px solid #d1d9e0;
		padding: 8px 16px;
		font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas,
			"Liberation Mono", Menlo, monospace;
		font-size: 14px;
		color: #656d76;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.file-icon {
		margin-right: 8px;
		color: #656d76;
	}

	.file-info {
		display: flex;
		align-items: center;
	}

	.slide-panel {
		box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
	}
</style>
