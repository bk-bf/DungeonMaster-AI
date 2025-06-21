<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import {
		ABILITY_SCORES,
		ABILITY_SCORE_METHODS,
		type AbilityScoreMethod,
		getAbilityModifier,
		formatModifier,
		getPointBuyCost,
		rollAbilityScore,
		getRacialBonus,
	} from "$lib/data/abilityScores";
	import type { Race } from "$lib/data/races";

	export let selectedAbilityMethod: AbilityScoreMethod | null = null;
	export let abilityScores: Record<string, number> = {
		Strength: 10,
		Dexterity: 10,
		Constitution: 10,
		Intelligence: 10,
		Wisdom: 10,
		Charisma: 10,
	};
	export let pointBuyRemaining: number = 27;
	export let rolledScores: number[] = [];
	export let selectedRace: Race | null = null;
	export let creationMethod: "standard" | "quick" | "random" = "standard";

	const dispatch = createEventDispatcher<{
		methodSelected: { method: AbilityScoreMethod };
		scoreChanged: { ability: string; score: number };
		scoresRerolled: { scores: number[] };
		next: void;
		back: void;
		resetMethod: void;
	}>();

	function selectAbilityMethod(method: AbilityScoreMethod) {
		selectedAbilityMethod = method;

		// Initialize scores based on method
		if (method.type === "array") {
			// Standard Array: 15, 14, 13, 12, 10, 8
			abilityScores = {
				Strength: 15,
				Dexterity: 14,
				Constitution: 13,
				Intelligence: 12,
				Wisdom: 10,
				Charisma: 8,
			};
		} else if (method.type === "pointBuy") {
			// Point Buy: Start with 8s, 27 points to spend
			abilityScores = {
				Strength: 8,
				Dexterity: 8,
				Constitution: 8,
				Intelligence: 8,
				Wisdom: 8,
				Charisma: 8,
			};
			pointBuyRemaining = 27;
		} else if (method.type === "roll") {
			// Rolling: Generate 6 random scores
			rerollAbilityScores();
		}

		dispatch("methodSelected", { method });
		console.log("Selected ability method:", method.name);
	}

	function adjustPointBuyScore(abilityName: string, change: number) {
		if (!selectedAbilityMethod || selectedAbilityMethod.type !== "pointBuy")
			return;

		const currentScore = abilityScores[abilityName];
		const newScore = currentScore + change;

		// Validate bounds
		if (newScore < 8 || newScore > 15) return;

		// Calculate point cost difference
		const oldCost = getPointBuyCost(currentScore);
		const newCost = getPointBuyCost(newScore);
		const costDifference = newCost - oldCost;

		// Check if we have enough points
		if (pointBuyRemaining - costDifference < 0) return;

		// Apply changes
		abilityScores[abilityName] = newScore;
		pointBuyRemaining -= costDifference;

		dispatch("scoreChanged", { ability: abilityName, score: newScore });
		console.log(
			`${abilityName}: ${currentScore} → ${newScore}, Points remaining: ${pointBuyRemaining}`,
		);
	}

	function rerollAbilityScores() {
		if (!selectedAbilityMethod || selectedAbilityMethod.type !== "roll")
			return;

		// Generate 6 new scores - ✅ Pass selectedAbilityMethod to rollAbilityScore
		rolledScores = Array.from({ length: 6 }, () =>
			rollAbilityScore(selectedAbilityMethod!),
		);

		// Assign to abilities in order
		const abilityNames = [
			"Strength",
			"Dexterity",
			"Constitution",
			"Intelligence",
			"Wisdom",
			"Charisma",
		];
		abilityNames.forEach((ability, index) => {
			abilityScores[ability] = rolledScores[index];
		});

		dispatch("scoresRerolled", { scores: rolledScores });
		console.log("Rerolled ability scores:", rolledScores);
	}

	function handleNext() {
		dispatch("next");
	}

	function handleBack() {
		if (selectedAbilityMethod) {
			// Reset method selection (stay in same step)
			selectedAbilityMethod = null;
			dispatch("resetMethod");
		} else {
			// Go back to previous step
			dispatch("back");
		}
	}

	// Validation
	function validateAbilityScores(): boolean {
		if (!selectedAbilityMethod) return false;

		if (selectedAbilityMethod.type === "pointBuy") {
			return pointBuyRemaining === 0;
		}

		if (selectedAbilityMethod.type === "array") {
			const usedValues = Object.values(abilityScores);
			const standardArray = [15, 14, 13, 12, 10, 8];
			return (
				standardArray.every((value) => usedValues.includes(value)) &&
				usedValues.length === 6
			);
		}

		return true;
	}

	$: canProceedFromAbilities =
		selectedAbilityMethod !== null && validateAbilityScores();
</script>

