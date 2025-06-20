// src/lib/data/classes.ts

export interface Class {
	name: string;
	emoji: string;
	description: string;
	hitDie: string;
	primaryAbility: string[];
	savingThrows: string[];
	skillChoices: number;
	availableSkills: string[];
	startingEquipment: string[];
	spellcaster: boolean;
	armorProficiency: string[];
	weaponProficiency: string[];
}

// ✅ D&D 5E CLASSES DATA - comprehensive class information for character creation
export const CLASSES: Class[] = [
	{
		name: "Barbarian",
		emoji: "🪓",
		description: "A fierce warrior of primitive background who can enter a battle rage.",
		hitDie: "d12",
		primaryAbility: ["Strength"],
		savingThrows: ["Strength", "Constitution"],
		skillChoices: 2,
		availableSkills: [
			"Animal Handling", "Athletics", "Intimidation",
			"Nature", "Perception", "Survival"
		],
		startingEquipment: [
			"Greataxe or any martial melee weapon",
			"Two handaxes or any simple weapon",
			"Explorer's pack and four javelins"
		],
		spellcaster: false,
		armorProficiency: ["Light armor", "Medium armor", "Shields"],
		weaponProficiency: ["Simple weapons", "Martial weapons"]
	},
	{
		name: "Bard",
		emoji: "🎵",
		description: "A master of song, speech, and the magic they contain.",
		hitDie: "d8",
		primaryAbility: ["Charisma"],
		savingThrows: ["Dexterity", "Charisma"],
		skillChoices: 3,
		availableSkills: [
			"Deception", "History", "Investigation", "Persuasion",
			"Performance", "Sleight of Hand", "Stealth"
		],
		startingEquipment: [
			"Rapier or longsword or any simple melee weapon",
			"Diplomat's pack or entertainer's pack",
			"Leather armor, dagger, and simple weapon"
		],
		spellcaster: true,
		armorProficiency: ["Light armor"],
		weaponProficiency: ["Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"]
	},
	{
		name: "Cleric",
		emoji: "⛪",
		description: "A priestly champion who wields divine magic in service of a higher power.",
		hitDie: "d8",
		primaryAbility: ["Wisdom"],
		savingThrows: ["Wisdom", "Charisma"],
		skillChoices: 2,
		availableSkills: [
			"History", "Insight", "Medicine", "Persuasion", "Religion"
		],
		startingEquipment: [
			"Mace or warhammer (if proficient)",
			"Scale mail or leather armor or chain mail (if proficient)",
			"Light crossbow and 20 bolts or any simple weapon",
			"Priest's pack"
		],
		spellcaster: true,
		armorProficiency: ["Light armor", "Medium armor", "Shields"],
		weaponProficiency: ["Simple weapons"]
	},
	{
		name: "Druid",
		emoji: "🌿",
		description: "A priest of nature, wielding elemental forces and transforming into animals.",
		hitDie: "d8",
		primaryAbility: ["Wisdom"],
		savingThrows: ["Intelligence", "Wisdom"],
		skillChoices: 2,
		availableSkills: [
			"Arcana", "Animal Handling", "Insight", "Medicine",
			"Nature", "Perception", "Religion", "Survival"
		],
		startingEquipment: [
			"Wooden shield or any simple melee weapon",
			"Scimitar or any simple melee weapon",
			"Leather armor, explorer's pack, and druidcraft"
		],
		spellcaster: true,
		armorProficiency: ["Light armor", "Medium armor", "Shields (non-metal)"],
		weaponProficiency: ["Clubs", "Daggers", "Darts", "Javelins", "Maces", "Quarterstaffs", "Scimitars", "Sickles", "Slings", "Spears"]
	},
	{
		name: "Fighter",
		emoji: "⚔️",
		description: "A master of martial combat, skilled with a variety of weapons and armor.",
		hitDie: "d10",
		primaryAbility: ["Strength", "Dexterity"],
		savingThrows: ["Strength", "Constitution"],
		skillChoices: 2,
		availableSkills: [
			"Acrobatics", "Animal Handling", "Athletics", "History",
			"Insight", "Intimidation", "Perception", "Survival"
		],
		startingEquipment: [
			"Chain mail or leather armor, longbow, and 20 arrows",
			"Martial weapon and shield or two martial weapons",
			"Light crossbow and 20 bolts or two handaxes",
			"Dungeoneer's pack or explorer's pack"
		],
		spellcaster: false,
		armorProficiency: ["All armor", "Shields"],
		weaponProficiency: ["Simple weapons", "Martial weapons"]
	},
	{
		name: "Monk",
		emoji: "🥋",
		description: "A master of martial arts, harnessing inner power through discipline and focus.",
		hitDie: "d8",
		primaryAbility: ["Dexterity", "Wisdom"],
		savingThrows: ["Strength", "Dexterity"],
		skillChoices: 2,
		availableSkills: [
			"Acrobatics", "Athletics", "History", "Insight",
			"Religion", "Stealth"
		],
		startingEquipment: [
			"Shortsword or any simple melee weapon",
			"Dungeoneer's pack or explorer's pack",
			"10 darts"
		],
		spellcaster: false,
		armorProficiency: ["None"],
		weaponProficiency: ["Simple weapons", "Shortswords"]
	},
	{
		name: "Paladin",
		emoji: "🛡️",
		description: "A holy warrior bound to a sacred oath, wielding divine magic and martial prowess.",
		hitDie: "d10",
		primaryAbility: ["Strength", "Charisma"],
		savingThrows: ["Wisdom", "Charisma"],
		skillChoices: 2,
		availableSkills: [
			"Athletics", "Insight", "Intimidation", "Medicine",
			"Persuasion", "Religion"
		],
		startingEquipment: [
			"Chain mail",
			"Martial weapon and shield or two martial weapons",
			"Five javelins or any simple melee weapon",
			"Priest's pack or explorer's pack"
		],
		spellcaster: true,
		armorProficiency: ["All armor", "Shields"],
		weaponProficiency: ["Simple weapons", "Martial weapons"]
	},
	{
		name: "Ranger",
		emoji: "🏹",
		description: "A warrior of the wilderness, skilled in tracking, survival, and combat.",
		hitDie: "d10",
		primaryAbility: ["Dexterity", "Wisdom"],
		savingThrows: ["Strength", "Dexterity"],
		skillChoices: 3,
		availableSkills: [
			"Animal Handling", "Athletics", "Insight", "Investigation",
			"Nature", "Perception", "Stealth", "Survival"
		],
		startingEquipment: [
			"Scale mail or leather armor",
			"Two shortswords or two simple melee weapons",
			"Dungeoneer's pack or explorer's pack",
			"Longbow and quiver of 20 arrows"
		],
		spellcaster: true,
		armorProficiency: ["Light armor", "Medium armor", "Shields"],
		weaponProficiency: ["Simple weapons", "Martial weapons"]
	},
	{
		name: "Rogue",
		emoji: "🗡️",
		description: "A scoundrel who uses stealth and trickery to accomplish goals.",
		hitDie: "d8",
		primaryAbility: ["Dexterity"],
		savingThrows: ["Dexterity", "Intelligence"],
		skillChoices: 4,
		availableSkills: [
			"Acrobatics", "Athletics", "Deception", "Insight",
			"Intimidation", "Investigation", "Perception", "Performance",
			"Persuasion", "Sleight of Hand", "Stealth"
		],
		startingEquipment: [
			"Rapier or shortsword",
			"Shortbow and quiver of 20 arrows",
			"Burglar's pack, leather armor, two daggers, and thieves' tools"
		],
		spellcaster: false,
		armorProficiency: ["Light armor"],
		weaponProficiency: ["Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"]
	},
	{
		name: "Sorcerer",
		emoji: "✨",
		description: "A spellcaster who draws on inherent magic from a gift or bloodline.",
		hitDie: "d6",
		primaryAbility: ["Charisma"],
		savingThrows: ["Constitution", "Charisma"],
		skillChoices: 2,
		availableSkills: [
			"Arcana", "Deception", "Insight", "Intimidation",
			"Persuasion", "Religion"
		],
		startingEquipment: [
			"Light crossbow and 20 bolts or any simple weapon",
			"Component pouch or arcane focus",
			"Dungeoneer's pack or explorer's pack",
			"Two daggers"
		],
		spellcaster: true,
		armorProficiency: ["None"],
		weaponProficiency: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"]
	},
	{
		name: "Warlock",
		emoji: "👹",
		description: "A wielder of magic derived from a bargain with an extraplanar entity.",
		hitDie: "d8",
		primaryAbility: ["Charisma"],
		savingThrows: ["Wisdom", "Charisma"],
		skillChoices: 2,
		availableSkills: [
			"Arcana", "Deception", "History", "Intimidation",
			"Investigation", "Nature", "Religion"
		],
		startingEquipment: [
			"Light crossbow and 20 bolts or any simple weapon",
			"Component pouch or arcane focus",
			"Scholar's pack or dungeoneer's pack",
			"Leather armor, any simple weapon, and two daggers"
		],
		spellcaster: true,
		armorProficiency: ["Light armor"],
		weaponProficiency: ["Simple weapons"]
	},
	{
		name: "Wizard",
		emoji: "🧙‍♂️",
		description: "A scholarly magic-user capable of manipulating the structures of spells.",
		hitDie: "d6",
		primaryAbility: ["Intelligence"],
		savingThrows: ["Intelligence", "Wisdom"],
		skillChoices: 2,
		availableSkills: [
			"Arcana", "History", "Insight", "Investigation",
			"Medicine", "Religion"
		],
		startingEquipment: [
			"Quarterstaff or dagger",
			"Component pouch or arcane focus",
			"Scholar's pack or explorer's pack",
			"Spellbook with six 1st-level wizard spells"
		],
		spellcaster: true,
		armorProficiency: ["None"],
		weaponProficiency: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"]
	}
];

// ✅ HELPER FUNCTIONS - utility functions for class selection
export function getClassByName(name: string): Class | undefined {
	return CLASSES.find(classItem => classItem.name === name);
}

export function formatSkillChoices(skillChoices: number, availableSkills: string[]): string {
	return `Choose ${skillChoices} from: ${availableSkills.join(', ')}`;
}

export function getClassType(classItem: Class): string {
	if (classItem.spellcaster) {
		return "Spellcaster";
	} else if (classItem.hitDie === "d12" || classItem.hitDie === "d10") {
		return "Martial";
	} else {
		return "Specialist";
	}
}
