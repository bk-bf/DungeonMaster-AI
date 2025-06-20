// src/lib/services/prompts.ts
import type { ContextFile, EntityExtraction, CampaignContext, PlayerPreferences } from '$lib/types';

export function buildDungeonMasterPrompt(playerAction: string, context: CampaignContext): string {
	// Build context files section
	const contextFilesSection = context.contextFiles ?
		`\nRELEVANT CONTEXT FILES:
${context.contextFiles.map(file => `
### ${file.filename}
${file.content}
`).join('\n')}` : '';

	const entitySection = context.entityExtraction ?
		`\nPLAYER ACTION ANALYSIS:
- Keywords: ${context.entityExtraction.keywords.join(', ')}
- Entities: ${context.entityExtraction.entities.join(', ')}
- Action Type: ${context.entityExtraction.actionType}` : '';

	// ✅ FIXED: Extract character info from context files instead of hardcoded fallbacks
	const characterInfo = extractCharacterFromContextFiles(context.contextFiles || []);

	const playerPreferencesSection = context.playerPreferences ? `
PLAYER PREFERENCES (tailor narrative accordingly):
- Favorite Genres: ${context.playerPreferences.favoriteGenres?.join(', ') || 'Not specified'}
- Narrative Style: ${context.playerPreferences.preferredNarrativeStyle || 'Not specified'}
- Preferred Themes: ${context.playerPreferences.preferredThemes?.join(', ') || 'Not specified'}
- Age: ${context.playerPreferences.age || 'Not specified'}
- Favorite Books: ${context.playerPreferences.favoriteBooks || 'Not specified'}
- Favorite Movies: ${context.playerPreferences.favoriteMovies || 'Not specified'}
- Favorite Games: ${context.playerPreferences.favoriteGames || 'Not specified'}

IMPORTANT: Tailor your narrative to match these specific preferences.` : 'Standard D&D adventure style';

	return `You are an expert Dungeon Master running a D&D 5e campaign. You create engaging, immersive narratives with the quality and depth of professional storytelling.

CRITICAL FORMATTING REQUIREMENTS:
- Use markdown formatting with ## for scene headers (be creative - use location names, dramatic moments, or atmospheric descriptions)
- Add ONE relevant emoji to scene headers only
- *Use cursive (italic) formatting for all NPCs and locations*
- Selectively add emojis ONLY to major/important NPCs and significant locations (maximum 2-3 per response)
- End with natural action encouragement that flows with the narrative
- Vary your call-to-action style - don't use the same format every time

CHARACTER CONTEXT (from character sheet):
Name: ${characterInfo.name}
Class: ${characterInfo.class}
Level: ${characterInfo.level}
Background: ${characterInfo.background}
Hit Points: ${characterInfo.hitPoints}
Armor Class: ${characterInfo.armorClass}
Current Status: ${characterInfo.status}
Equipment: ${characterInfo.equipment}
Special Abilities: ${characterInfo.abilities}

CAMPAIGN STATE:
Current Location: ${context.currentLocation || 'Starting area'}
Recent Events: ${context.recentHistory.length > 0 ? 'See recent campaign events below' : 'Beginning of adventure'}

RECENT CAMPAIGN EVENTS:
${context.recentHistory.slice(-3).join('\n')}

${contextFilesSection}

${entitySection}

${playerPreferencesSection}

CURRENT PLAYER ACTION: "${playerAction}"

IMPORTANT: Use the character sheet information and context files to inform your response. Reference the character's specific abilities, equipment, and status naturally in your narrative. The character information comes directly from their character sheet and should be treated as authoritative.

Remember: 
- Maximum 2-3 emojis per response (excluding header and call-to-action)
- Only important NPCs and significant locations get emojis
- Use cursive (italic) for ALL NPCs/locations regardless of emoji status
- Complete all thoughts - never cut off mid-sentence
- Make each response feel unique and natural, not formulaic`;
}

// ✅ Helper function to extract character info from context files
function extractCharacterFromContextFiles(contextFiles: ContextFile[]): any {
	const characterSheet = contextFiles.find(file => file.id === 'character_sheet');

	if (!characterSheet) {
		return {
			name: 'Unknown Adventurer',
			class: 'Unknown Class',
			level: 'Unknown Level',
			background: 'Unknown Background',
			hitPoints: 'Unknown',
			armorClass: 'Unknown',
			status: 'Unknown',
			equipment: 'Unknown',
			abilities: 'Unknown'
		};
	}

	// Parse the markdown character sheet
	const content = characterSheet.content;

	return {
		name: extractValue(content, /\*\*Name\*\*:\s*(.+)/) || 'Unknown Adventurer',
		class: extractValue(content, /\*\*Class\*\*:\s*(.+)/) || 'Unknown Class',
		level: extractValue(content, /\*\*Level\*\*:\s*(\d+)/) || 'Unknown Level',
		background: extractValue(content, /\*\*Background\*\*:\s*(.+)/) || 'Unknown Background',
		hitPoints: extractValue(content, /\*\*Hit Points\*\*:\s*(.+)/) || 'Unknown',
		armorClass: extractValue(content, /\*\*Armor Class\*\*:\s*(.+)/) || 'Unknown',
		status: 'Active', // Could be extracted from character sheet
		equipment: extractEquipment(content) || 'Basic adventuring gear',
		abilities: extractAbilities(content) || 'Standard class abilities'
	};
}

