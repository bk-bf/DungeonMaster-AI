<script lang="ts">
	import { PlayerPreferencesForm } from "$lib/components/character";
	import FileImport from "./FileImport.svelte";
	import { contextFileManager } from "$lib/services/contextFiles";
	import { campaignStore } from "$lib/stores/campaigns";
	import { createEventDispatcher } from "svelte";
	import WelcomeScreen from "$lib/components/character/creation/WelcomeScreen.svelte";
	import CreationMethod from "$lib/components/character/creation/CreationMethod.svelte";
	import RaceSelection from "$lib/components/character/creation/RaceSelection.svelte";
	import ClassSelection from "$lib/components/character/creation/ClassSelection.svelte";
	import AbilityScores from "$lib/components/character/creation/AbilityScores.svelte";
	import BackgroundSelection from "$lib/components/character/creation/BackgroundSelection.svelte";
	import SkillResolution from "$lib/components/character/creation/SkillResolution.svelte";
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
		getEquipmentByCategory,
		MARTIAL_MELEE_WEAPONS,
		SIMPLE_WEAPONS,
		RANGED_WEAPONS,
		ARMOR,
		TOOLS_AND_KITS,
		ADVENTURING_GEAR,
		EQUIPMENT_PACKS,
		ALL_EQUIPMENT,
		parseClassEquipment,
		getChoiceById,
		canSelectEquipment,
		areAllChoicesMade,
		getAutomaticEquipment,
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
	let finalEquipment: Equipment[] = []; // ✅ NEW: Final equipment list
	let canReroll: boolean = true; // ✅ NEW: Controls if reroll is allowed for gold
	let equipmentLocked = false; // Prevent going back after gold choice
	let selectedWeapons: string[] = [];
	let selectedEquipment: string[] = [];
	let selectedCategory: string = "all";
	let startingGold: number = 0;
	let automaticEquipment: Equipment[] = [];
	let equipmentChoices: Record<string, Equipment | null> = {};

	// ✅ EVENT HANDLERS FOR WELCOME SCREEN
	function handleCreateCharacter() {
		currentStep = 2;
	}

	function handleImportCharacter() {
		showImport = true;
	}
	// ✅ EVENT HANDLERS FOR CREATION METHOD
	function handleMethodSelected(event: CustomEvent) {
		creationMethod = event.detail.method;
		currentStep = 3;
		console.log("Selected creation method:", creationMethod);
	}
	// ✅ EVENT HANDLERS FOR RACE SELECTION
	function handleRaceSelected(event: CustomEvent) {
		selectedRace = event.detail.race;
		selectedSubrace = null; // Reset subrace when race changes
		console.log("Selected race:", selectedRace?.name);
	}

	function handleSubraceSelected(event: CustomEvent) {
		selectedSubrace = event.detail.subrace;
		console.log("Selected subrace:", selectedSubrace);
	}

	function handleRaceNext() {
		currentStep = 4;
	}

	function handleRaceBack() {
		currentStep = 2;
	}
	function handleCreationMethodBack() {
		currentStep = 1;
	}
	// ✅ EVENT HANDLERS FOR CLASS SELECTION
	function handleClassSelected(event: CustomEvent) {
		selectedClass = event.detail.class;
		selectedSkills = []; // Reset skills when changing class
		console.log("Selected class:", selectedClass?.name);
	}

	function handleSkillToggled(event: CustomEvent) {
		const skill = event.detail.skill;
		if (selectedSkills.includes(skill)) {
			selectedSkills = selectedSkills.filter((s) => s !== skill);
		} else if (
			selectedClass &&
			selectedSkills.length < selectedClass.skillChoices
		) {
			selectedSkills = [...selectedSkills, skill];
		}
		console.log("Selected skills:", selectedSkills);
	}

	function handleSkillsReset() {
		selectedSkills = [];
	}

	function handleClassNext() {
		currentStep = 5;
	}

	function handleClassBack() {
		currentStep = 3;
	}
	// ✅ EVENT HANDLERS FOR ABILITY SCORES
	function handleAbilityMethodSelected(event: CustomEvent) {
		selectedAbilityMethod = event.detail.method;
		console.log("Selected ability method:", selectedAbilityMethod?.name);
	}

	function handleAbilityScoreChanged(event: CustomEvent) {
		const { ability, score } = event.detail;
		abilityScores[ability] = score;
		console.log(`${ability} changed to ${score}`);
	}

	function handleAbilityScoresRerolled(event: CustomEvent) {
		rolledScores = event.detail.scores;
		console.log("Rerolled ability scores:", rolledScores);
	}

	function handleAbilityNext() {
		currentStep = 6;
	}

	function handleAbilityBack() {
		currentStep = 4;
	}

	function handleAbilityResetMethod() {
		selectedAbilityMethod = null;
	}

	// ✅ EVENT HANDLERS FOR BACKGROUND SELECTION
	function handleBackgroundSelected(event: CustomEvent) {
		selectedBackground = event.detail.background;
		console.log("Selected background:", selectedBackground?.name);
	}

	function handleBackgroundNext() {
		currentStep = 7;
	}

	function handleBackgroundBack() {
		currentStep = 5;
	}

	// ✅ EVENT HANDLERS FOR SKILL RESOLUTION
	function handleSkillsInitialized(event: CustomEvent) {
		finalSkillProficiencies = event.detail.finalSkillProficiencies;
		skillReplacements = event.detail.skillReplacements;
		skillsFinalized = true;
		console.log("Skills initialized:", finalSkillProficiencies);
	}

	function handleReplacementSelected(event: CustomEvent) {
		const { overlappingSkill, replacementSkill } = event.detail;
		skillReplacements[overlappingSkill] = replacementSkill;
		console.log(
			`Replacement selected: ${overlappingSkill} → ${replacementSkill}`,
		);
	}

	function handleSkillResolutionNext() {
		currentStep = 8;
	}

	function handleSkillResolutionBack() {
		currentStep = 6;
	}
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
	// ✅ EQUIPMENT SELECTION FUNCTION
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
	// ✅ CATEGORY FILTERING
	$: filteredEquipment = (() => {
		switch (selectedCategory) {
			case "weapons":
				return [
					...MARTIAL_MELEE_WEAPONS,
					...SIMPLE_WEAPONS,
					...RANGED_WEAPONS,
				];
			case "armor":
				return ARMOR;
			case "tools":
				return TOOLS_AND_KITS;
			case "gear":
				return ADVENTURING_GEAR;
			case "packs":
				return EQUIPMENT_PACKS;
			case "all":
			default:
				return ALL_EQUIPMENT;
		}
	})();
	// ✅ PROFICIENCY CHECKING
	function isEquipmentProficient(equipment: Equipment): boolean {
		if (!selectedClass) return false;

		// Check weapon proficiency
		if (equipment.type === "weapon") {
			return selectedClass.weaponProficiency.some((prof) => {
				if (
					prof.includes("Simple weapons") &&
					SIMPLE_WEAPONS.includes(equipment)
				)
					return true;
				if (
					prof.includes("Martial weapons") &&
					MARTIAL_MELEE_WEAPONS.includes(equipment)
				)
					return true;
				if (prof.includes("All weapons")) return true;
				return false;
			});
		}

		// Check armor proficiency
		if (equipment.type === "armor") {
			return selectedClass.armorProficiency.some((prof) => {
				if (
					prof.includes("Light armor") &&
					equipment.properties?.includes("Light")
				)
					return true;
				if (
					prof.includes("Medium armor") &&
					equipment.properties?.includes("Medium")
				)
					return true;
				if (
					prof.includes("Heavy armor") &&
					equipment.properties?.includes("Heavy")
				)
					return true;
				if (
					prof.includes("Shields") &&
					equipment.properties?.includes("Shield")
				)
					return true;
				return false;
			});
		}

		// Tools, gear, and packs are generally available to everyone
		return true;
	}
	// ✅ AFFORDABILITY CHECKING
	function canAffordEquipment(equipment: Equipment): boolean {
		if (!startingGold) {
			startingGold = selectedClass
				? rollStartingGold(selectedClass.name)
				: 50;
		}

		// Parse cost string (e.g., "15 gp", "5 sp")
		const costMatch = equipment.cost.match(/(\d+)\s*(gp|sp|cp)/);
		if (!costMatch) return true; // Free items

		const amount = parseInt(costMatch[1]);
		const currency = costMatch[2];

		let costInGold = 0;
		switch (currency) {
			case "gp":
				costInGold = amount;
				break;
			case "sp":
				costInGold = amount / 10;
				break;
			case "cp":
				costInGold = amount / 100;
				break;
		}

		return startingGold >= costInGold;
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
	$: equipmentMethodSelected = equipmentMethod !== null; // ✅ NEW: Equipment validation
	$: canProceedFromEquipment = selectedClass
		? areAllChoicesMade(equipmentChoices, selectedClass.startingEquipment)
		: false;
	$: if (selectedClass) {
		initializeEquipmentChoices();
	}
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
			initializeEquipment();
		}

		console.log("Selected equipment method:", method);
	}

	function initializeEquipment() {
		if (!selectedClass || !selectedBackground) return;

		// Add all background equipment automatically
		automaticEquipment = selectedBackground.equipment.map((item) => ({
			name: item,
			emoji: "🎒",
			type: "gear",
			cost: "—",
			weight: "—",
			description: `From ${selectedBackground?.name ?? ""} background`,
		}));

		// Initialize class equipment choices
		const classChoices = parseClassEquipment(
			selectedClass.startingEquipment,
		);
		classChoices.forEach((choice) => {
			if (choice.options.length === 1) {
				// Automatic equipment
				automaticEquipment.push(choice.options[0]);
			} else {
				// Player choice required
				equipmentChoices[choice.id] = null;
			}
		});
	}
	function initializeEquipmentChoices() {
		if (!selectedClass) return;

		const choices = parseClassEquipment(selectedClass.startingEquipment);
		equipmentChoices = {};

		choices.forEach((choice) => {
			if (choice.options.length > 1) {
				equipmentChoices[choice.id] = null; // Requires player choice
			}
			// Single options are automatic, no choice needed
		});
	}
	function selectEquipmentChoice(choiceId: string, equipment: Equipment) {
		if (
			!selectedClass ||
			!canSelectEquipment(
				equipment,
				choiceId,
				selectedClass.startingEquipment,
			)
		) {
			console.error("Invalid equipment choice");
			return;
		}

		equipmentChoices[choiceId] = equipment;
		console.log("Equipment choice:", choiceId, "→", equipment.name);
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
		<!-- ✅ STEP 1: WELCOME SCREEN - Now extracted to component -->
		{#if currentStep === 1}
			<WelcomeScreen
				on:createCharacter={handleCreateCharacter}
				on:importCharacter={handleImportCharacter}
			/>
		{/if}

		<!-- ✅ STEP 2: CREATION METHOD - Now extracted to component -->
		{#if currentStep === 2}
			<CreationMethod
				bind:creationMethod
				on:methodSelected={handleMethodSelected}
				on:back={handleCreationMethodBack}
			/>
		{/if}

		<!-- ✅ STEP 3: RACE SELECTION - Now extracted to component -->
		{#if currentStep === 3}
			<RaceSelection
				bind:selectedRace
				bind:selectedSubrace
				{creationMethod}
				on:raceSelected={handleRaceSelected}
				on:subraceSelected={handleSubraceSelected}
				on:next={handleRaceNext}
				on:back={handleRaceBack}
			/>
		{/if}

		<!-- ✅ STEP 4: CLASS SELECTION - Now extracted to component -->
		{#if currentStep === 4}
			<ClassSelection
				bind:selectedClass
				bind:selectedSkills
				{creationMethod}
				on:classSelected={handleClassSelected}
				on:skillsReset={handleSkillsReset}
				on:next={handleClassNext}
				on:back={handleClassBack}
			/>
		{/if}

		<!-- ✅ STEP 5: ABILITY SCORES - Now extracted to component -->
		{#if currentStep === 5}
			<AbilityScores
				bind:selectedAbilityMethod
				bind:abilityScores
				bind:pointBuyRemaining
				bind:rolledScores
				{selectedRace}
				{creationMethod}
				on:methodSelected={handleAbilityMethodSelected}
				on:scoreChanged={handleAbilityScoreChanged}
				on:scoresRerolled={handleAbilityScoresRerolled}
				on:next={handleAbilityNext}
				on:back={handleAbilityBack}
				on:resetMethod={handleAbilityResetMethod}
			/>
		{/if}

		<!-- ✅ STEP 6: BACKGROUND SELECTION - Now extracted to component -->
		{#if currentStep === 6}
			<BackgroundSelection
				bind:selectedBackground
				{selectedClass}
				{selectedSkills}
				{creationMethod}
				on:backgroundSelected={handleBackgroundSelected}
				on:next={handleBackgroundNext}
				on:back={handleBackgroundBack}
			/>
		{/if}

		<!-- ✅ STEP 7: SKILL RESOLUTION - Now extracted to component -->
		{#if currentStep === 7}
			<SkillResolution
				{selectedClass}
				{selectedBackground}
				{selectedSkills}
				bind:finalSkillProficiencies
				bind:skillReplacements
				{creationMethod}
				on:skillsInitialized={handleSkillsInitialized}
				on:replacementSelected={handleReplacementSelected}
				on:next={handleSkillResolutionNext}
				on:back={handleSkillResolutionBack}
			/>
		{/if}

		<!-- ✅ STEP 8: EQUIPMENT SELECTION - Clean dropdown interface with proper D&D 5e rules -->
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
					Make your equipment choices based on your class and
					background. Each choice follows official D&D 5e rules.
				</p>

				{#if selectedClass && selectedBackground}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<!-- ✅ CLASS EQUIPMENT CHOICES - Proper dropdown selections -->
						<div class="space-y-4">
							<h3 class="text-lg font-semibold text-blue-800">
								From {selectedClass.name} Class
							</h3>

							{#each parseClassEquipment(selectedClass.startingEquipment) as choice, index}
								<div class="p-4 bg-blue-50 rounded-lg border">
									{#if choice.options.length > 1}
										<!-- ✅ CHOICE REQUIRED -->
										<div class="mb-3">
											<h4
												class="font-medium text-blue-800"
											>
												<span
													class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 mr-2"
												>
													Choose One
												</span>
												{choice.description}
											</h4>
										</div>

										<!-- ✅ DROPDOWN SELECTION -->
										<div class="relative">
											<select
												bind:value={
													equipmentChoices[choice.id]
												}
												class="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none appearance-none"
												class:border-blue-500={equipmentChoices[
													choice.id
												]}
											>
												<option value={null} disabled
													>Select your equipment...</option
												>

												<!-- ✅ HANDLE SPECIFIC WEAPON CATEGORIES -->
												{#if choice.description.includes("any martial melee weapon")}
													<!-- Include original options first -->
													{#each choice.options as originalOption}
														<option
															value={originalOption}
														>
															{originalOption.emoji}
															{originalOption.name}
															{#if originalOption.damage}({originalOption.damage}){/if}
															- Recommended
														</option>
													{/each}
													<option disabled
														>──── Other Martial
														Weapons ────</option
													>
													{#each MARTIAL_MELEE_WEAPONS.filter((weapon) => !choice.options.some((opt) => opt.name === weapon.name)) as weapon}
														<option value={weapon}>
															{weapon.emoji}
															{weapon.name} ({weapon.damage})
														</option>
													{/each}
												{:else if choice.description.includes("any simple weapon")}
													{#each choice.options as originalOption}
														<option
															value={originalOption}
														>
															{originalOption.emoji}
															{originalOption.name}
															{#if originalOption.damage}({originalOption.damage}){/if}
															- Recommended
														</option>
													{/each}
													<option disabled
														>──── Other Simple
														Weapons ────</option
													>
													{#each SIMPLE_WEAPONS.filter((weapon) => !choice.options.some((opt) => opt.name === weapon.name)) as weapon}
														<option value={weapon}>
															{weapon.emoji}
															{weapon.name} ({weapon.damage})
														</option>
													{/each}
												{:else if choice.description.includes("any martial weapon")}
													{#each choice.options as originalOption}
														<option
															value={originalOption}
														>
															{originalOption.emoji}
															{originalOption.name}
															{#if originalOption.damage}({originalOption.damage}){/if}
															- Recommended
														</option>
													{/each}
													<option disabled
														>──── Other Martial
														Weapons ────</option
													>
													{#each [...MARTIAL_MELEE_WEAPONS, ...RANGED_WEAPONS].filter((weapon) => !choice.options.some((opt) => opt.name === weapon.name)) as weapon}
														<option value={weapon}>
															{weapon.emoji}
															{weapon.name} ({weapon.damage})
														</option>
													{/each}
												{:else}
													<!-- Regular specific options -->
													{#each choice.options as option}
														<option value={option}>
															{option.emoji}
															{option.name}
														</option>
													{/each}
												{/if}
											</select>

											<!-- Custom dropdown arrow -->
											<div
												class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
											>
												<svg
													class="w-4 h-4 text-gray-400"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 9l-7 7-7-7"
													/>
												</svg>
											</div>
										</div>

										<!-- ✅ SELECTED EQUIPMENT PREVIEW -->
										{#if equipmentChoices[choice.id]}
											{@const selectedEquipment =
												equipmentChoices[choice.id]}
											<div
												class="mt-3 p-3 bg-white rounded-lg border border-blue-200"
											>
												<div
													class="flex items-center space-x-3"
												>
													<span class="text-2xl"
														>{selectedEquipment?.emoji}</span
													>
													<div>
														<h5
															class="font-semibold text-gray-900"
														>
															{selectedEquipment?.name}
														</h5>
														<p
															class="text-sm text-gray-600"
														>
															{selectedEquipment?.description}
														</p>
														{#if selectedEquipment?.damage}
															<p
																class="text-sm font-medium text-green-600"
															>
																Damage: {selectedEquipment?.damage}
															</p>
														{/if}
														{#if selectedEquipment?.properties && selectedEquipment.properties.length > 0}
															<div
																class="flex flex-wrap gap-1 mt-1"
															>
																{#each selectedEquipment.properties as property}
																	<span
																		class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
																	>
																		{property}
																	</span>
																{/each}
															</div>
														{/if}
													</div>
												</div>
											</div>
										{/if}
									{:else}
										<!-- ✅ AUTOMATIC EQUIPMENT -->
										<div class="mb-3">
											<h4
												class="font-medium text-green-800"
											>
												<span
													class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 mr-2"
												>
													Included
												</span>
												{choice.options[0].name}
											</h4>
										</div>

										<div
											class="p-3 bg-green-50 rounded-lg border border-green-200"
										>
											<div
												class="flex items-center space-x-2"
											>
												<svg
													class="w-5 h-5 text-green-500"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fill-rule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clip-rule="evenodd"
													/>
												</svg>
												<span
													class="font-medium text-green-800"
													>{choice.options[0]
														.name}</span
												>
												<span
													class="text-sm text-green-600"
													>- No choice needed,
													automatically yours</span
												>
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>

						<!-- ✅ BACKGROUND EQUIPMENT - Automatic -->
						<div class="space-y-4">
							<h3 class="text-lg font-semibold text-green-800">
								From {selectedBackground.name} Background
							</h3>

							<div class="p-4 bg-green-50 rounded-lg border">
								<h4 class="font-medium text-green-800 mb-3">
									Automatic Equipment
								</h4>
								<div class="space-y-2">
									{#each selectedBackground.equipment as equipment}
										<div
											class="flex items-center space-x-2"
										>
											<svg
												class="w-4 h-4 text-green-500"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fill-rule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clip-rule="evenodd"
												/>
											</svg>
											<span class="text-sm text-green-700"
												>{equipment}</span
											>
										</div>
									{/each}
								</div>
							</div>

							<!-- ✅ EQUIPMENT SUMMARY -->
							<div class="p-4 bg-gray-50 rounded-lg border">
								<h4 class="font-medium text-gray-800 mb-3">
									Equipment Summary
								</h4>
								<div class="space-y-2">
									<div class="flex justify-between text-sm">
										<span class="text-gray-600"
											>Class Choices Made:</span
										>
										<span class="font-medium">
											{Object.values(
												equipmentChoices,
											).filter(
												(choice) => choice !== null,
											).length} /
											{parseClassEquipment(
												selectedClass.startingEquipment,
											).filter(
												(choice) =>
													choice.options.length > 1,
											).length}
										</span>
									</div>
									<div class="flex justify-between text-sm">
										<span class="text-gray-600"
											>Background Items:</span
										>
										<span class="font-medium"
											>{selectedBackground.equipment
												.length}</span
										>
									</div>
									<div class="flex justify-between text-sm">
										<span class="text-gray-600"
											>Total Equipment:</span
										>
										<span
											class="font-medium text-green-600"
										>
											{Object.values(
												equipmentChoices,
											).filter(
												(choice) => choice !== null,
											).length +
												parseClassEquipment(
													selectedClass.startingEquipment,
												).filter(
													(choice) =>
														choice.options
															.length === 1,
												).length +
												selectedBackground.equipment
													.length} items
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}

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
						disabled={!canProceedFromEquipment}
						class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
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
