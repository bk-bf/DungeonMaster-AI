// src/lib/data/races.ts

export interface Race {
	name: string;
	emoji: string; // ✅ NEW: Add emoji property
	description: string;
	traits: string[];
	abilityScoreIncrease: Record<string, number>;
	size: string;
	speed: number;
	languages: string[];
	subraces?: Subrace[];
}

export interface Subrace {
	name: string;
	description: string;
	traits: string[];
	abilityScoreIncrease: Record<string, number>;
}

// ✅ D&D 5E RACES DATA - enhanced with emojis for visual appeal
export const RACES: Race[] = [
	{
		name: "Human",
		emoji: "👤", // ✅ NEW: Human emoji
		description: "Versatile and ambitious, humans are the most adaptable of all races.",
		traits: [
			"Extra Language",
			"Extra Skill",
			"Versatile"
		],
		abilityScoreIncrease: {
			"Strength": 1,
			"Dexterity": 1,
			"Constitution": 1,
			"Intelligence": 1,
			"Wisdom": 1,
			"Charisma": 1
		},
		size: "Medium",
		speed: 30,
		languages: ["Common", "One extra language of your choice"]
	},
	{
		name: "Elf",
		emoji: "🧝‍♀️", // ✅ NEW: Elf emoji
		description: "Graceful and long-lived, elves are masters of magic and nature.",
		traits: [
			"Darkvision",
			"Keen Senses",
			"Fey Ancestry",
			"Trance"
		],
		abilityScoreIncrease: {
			"Dexterity": 2
		},
		size: "Medium",
		speed: 30,
		languages: ["Common", "Elvish"],
		subraces: [
			{
				name: "High Elf",
				description: "Intelligent and magical elves with a cantrip.",
				traits: ["Cantrip", "Extra Language", "Weapon Training"],
				abilityScoreIncrease: { "Intelligence": 1 }
			},
			{
				name: "Wood Elf",
				description: "Nature-loving elves with bow expertise.",
				traits: ["Weapon Training", "Fleet of Foot", "Mask of the Wild"],
				abilityScoreIncrease: { "Wisdom": 1 }
			}
		]
	},
	{
		name: "Dwarf",
		emoji: "🧔", // ✅ NEW: Dwarf emoji
		description: "Hardy and resilient, dwarves are master craftsmen and warriors.",
		traits: [
			"Darkvision",
			"Dwarven Resilience",
			"Stonecunning",
			"Dwarven Combat Training"
		],
		abilityScoreIncrease: {
			"Constitution": 2
		},
		size: "Medium",
		speed: 25,
		languages: ["Common", "Dwarvish"],
		subraces: [
			{
				name: "Hill Dwarf",
				description: "Wise and hardy dwarves with extra hit points.",
				traits: ["Dwarven Toughness"],
				abilityScoreIncrease: { "Wisdom": 1 }
			},
			{
				name: "Mountain Dwarf",
				description: "Strong dwarves with armor proficiency.",
				traits: ["Armor Proficiency"],
				abilityScoreIncrease: { "Strength": 2 }
			}
		]
	},
	{
		name: "Halfling",
		emoji: "🍀", // ✅ NEW: Halfling emoji (using clover for luck)
		description: "Small but brave, halflings are naturally lucky and nimble.",
		traits: [
			"Lucky",
			"Brave",
			"Halfling Nimbleness"
		],
		abilityScoreIncrease: {
			"Dexterity": 2
		},
		size: "Small",
		speed: 25,
		languages: ["Common", "Halfling"],
		subraces: [
			{
				name: "Lightfoot",
				description: "Charismatic halflings who can hide behind others.",
				traits: ["Naturally Stealthy"],
				abilityScoreIncrease: { "Charisma": 1 }
			},
			{
				name: "Stout",
				description: "Resilient halflings with poison resistance.",
				traits: ["Stout Resilience"],
				abilityScoreIncrease: { "Constitution": 1 }
			}
		]
	},
	{
		name: "Dragonborn",
		emoji: "🐲", // ✅ NEW: Dragon emoji
		description: "Draconic humanoids with breath weapons and scales.",
		traits: [
			"Draconic Ancestry",
			"Breath Weapon",
			"Damage Resistance"
		],
		abilityScoreIncrease: {
			"Strength": 2,
			"Charisma": 1
		},
		size: "Medium",
		speed: 30,
		languages: ["Common", "Draconic"]
	},
	{
		name: "Gnome",
		emoji: "🎩", // ✅ NEW: Hat emoji (gnome hat reference)
		description: "Small and clever, gnomes are natural tinkerers and spellcasters.",
		traits: [
			"Darkvision",
			"Gnome Cunning"
		],
		abilityScoreIncrease: {
			"Intelligence": 2
		},
		size: "Small",
		speed: 25,
		languages: ["Common", "Gnomish"],
		subraces: [
			{
				name: "Forest Gnome",
				description: "Nature-loving gnomes who can speak with animals.",
				traits: ["Natural Illusionist", "Speak with Small Beasts"],
				abilityScoreIncrease: { "Dexterity": 1 }
			},
			{
				name: "Rock Gnome",
				description: "Inventive gnomes with tinker abilities.",
				traits: ["Artificer's Lore", "Tinker"],
				abilityScoreIncrease: { "Constitution": 1 }
			}
		]
	},
	{
		name: "Half-Elf",
		emoji: "🌟", // ✅ NEW: Star emoji (representing dual nature)
		description: "Charismatic beings who bridge the gap between human and elf societies.",
		traits: [
			"Darkvision",
			"Fey Ancestry",
			"Two Skills",
			"Extra Language"
		],
		abilityScoreIncrease: {
			"Charisma": 2,
			"Any Two": 1
		},
		size: "Medium",
		speed: 30,
		languages: ["Common", "Elvish", "One extra language"]
	},
	{
		name: "Half-Orc",
		emoji: "⚔️", // ✅ NEW: Crossed swords emoji
		description: "Strong and fierce, half-orcs struggle between their dual heritage.",
		traits: [
			"Darkvision",
			"Relentless Endurance",
			"Savage Attacks"
		],
		abilityScoreIncrease: {
			"Strength": 2,
			"Constitution": 1
		},
		size: "Medium",
		speed: 30,
		languages: ["Common", "Orc"]
	},
	{
		name: "Tiefling",
		emoji: "😈", // ✅ NEW: Devil emoji (infernal heritage)
		description: "Touched by infernal heritage, tieflings possess innate magical abilities.",
		traits: [
			"Darkvision",
			"Hellish Resistance",
			"Infernal Legacy"
		],
		abilityScoreIncrease: {
			"Intelligence": 1,
			"Charisma": 2
		},
		size: "Medium",
		speed: 30,
		languages: ["Common", "Infernal"]
	}
];


// ✅ HELPER FUNCTIONS - utility functions for race selection
export function getRaceByName(name: string): Race | undefined {
	return RACES.find(race => race.name === name);
}

export function getAbilityScoreModifier(score: number): string {
	const modifier = Math.floor((score - 10) / 2);
	return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

export function formatAbilityScoreIncrease(increases: Record<string, number>): string {
	return Object.entries(increases)
		.map(([ability, bonus]) => `+${bonus} ${ability}`)
		.join(", ");
}
