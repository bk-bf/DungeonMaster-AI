<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let creationMethod: "standard" | "quick" | "random" = "standard";

	const dispatch = createEventDispatcher<{
		methodSelected: { method: "standard" | "quick" | "random" };
		back: void;
	}>();

	function selectMethod(method: "standard" | "quick" | "random") {
		creationMethod = method;
		dispatch("methodSelected", { method });
	}

	function handleBack() {
		dispatch("back");
	}
</script>

<!-- ✅ STEP 2: CHARACTER CREATION METHOD - Choose how to create character -->
<div class="p-6">
	<h2 class="text-2xl font-bold mb-4">🎲 Choose Creation Method</h2>

	<div class="space-y-4">
		<p class="text-gray-600">
			How would you like to create your character?
		</p>

		<!-- Standard Creation - Full control, step-by-step process -->
		<button
			onclick={() => selectMethod("standard")}
			class="w-full p-4 border-2 rounded-lg transition-all text-left transform hover:scale-[1.02] focus:ring-2 focus:ring-opacity-50"
			class:border-blue-300={creationMethod === "standard"}
			class:bg-blue-50={creationMethod === "standard"}
			class:border-gray-200={creationMethod !== "standard"}
			class:hover:border-blue-300={creationMethod !== "standard"}
			class:hover:bg-blue-50={creationMethod !== "standard"}
			class:focus:ring-blue-300={true}
		>
			<div class="flex items-center space-x-3">
				<div
					class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
				>
					<svg
						class="w-6 h-6 text-blue-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<div>
					<h3 class="font-semibold text-blue-800">
						Standard Creation
					</h3>
					<p class="text-sm text-blue-700">
						Full control over every aspect of your character
					</p>
					<p class="text-xs text-blue-600 mt-1">
						Recommended for experienced players
					</p>
				</div>
			</div>
		</button>

		<!-- Quick Build - Optimized character with minimal choices -->
		<button
			onclick={() => selectMethod("quick")}
			class="w-full p-4 border-2 rounded-lg transition-all text-left transform hover:scale-[1.02] focus:ring-2 focus:ring-opacity-50"
			class:border-green-300={creationMethod === "quick"}
			class:bg-green-50={creationMethod === "quick"}
			class:border-gray-200={creationMethod !== "quick"}
			class:hover:border-green-300={creationMethod !== "quick"}
			class:hover:bg-green-50={creationMethod !== "quick"}
			class:focus:ring-green-300={true}
		>
			<div class="flex items-center space-x-3">
				<div
					class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
				>
					<svg
						class="w-6 h-6 text-green-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
				</div>
				<div>
					<h3 class="font-semibold text-green-800">Quick Build</h3>
					<p class="text-sm text-green-700">
						Optimized character ready to play in minutes
					</p>
					<p class="text-xs text-green-600 mt-1">
						Perfect for beginners and fast games
					</p>
				</div>
			</div>
		</button>

		<!-- Random Character - Dice-based generation for surprises -->
		<button
			onclick={() => selectMethod("random")}
			class="w-full p-4 border-2 rounded-lg transition-all text-left transform hover:scale-[1.02] focus:ring-2 focus:ring-opacity-50"
			class:border-purple-300={creationMethod === "random"}
			class:bg-purple-50={creationMethod === "random"}
			class:border-gray-200={creationMethod !== "random"}
			class:hover:border-purple-300={creationMethod !== "random"}
			class:hover:bg-purple-50={creationMethod !== "random"}
			class:focus:ring-purple-300={true}
		>
			<div class="flex items-center space-x-3">
				<div
					class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
				>
					<svg
						class="w-6 h-6 text-purple-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2m-5 4v6m-3-3h6"
						/>
					</svg>
				</div>
				<div>
					<h3 class="font-semibold text-purple-800">
						Random Character
					</h3>
					<p class="text-sm text-purple-700">
						Let the dice decide your character's fate
					</p>
					<p class="text-xs text-purple-600 mt-1">
						For adventurous players who love surprises
					</p>
				</div>
			</div>
		</button>
	</div>

	<!-- Navigation buttons for Step 2 -->
	<div class="flex justify-between mt-8">
		<button
			onclick={handleBack}
			class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
		>
			← Back
		</button>

		<!-- Info about selected method -->
		{#if creationMethod}
			<div class="text-sm text-gray-500">
				Selected: <span class="font-medium capitalize"
					>{creationMethod} Creation</span
				>
			</div>
		{/if}
	</div>
</div>
