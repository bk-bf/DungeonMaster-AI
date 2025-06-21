// src/lib/data/equipment.ts

export interface Equipment {
	name: string;
	emoji: string;
	type: 'weapon' | 'armor' | 'tool' | 'gear' | 'pack' | 'kit';
	cost: string;
	weight: string;
	description: string;
	damage?: string; // For weapons
	armorClass?: string; // For armor
	properties?: string[];
}

export interface EquipmentChoice {
	id: string;
	description: string;
	options: Equipment[];
	allowCustom?: boolean;
	customDescription?: string;
}

export interface StartingGoldByClass {
	[className: string]: {
		formula: string;
		average: number;
	};
}

// ✅ D&D 5E WEAPONS DATA - Individual weapons with emojis and stats
export const MARTIAL_MELEE_WEAPONS: Equipment[] = [
	{
		name: "Greatsword",
		emoji: "⚔️",
		type: "weapon",
		cost: "50 gp",
		weight: "6 lb",
		damage: "2d6 slashing",
		description: "Heavy, two-handed weapon",
		properties: ["Heavy", "Two-handed"]
	},
	{
		name: "Longsword",
		emoji: "🗡️",
		type: "weapon",
		cost: "15 gp",
		weight: "3 lb",
		damage: "1d8 slashing",
		description: "Versatile (1d10)",
		properties: ["Versatile"]
	},
	{
		name: "Battleaxe",
		emoji: "🪓",
		type: "weapon",
		cost: "10 gp",
		weight: "4 lb",
		damage: "1d8 slashing",
		description: "Versatile (1d10)",
		properties: ["Versatile"]
	},
	{
		name: "Warhammer",
		emoji: "🔨",
		type: "weapon",
		cost: "15 gp",
		weight: "2 lb",
		damage: "1d8 bludgeoning",
		description: "Versatile (1d10)",
		properties: ["Versatile"]
	},
	{
		name: "Glaive",
		emoji: "🔱",
		type: "weapon",
		cost: "20 gp",
		weight: "6 lb",
		damage: "1d10 slashing",
		description: "Heavy, reach, two-handed",
		properties: ["Heavy", "Reach", "Two-handed"]
	},
	{
		name: "Rapier",
		emoji: "🤺",
		type: "weapon",
		cost: "25 gp",
		weight: "2 lb",
		damage: "1d8 piercing",
		description: "Finesse weapon",
		properties: ["Finesse"]
	},
	{
		name: "Scimitar",
		emoji: "🏴‍☠️",
		type: "weapon",
		cost: "25 gp",
		weight: "3 lb",
		damage: "1d6 slashing",
		description: "Finesse, light weapon",
		properties: ["Finesse", "Light"]
	},
	{
		name: "Shortsword",
		emoji: "⚔️",
		type: "weapon",
		cost: "10 gp",
		weight: "2 lb",
		damage: "1d6 piercing",
		description: "Finesse, light weapon",
		properties: ["Finesse", "Light"]
	}
];

export const SIMPLE_WEAPONS: Equipment[] = [
	{
		name: "Club",
		emoji: "🏏",
		type: "weapon",
		cost: "1 sp",
		weight: "2 lb",
		damage: "1d4 bludgeoning",
		description: "Light weapon",
		properties: ["Light"]
	},
	{
		name: "Dagger",
		emoji: "🗡️",
		type: "weapon",
		cost: "2 gp",
		weight: "1 lb",
		damage: "1d4 piercing",
		description: "Finesse, light, thrown",
		properties: ["Finesse", "Light", "Thrown"]
	},
	{
		name: "Javelin",
		emoji: "🏹",
		type: "weapon",
		cost: "5 sp",
		weight: "2 lb",
		damage: "1d6 piercing",
		description: "Thrown weapon",
		properties: ["Thrown"]
	},
	{
		name: "Mace",
		emoji: "🔨",
		type: "weapon",
		cost: "5 gp",
		weight: "4 lb",
		damage: "1d6 bludgeoning",
		description: "Simple weapon",
		properties: []
	},
	{
		name: "Quarterstaff",
		emoji: "🥍",
		type: "weapon",
		cost: "2 sp",
		weight: "4 lb",
		damage: "1d6 bludgeoning",
		description: "Versatile (1d8)",
		properties: ["Versatile"]
	},
	{
		name: "Spear",
		emoji: "🔱",
		type: "weapon",
		cost: "1 gp",
		weight: "3 lb",
		damage: "1d6 piercing",
		description: "Thrown, versatile (1d8)",
		properties: ["Thrown", "Versatile"]
	}
];

