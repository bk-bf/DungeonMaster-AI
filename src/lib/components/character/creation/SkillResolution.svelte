<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import {
		ALL_SKILLS,
		type Skill,
		type SkillProficiency,
		getSkillByName,
		formatSkillWithAbility,
		detectSkillOverlaps,
	} from "$lib/data/skills";
	import type { Class } from "$lib/data/classes";
	import type { Background } from "$lib/data/backgrounds";

	export let selectedClass: Class | null = null;
	export let selectedBackground: Background | null = null;
	export let selectedSkills: string[] = [];
	export let finalSkillProficiencies: SkillProficiency[] = [];
	export let skillReplacements: Record<string, string> = {};
	export let creationMethod: "standard" | "quick" | "random" = "standard";

	const dispatch = createEventDispatcher<{
		skillsFinalized: {
			finalSkillProficiencies: SkillProficiency[];
			skillReplacements: Record<string, string>;
		};
		next: void;
		back: void;
	}>();

	// ✅ AUTO-INITIALIZE ON COMPONENT MOUNT
	let skillsInitialized = false;

	// ✅ REACTIVE AUTO-INITIALIZATION
	$: if (
		selectedClass &&
		selectedBackground &&
		selectedSkills.length > 0 &&
		!skillsInitialized
	) {
		initializeSkillResolution();
	}

	// Skill overlap detection
	$: skillOverlaps =
		selectedClass && selectedBackground && selectedSkills
			? detectSkillOverlaps(
					selectedSkills,
					selectedBackground.skillProficiencies,
				)
			: [];
	$: hasSkillOverlaps = skillOverlaps.length > 0;

	// ✅ SIMPLE VALIDATION - No complex modes
	$: allReplacementsChosen =
		skillOverlaps.length === 0 ||
		skillOverlaps.every(
			(skill) =>
				skillReplacements[skill] &&
				skillReplacements[skill].trim() !== "",
		);
	$: canProceedFromSkills = skillsInitialized && allReplacementsChosen;

	function initializeSkillResolution() {
		if (!selectedClass || !selectedBackground || !selectedSkills) return;

		const overlaps = detectSkillOverlaps(
			selectedSkills,
			selectedBackground.skillProficiencies,
		);

		// Initialize final skill proficiencies
		finalSkillProficiencies = [];

		// Add all class skills
		selectedSkills.forEach((skill) => {
			finalSkillProficiencies.push({
				skill,
				source: "class",
			});
		});

		// Add all background skills (overlaps will be handled by replacements)
		selectedBackground.skillProficiencies.forEach((skill) => {
			finalSkillProficiencies.push({
				skill,
				source: "background",
			});
		});

		// Initialize replacement tracking
		skillReplacements = {};
		overlaps.forEach((skill) => {
			skillReplacements[skill] = "";
		});

		skillsInitialized = true;

		dispatch("skillsFinalized", {
			finalSkillProficiencies,
			skillReplacements,
		});
		console.log("Skills auto-initialized:", {
			overlaps,
			finalSkillProficiencies,
			skillReplacements,
		});
	}

	function selectReplacementSkill(
		overlappingSkill: string,
		replacementSkill: string,
	) {
		skillReplacements[overlappingSkill] = replacementSkill;

		// Update final skill proficiencies
		finalSkillProficiencies = finalSkillProficiencies.map((prof) => {
			if (
				prof.skill === overlappingSkill &&
				prof.source === "background"
			) {
				return {
					skill: replacementSkill,
					source: "replacement",
					replacedSkill: overlappingSkill,
				};
			}
			return prof;
		});

		console.log(
			"Selected replacement:",
			overlappingSkill,
			"→",
			replacementSkill,
		);
	}

	function getAvailableReplacementSkills(): string[] {
		const currentSkills = selectedSkills;
		const selectedReplacements = Object.values(skillReplacements).filter(
			(skill) => skill !== "",
		);
		const keptBackgroundSkills =
			selectedBackground?.skillProficiencies.filter(
				(skill) => !skillOverlaps.includes(skill),
			) || [];
		const overlappingSkills = skillOverlaps;

		const excludedSkills = [
			...currentSkills,
			...selectedReplacements,
			...keptBackgroundSkills,
			...overlappingSkills,
		];

		return ALL_SKILLS.map((skill) => skill.name).filter(
			(skill) => !excludedSkills.includes(skill),
		);
	}

	function getFinalSkillsList(): string[] {
		const classSkills = selectedSkills;
		const backgroundSkills = (selectedBackground?.skillProficiencies || [])
			.map((skill) => {
				const isOverlap = skillOverlaps.includes(skill);
				const replacement = skillReplacements[skill];
				return isOverlap && replacement
					? replacement
					: isOverlap
						? null
						: skill;
			})
			.filter((skill) => skill !== null);

		return [...classSkills, ...backgroundSkills];
	}

	function handleNext() {
		console.log("🎯 Skills finalized - proceeding to equipment");
		dispatch("next");
	}

	function handleBack() {
		dispatch("back");
	}