<!-- ✅ STEP 5: ABILITY SCORES - Choose ability score generation method and assign scores -->
<div class="p-6">
	<h2 class="text-2xl font-bold mb-4">
		💪 Ability Scores
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
		Your ability scores determine your character's basic capabilities and
		modifiers.
		{#if creationMethod === "random"}
			<span class="text-purple-600 font-medium"
				>(Ability scores will be randomly generated)</span
			>
		{/if}
	</p>

	<!-- ✅ ABILITY SCORE METHOD SELECTION -->
	{#if !selectedAbilityMethod || creationMethod === "random"}
		<div class="mb-6">
			<h3 class="text-lg font-semibold mb-4">Choose Generation Method</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each ABILITY_SCORE_METHODS as method}
					<button
						onclick={() => selectAbilityMethod(method)}
						disabled={creationMethod === "random"}
						class="p-4 border-2 rounded-lg text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
						class:border-blue-500={selectedAbilityMethod?.name ===
							method.name}
						class:bg-blue-50={selectedAbilityMethod?.name ===
							method.name}
						class:border-gray-200={selectedAbilityMethod?.name !==
							method.name}
						class:hover:border-blue-300={selectedAbilityMethod?.name !==
							method.name && creationMethod !== "random"}
						class:bg-gray-100={creationMethod === "random"}
						class:cursor-not-allowed={creationMethod === "random"}
					>
						<div class="flex items-center justify-between mb-2">
							<div class="flex items-center space-x-2">
								<span
									class="text-xl"
									role="img"
									aria-label="{method.name} emoji"
								>
									{method.emoji}
								</span>
								<h4 class="font-semibold">{method.name}</h4>
							</div>
							{#if selectedAbilityMethod?.name === method.name}
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
						<p class="text-sm text-gray-600">
							{method.description}
						</p>
						{#if method.type === "array"}
							<div class="mt-2 text-xs text-green-600">
								Values: 15, 14, 13, 12, 10, 8
							</div>
						{:else if method.type === "pointBuy"}
							<div class="mt-2 text-xs text-green-600">
								27 points • Range: 8-15
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- ✅ ABILITY SCORE ASSIGNMENT -->
	{#if selectedAbilityMethod}
		<div class="border-t pt-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold">Assign Ability Scores</h3>
				<div class="flex items-center space-x-4">
					{#if selectedAbilityMethod.type === "pointBuy"}
						<div class="text-sm">
							<span class="font-medium">Points Remaining:</span>
							<span
								class="text-lg font-bold"
								class:text-red-600={pointBuyRemaining < 0}
								class:text-green-600={pointBuyRemaining === 0}
								class:text-blue-600={pointBuyRemaining > 0}
							>
								{pointBuyRemaining}
							</span>
						</div>
					{:else if selectedAbilityMethod.type === "roll"}
						<button
							onclick={rerollAbilityScores}
							class="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors text-sm"
							title="Reroll all ability scores"
						>
							<span class="text-base">🎲</span>
							<span>Reroll</span>
						</button>
					{/if}
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each ABILITY_SCORES as ability}
					{@const baseScore = abilityScores[ability.name] || 10}
					{@const racialBonus = selectedRace
						? getRacialBonus(selectedRace.name, ability.name)
						: 0}
					{@const totalScore = baseScore + racialBonus}
					{@const modifier = getAbilityModifier(totalScore)}

					<div class="p-4 bg-gray-50 rounded-lg border">
						<!-- Ability Header -->
						<div class="flex items-center space-x-2 mb-2">
							<span
								class="text-lg"
								role="img"
								aria-label="{ability.name} emoji"
							>
								{ability.emoji}
							</span>
							<div>
								<h4 class="font-semibold text-sm">
									{ability.name}
								</h4>
								<p class="text-xs text-gray-500">
									{ability.shortName}
								</p>
							</div>
						</div>

						<!-- Score Display -->
						<div class="text-center mb-3">
							<div class="text-2xl font-bold text-gray-800">
								{totalScore}
							</div>
							<div class="text-sm text-gray-600">
								{formatModifier(modifier)} modifier
							</div>
							{#if racialBonus > 0}
								<div class="text-xs text-green-600">
									{baseScore} + {racialBonus} racial
								</div>
							{/if}
						</div>

						<!-- Point Buy Controls -->
						{#if selectedAbilityMethod.type === "pointBuy"}
							<div
								class="flex items-center justify-center space-x-2"
							>
								<button
									onclick={() =>
										adjustPointBuyScore(ability.name, -1)}
									disabled={baseScore <= 8}
									class="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold"
								>
									−
								</button>
								<span class="w-8 text-center font-medium"
									>{baseScore}</span
								>
								<button
									onclick={() =>
										adjustPointBuyScore(ability.name, 1)}
									disabled={baseScore >= 15 ||
										pointBuyRemaining <
											getPointBuyCost(baseScore + 1) -
												getPointBuyCost(baseScore)}
									class="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold"
								>
									+
								</button>
							</div>
						{/if}

						<!-- Ability Description -->
						<div class="mt-3 text-xs text-gray-600">
							<p class="mb-1">{ability.description}</p>
							<div class="text-xs text-gray-500">
								Used for: {ability.examples
									.slice(0, 2)
									.join(", ")}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Navigation buttons for Step 5 -->
	<div class="flex justify-between mt-8">
		<button
			onclick={handleBack}
			class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
		>
			← Back
		</button>

		<button
			onclick={handleNext}
			disabled={!canProceedFromAbilities}
			class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
		>
			Next →
		</button>
	</div>
</div>