export const RANGED_WEAPONS: Equipment[] = [
	{
		name: "Longbow",
		emoji: "🏹",
		type: "weapon",
		cost: "50 gp",
		weight: "2 lb",
		damage: "1d8 piercing",
		description: "Heavy, two-handed, range 150/600",
		properties: ["Heavy", "Two-handed", "Ammunition"]
	},
	{
		name: "Shortbow",
		emoji: "🏹",
		type: "weapon",
		cost: "25 gp",
		weight: "2 lb",
		damage: "1d6 piercing",
		description: "Two-handed, range 80/320",
		properties: ["Two-handed", "Ammunition"]
	},
	{
		name: "Light Crossbow",
		emoji: "🏹",
		type: "weapon",
		cost: "25 gp",
		weight: "5 lb",
		damage: "1d8 piercing",
		description: "Loading, range 80/320",
		properties: ["Loading", "Two-handed", "Ammunition"]
	},
	{
		name: "Heavy Crossbow",
		emoji: "🏹",
		type: "weapon",
		cost: "50 gp",
		weight: "18 lb",
		damage: "1d10 piercing",
		description: "Heavy, loading, range 100/400",
		properties: ["Heavy", "Loading", "Two-handed", "Ammunition"]
	}
];
// ✅ D&D 5E ARMOR DATA
export const ARMOR: Equipment[] = [
	{
		name: "Leather Armor",
		emoji: "🧥",
		type: "armor",
		cost: "10 gp",
		weight: "10 lb",
		armorClass: "11 + Dex modifier",
		description: "Light armor made of supple leather",
		properties: ["Light"]
	},
	{
		name: "Studded Leather",
		emoji: "🦺",
		type: "armor",
		cost: "45 gp",
		weight: "13 lb",
		armorClass: "12 + Dex modifier",
		description: "Leather reinforced with metal studs",
		properties: ["Light"]
	},
	{
		name: "Chain Mail",
		emoji: "⛓️",
		type: "armor",
		cost: "75 gp",
		weight: "55 lb",
		armorClass: "16",
		description: "Interlocking metal rings",
		properties: ["Heavy", "Disadvantage on Stealth"]
	},
	{
		name: "Chain Shirt",
		emoji: "🔗",
		type: "armor",
		cost: "50 gp",
		weight: "20 lb",
		armorClass: "13 + Dex modifier (max 2)",
		description: "Medium armor of interlocking rings",
		properties: ["Medium"]
	},
	{
		name: "Scale Mail",
		emoji: "🐟",
		type: "armor",
		cost: "50 gp",
		weight: "45 lb",
		armorClass: "14 + Dex modifier (max 2)",
		description: "Coat of leather covered in overlapping scales",
		properties: ["Medium", "Disadvantage on Stealth"]
	},
	{
		name: "Plate Armor",
		emoji: "🛡️",
		type: "armor",
		cost: "1,500 gp",
		weight: "65 lb",
		armorClass: "18",
		description: "Interlocking metal plates covering the entire body",
		properties: ["Heavy", "Disadvantage on Stealth"]
	},
	{
		name: "Shield",
		emoji: "🛡️",
		type: "armor",
		cost: "10 gp",
		weight: "6 lb",
		armorClass: "+2 AC",
		description: "Increases Armor Class by 2",
		properties: ["Shield"]
	}
];

