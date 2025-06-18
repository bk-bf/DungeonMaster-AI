<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { ButtonProps } from "$lib/types/ui.js";

	// Use interface properties with defaults
	export let variant: ButtonProps["variant"] = "primary";
	export let size: ButtonProps["size"] = "md";
	export let disabled: ButtonProps["disabled"] = false;
	export let type: ButtonProps["type"] = "button";
	export let loading: ButtonProps["loading"] = false;

	const dispatch = createEventDispatcher<{ click: MouseEvent }>();

	// Reactive class computation based on props
	$: buttonClasses = [
		// Base classes
		"inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",

		// Variant classes
		variant === "primary" &&
			"bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
		variant === "secondary" &&
			"bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
		variant === "outline" &&
			"border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
		variant === "ghost" &&
			"text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
		variant === "danger" &&
			"bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",

		// Size classes
		size === "sm" && "px-3 py-1.5 text-sm",
		size === "md" && "px-4 py-2 text-sm",
		size === "lg" && "px-6 py-3 text-base",
		size === "xl" && "px-8 py-4 text-lg",
	]
		.filter(Boolean)
		.join(" ");

	function handleClick(event: MouseEvent) {
		if (!disabled && !loading) {
			dispatch("click", event);
		}
	}
</script>

<button
	{type}
	class={buttonClasses}
	{disabled}
	on:click={handleClick}
	aria-disabled={disabled || loading}
>
	{#if loading}
		<svg class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
			<circle
				class="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{/if}
	<slot />
</button>
