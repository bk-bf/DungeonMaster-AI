<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import {
		RACES,
		type Race,
		formatAbilityScoreIncrease,
	} from "$lib/data/races";

	export let selectedRace: Race | null = null;
	export let selectedSubrace: string | null = null;
	export let creationMethod: "standard" | "quick" | "random" = "standard";

	const dispatch = createEventDispatcher<{
		raceSelected: { race: Race };
		subraceSelected: { subrace: string };
		next: void;
		back: void;
	}>();

	function selectRace(race: Race) {
		selectedRace = race;
		// Reset subrace when changing race
		selectedSubrace = null;
		dispatch("raceSelected", { race });
		console.log("Selected race:", race.name);
	}

	function selectSubrace(subraceName: string) {
		selectedSubrace = subraceName;
		dispatch("subraceSelected", { subrace: subraceName });
		console.log("Selected subrace:", subraceName);
	}

	function handleNext() {
		dispatch("next");
	}

	function handleBack() {
		dispatch("back");
	}

	// Validation
	$: canProceedFromRace =
		selectedRace !== null &&
		(!selectedRace?.subraces || selectedSubrace !== null);
</script>

<!-- ✅ STEP 3: RACE SELECTION - Enhanced with emojis and perfect alignment -->
<div class="p-6">
	<h2 class="text-2xl font-bold mb-4">
		🧝‍♀️ Choose Your Race
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
		Your race determines your character's physical traits, natural
		abilities, and cultural background.
		{#if creationMethod === "random"}
			<span class="text-purple-600 font-medium"
				>(Race will be randomly selected)</span
			>
		{/if}
	</p>

	<!-- Race Grid - displays all available races with consistent alignment -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
		{#each RACES as race}
			<button
				onclick={() => selectRace(race)}
				disabled={creationMethod === "random"}
				class="h-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 flex flex-col"
				class:border-blue-500={selectedRace?.name === race.name}
				class:bg-blue-50={selectedRace?.name === race.name}
				class:border-gray-200={selectedRace?.name !== race.name}
				class:hover:border-blue-300={selectedRace?.name !== race.name &&
					creationMethod !== "random"}
				class:bg-gray-100={creationMethod === "random"}
				class:cursor-not-allowed={creationMethod === "random"}
			>
				<!-- ✅ RACE HEADER - Fixed height container for perfect alignment -->
				<div
					class="flex items-center justify-between mb-2 min-h-[2rem]"
				>
					<div class="flex items-center space-x-2">
						<!-- ✅ Race emoji with consistent sizing -->
						<span
							class="text-xl"
							role="img"
							aria-label="{race.name} emoji"
						>
							{race.emoji}
						</span>
						<!-- ✅ Race name with consistent typography -->
						<h3 class="font-semibold text-lg leading-tight">
							{race.name}
						</h3>
					</div>

					<!-- ✅ Selection checkbox - always in same position -->
					<div class="flex-shrink-0">
						{#if selectedRace?.name === race.name}
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
							<!-- ✅ Placeholder to maintain consistent spacing -->
							<div class="w-5 h-5"></div>
						{/if}
					</div>
				</div>

				<!-- ✅ RACE DESCRIPTION - Fixed height for consistent layout -->
				<div class="flex-grow">
					<p
						class="text-sm text-gray-600 mb-3 min-h-[2.5rem] leading-relaxed"
					>
						{race.description}
					</p>

					<!-- ✅ ABILITY SCORE INCREASES - Consistent spacing -->
					<div class="mb-3">
						<div
							class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
						>
							Ability Score Increase
						</div>
						<div class="text-sm font-medium text-green-600">
							{formatAbilityScoreIncrease(
								race.abilityScoreIncrease,
							)}
						</div>
					</div>

					<!-- ✅ KEY TRAITS - Consistent height container -->
					<div class="mb-3">
						<div
							class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
						>
							Key Traits
						</div>
						<div class="flex flex-wrap gap-1 min-h-[1.5rem]">
							{#each race.traits.slice(0, 3) as trait}
								<span
									class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
								>
									{trait}
								</span>
							{/each}
							{#if race.traits.length > 3}
								<span class="text-xs text-gray-500 px-2 py-1">
									+{race.traits.length - 3} more
								</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- ✅ SIZE AND SPEED - Always at bottom for consistent alignment -->
				<div
					class="text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100"
				>
					<div class="flex items-center justify-between">
						<span
							>Size: <span class="font-medium">{race.size}</span
							></span
						>
						<span
							>Speed: <span class="font-medium"
								>{race.speed} ft</span
							></span
						>
					</div>
					{#if race.subraces}
						<div class="mt-1 text-center">
							<span
								class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
							>
								<svg
									class="w-3 h-3 mr-1"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
										clip-rule="evenodd"
									/>
								</svg>
								Has Subraces
							</span>
						</div>
					{/if}
				</div>
			</button>
		{/each}
	</div>

	<!-- ✅ SUBRACE SELECTION - Enhanced with better visual hierarchy -->
	{#if selectedRace?.subraces && creationMethod !== "random"}
		<div class="border-t pt-6">
			<div class="flex items-center space-x-2 mb-4">
				<span
					class="text-xl"
					role="img"
					aria-label="{selectedRace.name} emoji"
				>
					{selectedRace.emoji}
				</span>
				<h3 class="text-lg font-semibold">
					Choose Your {selectedRace.name} Subrace
				</h3>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each selectedRace.subraces as subrace}
					<button
						onclick={() => selectSubrace(subrace.name)}
						class="p-4 border-2 rounded-lg text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 h-full flex flex-col"
						class:border-blue-500={selectedSubrace === subrace.name}
						class:bg-blue-50={selectedSubrace === subrace.name}
						class:border-gray-200={selectedSubrace !== subrace.name}
						class:hover:border-blue-300={selectedSubrace !==
							subrace.name}
					>
						<!-- ✅ SUBRACE HEADER - Consistent alignment -->
						<div
							class="flex items-center justify-between mb-2 min-h-[1.5rem]"
						>
							<h4 class="font-semibold leading-tight">
								{subrace.name}
							</h4>
							<div class="flex-shrink-0">
								{#if selectedSubrace === subrace.name}
									<svg
										class="w-4 h-4 text-blue-500"
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
									<div class="w-4 h-4"></div>
								{/if}
							</div>
						</div>

						<!-- ✅ SUBRACE CONTENT - Flexible height -->
						<div class="flex-grow">
							<p
								class="text-sm text-gray-600 mb-3 leading-relaxed"
							>
								{subrace.description}
							</p>

							<div class="mb-2">
								<div
									class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
								>
									Additional Bonuses
								</div>
								<div class="text-sm font-medium text-green-600">
									{formatAbilityScoreIncrease(
										subrace.abilityScoreIncrease,
									)}
								</div>
							</div>
						</div>

						<!-- ✅ SUBRACE TRAITS - Always at bottom -->
						<div class="mt-auto pt-2 border-t border-gray-100">
							<div
								class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
							>
								Special Traits
							</div>
							<div class="flex flex-wrap gap-1">
								{#each subrace.traits as trait}
									<span
										class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
									>
										{trait}
									</span>
								{/each}
							</div>
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Navigation buttons for Step 3 -->
	<div class="flex justify-between mt-8">
		<button
			onclick={handleBack}
			class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
		>
			← Back
		</button>

		<button
			onclick={handleNext}
			disabled={!canProceedFromRace}
			class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
		>
			Next →
		</button>
	</div>

	<!-- ✅ RACE SUMMARY - Enhanced with emoji -->
	{#if selectedRace}
		<div class="mt-6 p-4 bg-gray-50 rounded-lg border">
			<h4 class="font-medium text-gray-800 mb-2">Selected Race:</h4>
			<div class="text-sm text-gray-600">
				<div class="flex items-center space-x-2 mb-1">
					<span
						class="text-lg"
						role="img"
						aria-label="{selectedRace.name} emoji"
					>
						{selectedRace.emoji}
					</span>
					<span class="font-medium">{selectedRace.name}</span>
					{#if selectedSubrace}
						<span class="text-gray-500">({selectedSubrace})</span>
					{/if}
				</div>
				<span class="text-green-600">
					{formatAbilityScoreIncrease(
						selectedRace.abilityScoreIncrease,
					)}
					{#if selectedSubrace && selectedRace.subraces}
						{@const subrace = selectedRace.subraces.find(
							(s) => s.name === selectedSubrace,
						)}
						{#if subrace}
							, {formatAbilityScoreIncrease(
								subrace.abilityScoreIncrease,
							)}
						{/if}
					{/if}
				</span>
			</div>
		</div>
	{/if}
</div>
