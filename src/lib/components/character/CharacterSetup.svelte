<!-- src/lib/components/character/CharacterSetup.svelte -->
<script lang="ts">
	import { PlayerPreferencesForm } from "$lib/components/character";
	import { contextFileManager } from "$lib/services/contextFiles";
	import { campaignStore } from "$lib/stores/campaigns";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher<{
		complete: void;
	}>();

	let currentStep = 1;
	let characterName = "";
	let characterClass = "Fighter";
	let characterBackground = "Folk Hero";

	async function completeSetup(preferences: any) {
		// ✅ FIX: Pass actual character data instead of just name
		await contextFileManager.initializeCharacterFiles(
			characterName,
			characterClass,
			characterBackground,
		);

		// Update campaign store
		campaignStore.updateCampaignCharacter({
			name: characterName,
			class: characterClass,
			background: characterBackground,
			preferences,
		});

		dispatch("complete");
	}
</script>

<div
	class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
>
	<div
		class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
	>
		{#if currentStep === 1}
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

				<div class="flex justify-end mt-6">
					<button
						onclick={() => (currentStep = 2)}
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
