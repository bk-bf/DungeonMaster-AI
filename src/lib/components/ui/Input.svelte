<script lang="ts">
	// Simplified props for D&D chat interface
	interface Props {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		size?: "sm" | "md" | "lg";
		oninput?: (event: Event) => void;
		onkeydown?: (event: KeyboardEvent) => void;
	}

	let {
		value = $bindable(""),
		placeholder = "",
		disabled = false,
		size = "md",
		oninput,
		onkeydown,
	}: Props = $props();

	// Complete class computation with size variants and states
	const inputClasses = $derived(
		[
			// Base classes
			"w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 transition-colors",
			"focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
			"disabled:opacity-50 disabled:cursor-not-allowed",

			// Size variants
			size === "sm" && "px-3 py-1.5 text-sm",
			size === "md" && "px-4 py-2 text-sm",
			size === "lg" && "px-4 py-3 text-base",
		]
			.filter(Boolean)
			.join(" "),
	);
</script>

<input
	type="text"
	bind:value
	{placeholder}
	{disabled}
	class={inputClasses}
	{oninput}
	{onkeydown}
/>