function extractValue(content: string, regex: RegExp): string | null {
	const match = content.match(regex);
	return match ? match[1].trim() : null;
}

function extractEquipment(content: string): string {
	const equipmentSection = content.match(/## Equipment\s*([\s\S]*?)(?=##|$)/);
	if (equipmentSection) {
		return equipmentSection[1].trim().replace(/\n/g, ', ').replace(/- /g, '');
	}
	return 'Basic equipment';
}

function extractAbilities(content: string): string {
	const abilitiesSection = content.match(/## Special Abilities\s*([\s\S]*?)(?=##|$)/);
	if (abilitiesSection) {
		return abilitiesSection[1].trim().replace(/\n/g, ', ').replace(/- /g, '');
	}
	return 'Standard abilities';
}

// ✅ COLLABORATIVE CHARACTER CREATION PROMPTS

export function buildCharacterConceptPrompt(playerPreferences: any): string {
	return `🎭 **Welcome to Collaborative Character Creation!**

I'm excited to help you create the perfect D&D character for your solo adventure! Based on your preferences, we'll build a hero that matches exactly what you love about storytelling.

**Your Preferences:**
- Favorite Stories: ${playerPreferences.favoriteMedia || 'Not specified'}
- Hero Type: ${playerPreferences.heroType || 'Not specified'}
- Age: ${playerPreferences.age || 'Not specified'}

Let's start with the big picture: **What kind of story do you want your character to live?**

Here are some directions we could explore:

🗡️ **The Reluctant Hero** - Someone thrust into adventure who must find their courage
⚔️ **The Seeking Warrior** - A fighter on a quest to prove themselves or find redemption  
🔮 **The Mysterious Scholar** - A magic user uncovering ancient secrets
🏹 **The Skilled Survivor** - A rogue or ranger who relies on wit and skill
✨ **Something Completely Different** - Tell me your own vision!

What resonates with you? Or describe the kind of character story that excites you most!`;
}

export function buildBackgroundDevelopmentPrompt(
	playerResponse: string,
	characterConcept: string,
	playerPreferences: any
): string {
	return `Excellent choice! I love the direction of "${characterConcept}".

Now let's dive deeper into your character's **past and motivations**:

**Character Concept:** ${characterConcept}

To make this character feel real and personal, I need to understand their history:

🏠 **Origins**: Where did they come from? A small village, bustling city, or somewhere more exotic?

💔 **The Catalyst**: What event changed everything for them? What pushed them toward adventure?

👥 **Important People**: Who matters most to them? Family, mentors, friends, or even enemies?

🎯 **Personal Stakes**: What do they hope to achieve or protect?

💪 **Skills & Abilities**: How did they develop their capabilities? Through training, necessity, or natural talent?

Share your thoughts on any or all of these elements. Don't worry about D&D mechanics yet - just tell me the **story** of who this person is and what drives them!

**Player Response:** "${playerResponse}"

Based on what you've shared, I'm already seeing some exciting possibilities for your character's background...`;
}

export function buildWorldBuildingPrompt(
	playerResponse: string,
	characterConcept: string,
	backgroundDetails: string,
	playerPreferences: any
): string {
	return `Perfect! Your character is really coming to life:

**Character:** ${characterConcept}
**Background:** ${backgroundDetails}

Now let's create the **world** where their story begins:

🌍 **Setting Tone**: Based on your character's story, what kind of world fits them?
- Gritty and realistic with political intrigue?
- High fantasy with magic and wonder?
- Dark and mysterious with hidden threats?
- Something else entirely?

🏰 **Starting Location**: Where should your adventure begin?
- Your character's hometown facing a crisis?
- A crossroads where opportunity calls?
- A place connected to their past?

⚔️ **Threats & Mysteries**: What dangers or mysteries exist in this world?
- Ancient evils stirring?
- Political corruption?
- Personal vendettas?
- Unexplored frontiers?

👑 **Important NPCs**: Who are the key people in this world?
- Allies who might help your character?
- Enemies from their past?
- New faces with their own agendas?

Tell me what kind of world excites you for this character's story! I'll weave everything together into the perfect starting scenario.

**Your Latest Input:** "${playerResponse}"`;
}

export function buildIntegrationPrompt(collaborativeData: any): string {
	return `🎉 **Character & World Creation Complete!**

Let me weave everything together into your complete character and starting scenario:

**Character Summary:**
${collaborativeData.characterConcept}

**Background:**
${collaborativeData.backgroundDetails}

**World Setting:**
${collaborativeData.worldElements}

Now I'll create:
1. 📋 **Complete Character Sheet** with D&D 5e stats
2. 🌍 **World Overview** with key locations and NPCs
3. 🎬 **Opening Scene** that launches your adventure

This will take just a moment to process all our collaborative work...

*[System will now generate character sheet, world files, and opening scene]*

Ready to begin your epic adventure? Your character's story is about to unfold!`;
}

// ✅ COLLABORATIVE CREATION ORCHESTRATOR
export function buildCollaborativeCreationPrompt(
	playerAction: string,
	campaignState: any
): string {
	const { mode, creationPhase, collaborativeData } = campaignState;

	switch (creationPhase) {
		case 'concept':
			return buildCharacterConceptPrompt(collaborativeData.playerPreferences);

		case 'background':
			return buildBackgroundDevelopmentPrompt(
				playerAction,
				collaborativeData.characterConcept || '',
				collaborativeData.playerPreferences
			);

		case 'world':
			return buildWorldBuildingPrompt(
				playerAction,
				collaborativeData.characterConcept || '',
				collaborativeData.backgroundDetails || '',
				collaborativeData.playerPreferences
			);

		case 'integration':
			return buildIntegrationPrompt(collaborativeData);

		default:
			return buildCharacterConceptPrompt(collaborativeData.playerPreferences);
	}
}

// ✅ PROMPT TYPE DETERMINATION
export function determinePromptType(
	playerAction: string,
	campaignState: any
): 'collaborative_creation' | 'standard_gameplay' {
	if (campaignState.mode === 'character_creation' ||
		campaignState.mode === 'world_building') {
		return 'collaborative_creation';
	}

	return 'standard_gameplay';
}

// ✅ EXISTING PROMPTS (keeping for compatibility)
export function buildCharacterCreationPrompt(playerPreferences: string): string {
	return `You are an expert D&D character creation assistant and narrative designer. Based on the player's preferences, create a compelling character concept that will lead to an engaging campaign.

PLAYER PREFERENCES AND BACKGROUND:
${playerPreferences}

ANALYSIS REQUIREMENTS:
1. Identify core themes the player enjoys from their preferences
2. Create a character concept that embodies these themes
3. Design a compelling backstory with built-in character growth potential
4. Suggest starting class and multiclass potential
5. Create an engaging adventure hook

FORMATTING REQUIREMENTS:
- Use creative markdown headers (not just "Character Profile")
- Include relevant emojis for atmosphere
- Structure organically with natural flow between sections
- End with engaging question that invites player input

NARRATIVE THEMES TO IDENTIFY:
- Growth and transformation patterns
- Mentor/student relationships
- Redemption and second chances
- Hidden potential and awakening power
- Moral complexity and difficult choices
- Found family and deep bonds

Create a character concept that will naturally lead to the type of story this player will love, with clear progression from humble beginnings to potential greatness.`;
}

export function buildCampaignStartPrompt(characterConcept: string, preferences: string): string {
	return `You are a master Dungeon Master beginning a new D&D 5e campaign. Create an engaging opening scene that establishes the world, introduces the character's current situation, and presents the first adventure hook.

CHARACTER CONCEPT:
${characterConcept}

PLAYER PREFERENCES:
${preferences}

OPENING SCENE REQUIREMENTS:
- Start with atmospheric scene description using creative ## header and emojis
- Establish character's current circumstances and emotional state
- Introduce a compelling NPC with a personal request/problem
- Create immediate stakes without time pressure
- Show character's skills/background through environmental details
- End with natural action encouragement woven into the narrative

FORMATTING REQUIREMENTS:
- Creative ## headers that capture the scene's essence
- Rich sensory descriptions (sight, sound, smell, touch)
- *Cursive formatting* for important NPCs, items, and locations
- Dialogue in quotes with distinct character voices
- Natural action suggestions integrated into the story flow
- Varied call-to-action that fits the opening's mood

AVOID FORMULAIC PATTERNS:
- Don't use rigid "Location - Time" headers
- Don't use repetitive "What would you like [character] to do?" phrasing
- Don't create artificial bullet-point lists
- Instead, let action possibilities emerge naturally from the scene description

Create an opening that immediately draws the player into their character's world and presents meaningful choices that feel organic to the narrative.`;
}

export function buildTestPrompt(): string {
	return `You are a Dungeon Master running a D&D campaign. A player says: "I want to explore the mysterious cave entrance."

CRITICAL REQUIREMENTS:
- Write ONLY in second person ("You see...", "You hear...")
- NEVER use casual words like "okay", "alright", "well"
- Include rich sensory details (sight, sound, smell, touch, temperature)
- Create atmospheric tension and mood
- End with a compelling scene, not a question
- 150-200 words maximum
- END with: "You could [action 1], [action 2], or [action 3]. What do you want to do?"

Example action suggestions:
- "explore the area around you carefully"
- "dig into your memory if you recognize the growl"
- "check your equipment for useful items"

Describe what happens as they enter the cave, then provide specific action suggestions.`;
}
