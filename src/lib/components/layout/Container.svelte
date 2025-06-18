<script lang="ts">
	// Container props for D&D interface
	interface Props {
		maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
		padding?: "none" | "sm" | "md" | "lg";
		centered?: boolean;
	}

	let {
		maxWidth = "full",
		padding = "md",
		centered = false,
	}: Props = $props();

	// Responsive container classes
	const containerClasses = $derived(
		[
			"w-full",

			// Max width variants
			maxWidth === "sm" && "max-w-sm",
			maxWidth === "md" && "max-w-md",
			maxWidth === "lg" && "max-w-lg",
			maxWidth === "xl" && "max-w-xl",
			maxWidth === "2xl" && "max-w-2xl",
			maxWidth === "full" && "max-w-none",

			// Padding variants
			padding === "none" && "",
			padding === "sm" && "p-4",
			padding === "md" && "p-6",
			padding === "lg" && "p-8",

			// Centering
			centered && "mx-auto",
		]
			.filter(Boolean)
			.join(" "),
	);
</script>

<div class={containerClasses}>
	<slot />
</div>
