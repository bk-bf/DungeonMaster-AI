<script lang="ts">
	import { PlayerPreferencesForm } from "$lib/components/character";
	import FileImport from "./FileImport.svelte";
	import { contextFileManager } from "$lib/services/contextFiles";
	import { campaignStore } from "$lib/stores/campaigns";
	import { createEventDispatcher } from "svelte";

	// ✅ USE CREATEEVENTDISPATCHER FOR SVELTE 4 COMPATIBILITY
	const dispatch = createEventDispatcher<{
		complete: { collaborativeMode: boolean; preferences: any };
	}>();

	// Component state
	let currentStep = 1;
	let showImport = false;

	// Traditional character creation fields
	let characterName = "";
	let characterClass = "Fighter";
	let characterBackground = "Folk Hero";

	function handleImportClick() {
		console.log("Import button clicked!");
		showImport = true;
	}

	async function completeTraditionalSetup(event: CustomEvent) {
		const preferences = event.detail;

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

		// ✅ DISPATCH EVENT
		dispatch("complete", { collaborativeMode: false, preferences });
	}

	function completeCollaborativeSetup(event: CustomEvent) {
		const preferences = event.detail;
		// No character files created yet - LLM will handle character creation

		// ✅ DISPATCH EVENT
		dispatch("complete", { collaborativeMode: true, preferences });
	}

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
		dispatch("complete", { collaborativeMode: false, preferences: null });
	}

	function handleImportError(event: CustomEvent) {
		alert(`Import failed: ${event.detail}`);
	}
</script>

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
		class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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

					<!-- Collaborative Creation (Recommended) -->
					<button
						onclick={() => {
							currentStep = 2;
						}}
						class="w-full p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:border-green-300 hover:bg-green-100 transition-colors text-left"
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
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
							</div>
							<div>
								<h3 class="font-semibold text-green-800">
									Collaborative Character Creation
								</h3>
								<p class="text-sm text-green-700">
									<span
										class="inline-block px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium mr-2"
										>RECOMMENDED</span
									>
									Work with the AI to create your perfect character
									through conversation
								</p>
							</div>
						</div>
					</button>

					<!-- Traditional Creation -->
					<button
						onclick={() => {
							currentStep = 3;
						}}
						class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left"
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
								<h3 class="font-semibold">
									Traditional Character Creation
								</h3>
								<p class="text-sm text-gray-600">
									Create your character manually with forms
									(classic approach)
								</p>
							</div>
						</div>
					</button>

					<!-- Import Previous Session -->
					<button
						onclick={handleImportClick}
						class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
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

		<!-- Step 2: Collaborative Mode - Player Preferences -->
		{#if currentStep === 2}
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					🎭 Tell Us About Yourself
				</h2>

				<div
					class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
				>
					<div class="flex items-start space-x-3">
						<svg
							class="w-5 h-5 text-green-600 mt-0.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div>
							<h3 class="font-medium text-green-800">
								How Collaborative Creation Works
							</h3>
							<p class="text-sm text-green-700 mt-1">
								After you share your preferences, our AI Dungeon
								Master will have a conversation with you to
								create the perfect character together. You'll
								discuss your character's background, abilities,
								and story collaboratively!
							</p>
						</div>
					</div>
				</div>

				<PlayerPreferencesForm
					collaborativeMode={true}
					onBack={() => (currentStep = 1)}
					on:complete={completeCollaborativeSetup}
				/>
			</div>
		{/if}

		<!-- Step 3: Traditional Mode - Character Basic Info -->
		{#if currentStep === 3}
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					🧙‍♂️ Create Your Character
				</h2>

				<div class="space-y-4">
					<div>
						<label
							for="character-name"
							class="block text-sm font-medium mb-2"
							>Character Name</label
						>
						<input
							id="character-name"
							bind:value={characterName}
							class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
							placeholder="Enter your character's name"
						/>
					</div>

					<div>
						<label
							for="character-class"
							class="block text-sm font-medium mb-2">Class</label
						>
						<select
							id="character-class"
							bind:value={characterClass}
							class="w-full px-3 py-2 border rounded-lg"
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
							class="w-full px-3 py-2 border rounded-lg"
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
						</select>
					</div>
				</div>

				<div class="flex justify-between mt-8">
					<button
						onclick={() => (currentStep = 1)}
						class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
					>
						← Back
					</button>

					<button
						onclick={() => (currentStep = 4)}
						class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
					>
						Next →
					</button>
				</div>
			</div>
		{/if}

		<!-- Step 4: Traditional Mode - Player Preferences -->
		{#if currentStep === 4}
			<PlayerPreferencesForm
				collaborativeMode={false}
				onBack={() => (currentStep = 3)}
				on:complete={completeTraditionalSetup}
			/>
		{/if}
	</div>
</div>
