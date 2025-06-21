<script lang="ts">
	import { PlayerPreferencesForm } from "$lib/components/character";
	import FileImport from "./FileImport.svelte";
	import { contextFileManager } from "$lib/services/contextFiles";
	import { campaignStore } from "$lib/stores/campaigns";
	import { createEventDispatcher } from "svelte";
	import {
		RACES,
		type Race,
		formatAbilityScoreIncrease,
	} from "$lib/data/races";
	import {
		CLASSES,
		type Class,
		formatSkillChoices,
		getClassType,
	} from "$lib/data/classes";
	// ✅ NEW IMPORT - ability scores data
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
	// NEW IMPORT - background data
	import {
		BACKGROUNDS,
		type Background,
		getBackgroundByName,
		formatSkillList,
	} from "$lib/data/backgrounds";
	// ✅ NEW IMPORT - skills data
	import {
		ALL_SKILLS,
		type Skill,
		type SkillProficiency,
		getSkillByName,
		formatSkillWithAbility,
		detectSkillOverlaps,
	} from "$lib/data/skills";
	// ✅ NEW IMPORT - equipment data
	import {
		STARTING_GOLD,
		type Equipment,
		type EquipmentChoice,
		rollStartingGold,
		parseClassEquipment,
		getEquipmentByCategory,
		MARTIAL_MELEE_WEAPONS,
		SIMPLE_WEAPONS,
		RANGED_WEAPONS,
		ARMOR,
		TOOLS_AND_KITS,
		ADVENTURING_GEAR,
		EQUIPMENT_PACKS,
		ALL_EQUIPMENT, // ✅ ADD THIS
	} from "$lib/data/equipment";

	// ✅ EXISTING STATE MANAGEMENT EVENT DISPATCHER - handles completion events for parent component
	const dispatch = createEventDispatcher<{
		complete: {
			collaborativeMode: boolean;
			preferences: any;
			characterData?: any;
			timestamp: string;
			setupType: "traditional" | "import";
		};
	}>();

	// ✅ COMPONENT STATE MANAGEMENT
	let currentStep = 1; // Controls which step is currently displayed
	let showImport = false; // Controls import modal visibility
	let isCompletingSetup = false; // Loading state during character creation
	// ✅ Character creation method selection (Step 2)
	let creationMethod: "standard" | "quick" | "random" = "standard";

	// ✅ CHARACTER DATA - enhanced with ability scores
	let characterName = "";
	let characterBackground = "Folk Hero";
	let selectedRace: Race | null = null;
	let selectedSubrace: string | null = null;
	let selectedClass: Class | null = null;
	let selectedSkills: string[] = [];
	let selectedAbilityMethod: AbilityScoreMethod | null = null; // ✅ NEW: Selected ability score method
	let abilityScores: Record<string, number> = {
		// ✅ NEW: Ability scores
		Strength: 10,
		Dexterity: 10,
		Constitution: 10,
		Intelligence: 10,
		Wisdom: 10,
		Charisma: 10,
	};
	let pointBuyRemaining = 27; // ✅ NEW: Point buy tracking
	let rolledScores: number[] = []; // ✅ NEW: For rolled methods
	let selectedBackground: Background | null = null; // NEW: Selected background
	let finalSkillProficiencies: SkillProficiency[] = []; // ✅ NEW: Final resolved skills
	let skillReplacements: Record<string, string> = {}; // ✅ NEW: Overlap replacements
	let equipmentMethod: "class" | "gold" | null = null; // ✅ NEW: Equipment method selection
	let startingGold: number = 0; // ✅ NEW: Rolled starting gold
	let equipmentChoices: Record<string, string> = {}; // ✅ NEW: Player equipment choices
	let finalEquipment: Equipment[] = []; // ✅ NEW: Final equipment list
	let canReroll: boolean = true; // ✅ NEW: Controls if reroll is allowed for gold
	let equipmentLocked = false; // Prevent going back after gold choice
	let selectedWeapons: string[] = [];
	let selectedEquipment: string[] = [];

	// ✅ BACKGROUND SKILL DATA - skills granted by backgrounds
	const BACKGROUND_SKILLS: Record<string, string[]> = {
		"Folk Hero": ["Animal Handling", "Survival"],
		Criminal: ["Deception", "Stealth"],
		Acolyte: ["Insight", "Religion"],
		Noble: ["History", "Persuasion"],
		Sage: ["Arcana", "History"],
		Soldier: ["Athletics", "Intimidation"],
		Entertainer: ["Acrobatics", "Performance"],
		"Guild Artisan": ["Insight", "Persuasion"],
		Hermit: ["Herbalism Kit", "Religion"],
		Outlander: ["Athletics", "Survival"],
	};

	// ✅ RACE SKILL DATA - skills granted by races (simplified)
	const RACE_SKILLS: Record<string, string[]> = {
		Human: [], // Humans get to choose any skill
		Elf: ["Perception"],
		"Half-Elf": [], // Half-elves get to choose 2 skills
		Dwarf: [],
		Halfling: [],
		Dragonborn: [],
		Gnome: [],
		"Half-Orc": [],
		Tiefling: [],
	};

	function selectEquipment(equipment: Equipment) {
		if (selectedEquipment.includes(equipment.name)) {
			selectedEquipment = selectedEquipment.filter(
				(e) => e !== equipment.name,
			);
		} else {
			selectedEquipment = [...selectedEquipment, equipment.name];
		}
		console.log("Selected equipment:", selectedEquipment);
	}
	// ✅ SKILL CONFLICT DETECTION FUNCTION
	function checkSkillConflicts(
		selectedSkills: string[],
		raceTraits: string[] | undefined,
		background: string,
	): boolean {
		if (!selectedSkills.length) return false;

		// Get background skills
		const backgroundSkills = BACKGROUND_SKILLS[background] || [];

		// Get race skills (simplified - in real D&D this is more complex)
		const raceSkills = selectedRace
			? RACE_SKILLS[selectedRace.name] || []
			: [];

		// Check if any selected skills conflict with background or race skills
		const conflicts = selectedSkills.some(
			(skill) =>
				backgroundSkills.includes(skill) || raceSkills.includes(skill),
		);

		return conflicts;
	}

	// ✅ VALIDATION HELPERS - enhanced with ability score validation
	$: isCharacterNameValid = characterName.trim().length > 0;
	$: isRaceSelected = selectedRace !== null;
	$: canProceedFromRace =
		isRaceSelected && (!selectedRace?.subraces || selectedSubrace !== null);
	$: isClassSelected = selectedClass !== null;
	$: hasCorrectSkillCount = selectedClass
		? selectedSkills.length === selectedClass.skillChoices
		: true;
	$: canProceedFromClass = isClassSelected && hasCorrectSkillCount;
	$: isAbilityMethodSelected = selectedAbilityMethod !== null; // ✅ NEW: Ability method validation
	$: canProceedFromAbilities =
		isAbilityMethodSelected && validateAbilityScores();
	$: isBackgroundSelected = selectedBackground !== null; // NEW: Background validation
	$: canProceedFromBackground = isBackgroundSelected;
	$: skillsFinalized = finalSkillProficiencies.length > 0; // ✅ NEW: Skills validation
	$: allReplacementsChosen =
		skillOverlaps.length === 0 ||
		skillOverlaps.every(
			(skill) =>
				skillReplacements[skill] &&
				skillReplacements[skill].trim() !== "",
		);
	// ✅ FIX: Also update the reactive validation
	$: canProceedFromSkills = skillsFinalized && allReplacementsChosen;
	$: equipmentMethodSelected = equipmentMethod !== null; // ✅ NEW: Equipment validation
	$: canProceedFromEquipment = selectedEquipment.length > 0;
	// ✅REACTIVE STATEMENTS WITH PROPER NULL CHECKS
	$: skillOverlaps =
		selectedClass && selectedBackground && selectedSkills
			? detectSkillOverlaps(
					selectedSkills,
					selectedBackground.skillProficiencies,
				)
			: [];

	$: hasSkillOverlaps = skillOverlaps && skillOverlaps.length > 0;
	// ✅ CLASS SELECTION HANDLER - resets skills when class changes
	function selectClass(classItem: Class) {
		selectedClass = classItem;
		selectedSkills = []; // Reset skills when changing class
		console.log("Selected class:", classItem.name);
	}
	// ✅ EQUIPMENT SELECTION HANDLERS
	function selectEquipmentMethod(method: "class" | "gold") {
		equipmentMethod = method;

		if (method === "gold" && selectedClass) {
			// Roll starting gold immediately
			startingGold = rollStartingGold(selectedClass.name);
			console.log(`Rolled ${startingGold} gp for ${selectedClass.name}`);
		} else if (method === "class") {
			// Initialize class equipment choices
			initializeClassEquipment();
		}

		console.log("Selected equipment method:", method);
	}

	function initializeClassEquipment() {
		if (!selectedClass || !selectedBackground) return;

		// Parse class equipment into choices
		const classEquipmentChoices = parseClassEquipment(
			selectedClass.startingEquipment,
		);

		// Initialize equipment choices
		equipmentChoices = {};
		classEquipmentChoices.forEach((choice) => {
			if (choice.options.length > 1) {
				equipmentChoices[choice.id] = ""; // Needs player choice
			} else {
				equipmentChoices[choice.id] = choice.options[0].name; // Automatic
			}
		});

		finalEquipment =
			selectedBackground?.equipment.map((item) => ({
				name: item,
				type: "gear" as const,
				cost: "—",
				weight: "—",
				description: `From ${selectedBackground?.name ?? "Unknown"} background`,
				emoji: "🎒", // Add a default or appropriate emoji for gear
			})) ?? [];
		console.log("Initialized class equipment:", equipmentChoices);
	}

	function selectEquipmentChoice(choiceId: string, equipment: string) {
		equipmentChoices[choiceId] = equipment;
		console.log("Selected equipment:", choiceId, "→", equipment);
	}

	function rerollStartingGold() {
		if (selectedClass) {
			startingGold = rollStartingGold(selectedClass.name);
			console.log(
				`Rerolled ${startingGold} gp for ${selectedClass.name}`,
			);
		}
	}
	function resetEquipmentSelection() {
		equipmentMethod = null;
		equipmentChoices = {};
		finalEquipment = [];
		startingGold = 0;
	}
	// // ✅ SKILL OVERLAP DETECTION FUNCTION  obsolete but kept for reference
	// function getSkillOverlaps(
	// 	classSkills: string[],
	// 	backgroundSkills: string[],
	// ): string[] {
	// 	return classSkills.filter((skill) => backgroundSkills.includes(skill));
	// }

	// ✅ SKILL RESOLUTION HANDLERS
	function initializeSkillResolution() {
		if (!selectedClass || !selectedBackground || !selectedSkills) return;

		const overlaps = detectSkillOverlaps(
			selectedSkills,
			selectedBackground.skillProficiencies,
		);

		// Initialize final skill proficiencies
		finalSkillProficiencies = [];

		// Add non-overlapping class skills
		selectedSkills.forEach((skill) => {
			if (!overlaps.includes(skill)) {
				finalSkillProficiencies.push({
					skill,
					source: "class",
				});
			}
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
			skillReplacements[skill] = ""; // Empty string means no replacement chosen yet
		});

		console.log("Initialized skill resolution:", {
			overlaps,
			finalSkillProficiencies,
			skillReplacements,
		});
	}

	function selectReplacementSkill(
		overlappingSkill: string,
		replacementSkill: string,
	) {
		// Validate the replacement skill isn't already used
		const currentSkills = selectedSkills;
		const otherReplacements = Object.entries(skillReplacements)
			.filter(([key, value]) => key !== overlappingSkill && value !== "")
			.map(([key, value]) => value);
		const keptBackgroundSkills =
			selectedBackground?.skillProficiencies.filter(
				(skill) => !skillOverlaps.includes(skill),
			) || [];

		const allUsedSkills = [
			...currentSkills,
			...otherReplacements,
			...keptBackgroundSkills,
		];

		if (allUsedSkills.includes(replacementSkill)) {
			console.error(
				"Cannot select already used skill:",
				replacementSkill,
			);
			return;
		}

		// Update the replacement
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
		console.log("All replacements selected:", areAllReplacementsSelected());
	}

	function getAvailableReplacementSkills(): string[] {
		// Get all currently selected skills (class skills)
		const currentSkills = selectedSkills;

		// Get all selected replacement skills (excluding empty strings)
		const selectedReplacements = Object.values(skillReplacements).filter(
			(skill) => skill !== "",
		);

		// Get all background skills that are NOT overlapping (these are kept)
		const keptBackgroundSkills =
			selectedBackground?.skillProficiencies.filter(
				(skill) => !skillOverlaps.includes(skill),
			) || [];

		// Exclude ALL currently used skills
		const excludedSkills = [
			...currentSkills, // Class skills
			...selectedReplacements, // Already chosen replacements
			...keptBackgroundSkills, // Background skills being kept
		];

		return ALL_SKILLS.map((skill) => skill.name).filter(
			(skill) => !excludedSkills.includes(skill),
		);
	}

	// ✅ FIX: Enhanced validation function
	function areAllReplacementsSelected(): boolean {
		if (skillOverlaps.length === 0) return true; // No overlaps to resolve

		return skillOverlaps.every((overlappingSkill) => {
			const replacement = skillReplacements[overlappingSkill];
			return replacement && replacement.trim() !== "";
		});
	}

	// ✅ ABILITY SCORE VALIDATION
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

		return true; // For rolled methods
	}
	// BACKGROUND SELECTION HANDLER
	function selectBackground(background: Background) {
		selectedBackground = background;
		console.log("Selected background:", background.name);
	}
	// ✅ ABILITY SCORE HANDLERS
	function selectAbilityMethod(method: AbilityScoreMethod) {
		selectedAbilityMethod = method;

		if (method.type === "array") {
			// Reset to default values for assignment
			abilityScores = {
				Strength: 15,
				Dexterity: 14,
				Constitution: 13,
				Intelligence: 12,
				Wisdom: 10,
				Charisma: 8,
			};
		} else if (method.type === "pointBuy") {
			// Reset to minimum values
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
			// Generate rolled scores
			rolledScores = [];
			for (let i = 0; i < 6; i++) {
				rolledScores.push(rollAbilityScore(method));
			}
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
				abilityScores[ability] = rolledScores[index] || 10;
			});
		}

		console.log("Selected ability method:", method.name);
	}

	function adjustPointBuyScore(ability: string, change: number) {
		if (selectedAbilityMethod?.type !== "pointBuy") return;

		const currentScore = abilityScores[ability];
		const newScore = currentScore + change;

		if (newScore < 8 || newScore > 15) return;

		const currentCost = getPointBuyCost(currentScore);
		const newCost = getPointBuyCost(newScore);
		const costDifference = newCost - currentCost;

		if (pointBuyRemaining - costDifference < 0) return;

		abilityScores[ability] = newScore;
		pointBuyRemaining -= costDifference;
	}

	function getTotalAbilityScore(ability: string): number {
		const baseScore = abilityScores[ability] || 10;
		const racialBonus = selectedRace
			? getRacialBonus(selectedRace.name, ability)
			: 0;
		return baseScore + racialBonus;
	}
	function rerollAbilityScores() {
		if (!selectedAbilityMethod || selectedAbilityMethod.type !== "roll")
			return;

		// Generate new rolled scores
		rolledScores = [];
		for (let i = 0; i < 6; i++) {
			rolledScores.push(rollAbilityScore(selectedAbilityMethod));
		}

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
			abilityScores[ability] = rolledScores[index] || 10;
		});

		console.log("Rerolled ability scores:", rolledScores);
	}

	// ✅ SKILL SELECTION HANDLERS
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
		console.log("Selected skills:", selectedSkills);
	}

	function resetSkills() {
		selectedSkills = [];
	}

	// ✅ RACE SELECTION HANDLER - manages race and subrace selection
	function selectRace(race: Race) {
		selectedRace = race;
		// Reset subrace when changing race
		selectedSubrace = null;
		console.log("Selected race:", race.name);
	}

	function selectSubrace(subraceName: string) {
		selectedSubrace = subraceName;
		console.log("Selected subrace:", subraceName);
	}

	// ✅ IMPORT FUNCTIONALITY - handles file import for existing characters
	function handleImportClick() {
		console.log("Import button clicked!");
		showImport = true;
	}

	// ✅ ENHANCED TRADITIONAL SETUP COMPLETION - includes equipment data
	async function completeTraditionalSetup(event: CustomEvent) {
		const preferences = event.detail;

		isCompletingSetup = true;

		try {
			console.log("⚔️ Traditional setup completed:", {
				characterName,
				selectedClass: selectedClass?.name,
				selectedBackground: selectedBackground?.name,
				selectedRace: selectedRace?.name,
				selectedSubrace,
				finalSkillProficiencies,
				equipmentMethod,
				equipmentChoices,
				startingGold,
				finalEquipment,
				selectedAbilityMethod: selectedAbilityMethod?.name,
				abilityScores,
				preferences,
				creationMethod,
			});

			// Create character files in the context system
			await contextFileManager.initializeCharacterFiles(
				characterName,
				selectedClass?.name || "Fighter",
				selectedBackground?.name || "Folk Hero",
			);

			// Update campaign store with character data
			campaignStore.updateCampaignCharacter({
				name: characterName,
				class: selectedClass?.name || "Fighter",
				background: selectedBackground?.name || "Folk Hero",
				preferences,
				creationMethod,
			});

			// Notify parent component that setup is complete
			dispatch("complete", {
				collaborativeMode: false,
				preferences,
				characterData: {
					name: characterName,
					class: selectedClass?.name,
					background: selectedBackground?.name,
					race: selectedRace?.name,
					subrace: selectedSubrace,
					skills: finalSkillProficiencies,
					equipmentMethod,
					equipment: finalEquipment,
					startingGold:
						equipmentMethod === "gold" ? startingGold : undefined,
					abilityMethod: selectedAbilityMethod?.name,
					abilityScores,
					creationMethod,
				},
				timestamp: new Date().toISOString(),
				setupType: "traditional",
			});
		} finally {
			isCompletingSetup = false;
		}
	}
	// ✅ IMPORT SUCCESS HANDLER - processes imported character data
	function handleImportSuccess(event: CustomEvent) {
		const { data } = event.detail;

		// Generate appropriate success message based on what was imported
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

	// ✅ IMPORT ERROR HANDLER - displays error messages for failed imports
	function handleImportError(event: CustomEvent) {
		alert(`Import failed: ${event.detail}`);
	}
</script>

<!-- ✅ LOADING OVERLAY - shown during character creation process -->
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

<!-- ✅ IMPORT MODAL - handles file import functionality -->
{#if showImport}
	<FileImport
		on:success={handleImportSuccess}
		on:error={handleImportError}
		on:cancel={() => (showImport = false)}
	/>
{/if}

<!-- ✅ MAIN MODAL CONTAINER - houses all character creation steps -->
<div
	class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
>
	<div
		class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
	>
		<!-- ✅ STEP 1: WELCOME SCREEN - initial landing page with main options -->
		{#if currentStep === 1}
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					🧙‍♂️ Welcome to DungeonMaster AI
				</h2>

				<div class="space-y-4">
					<p class="text-gray-600">
						Choose how you'd like to begin your adventure:
					</p>

					<!-- Create New Character Button - leads to character creation method selection -->
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

					<!-- Import Previous Session Button - opens file import modal -->
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

		<!-- ✅ STEP 2: CHARACTER CREATION METHOD - NEW! Choose how to create character -->
		{#if currentStep === 2}
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					🎲 Choose Creation Method
				</h2>

				<div class="space-y-4">
					<p class="text-gray-600">
						How would you like to create your character?
					</p>

					<!-- Standard Creation - Full control, step-by-step process -->
					<button
						onclick={() => {
							creationMethod = "standard";
							currentStep = 3;
						}}
						class="w-full p-4 border-2 rounded-lg transition-all text-left transform hover:scale-[1.02] focus:ring-2 focus:ring-opacity-50"
						class:border-blue-300={creationMethod === "standard"}
						class:bg-blue-50={creationMethod === "standard"}
						class:border-gray-200={creationMethod !== "standard"}
						class:hover:border-blue-300={creationMethod !==
							"standard"}
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
									Full control over every aspect of your
									character
								</p>
								<p class="text-xs text-blue-600 mt-1">
									Recommended for experienced players
								</p>
							</div>
						</div>
					</button>

					<!-- Quick Build - Optimized character with minimal choices -->
					<button
						onclick={() => {
							creationMethod = "quick";
							currentStep = 3;
						}}
						class="w-full p-4 border-2 rounded-lg transition-all text-left transform hover:scale-[1.02] focus:ring-2 focus:ring-opacity-50"
						class:border-green-300={creationMethod === "quick"}
						class:bg-green-50={creationMethod === "quick"}
						class:border-gray-200={creationMethod !== "quick"}
						class:hover:border-green-300={creationMethod !==
							"quick"}
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
								<h3 class="font-semibold text-green-800">
									Quick Build
								</h3>
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
						onclick={() => {
							creationMethod = "random";
							currentStep = 3;
						}}
						class="w-full p-4 border-2 rounded-lg transition-all text-left transform hover:scale-[1.02] focus:ring-2 focus:ring-opacity-50"
						class:border-purple-300={creationMethod === "random"}
						class:bg-purple-50={creationMethod === "random"}
						class:border-gray-200={creationMethod !== "random"}
						class:hover:border-purple-300={creationMethod !==
							"random"}
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
						onclick={() => (currentStep = 1)}
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
		{/if}

		<!-- ✅ STEP 3: RACE SELECTION - Enhanced with emojis and perfect alignment -->
		{#if currentStep === 3}
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					🧝‍♀️ Choose Your Race
					{#if creationMethod === "quick"}
						<span class="text-sm font-normal text-green-600"
							>(Quick Build)</span
						>
					{:else if creationMethod === "random"}
						<span class="text-sm font-normal text-purple-600"
							>(Random)</span
						>
					{:else}
						<span class="text-sm font-normal text-blue-600"
							>(Standard)</span
						>
					{/if}
				</h2>

				<p class="text-gray-600 mb-6">
					Your race determines your character's physical traits,
					natural abilities, and cultural background.
					{#if creationMethod === "random"}
						<span class="text-purple-600 font-medium"
							>(Race will be randomly selected)</span
						>
					{/if}
				</p>

				<!-- Race Grid - displays all available races with consistent alignment -->
				<div
					class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
				>
					{#each RACES as race}
						<button
							onclick={() => selectRace(race)}
							disabled={creationMethod === "random"}
							class="h-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 flex flex-col"
							class:border-blue-500={selectedRace?.name ===
								race.name}
							class:bg-blue-50={selectedRace?.name === race.name}
							class:border-gray-200={selectedRace?.name !==
								race.name}
							class:hover:border-blue-300={selectedRace?.name !==
								race.name && creationMethod !== "random"}
							class:bg-gray-100={creationMethod === "random"}
							class:cursor-not-allowed={creationMethod ===
								"random"}
						>
							<!-- ✅ RACE HEADER - Fixed height container for perfect alignment -->
							<div
								class="flex items-center justify-between mb-2 min-h-[2rem]"
							>
								<div class="flex items-center space-x-2">
									<!-- ✅ NEW: Race emoji with consistent sizing -->
									<span
										class="text-xl"
										role="img"
										aria-label="{race.name} emoji"
									>
										{race.emoji}
									</span>
									<!-- ✅ Race name with consistent typography -->
									<h3
										class="font-semibold text-lg leading-tight"
									>
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
									<div
										class="text-sm font-medium text-green-600"
									>
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
									<div
										class="flex flex-wrap gap-1 min-h-[1.5rem]"
									>
										{#each race.traits.slice(0, 3) as trait}
											<span
												class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
											>
												{trait}
											</span>
										{/each}
										{#if race.traits.length > 3}
											<span
												class="text-xs text-gray-500 px-2 py-1"
											>
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
										>Size: <span class="font-medium"
											>{race.size}</span
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
									class:border-blue-500={selectedSubrace ===
										subrace.name}
									class:bg-blue-50={selectedSubrace ===
										subrace.name}
									class:border-gray-200={selectedSubrace !==
										subrace.name}
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
											<div
												class="text-sm font-medium text-green-600"
											>
												{formatAbilityScoreIncrease(
													subrace.abilityScoreIncrease,
												)}
											</div>
										</div>
									</div>

									<!-- ✅ SUBRACE TRAITS - Always at bottom -->
									<div
										class="mt-auto pt-2 border-t border-gray-100"
									>
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
						onclick={() => (currentStep = 2)}
						class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
					>
						← Back
					</button>

					<button
						onclick={() => (currentStep = 4)}
						disabled={!canProceedFromRace}
						class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
					>
						Next →
					</button>
				</div>

				<!-- ✅ RACE SUMMARY - Enhanced with emoji -->
				{#if selectedRace}
					<div class="mt-6 p-4 bg-gray-50 rounded-lg border">
						<h4 class="font-medium text-gray-800 mb-2">
							Selected Race:
						</h4>
						<div class="text-sm text-gray-600">
							<div class="flex items-center space-x-2 mb-1">
								<span
									class="text-lg"
									role="img"
									aria-label="{selectedRace.name} emoji"
								>
									{selectedRace.emoji}
								</span>
								<span class="font-medium"
									>{selectedRace.name}</span
								>
								{#if selectedSubrace}
									<span class="text-gray-500"
										>({selectedSubrace})</span
									>
								{/if}
							</div>
							<span class="text-green-600">
								{formatAbilityScoreIncrease(
									selectedRace.abilityScoreIncrease,
								)}
								{#if selectedSubrace && selectedRace.subraces}
									{@const subrace =
										selectedRace.subraces.find(
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
		{/if}

		<!-- ✅ STEP 4: CLASS SELECTION - Enhanced with skill selection -->
		{#if currentStep === 4}
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					⚔️ Choose Your Class
					{#if creationMethod === "quick"}
						<span class="text-sm font-normal text-green-600"
							>(Quick Build)</span
						>
					{:else if creationMethod === "random"}
						<span class="text-sm font-normal text-purple-600"
							>(Random)</span
						>
					{:else}
						<span class="text-sm font-normal text-blue-600"
							>(Standard)</span
						>
					{/if}
				</h2>

				<p class="text-gray-600 mb-6">
					Your class determines your character's abilities, skills,
					and role in adventures.
					{#if creationMethod === "random"}
						<span class="text-purple-600 font-medium"
							>(Class will be randomly selected)</span
						>
					{/if}
				</p>

				<!-- ✅ CLASS GRID - existing class selection cards remain the same -->
				<div
					class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
				>
					{#each CLASSES as classItem}
						<button
							onclick={() => selectClass(classItem)}
							disabled={creationMethod === "random"}
							class="h-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 flex flex-col"
							class:border-blue-500={selectedClass?.name ===
								classItem.name}
							class:bg-blue-50={selectedClass?.name ===
								classItem.name}
							class:border-gray-200={selectedClass?.name !==
								classItem.name}
							class:hover:border-blue-300={selectedClass?.name !==
								classItem.name && creationMethod !== "random"}
							class:bg-gray-100={creationMethod === "random"}
							class:cursor-not-allowed={creationMethod ===
								"random"}
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
									<h3
										class="font-semibold text-lg leading-tight"
									>
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
									<div
										class="text-sm font-medium text-green-600"
									>
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
											class:bg-red-100={getClassType(
												classItem,
											) === "Martial"}
											class:text-red-700={getClassType(
												classItem,
											) === "Martial"}
											class:bg-purple-100={getClassType(
												classItem,
											) === "Spellcaster"}
											class:text-purple-700={getClassType(
												classItem,
											) === "Spellcaster"}
											class:bg-blue-100={getClassType(
												classItem,
											) === "Specialist"}
											class:text-blue-700={getClassType(
												classItem,
											) === "Specialist"}
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
											>{classItem.savingThrows.join(
												", ",
											)}</span
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
								<div
									class="flex items-center justify-between mb-3"
								>
									<h4 class="font-medium text-gray-800">
										Choose {selectedClass.skillChoices} Skills
									</h4>
									<!-- ✅ Skill counter in top right -->
									<div class="flex items-center space-x-1">
										<span
											class="text-sm"
											class:text-red-600={selectedSkills.length ===
												0}
											class:text-gray-600={selectedSkills.length >
												0}
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
										{@const isSelected =
											selectedSkills.includes(skill)}
										{@const isDisabled =
											!isSelected &&
											selectedSkills.length >=
												selectedClass.skillChoices}

										<button
											onclick={() =>
												handleSkillToggle(skill)}
											disabled={isDisabled}
											class="text-xs px-2 py-1 rounded border-2 transition-all focus:outline-none focus:ring-1 focus:ring-blue-300"
											class:border-blue-500={isSelected}
											class:bg-blue-100={isSelected}
											class:text-blue-700={isSelected}
											class:border-gray-200={!isSelected &&
												!isDisabled}
											class:bg-white={!isSelected &&
												!isDisabled}
											class:text-gray-700={!isSelected &&
												!isDisabled}
											class:hover:border-blue-300={!isSelected &&
												!isDisabled}
											class:hover:bg-blue-50={!isSelected &&
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
											<span
												class="text-green-500 mr-2 mt-0.5"
												>•</span
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
						onclick={() => (currentStep = 3)}
						class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
					>
						← Back
					</button>

					<button
						onclick={() => (currentStep = 5)}
						disabled={!canProceedFromClass}
						class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
					>
						Next →
					</button>
				</div>

				<!-- ✅ ENHANCED CLASS SUMMARY - includes skills -->
				{#if selectedClass}
					<div class="mt-6 p-4 bg-gray-50 rounded-lg border">
						<h4 class="font-medium text-gray-800 mb-2">
							Selected Class:
						</h4>
						<div class="text-sm text-gray-600">
							<div class="flex items-center space-x-2 mb-1">
								<span
									class="text-lg"
									role="img"
									aria-label="{selectedClass.name} emoji"
								>
									{selectedClass.emoji}
								</span>
								<span class="font-medium"
									>{selectedClass.name}</span
								>
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
		{/if}

		<!-- ✅ STEP 5: ABILITY SCORES - NEW! Choose ability score generation method and assign scores -->
		{#if currentStep === 5}
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					💪 Ability Scores
					{#if creationMethod === "quick"}
						<span class="text-sm font-normal text-green-600"
							>(Quick Build)</span
						>
					{:else if creationMethod === "random"}
						<span class="text-sm font-normal text-purple-600"
							>(Random)</span
						>
					{:else}
						<span class="text-sm font-normal text-blue-600"
							>(Standard)</span
						>
					{/if}
				</h2>

				<p class="text-gray-600 mb-6">
					Your ability scores determine your character's basic
					capabilities and modifiers.
					{#if creationMethod === "random"}
						<span class="text-purple-600 font-medium"
							>(Ability scores will be randomly generated)</span
						>
					{/if}
				</p>

				<!-- ✅ ABILITY SCORE METHOD SELECTION -->
				{#if !selectedAbilityMethod || creationMethod === "random"}
					<div class="mb-6">
						<h3 class="text-lg font-semibold mb-4">
							Choose Generation Method
						</h3>
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
										method.name &&
										creationMethod !== "random"}
									class:bg-gray-100={creationMethod ===
										"random"}
									class:cursor-not-allowed={creationMethod ===
										"random"}
								>
									<div
										class="flex items-center justify-between mb-2"
									>
										<div
											class="flex items-center space-x-2"
										>
											<span
												class="text-xl"
												role="img"
												aria-label="{method.name} emoji"
											>
												{method.emoji}
											</span>
											<h4 class="font-semibold">
												{method.name}
											</h4>
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
										<div
											class="mt-2 text-xs text-green-600"
										>
											Values: 15, 14, 13, 12, 10, 8
										</div>
									{:else if method.type === "pointBuy"}
										<div
											class="mt-2 text-xs text-green-600"
										>
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
							<h3 class="text-lg font-semibold">
								Assign Ability Scores
							</h3>
							<div class="flex items-center space-x-4">
								{#if selectedAbilityMethod.type === "pointBuy"}
									<div class="text-sm">
										<span class="font-medium"
											>Points Remaining:</span
										>
										<span
											class="text-lg font-bold"
											class:text-red-600={pointBuyRemaining <
												0}
											class:text-green-600={pointBuyRemaining ===
												0}
											class:text-blue-600={pointBuyRemaining >
												0}
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

						<div
							class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
						>
							{#each ABILITY_SCORES as ability}
								{@const baseScore =
									abilityScores[ability.name] || 10}
								{@const racialBonus = selectedRace
									? getRacialBonus(
											selectedRace.name,
											ability.name,
										)
									: 0}
								{@const totalScore = baseScore + racialBonus}
								{@const modifier =
									getAbilityModifier(totalScore)}

								<div class="p-4 bg-gray-50 rounded-lg border">
									<!-- Ability Header -->
									<div
										class="flex items-center space-x-2 mb-2"
									>
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
										<div
											class="text-2xl font-bold text-gray-800"
										>
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
													adjustPointBuyScore(
														ability.name,
														-1,
													)}
												disabled={baseScore <= 8}
												class="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold"
											>
												−
											</button>
											<span
												class="w-8 text-center font-medium"
												>{baseScore}</span
											>
											<button
												onclick={() =>
													adjustPointBuyScore(
														ability.name,
														1,
													)}
												disabled={baseScore >= 15 ||
													pointBuyRemaining <
														getPointBuyCost(
															baseScore + 1,
														) -
															getPointBuyCost(
																baseScore,
															)}
												class="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold"
											>
												+
											</button>
										</div>
									{/if}

									<!-- Ability Description -->
									<div class="mt-3 text-xs text-gray-600">
										<p class="mb-1">
											{ability.description}
										</p>
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
						onclick={() => {
							if (selectedAbilityMethod) {
								// If method is selected, go back to method selection (within same step)
								selectedAbilityMethod = null;
							} else {
								// If no method selected, go back to previous step
								currentStep = 4;
							}
						}}
						class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
					>
						← Back
					</button>

					<button
						onclick={() => (currentStep = 6)}
						disabled={!canProceedFromAbilities}
						class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
					>
						Next →
					</button>
				</div>
			</div>
		{/if}
		<!-- STEP 6: BACKGROUND SELECTION - NEW! Choose character background -->
		{#if currentStep === 6}
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					📚 Choose Your Background
					{#if creationMethod === "quick"}
						<span class="text-sm font-normal text-green-600"
							>(Quick Build)</span
						>
					{:else if creationMethod === "random"}
						<span class="text-sm font-normal text-purple-600"
							>(Random)</span
						>
					{:else}
						<span class="text-sm font-normal text-blue-600"
							>(Standard)</span
						>
					{/if}
				</h2>

				<p class="text-gray-600 mb-6">
					Your background represents your character's history before
					becoming an adventurer, providing skills, tools, and
					equipment.
					{#if creationMethod === "random"}
						<span class="text-purple-600 font-medium"
							>(Background will be randomly selected)</span
						>
					{/if}
				</p>

				<!-- Background Grid - displays all available backgrounds -->
				<div
					class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
				>
					{#each BACKGROUNDS as background}
						<button
							onclick={() => selectBackground(background)}
							disabled={creationMethod === "random"}
							class="h-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 flex flex-col"
							class:border-blue-500={selectedBackground?.name ===
								background.name}
							class:bg-blue-50={selectedBackground?.name ===
								background.name}
							class:border-gray-200={selectedBackground?.name !==
								background.name}
							class:hover:border-blue-300={selectedBackground?.name !==
								background.name && creationMethod !== "random"}
							class:bg-gray-100={creationMethod === "random"}
							class:cursor-not-allowed={creationMethod ===
								"random"}
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
									<h3
										class="font-semibold text-lg leading-tight"
									>
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
											<div
												class="text-xs text-purple-600"
											>
												{formatSkillList(
													background.tools,
												)}
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
										{@const isOverlap =
											skillOverlaps.includes(skill)}
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
										⚠️ Skills overlap with your class
										selection, but dont worry this will be
										resolved in the next step.
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
											<span
												class="text-green-500 mr-2 mt-0.5"
												>•</span
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
									This background grants you a special feature
									that provides unique advantages during your
									adventures.
								</p>
							</div>

							<!-- Personality Traits -->
							<div class="p-4 bg-gray-50 rounded-lg">
								<h4 class="font-medium text-gray-800 mb-2">
									Personality Traits
								</h4>
								<div class="space-y-1">
									{#each selectedBackground.personalityTraits as trait}
										<div
											class="text-sm text-gray-600 italic"
										>
											"{trait}"
										</div>
									{/each}
								</div>
							</div>

							<!-- Ideals -->
							<div class="p-4 bg-gray-50 rounded-lg">
								<h4 class="font-medium text-gray-800 mb-2">
									Ideals
								</h4>
								<div class="space-y-1">
									{#each selectedBackground.ideals as ideal}
										<div
											class="text-sm text-gray-600 italic"
										>
											"{ideal}"
										</div>
									{/each}
								</div>
							</div>

							<!-- Bonds -->
							<div class="p-4 bg-gray-50 rounded-lg">
								<h4 class="font-medium text-gray-800 mb-2">
									Bonds
								</h4>
								<div class="space-y-1">
									{#each selectedBackground.bonds as bond}
										<div
											class="text-sm text-gray-600 italic"
										>
											"{bond}"
										</div>
									{/each}
								</div>
							</div>

							<!-- Flaws -->
							<div class="p-4 bg-gray-50 rounded-lg">
								<h4 class="font-medium text-gray-800 mb-2">
									Flaws
								</h4>
								<div class="space-y-1">
									{#each selectedBackground.flaws as flaw}
										<div
											class="text-sm text-gray-600 italic"
										>
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
						onclick={() => (currentStep = 5)}
						class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
					>
						← Back
					</button>

					<button
						onclick={() => (currentStep = 7)}
						disabled={!canProceedFromBackground}
						class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
					>
						Next →
					</button>
				</div>

				<!-- Background Summary -->
				{#if selectedBackground}
					<div class="mt-6 p-4 bg-gray-50 rounded-lg border">
						<h4 class="font-medium text-gray-800 mb-2">
							Selected Background:
						</h4>
						<div class="text-sm text-gray-600">
							<div class="flex items-center space-x-2 mb-1">
								<span
									class="text-lg"
									role="img"
									aria-label="{selectedBackground.name} emoji"
								>
									{selectedBackground.emoji}
								</span>
								<span class="font-medium"
									>{selectedBackground.name}</span
								>
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
									Tools: {formatSkillList(
										selectedBackground.tools,
									)}
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}
		<!-- ✅ STEP 7: SKILL RESOLUTION - Resolve conflicts and show ALL final skills -->
		{#if currentStep === 7}
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					🎯 Skill Resolution
					{#if creationMethod === "quick"}
						<span class="text-sm font-normal text-green-600"
							>(Quick Build)</span
						>
					{:else if creationMethod === "random"}
						<span class="text-sm font-normal text-purple-600"
							>(Random)</span
						>
					{:else}
						<span class="text-sm font-normal text-blue-600"
							>(Standard)</span
						>
					{/if}
				</h2>

				<p class="text-gray-600 mb-6">
					Let's finalize your character's skills by resolving any
					overlaps between your class and background choices.
					{#if creationMethod === "random"}
						<span class="text-purple-600 font-medium"
							>(Skills will be automatically resolved)</span
						>
					{/if}
				</p>

				<!-- ✅ INITIALIZE SKILL RESOLUTION -->
				{#if !skillsFinalized && selectedClass && selectedBackground}
					<div class="mb-6">
						<div class="text-center">
							<button
								onclick={initializeSkillResolution}
								class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
							>
								Analyze Skills & Resolve Conflicts
							</button>
						</div>
					</div>
				{/if}

				<!-- ✅ SKILL CONFLICT RESOLUTION -->
				{#if skillsFinalized && hasSkillOverlaps && !areAllReplacementsSelected()}
					<div class="mb-6">
						<div
							class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
						>
							<h3 class="font-semibold text-blue-800 mb-2">
								🔄 Skill Overlap Resolution
							</h3>
							<p class="text-sm text-blue-700">
								Your class and background both grant some of the
								same skills. Choose replacement skills for the
								overlapping background skills.
							</p>
						</div>

						<div class="space-y-4">
							{#each skillOverlaps as overlappingSkill}
								<div class="p-4 bg-gray-50 rounded-lg border">
									<div
										class="flex items-center justify-between mb-3"
									>
										<div>
											<h4
												class="font-medium text-gray-800"
											>
												Replace: <span
													class="text-red-600"
													>{overlappingSkill}</span
												>
											</h4>
											<p class="text-sm text-gray-600">
												Both your {selectedClass?.name} class
												and {selectedBackground?.name} background
												grant this skill.
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
												skillReplacements[
													overlappingSkill
												] === skill}
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

				<!-- ✅ COMPLETE SKILLS SUMMARY - Shows ALL final skills -->
				{#if skillsFinalized}
					<div class="border-t pt-6">
						<h3 class="text-lg font-semibold mb-4">
							Your Character's Complete Skills
						</h3>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<!-- Skills by Source -->
							<div class="space-y-4">
								<!-- Class Skills - Shows ALL class skills -->
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

								<!-- Background Skills - Shows final background skills (with replacements) -->
								<div class="p-4 bg-green-50 rounded-lg">
									<h4 class="font-medium text-green-800 mb-2">
										From {selectedBackground?.name} Background
										({selectedBackground?.skillProficiencies
											.length})
									</h4>
									<div class="flex flex-wrap gap-1">
										{#each selectedBackground?.skillProficiencies || [] as skill}
											{@const isOverlap =
												skillOverlaps.includes(skill)}
											{@const replacement =
												skillReplacements[skill]}

											{#if isOverlap && replacement}
												<!-- Show replacement skill -->
												<span
													class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
												>
													{formatSkillWithAbility(
														replacement,
													)}
													<span
														class="text-purple-500 ml-1"
														title="Replaced {skill}"
														>↔️</span
													>
												</span>
											{:else if !isOverlap}
												<!-- Show original background skill -->
												<span
													class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
												>
													{formatSkillWithAbility(
														skill,
													)}
												</span>
											{:else}
												<!-- Show pending replacement -->
												<span
													class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded border border-yellow-300"
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
										{@const allFinalSkills = [
											...selectedSkills,
											...(
												selectedBackground?.skillProficiencies ||
												[]
											)
												.map((skill) => {
													const isOverlap =
														skillOverlaps.includes(
															skill,
														);
													const replacement =
														skillReplacements[
															skill
														];
													return isOverlap &&
														replacement
														? replacement
														: isOverlap
															? null
															: skill;
												})
												.filter(
													(skill) => skill !== null,
												),
										]}
										{@const skillsForAbility =
											allFinalSkills.filter((skill) => {
												const skillData =
													getSkillByName(skill);
												return (
													skillData?.ability ===
													ability
												);
											})}

										{#if skillsForAbility.length > 0}
											<div class="text-sm">
												<span
													class="font-medium text-gray-700"
													>{ability}:</span
												>
												<span class="text-gray-600">
													{skillsForAbility.join(
														", ",
													)}
												</span>
											</div>
										{/if}
									{/each}
								</div>

								<!-- Total Skills Count -->
								<div class="mt-3 pt-2 border-t border-gray-200">
									<div
										class="text-sm font-medium text-gray-700"
									>
										Total Skills: {selectedSkills.length +
											(selectedBackground
												?.skillProficiencies.length ||
												0)}
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Navigation buttons for Step 7 -->
				<div class="flex justify-between mt-8">
					<button
						onclick={() => (currentStep = 6)}
						class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
					>
						← Back
					</button>

					<button
						onclick={() => (currentStep = 8)}
						disabled={!canProceedFromSkills ||
							(hasSkillOverlaps && !areAllReplacementsSelected())}
						class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
					>
						Next →
					</button>
				</div>
			</div>
		{/if}
		<!-- ✅ STEP 8: ALL EQUIPMENT SELECTION -->
		{#if currentStep === 8}
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					⚔️ Choose Your Equipment
					{#if creationMethod === "quick"}
						<span class="text-sm font-normal text-green-600"
							>(Quick Build)</span
						>
					{:else if creationMethod === "random"}
						<span class="text-sm font-normal text-purple-600"
							>(Random)</span
						>
					{:else}
						<span class="text-sm font-normal text-blue-600"
							>(Standard)</span
						>
					{/if}
				</h2>

				<p class="text-gray-600 mb-6">
					Your equipment determines your character's capabilities and
					survival in adventures.
				</p>

				<!-- Equipment Grid - displays all equipment with consistent alignment -->
				<div
					class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
				>
					{#each ALL_EQUIPMENT as equipment}
						{@const isSelected = selectedEquipment?.includes(
							equipment.name,
						)}

						<button
							onclick={() => selectEquipment(equipment)}
							disabled={creationMethod === "random"}
							class="h-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 flex flex-col"
							class:border-blue-500={isSelected}
							class:bg-blue-50={isSelected}
							class:border-gray-200={!isSelected}
							class:hover:border-blue-300={!isSelected &&
								creationMethod !== "random"}
							class:bg-gray-100={creationMethod === "random"}
							class:cursor-not-allowed={creationMethod ===
								"random"}
						>
							<!-- Equipment Header -->
							<div
								class="flex items-center justify-between mb-2 min-h-[2rem]"
							>
								<div class="flex items-center space-x-2">
									<span
										class="text-xl"
										role="img"
										aria-label="{equipment.name} emoji"
									>
										{equipment.emoji}
									</span>
									<h3
										class="font-semibold text-lg leading-tight"
									>
										{equipment.name}
									</h3>
								</div>

								<div class="flex-shrink-0">
									{#if isSelected}
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

							<!-- Equipment Description -->
							<div class="flex-grow">
								<p
									class="text-sm text-gray-600 mb-3 min-h-[2.5rem] leading-relaxed"
								>
									{equipment.description}
								</p>

								<!-- Equipment Stats -->
								<div class="mb-3">
									<div
										class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
									>
										{#if equipment.damage}
											Damage
										{:else if equipment.armorClass}
											Armor Class
										{:else}
											Type
										{/if}
									</div>
									<div
										class="text-sm font-medium text-green-600"
									>
										{equipment.damage ||
											equipment.armorClass ||
											equipment.type}
									</div>
								</div>

								<!-- Properties -->
								<div class="mb-3">
									<div
										class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
									>
										Properties
									</div>
									<div
										class="flex flex-wrap gap-1 min-h-[1.5rem]"
									>
										{#each equipment.properties?.slice(0, 3) || [] as property}
											<span
												class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
											>
												{property}
											</span>
										{/each}
										{#if equipment.properties && equipment.properties.length > 3}
											<span
												class="text-xs text-gray-500 px-2 py-1"
											>
												+{equipment.properties.length -
													3} more
											</span>
										{/if}
									</div>
								</div>
							</div>

							<!-- Cost and Weight -->
							<div
								class="text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100"
							>
								<div class="flex items-center justify-between">
									<span
										>Cost: <span class="font-medium"
											>{equipment.cost}</span
										></span
									>
									<span
										>Weight: <span class="font-medium"
											>{equipment.weight}</span
										></span
									>
								</div>
							</div>
						</button>
					{/each}
				</div>

				<!-- Navigation buttons -->
				<div class="flex justify-between mt-8">
					<button
						onclick={() => (currentStep = 7)}
						class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
					>
						← Back
					</button>

					<button
						onclick={() => (currentStep = 9)}
						class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
					>
						Next →
					</button>
				</div>
			</div>
		{/if}

		<!-- ✅ STEP 9: CHARACTER DETAILS -->
		{#if currentStep === 9}
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">
					🧙‍♂️ Character Details
					{#if creationMethod === "quick"}
						<span class="text-sm font-normal text-green-600"
							>(Quick Build)</span
						>
					{:else if creationMethod === "random"}
						<span class="text-sm font-normal text-purple-600"
							>(Random)</span
						>
					{:else}
						<span class="text-sm font-normal text-blue-600"
							>(Standard)</span
						>
					{/if}
				</h2>

				<div class="space-y-4">
					<!-- Character Name Input -->
					<div>
						<label
							for="character-name"
							class="block text-sm font-medium mb-2"
						>
							Character Name <span class="text-red-500">*</span>
						</label>
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

					<!-- Background Selection -->
					<div>
						<label
							for="character-background"
							class="block text-sm font-medium mb-2"
						>
							Background
							{#if creationMethod === "random"}
								<span class="text-purple-600 text-xs"
									>(Will be randomized)</span
								>
							{:else if creationMethod === "quick"}
								<span class="text-green-600 text-xs"
									>(Recommended for class)</span
								>
							{/if}
						</label>
						<select
							id="character-background"
							bind:value={characterBackground}
							disabled={creationMethod === "random"}
							class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
							class:bg-gray-100={creationMethod === "random"}
							class:cursor-not-allowed={creationMethod ===
								"random"}
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
							<option value="Entertainer"
								>Entertainer - Performer and artist</option
							>
							<option value="Guild Artisan"
								>Guild Artisan - Skilled craftsperson</option
							>
							<option value="Hermit"
								>Hermit - Isolated seeker of truth</option
							>
							<option value="Outlander"
								>Outlander - Wilderness survivor</option
							>
						</select>
					</div>
				</div>

				<!-- Navigation buttons for Step 8 -->
				<div class="flex justify-between mt-8">
					<button
						onclick={() => {
							resetEquipmentSelection();
							currentStep = 8;
						}}
						disabled={equipmentMethod === "gold"}
						class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
					>
						← Back
					</button>

					<button
						onclick={() => (currentStep = 6)}
						disabled={!isCharacterNameValid}
						class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
					>
						Next →
					</button>
				</div>

				<!-- Enhanced Character Preview - includes race and class information -->
				{#if isCharacterNameValid && selectedRace && selectedClass}
					<div class="mt-6 p-4 bg-gray-50 rounded-lg border">
						<h4 class="font-medium text-gray-800 mb-2">
							Character Preview:
						</h4>
						<div class="flex items-center space-x-2 mb-2">
							<span
								class="text-lg"
								role="img"
								aria-label="{selectedRace.name} emoji"
							>
								{selectedRace.emoji}
							</span>
							<span
								class="text-lg"
								role="img"
								aria-label="{selectedClass.name} emoji"
							>
								{selectedClass.emoji}
							</span>
							<span class="font-medium text-lg"
								>{characterName}</span
							>
						</div>
						<p class="text-sm text-gray-600">
							<span class="font-medium">{selectedRace.name}</span>
							{#if selectedSubrace}
								<span class="font-medium"
									>({selectedSubrace})</span
								>
							{/if}
							<span class="font-medium"
								>{characterBackground}</span
							>
							<span class="font-medium">{selectedClass.name}</span
							>
						</p>
						<div class="text-xs text-green-600 mt-1 space-y-1">
							<div>
								Racial Bonuses: {formatAbilityScoreIncrease(
									selectedRace.abilityScoreIncrease,
								)}
							</div>
							<div>
								Hit Die: {selectedClass.hitDie} • Primary: {selectedClass.primaryAbility.join(
									", ",
								)}
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- ✅ STEP 10: PLAYER PREFERENCES -->
		{#if currentStep === 10}
			<PlayerPreferencesForm
				collaborativeMode={false}
				onBack={() => (currentStep = 5)}
				on:complete={completeTraditionalSetup}
			/>
		{/if}
	</div>
</div>

<!-- ✅ STYLING - maintains existing hover effects and transitions -->
<style>
	.transform {
		transition: transform 0.2s ease-in-out;
	}

	.hover\:scale-\[1\.02\]:hover {
		transform: scale(1.02);
	}
</style>