// ✅ D&D 5E TOOLS AND KITS
export const TOOLS_AND_KITS: Equipment[] = [
	{
		name: "Thieves' Tools",
		emoji: "🔧",
		type: "tool",
		cost: "25 gp",
		weight: "1 lb",
		description: "Lock picks and other tools for disabling traps",
		properties: ["Proficiency required"]
	},
	{
		name: "Healer's Kit",
		emoji: "🏥",
		type: "kit",
		cost: "5 gp",
		weight: "3 lb",
		description: "Bandages, splints, and other supplies for treating wounds",
		properties: ["10 uses"]
	},
	{
		name: "Disguise Kit",
		emoji: "🎭",
		type: "kit",
		cost: "25 gp",
		weight: "3 lb",
		description: "Cosmetics, hair dye, and props for creating disguises",
		properties: ["Proficiency required"]
	},
	{
		name: "Forgery Kit",
		emoji: "📝",
		type: "kit",
		cost: "15 gp",
		weight: "5 lb",
		description: "Papers, inks, and seals for creating false documents",
		properties: ["Proficiency required"]
	},
	{
		name: "Herbalism Kit",
		emoji: "🌿",
		type: "kit",
		cost: "5 gp",
		weight: "3 lb",
		description: "Pouches, vials, and tools for creating herbal remedies",
		properties: ["Proficiency required"]
	},
	{
		name: "Poisoner's Kit",
		emoji: "☠️",
		type: "kit",
		cost: "50 gp",
		weight: "2 lb",
		description: "Vials, chemicals, and tools for handling poison",
		properties: ["Proficiency required"]
	},
	{
		name: "Alchemist's Supplies",
		emoji: "⚗️",
		type: "tool",
		cost: "50 gp",
		weight: "8 lb",
		description: "Glass beakers, metal frame, and various chemicals",
		properties: ["Artisan's tools"]
	},
	{
		name: "Smith's Tools",
		emoji: "🔨",
		type: "tool",
		cost: "20 gp",
		weight: "8 lb",
		description: "Hammers, tongs, charcoal, and metal",
		properties: ["Artisan's tools"]
	},
	{
		name: "Cook's Utensils",
		emoji: "🍳",
		type: "tool",
		cost: "1 gp",
		weight: "8 lb",
		description: "Metal pot, knives, forks, and stirring spoon",
		properties: ["Artisan's tools"]
	},
	{
		name: "Navigator's Tools",
		emoji: "🧭",
		type: "tool",
		cost: "25 gp",
		weight: "2 lb",
		description: "Sextant, compass, calipers, and charts",
		properties: ["Professional tools"]
	}
];

