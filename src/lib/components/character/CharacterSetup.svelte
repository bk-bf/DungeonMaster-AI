<script lang="ts">
	import { PlayerPreferencesForm } from "$lib/components/character";
	import FileImport from "./FileImport.svelte";
	import { contextFileManager } from "$lib/services/contextFiles";
	import { campaignStore } from "$lib/stores/campaigns";
	import { createEventDispatcher } from "svelte";

	// ✅ SIMPLIFIED EVENT DISPATCHER
	const dispatch = createEventDispatcher<{
		complete: {
			collaborativeMode: boolean;
			preferences: any;
			characterData?: any;
			timestamp: string;
			setupType: "traditional" | "import";
		};
	}>();

	// Component state
	let currentStep = 1;
	let showImport = false;
	let isCompletingSetup = false;

	// Traditional character creation fields
	let characterName = "";
	let characterClass = "Fighter";
	let characterBackground = "Folk Hero";

	function handleImportClick() {
		console.log("Import button clicked!");
		showImport = true;
	}

	// ✅ SIMPLIFIED: Only traditional setup
	async function completeTraditionalSetup(event: CustomEvent) {
		const preferences = event.detail;

		isCompletingSetup = true;

		try {
			console.log("⚔️ Traditional setup completed:", {
				characterName,
				characterClass,
				characterBackground,
				preferences,
			});

			await contextFileManager.initializeCharacterFiles(
				characterName,
				characterClass,
				characterBackground,
			);

			campaignStore.updateCampaignCharacter({
				name: characterName,
				class: characterClass,
				background: characterBackground,
				preferences,
			});

			dispatch("complete", {
				collaborativeMode: false,
				preferences,
				characterData: {
					name: characterName,
					class: characterClass,
					background: characterBackground,
				},
				timestamp: new Date().toISOString(),
				setupType: "traditional",
			});
		} finally {
			isCompletingSetup = false;
		}
	}

	// ✅ SIMPLIFIED: Better import handling
	function handleImportSuccess(event: CustomEvent) {
		const { data } = event.detail;

		let message = "";
		if (data.characterImported && data.campaignImported) {
			message =
				"Both character and campaign data imported successfully! Your complete adventure has been restored.";
		} else if (data.characterImported) {
			message =
				"Character data imported successfully! Your character and preferences have been restored.";
		} else if (data.campaignImported) {
			message =
				"Campaign data imported successfully! Your adventure history has been restored.";
		}

		alert(message);
		dispatch("complete", {
			collaborativeMode: false,
			preferences: null,
			timestamp: new Date().toISOString(),
			setupType: "import",
		});
	}

	function handleImportError(event: CustomEvent) {
		alert(`Import failed: ${event.detail}`);
	}

	// Validation helper
	$: isCharacterNameValid = characterName.trim().length > 0;
</script>

<!-- ✅ SIMPLIFIED: Loading overlay -->
{#if isCompletingSetup}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center"
	>
		<div class="bg-white rounded-lg p-6 text-center shadow-xl">
			<div
				class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"
			></div>
			<p class="text-gray-600">Setting up your character...</p>
		</div>
	</div>
{/if}

{#if showImport}
	<FileImport
		on:success={handleImportSuccess}
		on:error={handleImportError}
		on:cancel={() => (showImport = false)}
	/>
{/if}

<div
	class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
>
	<div
		class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
	>
		<!-- Step 1: Welcome Screen -->
		{#if currentStep === 1}
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					🧙‍♂️ Welcome to DungeonMaster AI
				</h2>

				<div class="space-y-4">
					<p class="text-gray-600">
						Choose how you'd like to begin your adventure:
					</p>

					<!-- Traditional Creation -->
					<button
						onclick={() => (currentStep = 2)}
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

					<!-- Import Previous Session -->
					<button
						onclick={handleImportClick}
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
								<h3 class="font-semibold">
									Import Previous Session
								</h3>
								<p class="text-sm text-gray-600">
									Continue your adventure from an exported
									file
								</p>
							</div>
						</div>
					</button>
				</div>
			</div>
		{/if}

		<!-- Step 2: Character Basic Info -->
		{#if currentStep === 2}
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					🧙‍♂️ Create Your Character
				</h2>

				<div class="space-y-4">
					<div>
						<label
							for="character-name"
							class="block text-sm font-medium mb-2"
							>Character Name <span class="text-red-500">*</span
							></label
						>
						<input
							id="character-name"
							bind:value={characterName}
							class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
							class:border-red-300={!isCharacterNameValid &&
								characterName.length > 0}
							placeholder="Enter your character's name"
							required
						/>
						{#if !isCharacterNameValid && characterName.length > 0}
							<p class="text-red-500 text-xs mt-1">
								Character name is required
							</p>
						{/if}
					</div>

					<div>
						<label
							for="character-class"
							class="block text-sm font-medium mb-2">Class</label
						>
						<select
							id="character-class"
							bind:value={characterClass}
							class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
						>
							<option value="Fighter"
								>Fighter - Strong warrior with weapons</option
							>
							<option value="Rogue"
								>Rogue - Sneaky thief with skills</option
							>
							<option value="Wizard"
								>Wizard - Magic user with spells</option
							>
							<option value="Cleric"
								>Cleric - Holy healer with divine power</option
							>
							<option value="Ranger"
								>Ranger - Nature's guardian with bow skills</option
							>
						</select>
					</div>

					<div>
						<label
							for="character-background"
							class="block text-sm font-medium mb-2"
							>Background</label
						>
						<select
							id="character-background"
							bind:value={characterBackground}
							class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
						>
							<option value="Folk Hero"
								>Folk Hero - Local champion</option
							>
							<option value="Criminal"
								>Criminal - Shady past</option
							>
							<option value="Acolyte"
								>Acolyte - Religious servant</option
							>
							<option value="Noble">Noble - High society</option>
							<option value="Sage"
								>Sage - Scholarly researcher</option
							>
							<option value="Soldier"
								>Soldier - Military background</option
							>
						</select>
					</div>
				</div>

				<div class="flex justify-between mt-8">
					<button
						onclick={() => (currentStep = 1)}
						class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
					>
						← Back
					</button>

					<button
						onclick={() => (currentStep = 3)}
						disabled={!isCharacterNameValid}
						class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
					>
						Next →
					</button>
				</div>

				<!-- Character preview -->
				{#if isCharacterNameValid}
					<div class="mt-6 p-4 bg-gray-50 rounded-lg border">
						<h4 class="font-medium text-gray-800 mb-2">
							Character Preview:
						</h4>
						<p class="text-sm text-gray-600">
							<span class="font-medium">{characterName}</span>, a
							<span class="font-medium"
								>{characterBackground}</span
							>
							<span class="font-medium">{characterClass}</span>
						</p>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Step 3: Player Preferences -->
		{#if currentStep === 3}
			<PlayerPreferencesForm
				collaborativeMode={false}
				onBack={() => (currentStep = 2)}
				on:complete={completeTraditionalSetup}
			/>
		{/if}
	</div>
</div>

<style>
	.transform {
		transition: transform 0.2s ease-in-out;
	}

	.hover\:scale-\[1\.02\]:hover {
		transform: scale(1.02);
	}
</style>
