<script lang="ts">
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher<{
		createCharacter: void;
		importCharacter: void;
	}>();

	function handleCreateCharacter() {
		dispatch("createCharacter");
	}

	function handleImportCharacter() {
		dispatch("importCharacter");
	}
</script>

<!-- ✅ STEP 1: WELCOME SCREEN - initial landing page with main options -->
<div class="p-6">
	<h2 class="text-2xl font-bold mb-4">🧙‍♂️ Welcome to DungeonMaster AI</h2>

	<div class="space-y-4">
		<p class="text-gray-600">
			Choose how you'd like to begin your adventure:
		</p>

		<!-- Create New Character Button - leads to character creation method selection -->
		<button
			onclick={handleCreateCharacter}
			class="w-full p-4 border-2 border-red-200 bg-red-50 rounded-lg hover:border-red-300 hover:bg-red-100 focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 transition-all text-left transform hover:scale-[1.02]"
		>
			<div class="flex items-center space-x-3">
				<div
					class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"
				>
					<svg
						class="w-6 h-6 text-red-600"
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
				</div>
				<div>
					<h3 class="font-semibold text-red-800">
						Create New Character
					</h3>
					<p class="text-sm text-red-700">
						Create your character with guidance
					</p>
				</div>
			</div>
		</button>

		<!-- Import Previous Session Button - opens file import modal -->
		<button
			onclick={handleImportCharacter}
			class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition-all text-left transform hover:scale-[1.02]"
		>
			<div class="flex items-center space-x-3">
				<div
					class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"
				>
					<svg
						class="w-6 h-6 text-gray-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
						/>
					</svg>
				</div>
				<div>
					<h3 class="font-semibold">Import Previous Session</h3>
					<p class="text-sm text-gray-600">
						Continue your adventure from an exported file
					</p>
				</div>
			</div>
		</button>
	</div>
</div>
