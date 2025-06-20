// src/lib/data/abilityScores.ts

export interface AbilityScore {
	name: string;
	shortName: string;
	emoji: string;
	description: string;
	examples: string[];
}

export interface AbilityScoreMethod {
	name: string;
	emoji: string;
	description: string;
	type: 'array' | 'pointBuy' | 'roll';
	values?: number[];
	config?: {
		points?: number;
		min?: number;
		max?: number;
		diceType?: number;
		diceCount?: number;
		dropLowest?: boolean;
	};
}

// ✅ D&D 5E ABILITY SCORES - comprehensive ability information
export const ABILITY_SCORES: AbilityScore[] = [
	{
		name: "Strength",
		shortName: "STR",
		emoji: "💪",
		description: "Physical power and athletic ability",
		examples: ["Melee attacks", "Jumping", "Climbing", "Breaking objects"]
	},
	{
		name: "Dexterity",
		shortName: "DEX",
		emoji: "🏃",
		description: "Agility, reflexes, and hand-eye coordination",
		examples: ["Ranged attacks", "Stealth", "Acrobatics", "Initiative"]
	},
	{
		name: "Constitution",
		shortName: "CON",
		emoji: "❤️",
		description: "Health, stamina, and vital force",
		examples: ["Hit points", "Concentration", "Poison resistance", "Endurance"]
	},
	{
		name: "Intelligence",
		shortName: "INT",
		emoji: "🧠",
		description: "Reasoning ability and memory",
		examples: ["Arcana", "History", "Investigation", "Wizard spells"]
	},
	{
		name: "Wisdom",
		shortName: "WIS",
		emoji: "👁️",
		description: "Awareness and insight",
		examples: ["Perception", "Medicine", "Survival", "Cleric spells"]
	},
	{
		name: "Charisma",
		shortName: "CHA",
		emoji: "✨",
		description: "Force of personality and leadership",
		examples: ["Persuasion", "Deception", "Performance", "Sorcerer spells"]
	}
];

// ✅ ABILITY SCORE GENERATION METHODS
export const ABILITY_SCORE_METHODS: AbilityScoreMethod[] = [
	{
		name: "Standard Array",
		emoji: "📊",
		description: "Use the standard set of ability scores for balanced characters",
		type: "array",
		values: [15, 14, 13, 12, 10, 8]
	},
	{
		name: "Point Buy",
		emoji: "🎯",
		description: "Spend 27 points to customize your ability scores",
		type: "pointBuy",
		config: {
			points: 27,
			min: 8,
			max: 15
		}
	},
	{
		name: "Roll 4d6",
		emoji: "🎲",
		description: "Roll 4d6, drop the lowest die for each ability score",
		type: "roll",
		config: {
			diceType: 6,
			diceCount: 4,
			dropLowest: true
		}
	},
	{
		name: "Roll 3d6",
		emoji: "🎲",
		description: "Roll 3d6 straight for each ability score (classic method)",
		type: "roll",
		config: {
			diceType: 6,
			diceCount: 3,
			dropLowest: false
		}
	}
];

// ✅ HELPER FUNCTIONS
export function getAbilityModifier(score: number): number {
	return Math.floor((score - 10) / 2);
}

export function formatModifier(modifier: number): string {
	return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

export function getPointBuyCost(score: number): number {
	const costs: Record<number, number> = {
		8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
	};
	return costs[score] || 0;
}

export function rollAbilityScore(method: AbilityScoreMethod): number {
	if (method.type !== 'roll' || !method.config) return 10;

	const { diceCount = 3, diceType = 6, dropLowest = false } = method.config;
	const rolls: number[] = [];

	for (let i = 0; i < diceCount; i++) {
		rolls.push(Math.floor(Math.random() * diceType) + 1);
	}

	if (dropLowest && rolls.length > 1) {
		rolls.sort((a, b) => b - a);
		return rolls.slice(0, -1).reduce((sum, roll) => sum + roll, 0);
	}

	return rolls.reduce((sum, roll) => sum + roll, 0);
}

export function getRacialBonus(raceName: string, abilityName: string): number {
	// Simplified racial bonuses - in real implementation, this would be more comprehensive
	const racialBonuses: Record<string, Record<string, number>> = {
		"Human": {
			"Strength": 1, "Dexterity": 1, "Constitution": 1,
			"Intelligence": 1, "Wisdom": 1, "Charisma": 1
		},
		"Elf": { "Dexterity": 2 },
		"Dwarf": { "Constitution": 2 },
		"Halfling": { "Dexterity": 2 },
		"Dragonborn": { "Strength": 2, "Charisma": 1 },
		"Gnome": { "Intelligence": 2 },
		"Half-Elf": { "Charisma": 2 },
		"Half-Orc": { "Strength": 2, "Constitution": 1 },
		"Tiefling": { "Intelligence": 1, "Charisma": 2 }
	};

	return racialBonuses[raceName]?.[abilityName] || 0;
}