// ✅ D&D 5E ADVENTURING GEAR
export const ADVENTURING_GEAR: Equipment[] = [
	{
		name: "Rope (50 feet)",
		emoji: "🪢",
		type: "gear",
		cost: "2 gp",
		weight: "10 lb",
		description: "Hemp rope useful for climbing and securing items",
		properties: ["50 feet"]
	},
	{
		name: "Grappling Hook",
		emoji: "🪝",
		type: "gear",
		cost: "2 gp",
		weight: "4 lb",
		description: "Metal hook for climbing or retrieving objects",
		properties: ["Thrown"]
	},
	{
		name: "Torch",
		emoji: "🔦",
		type: "gear",
		cost: "1 cp",
		weight: "1 lb",
		description: "Provides bright light in 20-foot radius",
		properties: ["1 hour burn time"]
	},
	{
		name: "Lantern (Hooded)",
		emoji: "🏮",
		type: "gear",
		cost: "5 gp",
		weight: "2 lb",
		description: "Casts bright light in 30-foot radius",
		properties: ["6 hours per flask of oil"]
	},
	{
		name: "Bedroll",
		emoji: "🛏️",
		type: "gear",
		cost: "1 gp",
		weight: "7 lb",
		description: "Sleeping gear for resting outdoors",
		properties: ["Comfort item"]
	},
	{
		name: "Blanket",
		emoji: "🧣",
		type: "gear",
		cost: "5 sp",
		weight: "3 lb",
		description: "Wool blanket for warmth",
		properties: ["Comfort item"]
	},
	{
		name: "Rations (1 day)",
		emoji: "🥘",
		type: "gear",
		cost: "2 gp",
		weight: "2 lb",
		description: "Dried foods suitable for travel",
		properties: ["1 day of food"]
	},
	{
		name: "Waterskin",
		emoji: "💧",
		type: "gear",
		cost: "2 gp",
		weight: "5 lb (full)",
		description: "Leather container holding 4 pints of liquid",
		properties: ["4 pints capacity"]
	},
	{
		name: "Backpack",
		emoji: "🎒",
		type: "gear",
		cost: "2 gp",
		weight: "5 lb",
		description: "Leather pack with multiple compartments",
		properties: ["1 cubic foot capacity"]
	},
	{
		name: "Crowbar",
		emoji: "🔧",
		type: "gear",
		cost: "2 gp",
		weight: "5 lb",
		description: "Iron bar for prying and leverage",
		properties: ["Advantage on Strength checks"]
	},
	{
		name: "Hammer",
		emoji: "🔨",
		type: "gear",
		cost: "1 gp",
		weight: "3 lb",
		description: "Tool for driving nails and breaking objects",
		properties: ["Tool"]
	},
	{
		name: "Pitons (10)",
		emoji: "📌",
		type: "gear",
		cost: "5 sp",
		weight: "2.5 lb",
		description: "Iron spikes for climbing",
		properties: ["10 pieces"]
	},
	{
		name: "Tinderbox",
		emoji: "🔥",
		type: "gear",
		cost: "5 sp",
		weight: "1 lb",
		description: "Flint, steel, and tinder for making fire",
		properties: ["Fire starter"]
	},
	{
		name: "Oil Flask",
		emoji: "🛢️",
		type: "gear",
		cost: "1 sp",
		weight: "1 lb",
		description: "Flask of oil for lanterns or as weapon",
		properties: ["1 pint"]
	},
	{
		name: "Caltrops (20)",
		emoji: "⭐",
		type: "gear",
		cost: "1 gp",
		weight: "2 lb",
		description: "Spiked metal balls that slow movement",
		properties: ["Area denial"]
	},
	{
		name: "Chain (10 feet)",
		emoji: "⛓️",
		type: "gear",
		cost: "5 gp",
		weight: "10 lb",
		description: "Metal chain for binding or climbing",
		properties: ["10 feet"]
	},
	{
		name: "Manacles",
		emoji: "🔒",
		type: "gear",
		cost: "2 gp",
		weight: "6 lb",
		description: "Metal restraints for prisoners",
		properties: ["Restraint"]
	},
	{
		name: "Mirror (Steel)",
		emoji: "🪞",
		type: "gear",
		cost: "5 gp",
		weight: "0.5 lb",
		description: "Polished steel mirror for signaling",
		properties: ["Utility"]
	},
	{
		name: "Pouch",
		emoji: "👛",
		type: "gear",
		cost: "5 sp",
		weight: "1 lb",
		description: "Small cloth or leather bag",
		properties: ["1/5 cubic foot"]
	}
];

