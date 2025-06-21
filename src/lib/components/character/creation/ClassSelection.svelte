<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import {
		CLASSES,
		type Class,
		formatSkillChoices,
		getClassType,
	} from "$lib/data/classes";

	export let selectedClass: Class | null = null;
	export let selectedSkills: string[] = [];
	export let creationMethod: "standard" | "quick" | "random" = "standard";

	const dispatch = createEventDispatcher<{
		classSelected: { class: Class };
		skillToggled: { skill: string };
		skillsReset: void;
		next: void;
		back: void;
	}>();

	function selectClass(classItem: Class) {
		selectedClass = classItem;
		selectedSkills = []; // Reset skills when changing class
		dispatch("classSelected", { class: classItem });
		console.log("Selected class:", classItem.name);
	}

	function handleSkillToggle(skill: string) {
		if (selectedSkills.includes(skill)) {
			// Remove skill
			selectedSkills = selectedSkills.filter((s) => s !== skill);
		} else if (
			selectedClass &&
			selectedSkills.length < selectedClass.skillChoices
		) {
			// Add skill if under limit
			selectedSkills = [...selectedSkills, skill];
		}

		// ✅ DISPATCH EVENT TO PARENT
		dispatch("skillToggled", { skill });
		console.log("Selected skills:", selectedSkills);
	}

	function resetSkills() {
		selectedSkills = [];
		dispatch("skillsReset");
	}

	function handleNext() {
		dispatch("next");
	}

	function handleBack() {
		dispatch("back");
	}

	// Validation
	$: hasCorrectSkillCount = selectedClass
		? selectedSkills.length === selectedClass.skillChoices
		: true;
	$: canProceedFromClass = selectedClass !== null && hasCorrectSkillCount;
</script>

