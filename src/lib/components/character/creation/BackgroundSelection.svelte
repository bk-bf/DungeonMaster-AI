<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import {
		BACKGROUNDS,
		type Background,
		formatSkillList,
	} from "$lib/data/backgrounds";
	import { detectSkillOverlaps } from "$lib/data/skills";
	import type { Class } from "$lib/data/classes";

	export let selectedBackground: Background | null = null;
	export let selectedClass: Class | null = null;
	export let selectedSkills: string[] = [];
	export let creationMethod: "standard" | "quick" | "random" = "standard";

	const dispatch = createEventDispatcher<{
		backgroundSelected: { background: Background };
		next: void;
		back: void;
	}>();

	function selectBackground(background: Background) {
		selectedBackground = background;
		dispatch("backgroundSelected", { background });
		console.log("Selected background:", background.name);
	}

	function handleNext() {
		dispatch("next");
	}

	function handleBack() {
		dispatch("back");
	}

	// Validation and skill overlap detection
	$: canProceedFromBackground = selectedBackground !== null;
	$: skillOverlaps =
		selectedClass && selectedBackground && selectedSkills
			? detectSkillOverlaps(
					selectedSkills,
					selectedBackground.skillProficiencies,
				)
			: [];
	$: hasSkillOverlaps = skillOverlaps.length > 0;
</script>

