// src/lib/data/backgrounds.ts

export interface Background {
	name: string;
	emoji: string;
	description: string;
	skillProficiencies: string[];
	languages: number;
	tools: string[];
	equipment: string[];
	feature: string;
	personalityTraits: string[];
	ideals: string[];
	bonds: string[];
	flaws: string[];
}

// D&D 5E BACKGROUNDS - comprehensive background information
export const BACKGROUNDS: Background[] = [
	{
		name: "Acolyte",
		emoji: "⛪",
		description: "You have spent your life in service to a temple and its gods.",
		skillProficiencies: ["Insight", "Religion"],
		languages: 2,
		tools: [],
		equipment: ["Holy symbol", "Prayer book", "Incense", "Vestments", "Belt pouch with 15 gp"],
		feature: "Shelter of the Faithful",
		personalityTraits: [
			"I idolize a particular hero of my faith.",
			"I can find common ground between the fiercest enemies."
		],
		ideals: [
			"Tradition: The ancient traditions must be preserved.",
			"Charity: I always try to help those in need."
		],
		bonds: [
			"I would die to recover an ancient relic of my faith.",
			"I owe my life to the priest who took me in when my parents died."
		],
		flaws: [
			"I judge others harshly, and myself even more severely.",
			"I put too much trust in those who wield power within my temple's hierarchy."
		]
	},
	{
		name: "Criminal",
		emoji: "🗡️",
		description: "You are an experienced criminal with a history of breaking the law.",
		skillProficiencies: ["Deception", "Stealth"],
		languages: 0,
		tools: ["One type of gaming set", "Thieves' tools"],
		equipment: ["Crowbar", "Dark common clothes with hood", "Belt pouch with 15 gp"],
		feature: "Criminal Contact",
		personalityTraits: [
			"I always have a plan for what to do when things go wrong.",
			"I am always calm, no matter what the situation."
		],
		ideals: [
			"Honor: I don't steal from others in the trade.",
			"Freedom: Chains are meant to be broken."
		],
		bonds: [
			"I'm trying to pay off an old debt I owe to a generous benefactor.",
			"My ill-gotten gains go to support my family."
		],
		flaws: [
			"When I see something valuable, I can't think about anything but how to steal it.",
			"I have a 'tell' that reveals when I'm lying."
		]
	},
	{
		name: "Folk Hero",
		emoji: "🛡️",
		description: "You come from humble origins but are destined for greater things.",
		skillProficiencies: ["Animal Handling", "Survival"],
		languages: 0,
		tools: ["One type of artisan's tools", "Vehicles (land)"],
		equipment: ["Artisan's tools", "Shovel", "Set of artisan clothes", "Belt pouch with 10 gp"],
		feature: "Rustic Hospitality",
		personalityTraits: [
			"I judge people by their actions, not their words.",
			"If someone is in trouble, I'm always ready to lend help."
		],
		ideals: [
			"Respect: People deserve to be treated with dignity.",
			"Fairness: No one should get preferential treatment."
		],
		bonds: [
			"I have a family, but I have no idea where they are.",
			"I worked the land, I love the land, and I will protect the land."
		],
		flaws: [
			"The tyrant who rules my land will stop at nothing to see me killed.",
			"I'm convinced of the significance of my destiny."
		]
	},
	{
		name: "Noble",
		emoji: "👑",
		description: "You understand wealth, power, and privilege from birth.",
		skillProficiencies: ["History", "Persuasion"],
		languages: 1,
		tools: ["One type of gaming set"],
		equipment: ["Signet ring", "Scroll of pedigree", "Fine clothes", "Purse with 25 gp"],
		feature: "Position of Privilege",
		personalityTraits: [
			"My eloquent flattery makes everyone I talk to feel wonderful.",
			"Despite my noble birth, I do not place myself above other folk."
		],
		ideals: [
			"Respect: Respect is due to me because of my position.",
			"Noble Obligation: It is my duty to protect those beneath me."
		],
		bonds: [
			"I will face any challenge to win the approval of my family.",
			"My house's alliance with another noble family must be sustained."
		],
		flaws: [
			"I secretly believe that everyone is beneath me.",
			"I hide a truly scandalous secret that could ruin my family forever."
		]
	},
	{
		name: "Sage",
		emoji: "📚",
		description: "You spent years learning the lore of the multiverse.",
		skillProficiencies: ["Arcana", "History"],
		languages: 2,
		tools: [],
		equipment: ["Ink and quill", "Small knife", "Letter from colleague", "Common clothes", "Belt pouch with 10 gp"],
		feature: "Researcher",
		personalityTraits: [
			"I use polysyllabic words that convey the impression of great erudition.",
			"I've read every book in the world's greatest libraries."
		],
		ideals: [
			"Knowledge: The path to power and self-improvement is through knowledge.",
			"Beauty: What is beautiful points us beyond itself toward what is true."
		],
		bonds: [
			"The workshop where I learned my trade is the most important place in the world to me.",
			"I sold my soul for knowledge. I hope to do great deeds and win it back."
		],
		flaws: [
			"I am horribly, horribly awkward in social situations.",
			"I overlook obvious solutions in favor of complicated ones."
		]
	},
	{
		name: "Soldier",
		emoji: "⚔️",
		description: "You had a military career and are trained in combat and tactics.",
		skillProficiencies: ["Athletics", "Intimidation"],
		languages: 0,
		tools: ["One type of gaming set", "Vehicles (land)"],
		equipment: ["Insignia of rank", "Trophy from fallen enemy", "Common clothes", "Belt pouch with 10 gp"],
		feature: "Military Rank",
		personalityTraits: [
			"I'm always respectful and polite.",
			"I face problems head-on. A simple, direct solution is the best path to success."
		],
		ideals: [
			"Greater Good: Our lot is to lay down our lives in defense of others.",
			"Responsibility: I do what I must and obey just authority."
		],
		bonds: [
			"I would still lay down my life for the people I served with.",
			"Someone saved my life on the battlefield. To this day, I will never leave a friend behind."
		],
		flaws: [
			"The monstrous enemy we faced in battle still leaves me quivering with fear.",
			"I have little respect for anyone who is not a proven warrior."
		]
	},
	{
		name: "Charlatan",
		emoji: "🎭",
		description: "You have always had a way with people and know what makes them tick.",
		skillProficiencies: ["Deception", "Sleight of Hand"],
		languages: 0,
		tools: ["Disguise kit", "Forgery kit"],
		equipment: ["Disguise kit", "Forgery kit", "Signet ring of fictional person", "Fine clothes", "Belt pouch with 15 gp"],
		feature: "False Identity",
		personalityTraits: [
			"I fall in and out of love easily, and am always pursuing someone.",
			"I have a joke for every occasion, especially occasions where humor is inappropriate."
		],
		ideals: [
			"Independence: I am a free spirit—no one tells me what to do.",
			"Fairness: I never target people who can't afford to lose a few coins."
		],
		bonds: [
			"I fleeced the wrong person and must work to ensure that this individual never crosses paths with me.",
			"I owe everything to my mentor—a horrible person who's probably rotting in jail somewhere."
		],
		flaws: [
			"I can't resist a pretty face.",
			"I'm always in debt. I spend my ill-gotten gains on decadent luxuries faster than I bring them in."
		]
	},
	{
		name: "Entertainer",
		emoji: "🎪",
		description: "You thrive in front of an audience and know how to entrance them.",
		skillProficiencies: ["Acrobatics", "Performance"],
		languages: 0,
		tools: ["Disguise kit", "One type of musical instrument"],
		equipment: ["Musical instrument", "Favor of an admirer", "Costume", "Belt pouch with 15 gp"],
		feature: "By Popular Demand",
		personalityTraits: [
			"I know a story relevant to almost every situation.",
			"Whenever I come to a new place, I collect local rumors and spread gossip."
		],
		ideals: [
			"Beauty: When I perform, I make the world better than it was.",
			"Tradition: The stories, legends, and songs of the past must never be forgotten."
		],
		bonds: [
			"My instrument is my most treasured possession.",
			"I want to be famous, whatever it takes."
		],
		flaws: [
			"I'll do anything to win fame and renown.",
			"A scandal prevents me from ever going home again."
		]
	},
	{
		name: "Guild Artisan",
		emoji: "🔨",
		description: "You are a member of an artisan's guild, skilled in a particular craft.",
		skillProficiencies: ["Insight", "Persuasion"],
		languages: 1,
		tools: ["One type of artisan's tools"],
		equipment: ["Artisan's tools", "Letter of introduction from guild", "Traveler's clothes", "Belt pouch with 15 gp"],
		feature: "Guild Membership",
		personalityTraits: [
			"I believe that anything worth doing is worth doing right.",
			"I'm a snob who looks down on those who can't appreciate fine art."
		],
		ideals: [
			"Community: It is the duty of all civilized people to strengthen the bonds of community.",
			"Generosity: My talents were given to me so that I could use them to benefit the world."
		],
		bonds: [
			"The workshop where I learned my trade is the most important place in the world to me.",
			"I owe my guild a great debt for forging me into the person I am today."
		],
		flaws: [
			"I'll do anything to get my hands on something rare or priceless.",
			"I'm quick to assume that someone is trying to cheat me."
		]
	},
	{
		name: "Hermit",
		emoji: "🏔️",
		description: "You lived in seclusion, seeking enlightenment or hiding from the world.",
		skillProficiencies: ["Medicine", "Religion"],
		languages: 1,
		tools: ["Herbalism kit"],
		equipment: ["Herbalism kit", "Scroll case with spiritual writings", "Winter blanket", "Belt pouch with 5 gp"],
		feature: "Discovery",
		personalityTraits: [
			"I've been isolated for so long that I rarely speak.",
			"I am utterly serene, even in the face of disaster."
		],
		ideals: [
			"Greater Good: My gifts are meant to be shared with all, not used for my own benefit.",
			"Logic: Emotions must not cloud our logical thinking."
		],
		bonds: [
			"Nothing is more important than the other members of my hermitage.",
			"I entered seclusion to hide from the ones who might still be hunting me."
		],
		flaws: [
			"Now that I've returned to the world, I enjoy its delights a little too much.",
			"I harbor dark, bloodthirsty thoughts that my isolation failed to quell."
		]
	},
	{
		name: "Outlander",
		emoji: "🌲",
		description: "You grew up in the wilds, far from civilization and its comforts.",
		skillProficiencies: ["Athletics", "Survival"],
		languages: 1,
		tools: ["One type of musical instrument"],
		equipment: ["Staff", "Hunting trap", "Traveler's clothes", "Belt pouch with 10 gp"],
		feature: "Wanderer",
		personalityTraits: [
			"I'm driven by a wanderlust that led me away from home.",
			"I watch over my friends as if they were a litter of newborn pups."
		],
		ideals: [
			"Change: Life is like the seasons, in constant change.",
			"Greater Good: It is each person's responsibility to make the most happiness for the whole tribe."
		],
		bonds: [
			"My family, clan, or tribe is the most important thing in my life.",
			"An injury to the unspoiled wilderness of my home is an injury to me."
		],
		flaws: [
			"I am too enamored of ale, wine, and other intoxicants.",
			"There's no room for caution in a life lived to the fullest."
		]
	},
	{
		name: "Sailor",
		emoji: "⚓",
		description: "You spent years sailing the seas, learning the ways of the ocean.",
		skillProficiencies: ["Athletics", "Perception"],
		languages: 0,
		tools: ["Navigator's tools", "Vehicles (water)"],
		equipment: ["Belaying pin", "50 feet of silk rope", "Lucky charm", "Common clothes", "Belt pouch with 10 gp"],
		feature: "Ship's Passage",
		personalityTraits: [
			"I'm always calm, no matter what the situation.",
			"I enjoy sailing into new ports and making new friends."
		],
		ideals: [
			"Respect: The thing that keeps a ship together is mutual respect.",
			"Fairness: We all do our duty, no matter what."
		],
		bonds: [
			"I was cheated out of my fair share of the profits.",
			"I hope to find my lost crewmates."
		],
		flaws: [
			"I follow orders, even if I don't agree with them.",
			"I'll never say no to a drink."
		]
	}
];

// HELPER FUNCTIONS
export function getBackgroundByName(name: string): Background | undefined {
	return BACKGROUNDS.find(bg => bg.name === name);
}

export function formatSkillList(skills: string[]): string {
	return skills.join(", ");
}