// ✅ D&D 5E EQUIPMENT PACKS
export const EQUIPMENT_PACKS: Equipment[] = [
	{
		name: "Burglar's Pack",
		emoji: "🥷",
		type: "pack",
		cost: "16 gp",
		weight: "46.5 lb",
		description: "Backpack, ball bearings, string, bell, 5 candles, crowbar, hammer, 10 pitons, hooded lantern, 2 oil flasks, 5 days rations, tinderbox, waterskin, 50 feet rope",
		properties: ["Complete kit for sneaking"]
	},
	{
		name: "Dungeoneer's Pack",
		emoji: "🗝️",
		type: "pack",
		cost: "12 gp",
		weight: "61.5 lb",
		description: "Backpack, crowbar, hammer, 10 pitons, 10 torches, tinderbox, 10 days rations, waterskin, 50 feet rope",
		properties: ["Complete kit for dungeon exploration"]
	},
	{
		name: "Explorer's Pack",
		emoji: "🧭",
		type: "pack",
		cost: "10 gp",
		weight: "59 lb",
		description: "Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, 50 feet rope",
		properties: ["Complete kit for wilderness travel"]
	},
	{
		name: "Entertainer's Pack",
		emoji: "🎪",
		type: "pack",
		cost: "40 gp",
		weight: "38 lb",
		description: "Backpack, bedroll, 2 costumes, 5 candles, 5 days rations, waterskin, disguise kit",
		properties: ["Complete kit for performers"]
	},
	{
		name: "Priest's Pack",
		emoji: "⛪",
		type: "pack",
		cost: "19 gp",
		weight: "24 lb",
		description: "Backpack, blanket, 10 candles, tinderbox, alms box, 2 incense blocks, censer, vestments, 2 days rations, waterskin",
		properties: ["Complete kit for clerics"]
	},
	{
		name: "Scholar's Pack",
		emoji: "📚",
		type: "pack",
		cost: "40 gp",
		weight: "20 lb",
		description: "Backpack, book of lore, ink bottle, ink pen, 10 sheets parchment, sand pouch, small knife",
		properties: ["Complete kit for researchers"]
	}
];
// ✅ D&D 5E STARTING GOLD BY CLASS
export const STARTING_GOLD: StartingGoldByClass = {
	"Barbarian": { formula: "2d4 × 10 gp", average: 50 },
	"Bard": { formula: "5d4 × 10 gp", average: 125 },
	"Cleric": { formula: "5d4 × 10 gp", average: 125 },
	"Druid": { formula: "2d4 × 10 gp", average: 50 },
	"Fighter": { formula: "5d4 × 10 gp", average: 125 },
	"Monk": { formula: "5d4 gp", average: 12.5 },
	"Paladin": { formula: "5d4 × 10 gp", average: 125 },
	"Ranger": { formula: "5d4 × 10 gp", average: 125 },
	"Rogue": { formula: "4d4 × 10 gp", average: 100 },
	"Sorcerer": { formula: "3d4 × 10 gp", average: 75 },
	"Warlock": { formula: "4d4 × 10 gp", average: 100 },
	"Wizard": { formula: "4d4 × 10 gp", average: 100 }
};

// ✅ HELPER FUNCTIONS
export function getChoiceById(choiceId: string, equipmentList: string[]): EquipmentChoice | undefined {
	const choices = parseClassEquipment(equipmentList);
	return choices.find(choice => choice.id === choiceId);
}

// ✅ ENHANCED EQUIPMENT VALIDATION HELPER
export function canSelectEquipment(
	equipment: Equipment,
	choiceId: string,
	equipmentList: string[]
): boolean {
	// Can only select if this is part of a valid class choice
	const choice = getChoiceById(choiceId, equipmentList);
	return choice?.options.some(option => option.name === equipment.name) || false;
}

export function getAvailableChoices(equipmentList: string[]): EquipmentChoice[] {
	return parseClassEquipment(equipmentList).filter(choice => choice.options.length > 1);
}

// ✅ HELPER TO GET AUTOMATIC EQUIPMENT
export function getAutomaticEquipment(equipmentList: string[]): Equipment[] {
	return parseClassEquipment(equipmentList)
		.filter(choice => choice.options.length === 1)
		.map(choice => choice.options[0]);
}

// ✅ VALIDATE ALL EQUIPMENT CHOICES ARE MADE
export function areAllChoicesMade(
	equipmentChoices: Record<string, Equipment | null>,
	equipmentList: string[]
): boolean {
	const requiredChoices = getAvailableChoices(equipmentList);
	return requiredChoices.every(choice => equipmentChoices[choice.id] !== null);
}

