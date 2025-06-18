<script lang="ts">
	// Simplified sidebar props
	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
	}

	let { isOpen = true, onClose }: Props = $props();
</script>

<!-- Static sidebar - no fixed positioning -->
<aside class="h-full bg-white border-r border-gray-200 flex flex-col">
	<!-- Sidebar header (mobile only) -->
	<div
		class="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden"
	>
		<h2 class="text-lg font-semibold text-gray-900">Menu</h2>
		<button
			type="button"
			class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
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

	<!-- Sidebar content -->
	<div class="flex-1 flex flex-col overflow-y-auto">
		<!-- Navigation -->
		<nav class="flex-1 px-4 py-4 space-y-2">
			<div class="space-y-1">
				<h3
					class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
				>
					Campaign
				</h3>
				<a
					href="#"
					class="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-gray-900 hover:bg-gray-100"
				>
					<svg
						class="mr-3 w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
					Chat History
				</a>
				<a
					href="#"
					class="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-gray-900 hover:bg-gray-100"
				>
					<svg
						class="mr-3 w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					Character Sheet
				</a>
				<a
					href="#"
					class="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-gray-900 hover:bg-gray-100"
				>
					<svg
						class="mr-3 w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
					Quest Log
				</a>
			</div>
		</nav>

		<!-- Sidebar footer -->
		<div class="flex-shrink-0 p-4 border-t border-gray-200">
			<button
				type="button"
				class="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-gray-900 hover:bg-gray-100"
			>
				<svg
					class="mr-3 w-5 h-5 flex-shrink-0 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6v6m0 0v6m0-6h6m-6 0H6"
					/>
				</svg>
				New Campaign
			</button>
		</div>
	</div>
</aside>
