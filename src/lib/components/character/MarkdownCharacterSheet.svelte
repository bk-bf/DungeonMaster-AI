<!-- src/lib/components/character/MarkdownCharacterSheet.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { marked } from "marked";
	import hljs from "highlight.js";
	import { contextFileManager } from "$lib/services/contextFiles";

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	let renderedHTML = "";
	let isLoading = true;

	// Get character sheet data
	$: contextFiles = contextFileManager.getAllFiles();
	$: characterSheet = contextFiles.find((f) => f.id === "character_sheet");

	// Configure marked for GitHub-style rendering
	onMount(() => {
		marked.use({
			renderer: {
				code({ text, lang }: { text: string; lang?: string }) {
					const language = hljs.getLanguage(lang || "")
						? lang || ""
						: "plaintext";
					return `<pre><code class="hljs language-${language}">${hljs.highlight(text, { language }).value}</code></pre>`;
				},
			},
			breaks: true,
			gfm: true,
		});
	});

	// Render markdown when character sheet changes
	$: if (characterSheet) {
		(async () => {
			try {
				renderedHTML = await marked(characterSheet.content);
				isLoading = false;
			} catch (error) {
				console.error("Failed to render markdown:", error);
				renderedHTML = "<p>Error rendering character sheet</p>";
				isLoading = false;
			}
		})();
	} else {
		renderedHTML = "<p>No character sheet found</p>";
		isLoading = false;
	}
</script>

<div
	class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
>
	<div
		class="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
	>
		<!-- Header -->
		<div
			class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50"
		>
			<h2
				class="text-lg font-semibold text-gray-900 flex items-center space-x-2"
			>
				<svg
					class="w-5 h-5 text-gray-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<span>character_sheet.md</span>
			</h2>
			<div class="flex items-center space-x-2">
				<span class="text-sm text-gray-500">Markdown</span>
				<button
					onclick={() => dispatch("close")}
					class="text-gray-400 hover:text-gray-600 transition-colors"
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

		<!-- Content -->
		<div class="flex-1 overflow-y-auto bg-gray-50">
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

<!-- GitHub-style CSS -->
<style>
	.github-markdown {
		box-sizing: border-box;
		min-width: 200px;
		max-width: 980px;
		margin: 0 auto;
		padding: 45px;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans",
			Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
		font-size: 16px;
		line-height: 1.5;
		word-wrap: break-word;
		background-color: #ffffff;
		border: 1px solid #d1d9e0;
		border-radius: 6px;
	}

	.github-markdown h1 {
		padding-bottom: 0.3em;
		font-size: 2em;
		border-bottom: 1px solid #d1d9e0;
		margin-top: 0;
		margin-bottom: 16px;
		font-weight: 600;
		line-height: 1.25;
	}

	.github-markdown h2 {
		padding-bottom: 0.3em;
		font-size: 1.5em;
		border-bottom: 1px solid #d1d9e0;
		margin-top: 24px;
		margin-bottom: 16px;
		font-weight: 600;
		line-height: 1.25;
	}

	.github-markdown h3 {
		font-size: 1.25em;
		margin-top: 24px;
		margin-bottom: 16px;
		font-weight: 600;
		line-height: 1.25;
	}

	.github-markdown p {
		margin-top: 0;
		margin-bottom: 16px;
	}

	.github-markdown ul,
	.github-markdown ol {
		margin-top: 0;
		margin-bottom: 16px;
		padding-left: 2em;
	}

	.github-markdown li {
		margin-bottom: 0.25em;
	}

	.github-markdown strong {
		font-weight: 600;
		color: #1f2328;
	}

	.github-markdown em {
		font-style: italic;
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

	.github-markdown pre code {
		display: inline;
		max-width: auto;
		padding: 0;
		margin: 0;
		overflow: visible;
		line-height: inherit;
		word-wrap: normal;
		background-color: transparent;
		border: 0;
	}

	.github-markdown table {
		border-spacing: 0;
		border-collapse: collapse;
		display: block;
		width: max-content;
		max-width: 100%;
		overflow: auto;
		margin-top: 0;
		margin-bottom: 16px;
	}

	.github-markdown table th,
	.github-markdown table td {
		padding: 6px 13px;
		border: 1px solid #d1d9e0;
	}

	.github-markdown table th {
		font-weight: 600;
		background-color: #f6f8fa;
	}

	.github-markdown table tr {
		background-color: #ffffff;
		border-top: 1px solid #d1d9e0;
	}

	.github-markdown table tr:nth-child(2n) {
		background-color: #f6f8fa;
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

	/* Highlight.js GitHub theme */
	.hljs {
		color: #24292e;
		background: #ffffff;
	}

	.hljs-comment,
	.hljs-quote {
		color: #6a737d;
		font-style: italic;
	}

	.hljs-keyword,
	.hljs-selector-tag,
	.hljs-subst {
		color: #d73a49;
	}

	.hljs-number,
	.hljs-literal,
	.hljs-variable,
	.hljs-template-variable,
	.hljs-tag .hljs-attr {
		color: #005cc5;
	}

	.hljs-string,
	.hljs-doctag {
		color: #032f62;
	}

	.hljs-title,
	.hljs-section,
	.hljs-selector-id {
		color: #6f42c1;
		font-weight: bold;
	}

	.hljs-type,
	.hljs-class .hljs-title {
		color: #d73a49;
	}

	.hljs-tag,
	.hljs-name,
	.hljs-attribute {
		color: #22863a;
	}

	.hljs-regexp,
	.hljs-link {
		color: #032f62;
	}

	.hljs-symbol,
	.hljs-bullet {
		color: #e36209;
	}

	.hljs-built_in,
	.hljs-builtin-name {
		color: #005cc5;
	}

	.hljs-meta {
		color: #6a737d;
	}

	.hljs-deletion {
		background: #ffeef0;
	}

	.hljs-addition {
		background: #f0fff4;
	}

	.hljs-emphasis {
		font-style: italic;
	}

	.hljs-strong {
		font-weight: bold;
	}
</style>