export function rollStartingGold(className: string): number {
	const goldData = STARTING_GOLD[className];
	if (!goldData) return 50; // Default fallback

	// Parse formula like "2d4 × 10 gp" or "5d4 gp"
	const formula = goldData.formula;
	const match = formula.match(/(\d+)d(\d+)(?:\s*×\s*(\d+))?/);

	if (!match) return goldData.average;

	const numDice = parseInt(match[1]);
	const diceSize = parseInt(match[2]);
	const multiplier = match[3] ? parseInt(match[3]) : 1;

	let total = 0;
	for (let i = 0; i < numDice; i++) {
		total += Math.floor(Math.random() * diceSize) + 1;
	}

	return total * multiplier;
}
export function getEquipmentByCategory(category: string): Equipment[] {
	switch (category) {
		case "martial melee":
			return MARTIAL_MELEE_WEAPONS;
		case "simple":
			return SIMPLE_WEAPONS;
		case "ranged":
			return RANGED_WEAPONS;
		case "martial":
			return [...MARTIAL_MELEE_WEAPONS, ...RANGED_WEAPONS];
		case "armor":
			return ARMOR;
		case "tools":
			return TOOLS_AND_KITS;
		case "gear":
			return ADVENTURING_GEAR;
		case "packs":
			return EQUIPMENT_PACKS;
		case "all":
			return [...MARTIAL_MELEE_WEAPONS, ...SIMPLE_WEAPONS, ...RANGED_WEAPONS, ...ARMOR, ...TOOLS_AND_KITS, ...ADVENTURING_GEAR, ...EQUIPMENT_PACKS];
		default:
			return [];
	}
}

export function getEquipmentByType(type: Equipment['type']): Equipment[] {
	const allEquipment = getEquipmentByCategory("all");
	return allEquipment.filter(item => item.type === type);
}

// ✅ ENHANCED EQUIPMENT PARSER - Handle complex choices
export function parseClassEquipment(equipmentList: string[]): EquipmentChoice[] {
	return equipmentList.map((item, index) => {
		if (item.includes(" or ")) {
			// Split the choice into options
			const optionStrings = item.split(" or ").map(opt => opt.trim());
			const options: Equipment[] = [];

			optionStrings.forEach(optionString => {
				if (optionString.includes("martial weapon and shield")) {
					// ✅ CREATE COMPOUND OPTION: Weapon + Shield
					options.push({
						name: "Martial Weapon + Shield",
						emoji: "⚔️🛡️",
						type: "gear",
						cost: "—",
						weight: "—",
						description: "Choose any martial weapon plus a shield",
						properties: ["Compound Choice"]
					});
				} else if (optionString.includes("two martial weapons")) {
					// ✅ CREATE COMPOUND OPTION: Two Weapons
					options.push({
						name: "Two Martial Weapons",
						emoji: "⚔️⚔️",
						type: "gear",
						cost: "—",
						weight: "—",
						description: "Choose any two martial weapons",
						properties: ["Compound Choice"]
					});
				} else if (optionString.includes("any martial melee weapon")) {
					// ✅ PLACEHOLDER FOR MARTIAL MELEE EXPANSION
					options.push({
						name: "Any Martial Melee Weapon",
						emoji: "⚔️",
						type: "weapon",
						cost: "—",
						weight: "—",
						description: "Choose from martial melee weapons",
						properties: ["Expandable Choice"]
					});
				} else {
					// ✅ SPECIFIC EQUIPMENT
					options.push({
						name: optionString,
						emoji: "⚔️",
						type: "gear",
						cost: "—",
						weight: "—",
						description: optionString
					});
				}
			});

			return {
				id: `choice_${index}`,
				description: item,
				options,
				allowCustom: item.includes("any ")
			};
		} else {
			// Automatic equipment
			return {
				id: `auto_${index}`,
				description: item,
				options: [{
					name: item,
					emoji: "🎒",
					type: "gear",
					cost: "—",
					weight: "—",
					description: item
				}]
			};
		}
	});
}


// ✅ WEAPON CATEGORY HELPERS
export function getWeaponsByCategory(category: string): Equipment[] {
	switch (category) {
		case "martial melee":
			return MARTIAL_MELEE_WEAPONS;
		case "simple":
			return SIMPLE_WEAPONS;
		case "ranged":
			return RANGED_WEAPONS;
		case "martial":
			return [...MARTIAL_MELEE_WEAPONS, ...RANGED_WEAPONS];
		default:
			return [];
	}
}
// ✅ EXPORTS FOR ALL EQUIPMENT
export const ALL_EQUIPMENT = [
	...MARTIAL_MELEE_WEAPONS,
	...SIMPLE_WEAPONS,
	...RANGED_WEAPONS,
	...ARMOR,
	...TOOLS_AND_KITS,
	...ADVENTURING_GEAR,
	...EQUIPMENT_PACKS
];
