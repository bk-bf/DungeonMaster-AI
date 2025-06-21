// src/lib/data/skills.ts

export interface Skill {
	name: string;
	ability: string;
	description: string;
	examples: string[];
}

export interface SkillProficiency {
	skill: string;
	source: 'class' | 'background' | 'race' | 'replacement';
	replacedSkill?: string; // If this skill replaced another due to overlap
}

// ✅ D&D 5E SKILLS - Complete skill list with abilities and descriptions
export const ALL_SKILLS: Skill[] = [
	{
		name: "Acrobatics",
		ability: "Dex",
		description: "Balance, tumbling, and aerial maneuvers",
		examples: ["Staying upright on a rocking ship", "Landing safely after a fall", "Performing acrobatic stunts"]
	},
	{
		name: "Animal Handling",
		ability: "Wis",
		description: "Calming and controlling animals",
		examples: ["Calming a frightened horse", "Training a guard dog", "Communicating with wild animals"]
	},
	{
		name: "Arcana",
		ability: "Int",
		description: "Knowledge of magic and magical items",
		examples: ["Identifying a spell being cast", "Recognizing magical symbols", "Understanding planar creatures"]
	},
	{
		name: "Athletics",
		ability: "Str",
		description: "Climbing, jumping, and swimming",
		examples: ["Climbing a cliff face", "Swimming across a river", "Jumping over a chasm"]
	},
	{
		name: "Deception",
		ability: "Cha",
		description: "Lying and misdirection",
		examples: ["Telling a convincing lie", "Disguising your intentions", "Creating a false identity"]
	},
	{
		name: "History",
		ability: "Int",
		description: "Knowledge of past events and civilizations",
		examples: ["Recalling historical events", "Identifying ancient artifacts", "Understanding political lineages"]
	},
	{
		name: "Insight",
		ability: "Wis",
		description: "Reading people and understanding motives",
		examples: ["Detecting lies", "Understanding someone's mood", "Predicting behavior"]
	},
	{
		name: "Intimidation",
		ability: "Cha",
		description: "Threatening and coercing others",
		examples: ["Forcing information from a prisoner", "Scaring off bandits", "Making threats"]
	},
	{
		name: "Investigation",
		ability: "Int",
		description: "Finding clues and solving puzzles",
		examples: ["Searching for hidden doors", "Analyzing crime scenes", "Solving riddles"]
	},
	{
		name: "Medicine",
		ability: "Wis",
		description: "Treating wounds and diagnosing illness",
		examples: ["Stabilizing a dying character", "Diagnosing diseases", "Performing surgery"]
	},
	{
		name: "Nature",
		ability: "Int",
		description: "Knowledge of animals, plants, and weather",
		examples: ["Identifying poisonous plants", "Predicting weather", "Understanding animal behavior"]
	},
	{
		name: "Perception",
		ability: "Wis",
		description: "Noticing details and hidden things",
		examples: ["Spotting hidden enemies", "Hearing distant sounds", "Noticing important details"]
	},
	{
		name: "Performance",
		ability: "Cha",
		description: "Entertaining others through art",
		examples: ["Playing musical instruments", "Acting or storytelling", "Dancing or singing"]
	},
	{
		name: "Persuasion",
		ability: "Cha",
		description: "Convincing others through charm",
		examples: ["Negotiating prices", "Convincing guards", "Making diplomatic agreements"]
	},
	{
		name: "Religion",
		ability: "Int",
		description: "Knowledge of deities and religious practices",
		examples: ["Identifying religious symbols", "Understanding divine magic", "Knowing religious customs"]
	},
	{
		name: "Sleight of Hand",
		ability: "Dex",
		description: "Manual dexterity and pickpocketing",
		examples: ["Picking pockets", "Palming objects", "Performing magic tricks"]
	},
	{
		name: "Stealth",
		ability: "Dex",
		description: "Moving unseen and unheard",
		examples: ["Sneaking past guards", "Hiding in shadows", "Moving silently"]
	},
	{
		name: "Survival",
		ability: "Wis",
		description: "Tracking, foraging, and wilderness navigation",
		examples: ["Following tracks", "Finding food and water", "Navigating wilderness"]
	}
];

// ✅ HELPER FUNCTIONS
export function getSkillByName(name: string): Skill | undefined {
	return ALL_SKILLS.find(skill => skill.name === name);
}

export function formatSkillWithAbility(skillName: string): string {
	const skill = getSkillByName(skillName);
	return skill ? `${skill.name} (${skill.ability})` : skillName;
}

export function getSkillsByAbility(ability: string): Skill[] {
	return ALL_SKILLS.filter(skill => skill.ability === ability);
}

export function detectSkillOverlaps(classSkills: string[], backgroundSkills: string[]): string[] {
	return classSkills.filter(skill => backgroundSkills.includes(skill));
}
