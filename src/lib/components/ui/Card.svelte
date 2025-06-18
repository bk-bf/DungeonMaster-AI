<script lang="ts">
	import type { CardProps } from "$lib/types/ui.js";

	// Use interface properties with defaults
	export let title: CardProps["title"] = "";
	export let padding: CardProps["padding"] = "md";
</script>

<div class="bg-white border border-gray-200 rounded-lg shadow-sm">
	{#if title}
		<div class="px-4 py-3 border-b border-gray-200">
			<h3 class="text-lg font-medium text-gray-900">{title}</h3>
		</div>
	{/if}

	<div
		class="
    {padding === 'sm' ? 'p-3' : ''}
    {padding === 'md' ? 'p-4' : ''}
    {padding === 'lg' ? 'p-6' : ''}
  "
	>
		<slot />
	</div>
</div>
