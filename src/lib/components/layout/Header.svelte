<script lang="ts">
	// Header props for D&D interface
	interface Props {
		title?: string;
		showMenuButton?: boolean;
		onMenuToggle?: () => void;
	}

	let {
		title = "D&D Campaign Assistant",
		showMenuButton = true,
		onMenuToggle,
	}: Props = $props();
</script>

<!-- ORANGE DEBUG for Header content -->
<header
	class="bg-orange-100 border-2 border-orange-500 px-4 py-3 flex items-center justify-between"
>
	<!-- Left side: Menu button and title -->
	<div
		class="flex items-center space-x-3 bg-pink-100 border border-pink-400 p-2"
	>
		{#if showMenuButton}
			<button
				type="button"
				class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 lg:hidden"
				onclick={onMenuToggle}
				aria-label="Toggle sidebar"
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
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>
		{/if}

		<h1 class="text-xl font-semibold text-gray-900">{title}</h1>
	</div>

	<!-- Right side: Navigation placeholder -->
	<div
		class="flex items-center space-x-2 bg-cyan-100 border border-cyan-400 p-2"
	>
		<button
			type="button"
			class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
			aria-label="Settings"
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
					d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
		</button>
	</div>
</header>