<!-- ✅ STEP 4: CLASS SELECTION - Enhanced with skill selection -->
<div class="p-6">
	<h2 class="text-2xl font-bold mb-4">
		⚔️ Choose Your Class
		{#if creationMethod === "quick"}
			<span class="text-sm font-normal text-green-600">(Quick Build)</span
			>
		{:else if creationMethod === "random"}
			<span class="text-sm font-normal text-purple-600">(Random)</span>
		{:else}
			<span class="text-sm font-normal text-blue-600">(Standard)</span>
		{/if}
	</h2>

	<p class="text-gray-600 mb-6">
		Your class determines your character's abilities, skills, and role in
		adventures.
		{#if creationMethod === "random"}
			<span class="text-purple-600 font-medium"
				>(Class will be randomly selected)</span
			>
		{/if}
	</p>

	<!-- ✅ CLASS GRID - existing class selection cards remain the same -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
		{#each CLASSES as classItem}
			<button
				onclick={() => selectClass(classItem)}
				disabled={creationMethod === "random"}
				class="h-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 flex flex-col"
				class:border-blue-500={selectedClass?.name === classItem.name}
				class:bg-blue-50={selectedClass?.name === classItem.name}
				class:border-gray-200={selectedClass?.name !== classItem.name}
				class:hover:border-blue-300={selectedClass?.name !==
					classItem.name && creationMethod !== "random"}
				class:bg-gray-100={creationMethod === "random"}
				class:cursor-not-allowed={creationMethod === "random"}
			>
				<!-- ✅ CLASS HEADER - same as before -->
				<div
					class="flex items-center justify-between mb-2 min-h-[2rem]"
				>
					<div class="flex items-center space-x-2">
						<span
							class="text-xl"
							role="img"
							aria-label="{classItem.name} emoji"
						>
							{classItem.emoji}
						</span>
						<h3 class="font-semibold text-lg leading-tight">
							{classItem.name}
						</h3>
					</div>

					<div class="flex-shrink-0">
						{#if selectedClass?.name === classItem.name}
							<svg
								class="w-5 h-5 text-blue-500"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
						{:else}
							<div class="w-5 h-5"></div>
						{/if}
					</div>
				</div>

				<!-- ✅ CLASS CONTENT - same as before -->
				<div class="flex-grow">
					<p
						class="text-sm text-gray-600 mb-3 min-h-[2.5rem] leading-relaxed"
					>
						{classItem.description}
					</p>

					<div class="mb-3">
						<div
							class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
						>
							Hit Die & Primary Ability
						</div>
						<div class="text-sm font-medium text-green-600">
							{classItem.hitDie} • {classItem.primaryAbility.join(
								", ",
							)}
						</div>
					</div>

					<div class="mb-3">
						<div
							class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
						>
							Skill Choices
						</div>
						<div class="text-sm text-gray-700">
							Choose {classItem.skillChoices} skills
						</div>
					</div>

					<div class="mb-3">
						<div class="flex flex-wrap gap-1">
							<span
								class="text-xs px-2 py-1 rounded-full"
								class:bg-red-100={getClassType(classItem) ===
									"Martial"}
								class:text-red-700={getClassType(classItem) ===
									"Martial"}
								class:bg-purple-100={getClassType(classItem) ===
									"Spellcaster"}
								class:text-purple-700={getClassType(
									classItem,
								) === "Spellcaster"}
								class:bg-blue-100={getClassType(classItem) ===
									"Specialist"}
								class:text-blue-700={getClassType(classItem) ===
									"Specialist"}
							>
								{getClassType(classItem)}
							</span>
							{#if classItem.spellcaster}
								<span
									class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
								>
									✨ Spellcaster
								</span>
							{/if}
						</div>
					</div>
				</div>

				<div
					class="text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100"
				>
					<div class="flex items-center justify-between">
						<span
							>Saves: <span class="font-medium"
								>{classItem.savingThrows.join(", ")}</span
							></span
						>
					</div>
					<div class="mt-1 text-center">
						<span
							class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
						>
							<svg
								class="w-3 h-3 mr-1"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fill-rule="evenodd"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									clip-rule="evenodd"
								/>
							</svg>
							{classItem.skillChoices} Skill{classItem.skillChoices !==
							1
								? "s"
								: ""}
						</span>
					</div>
				</div>
			</button>
		{/each}
	</div>

	<!-- ✅ ENHANCED CLASS DETAILS - Compact skill selection -->
	{#if selectedClass && creationMethod !== "random"}
		<div class="border-t pt-6">
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center space-x-2">
					<span
						class="text-xl"
						role="img"
						aria-label="{selectedClass.name} emoji"
					>
						{selectedClass.emoji}
					</span>
					<h3 class="text-lg font-semibold">
						{selectedClass.name} Details
					</h3>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- ✅ COMPACT SKILL SELECTION - Small cards like proficiency badges -->
				<div class="p-4 bg-gray-50 rounded-lg">
					<div class="flex items-center justify-between mb-3">
						<h4 class="font-medium text-gray-800">
							Choose {selectedClass.skillChoices} Skills
						</h4>
						<!-- ✅ Skill counter in top right -->
						<div class="flex items-center space-x-1">
							<span
								class="text-sm"
								class:text-red-600={selectedSkills.length === 0}
								class:text-gray-600={selectedSkills.length > 0}
							>
								{selectedSkills.length}/{selectedClass.skillChoices}
							</span>
							{#if hasCorrectSkillCount}
								<svg
									class="w-4 h-4 text-green-500"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</div>
					</div>

					<!-- ✅ COMPACT SKILL CARDS - Same size as proficiency badges -->
					<div class="flex flex-wrap gap-1">
						{#each selectedClass.availableSkills as skill}
							{@const isSelected = selectedSkills.includes(skill)}
							{@const isDisabled =
								!isSelected &&
								selectedSkills.length >=
									selectedClass.skillChoices}

							<button
								onclick={() => handleSkillToggle(skill)}
								disabled={isDisabled}
								class="text-xs px-2 py-1 rounded border-2 transition-all focus:outline-none focus:ring-1 focus:ring-blue-300"
								class:border-blue-500={isSelected}
								class:text-blue-500={isSelected}
								class:border-gray-200={!isSelected &&
									!isDisabled}
								class:bg-white={!isSelected && !isDisabled}
								class:text-gray-700={!isSelected && !isDisabled}
								class:hover:border-blue-300={!isSelected &&
									!isDisabled}
								class:border-gray-100={isDisabled}
								class:bg-gray-50={isDisabled}
								class:text-gray-400={isDisabled}
								class:cursor-not-allowed={isDisabled}
								class:opacity-50={isDisabled}
							>
								{skill}
							</button>
						{/each}
					</div>
				</div>

				<!-- ✅ STARTING EQUIPMENT -->
				<div class="p-4 bg-gray-50 rounded-lg">
					<h4 class="font-medium text-gray-800 mb-2">
						Starting Equipment
					</h4>
					<ul
						class="text-sm text-gray-600 space-y-1 max-h-48 overflow-y-auto"
					>
						{#each selectedClass.startingEquipment as equipment}
							<li class="flex items-start">
								<span class="text-green-500 mr-2 mt-0.5">•</span
								>
								<span>{equipment}</span>
							</li>
						{/each}
					</ul>
				</div>

				<!-- ✅ ARMOR PROFICIENCY -->
				<div class="p-4 bg-gray-50 rounded-lg">
					<h4 class="font-medium text-gray-800 mb-2">
						Armor Proficiency
					</h4>
					<div class="flex flex-wrap gap-1">
						{#each selectedClass.armorProficiency as armor}
							<span
								class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
							>
								{armor}
							</span>
						{/each}
					</div>
				</div>

				<!-- ✅ WEAPON PROFICIENCY -->
				<div class="p-4 bg-gray-50 rounded-lg">
					<h4 class="font-medium text-gray-800 mb-2">
						Weapon Proficiency
					</h4>
					<div class="flex flex-wrap gap-1">
						{#each selectedClass.weaponProficiency as weapon}
							<span
								class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
							>
								{weapon}
							</span>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Navigation buttons for Step 4 -->
	<div class="flex justify-between mt-8">
		<button
			onclick={handleBack}
			class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
		>
			← Back
		</button>

		<button
			onclick={handleNext}
			disabled={!canProceedFromClass}
			class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
		>
			Next →
		</button>
	</div>

	<!-- ✅ ENHANCED CLASS SUMMARY - includes skills -->
	{#if selectedClass}
		<div class="mt-6 p-4 bg-gray-50 rounded-lg border">
			<h4 class="font-medium text-gray-800 mb-2">Selected Class:</h4>
			<div class="text-sm text-gray-600">
				<div class="flex items-center space-x-2 mb-1">
					<span
						class="text-lg"
						role="img"
						aria-label="{selectedClass.name} emoji"
					>
						{selectedClass.emoji}
					</span>
					<span class="font-medium">{selectedClass.name}</span>
					<span class="text-gray-500"
						>({getClassType(selectedClass)})</span
					>
				</div>
				<div class="text-green-600 mb-1">
					Hit Die: {selectedClass.hitDie} • Primary: {selectedClass.primaryAbility.join(
						", ",
					)}
					{#if selectedClass.spellcaster}
						• Spellcaster
					{/if}
				</div>
				{#if selectedSkills.length > 0}
					<div class="text-blue-600">
						Skills: {selectedSkills.join(", ")}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