</script>

<!-- ✅ TRULY DYNAMIC SKILL RESOLUTION - Always show summary, auto-trigger conflicts -->
<div class="p-6">
	<h2 class="text-2xl font-bold mb-4">
		🎯 Your Character's Skills
		{#if hasSkillOverlaps && !allReplacementsChosen}
			<span class="text-sm font-normal text-yellow-600"
				>(Resolving Conflicts)</span
			>
		{:else if skillsInitialized}
			<span class="text-sm font-normal text-green-600">(Finalized)</span>
		{:else}
			<span class="text-sm font-normal text-blue-600">(Analyzing...)</span
			>
		{/if}
		{#if creationMethod === "quick"}
			<span class="text-sm font-normal text-green-600">
				• Quick Build</span
			>
		{:else if creationMethod === "random"}
			<span class="text-sm font-normal text-purple-600"> • Random</span>
		{:else}
			<span class="text-sm font-normal text-blue-600"> • Standard</span>
		{/if}
	</h2>

	<p class="text-gray-600 mb-6">
		{#if hasSkillOverlaps && !allReplacementsChosen}
			Some skills overlap between your class and background. Choose
			replacements for the conflicting background skills below.
		{:else if skillsInitialized}
			Your character's skills have been finalized. Review your complete
			skill set below.
		{:else}
			Analyzing your character's skills for any overlaps...
		{/if}
		{#if creationMethod === "random"}
			<span class="text-purple-600 font-medium"
				>(Skills will be automatically resolved)</span
			>
		{/if}
	</p>

	<!-- ✅ AUTO-TRIGGERED CONFLICT RESOLUTION (when conflicts exist) -->
	{#if hasSkillOverlaps && !allReplacementsChosen && skillsInitialized}
		<div class="mb-8">
			<div
				class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
			>
				<h3 class="font-semibold text-yellow-800 mb-2">
					⚠️ Skill Conflicts Detected
				</h3>
				<p class="text-sm text-yellow-700">
					Your class and background both grant {skillOverlaps.length} of
					the same skill{skillOverlaps.length !== 1 ? "s" : ""}.
					Choose replacement skills for the overlapping background
					skills below.
				</p>
			</div>

			<div class="space-y-4">
				{#each skillOverlaps as overlappingSkill}
					<div class="p-4 bg-gray-50 rounded-lg border">
						<div class="flex items-center justify-between mb-3">
							<div>
								<h4 class="font-medium text-gray-800">
									Replace: <span class="text-red-600"
										>{overlappingSkill}</span
									>
								</h4>
								<p class="text-sm text-gray-600">
									Both your {selectedClass?.name} class and {selectedBackground?.name}
									background grant this skill.
								</p>
							</div>
							<div class="text-sm text-gray-500">
								{skillReplacements[overlappingSkill]
									? "✅ Resolved"
									: "⏳ Choose replacement"}
							</div>
						</div>

						<div
							class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
						>
							{#each getAvailableReplacementSkills() as skill}
								{@const isSelected =
									skillReplacements[overlappingSkill] ===
									skill}
								<button
									onclick={() =>
										selectReplacementSkill(
											overlappingSkill,
											skill,
										)}
									class="p-2 text-sm border-2 rounded transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
									class:border-blue-500={isSelected}
									class:bg-blue-50={isSelected}
									class:text-blue-700={isSelected}
									class:border-gray-200={!isSelected}
									class:hover:border-blue-300={!isSelected}
								>
									{formatSkillWithAbility(skill)}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- ✅ SUCCESS MESSAGE (when conflicts resolved) -->
	{#if skillsInitialized && allReplacementsChosen}
		<div class="mb-8">
			<div
				class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
			>
				<h3 class="font-semibold text-green-800 mb-2">
					✅ Skills Finalized
				</h3>
				<p class="text-sm text-green-700">
					{#if hasSkillOverlaps}
						All skill conflicts have been resolved. Your character
						now has {getFinalSkillsList().length} unique skills.
					{:else}
						No skill conflicts detected. Your character has {getFinalSkillsList()
							.length} skills from class and background.
					{/if}
				</p>
			</div>
		</div>
	{/if}

	<!-- ✅ ALWAYS VISIBLE SKILLS SUMMARY (shows immediately after auto-init) -->
	{#if skillsInitialized}
		<div class="border-t pt-6">
			<h3 class="text-lg font-semibold mb-4">Complete Skills Overview</h3>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- Skills by Source -->
				<div class="space-y-4">
					<!-- Class Skills -->
					<div class="p-4 bg-blue-50 rounded-lg">
						<h4 class="font-medium text-blue-800 mb-2">
							From {selectedClass?.name} Class ({selectedSkills.length})
						</h4>
						<div class="flex flex-wrap gap-1">
							{#each selectedSkills as skill}
								<span
									class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
								>
									{formatSkillWithAbility(skill)}
								</span>
							{/each}
						</div>
					</div>

					<!-- Background Skills -->
					<div class="p-4 bg-green-50 rounded-lg">
						<h4 class="font-medium text-green-800 mb-2">
							From {selectedBackground?.name} Background ({selectedBackground
								?.skillProficiencies.length})
						</h4>
						<div class="flex flex-wrap gap-1">
							{#each selectedBackground?.skillProficiencies || [] as skill}
								{@const isOverlap =
									skillOverlaps.includes(skill)}
								{@const replacement = skillReplacements[skill]}

								{#if isOverlap && replacement}
									<!-- Show replacement skill -->
									<span
										class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
									>
										{formatSkillWithAbility(replacement)}
										<span
											class="text-purple-500 ml-1"
											title="Replaced {skill}">↔️</span
										>
									</span>
								{:else if !isOverlap}
									<!-- Show original background skill -->
									<span
										class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
									>
										{formatSkillWithAbility(skill)}
									</span>
								{:else}
									<!-- Show pending replacement -->
									<span
										class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded border border-yellow-300 animate-pulse"
									>
										{skill} (needs replacement)
									</span>
								{/if}
							{/each}
						</div>
					</div>
				</div>

				<!-- Complete Skills List by Ability -->
				<div class="p-4 bg-gray-50 rounded-lg">
					<h4 class="font-medium text-gray-800 mb-2">
						All Skills by Ability Score
					</h4>
					<div class="space-y-2">
						{#each ["Str", "Dex", "Con", "Int", "Wis", "Cha"] as ability}
							{@const allFinalSkills = getFinalSkillsList()}
							{@const skillsForAbility = allFinalSkills.filter(
								(skill) => {
									const skillData = getSkillByName(skill);
									return skillData?.ability === ability;
								},
							)}

							{#if skillsForAbility.length > 0}
								<div class="text-sm">
									<span class="font-medium text-gray-700"
										>{ability}:</span
									>
									<span class="text-gray-600"
										>{skillsForAbility.join(", ")}</span
									>
								</div>
							{/if}
						{/each}
					</div>

					<!-- Total Skills Count -->
					<div class="mt-3 pt-2 border-t border-gray-200">
						<div class="text-sm font-medium text-gray-700">
							Total Skills: {getFinalSkillsList().length}
						</div>
						{#if allReplacementsChosen}
							<div class="text-xs text-green-600 mt-1">
								✅ All conflicts resolved
							</div>
						{:else if hasSkillOverlaps}
							<div
								class="text-xs text-yellow-600 mt-1 animate-pulse"
							>
								⏳ {skillOverlaps.filter(
									(skill) => !skillReplacements[skill],
								).length} conflicts remaining
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Navigation buttons -->
	<div class="flex justify-between mt-8">
		<button
			onclick={handleBack}
			class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
		>
			← Back
		</button>

		<button
			onclick={handleNext}
			disabled={!canProceedFromSkills}
			class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
		>
			{#if !skillsInitialized}
				Analyzing...
			{:else}
				Next →
			{/if}
		</button>
	</div>
</div>
