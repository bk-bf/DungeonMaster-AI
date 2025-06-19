<!-- src/lib/components/character/CharacterSetup.svelte -->
<script lang="ts">
	import { PlayerPreferencesForm } from "$lib/components/character";
	import FileImport from "./FileImport.svelte"; // ✅ Direct import
	import { contextFileManager } from "$lib/services/contextFiles";
	import { campaignStore } from "$lib/stores/campaigns";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher<{
		complete: void;
	}>();

	let currentStep = 1;
	let showImport = false;
	let characterName = "";
	let characterClass = "Fighter";
	let characterBackground = "Folk Hero";

	// ✅ Add console log to debug
	function handleImportClick() {
		console.log("Import button clicked!");
		showImport = true;
	}

	async function completeSetup(preferences: any) {
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

		dispatch("complete");
	}

	function handleImportSuccess(event: CustomEvent) {
		const { type, data } = event.detail;

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
		dispatch("complete");
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
		{#if currentStep === 1}
			<!-- Welcome Screen with Import Option -->
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					🧙‍♂️ Welcome to DungeonMaster AI
				</h2>

				<div class="space-y-4">
					<p class="text-gray-600">
						Choose how you'd like to begin your adventure:
					</p>

					<!-- Create New Character -->
					<button
						onclick={() => (currentStep = 2)}
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
									Create New Character
								</h3>
								<p class="text-sm text-gray-600">
									Start fresh with a new character and
									campaign
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
		{:else if currentStep === 2}
			<!-- Character Basic Info -->
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					🧙‍♂️ Create Your Character
				</h2>

				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium mb-2"
							>Character Name</label
						>
						<input
							bind:value={characterName}
							class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
							placeholder="Enter your character's name"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium mb-2"
							>Class</label
						>
						<select
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
						<label class="block text-sm font-medium mb-2"
							>Background</label
						>
						<select
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

				<div class="flex justify-between mt-6">
					<button
						onclick={() => (currentStep = 1)}
						class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
					>
						← Back
					</button>
					<button
						onclick={() => (currentStep = 3)}
						disabled={!characterName.trim()}
						class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
					>
						Next: Preferences →
					</button>
				</div>
			</div>
		{:else}
			<!-- Player Preferences -->
			<PlayerPreferencesForm on:complete={completeSetup} />
		{/if}
	</div>
</div>