<!-- ✅ STEP 6: BACKGROUND SELECTION - Choose character background -->
<div class="p-6">
	<h2 class="text-2xl font-bold mb-4">
		📚 Choose Your Background
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
		Your background represents your character's history before becoming an
		adventurer, providing skills, tools, and equipment.
		{#if creationMethod === "random"}
			<span class="text-purple-600 font-medium"
				>(Background will be randomly selected)</span
			>
		{/if}
	</p>

	<!-- Background Grid - displays all available backgrounds -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
		{#each BACKGROUNDS as background}
			<button
				onclick={() => selectBackground(background)}
				disabled={creationMethod === "random"}
				class="h-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 flex flex-col"
				class:border-blue-500={selectedBackground?.name ===
					background.name}
				class:bg-blue-50={selectedBackground?.name === background.name}
				class:border-gray-200={selectedBackground?.name !==
					background.name}
				class:hover:border-blue-300={selectedBackground?.name !==
					background.name && creationMethod !== "random"}
				class:bg-gray-100={creationMethod === "random"}
				class:cursor-not-allowed={creationMethod === "random"}
			>
				<!-- Background Header -->
				<div
					class="flex items-center justify-between mb-2 min-h-[2rem]"
				>
					<div class="flex items-center space-x-2">
						<span
							class="text-xl"
							role="img"
							aria-label="{background.name} emoji"
						>
							{background.emoji}
						</span>
						<h3 class="font-semibold text-lg leading-tight">
							{background.name}
						</h3>
					</div>

					<div class="flex-shrink-0">
						{#if selectedBackground?.name === background.name}
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

				<!-- Background Description -->
				<div class="flex-grow">
					<p
						class="text-sm text-gray-600 mb-3 min-h-[2.5rem] leading-relaxed"
					>
						{background.description}
					</p>

					<!-- Skill Proficiencies -->
					<div class="mb-3">
						<div
							class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
						>
							Skill Proficiencies
						</div>
						<div class="flex flex-wrap gap-1">
							{#each background.skillProficiencies as skill}
								<span
									class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
								>
									{skill}
								</span>
							{/each}
						</div>
					</div>

					<!-- Languages and Tools -->
					<div class="mb-3">
						<div
							class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
						>
							Languages & Tools
						</div>
						<div class="text-sm text-gray-700">
							{#if background.languages > 0}
								<div class="text-xs text-blue-600">
									{background.languages} language{background.languages !==
									1
										? "s"
										: ""}
								</div>
							{/if}
							{#if background.tools.length > 0}
								<div class="text-xs text-purple-600">
									{formatSkillList(background.tools)}
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Feature and Equipment -->
				<div
					class="text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100"
				>
					<div class="mb-1">
						<span class="font-medium">Feature:</span>
						{background.feature}
					</div>
					<div class="text-xs text-gray-400">
						Starting equipment included
					</div>
				</div>
			</button>
		{/each}
	</div>

	<!-- ✅ ENHANCED BACKGROUND DETAILS - Now with skill overlap detection -->
	{#if selectedBackground && creationMethod !== "random"}
		<div class="border-t pt-6">
			<div class="flex items-center space-x-2 mb-4">
				<span
					class="text-xl"
					role="img"
					aria-label="{selectedBackground.name} emoji"
				>
					{selectedBackground.emoji}
				</span>
				<h3 class="text-lg font-semibold">
					{selectedBackground.name} Details
				</h3>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- ✅ SKILL PROFICIENCIES - Clean styling with minimal overlap indication -->
				<div class="p-4 bg-gray-50 rounded-lg">
					<h4 class="font-medium text-gray-800 mb-2">
						Skill Proficiencies
					</h4>
					<div class="flex flex-wrap gap-1">
						{#each selectedBackground.skillProficiencies as skill}
							{@const isOverlap = skillOverlaps.includes(skill)}
							<span
								class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
							>
								{skill}
								{#if isOverlap}
									<span
										class="ml-1"
										title="Overlaps with class skill"
										>⚠️</span
									>
								{/if}
							</span>
						{/each}
					</div>
					{#if hasSkillOverlaps}
						<p class="text-xs text-gray-600 mt-2">
							⚠️ Skills overlap with your class selection, but
							dont worry this will be resolved in the next step.
						</p>
					{/if}
				</div>

				<!-- Starting Equipment -->
				<div class="p-4 bg-gray-50 rounded-lg">
					<h4 class="font-medium text-gray-800 mb-2">
						Starting Equipment
					</h4>
					<ul class="text-sm text-gray-600 space-y-1">
						{#each selectedBackground.equipment as equipment}
							<li class="flex items-start">
								<span class="text-green-500 mr-2 mt-0.5">•</span
								>
								<span>{equipment}</span>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Background Feature -->
				<div class="p-4 bg-gray-50 rounded-lg">
					<h4 class="font-medium text-gray-800 mb-2">
						Feature: {selectedBackground.feature}
					</h4>
					<p class="text-sm text-gray-600">
						This background grants you a special feature that
						provides unique advantages during your adventures.
					</p>
				</div>

				<!-- Personality Traits -->
				<div class="p-4 bg-gray-50 rounded-lg">
					<h4 class="font-medium text-gray-800 mb-2">
						Personality Traits
					</h4>
					<div class="space-y-1">
						{#each selectedBackground.personalityTraits as trait}
							<div class="text-sm text-gray-600 italic">
								"{trait}"
							</div>
						{/each}
					</div>
				</div>

				<!-- Ideals -->
				<div class="p-4 bg-gray-50 rounded-lg">
					<h4 class="font-medium text-gray-800 mb-2">Ideals</h4>
					<div class="space-y-1">
						{#each selectedBackground.ideals as ideal}
							<div class="text-sm text-gray-600 italic">
								"{ideal}"
							</div>
						{/each}
					</div>
				</div>

				<!-- Bonds -->
				<div class="p-4 bg-gray-50 rounded-lg">
					<h4 class="font-medium text-gray-800 mb-2">Bonds</h4>
					<div class="space-y-1">
						{#each selectedBackground.bonds as bond}
							<div class="text-sm text-gray-600 italic">
								"{bond}"
							</div>
						{/each}
					</div>
				</div>

				<!-- Flaws -->
				<div class="p-4 bg-gray-50 rounded-lg">
					<h4 class="font-medium text-gray-800 mb-2">Flaws</h4>
					<div class="space-y-1">
						{#each selectedBackground.flaws as flaw}
							<div class="text-sm text-gray-600 italic">
								"{flaw}"
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Navigation buttons for Step 6 -->
	<div class="flex justify-between mt-8">
		<button
			onclick={handleBack}
			class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
		>
			← Back
		</button>

		<button
			onclick={handleNext}
			disabled={!canProceedFromBackground}
			class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
		>
			Next →
		</button>
	</div>

	<!-- Background Summary -->
	{#if selectedBackground}
		<div class="mt-6 p-4 bg-gray-50 rounded-lg border">
			<h4 class="font-medium text-gray-800 mb-2">Selected Background:</h4>
			<div class="text-sm text-gray-600">
				<div class="flex items-center space-x-2 mb-1">
					<span
						class="text-lg"
						role="img"
						aria-label="{selectedBackground.name} emoji"
					>
						{selectedBackground.emoji}
					</span>
					<span class="font-medium">{selectedBackground.name}</span>
				</div>
				<div class="text-green-600 mb-1">
					Skills: {formatSkillList(
						selectedBackground.skillProficiencies,
					)}
				</div>
				{#if selectedBackground.languages > 0}
					<div class="text-blue-600 mb-1">
						Languages: {selectedBackground.languages}
					</div>
				{/if}
				{#if selectedBackground.tools.length > 0}
					<div class="text-purple-600">
						Tools: {formatSkillList(selectedBackground.tools)}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
