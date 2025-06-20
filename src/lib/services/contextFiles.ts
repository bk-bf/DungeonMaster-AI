// src/lib/services/contextFiles.ts
import { browser } from '$app/environment';
import type { ContextFile, EntityExtraction, PlayerPreferences } from '$lib/types';

class ContextFileManager {
	private files: Map<string, ContextFile> = new Map();

	deleteFile(fileId: string) {
		this.files.delete(fileId);
		this.saveToStorage();
	}

	// Import character data from JSON
	async importCharacterData(jsonData: any): Promise<boolean> {
		try {
			if (jsonData.contextFiles && Array.isArray(jsonData.contextFiles)) {
				// Clear existing files
				this.files.clear();

				// Import context files
				jsonData.contextFiles.forEach((file: any) => {
					this.files.set(file.id, {
						...file,
						lastUpdated: new Date(file.lastUpdated)
					});
				});

				this.saveToStorage();
				return true;
			}
			return false;
		} catch (error) {
			console.error('Failed to import character data:', error);
			return false;
		}
	}

	// Import campaign data
	async importCampaignData(jsonData: any): Promise<any> {
		try {
			if (jsonData.campaign) {
				return {
					campaign: jsonData.campaign,
					playerPreferences: jsonData.playerPreferences || null
				};
			}
			return null;
		} catch (error) {
			console.error('Failed to import campaign data:', error);
			return null;
		}
	}
	// ✅ FIX: Accept actual character data instead of hardcoded values
	async initializeCharacterFiles(characterName: string, characterClass: string = 'Fighter', characterBackground: string = 'Folk Hero') {
		const defaultFiles: ContextFile[] = [
			{
				id: 'character_sheet',
				filename: 'character_sheet.md',
				content: this.generateCharacterSheetMD(characterName, characterClass, characterBackground), // ✅ Pass actual values
				tags: ['character', 'stats', 'abilities', 'core'],
				lastUpdated: new Date(),
				priority: 10
			},
			{
				id: 'character_progression',
				filename: 'character_progression.md',
				content: this.generateProgressionMD(),
				tags: ['progression', 'experience', 'levels', 'growth'],
				lastUpdated: new Date(),
				priority: 9
			},
			{
				id: 'spell_book',
				filename: 'spell_book.md',
				content: this.generateSpellBookMD(),
				tags: ['spells', 'magic', 'abilities', 'slots'],
				lastUpdated: new Date(),
				priority: 8
			},
			{
				id: 'combat_log',
				filename: 'combat_log.md',
				content: '# Combat History\n\n*No combat encounters yet.*',
				tags: ['combat', 'encounters', 'tactics', 'enemies'],
				lastUpdated: new Date(),
				priority: 7
			},
			{
				id: 'relationships',
				filename: 'relationships.md',
				content: '# NPC Relationships\n\n*No significant relationships yet.*',
				tags: ['npcs', 'relationships', 'social', 'reputation'],
				lastUpdated: new Date(),
				priority: 6
			},
			{
				id: 'quest_log',
				filename: 'quest_log.md',
				content: '# Active Quests\n\n*No active quests.*',
				tags: ['quests', 'objectives', 'goals', 'progress'],
				lastUpdated: new Date(),
				priority: 8
			}
		];


		defaultFiles.forEach(file => {
			this.files.set(file.id, file);
		});

		this.saveToStorage();
	}

	// Extract keywords and entities from player input
	extractEntities(playerInput: string): EntityExtraction {
		const input = playerInput.toLowerCase();

		// Define keyword patterns
		const combatKeywords = ['attack', 'fight', 'spell', 'weapon', 'damage', 'hit', 'cast', 'shoot'];
		const socialKeywords = ['talk', 'persuade', 'intimidate', 'deceive', 'charm', 'negotiate'];
		const explorationKeywords = ['search', 'investigate', 'explore', 'examine', 'look', 'move'];
		const magicKeywords = ['spell', 'magic', 'cast', 'enchant', 'ritual', 'arcane'];

		// Extract keywords
		const keywords: string[] = [];
		const words = input.split(/\s+/);

		words.forEach(word => {
			if (combatKeywords.includes(word)) keywords.push(word);
			if (socialKeywords.includes(word)) keywords.push(word);
			if (explorationKeywords.includes(word)) keywords.push(word);
			if (magicKeywords.includes(word)) keywords.push(word);
		});

		// Extract entities (spells, NPCs, items, etc.)
		const entities: string[] = [];

		// Spell detection
		const spellPatterns = ['fire', 'healing', 'magic missile', 'fireball', 'cure wounds'];
		spellPatterns.forEach(spell => {
			if (input.includes(spell)) entities.push(`spell:${spell}`);
		});

		// NPC detection (would be dynamic based on campaign)
		const npcPatterns = ['henrik', 'mira', 'guard', 'merchant', 'bartender'];
		npcPatterns.forEach(npc => {
			if (input.includes(npc)) entities.push(`npc:${npc}`);
		});

		// Determine action type
		let actionType: EntityExtraction['actionType'] = 'general';
		if (combatKeywords.some(k => input.includes(k))) actionType = 'combat';
		else if (socialKeywords.some(k => input.includes(k))) actionType = 'social';
		else if (explorationKeywords.some(k => input.includes(k))) actionType = 'exploration';
		else if (magicKeywords.some(k => input.includes(k))) actionType = 'magic';

		return { keywords, entities, actionType };
	}

	// Retrieve relevant context files based on extracted entities
	retrieveRelevantContext(extraction: EntityExtraction): ContextFile[] {
		const relevantFiles: ContextFile[] = [];
		const { keywords, entities, actionType } = extraction;

		// Always include character sheet
		const characterSheet = this.files.get('character_sheet');
		if (characterSheet) relevantFiles.push(characterSheet);

		// Include files based on action type
		switch (actionType) {
			case 'combat':
				this.addFileByTags(relevantFiles, ['combat', 'spells', 'abilities']);
				break;
			case 'magic':
				this.addFileByTags(relevantFiles, ['spells', 'magic', 'abilities']);
				break;
			case 'social':
				this.addFileByTags(relevantFiles, ['relationships', 'npcs', 'social']);
				break;
			case 'exploration':
				this.addFileByTags(relevantFiles, ['quest_log', 'exploration']);
				break;
		}

		// Include files based on specific entities
		entities.forEach(entity => {
			if (entity.startsWith('spell:')) {
				this.addFileByTags(relevantFiles, ['spells', 'magic']);
			}
			if (entity.startsWith('npc:')) {
				this.addFileByTags(relevantFiles, ['relationships', 'npcs']);
			}
		});

		// Sort by priority and limit to top 5 most relevant
		return relevantFiles
			.sort((a, b) => b.priority - a.priority)
			.slice(0, 5);
	}

	private addFileByTags(relevantFiles: ContextFile[], tags: string[]) {
		this.files.forEach(file => {
			if (tags.some(tag => file.tags.includes(tag)) &&
				!relevantFiles.find(rf => rf.id === file.id)) {
				relevantFiles.push(file);
			}
		});
	}

	// Update character progression based on game events
	updateCharacterProgression(event: string, details: any) {
		const progressionFile = this.files.get('character_progression');
		if (!progressionFile) return;

		const timestamp = new Date().toISOString();
		let newContent = '';

		switch (event) {
			case 'spell_cast':
				newContent = `\n## ${timestamp}\n**Spell Cast**: ${details.spellName}\n- Spell Level: ${details.level}\n- Target: ${details.target}\n- Result: ${details.result}\n`;
				break;
			case 'combat_victory':
				newContent = `\n## ${timestamp}\n**Combat Victory**: ${details.enemy}\n- Experience Gained: ${details.xp}\n- Tactics Used: ${details.tactics}\n`;
				break;
			case 'social_interaction':
				newContent = `\n## ${timestamp}\n**Social Interaction**: ${details.npc}\n- Interaction Type: ${details.type}\n- Outcome: ${details.outcome}\n`;
				break;
		}

		progressionFile.content += newContent;
		progressionFile.lastUpdated = new Date();
		this.saveToStorage();
	}

	// ✅ FIX: Update to accept actual character data
	private generateCharacterSheetMD(characterName: string, characterClass: string, characterBackground: string): string {
		return `# ${characterName} - Character Sheet 📜

## **Basic Information** ℹ️
- **Name:** ${characterName}
- **Race:** Human (Variant) 👤
- **Class:** ${characterClass} ⚔️
- **Level:** 1 ⭐
- **Current XP:** 0/300
- **Background:** ${characterBackground} 🎭
- **Alignment:** Chaotic Good 😇
- **Age:** 25
- **Height:** 5'10"
- **Weight:** 165 lbs
- **Current Gold:** 15 gp 💰

## **Ability Scores** 💪
| Ability | Score | Modifier |
|---------|-------|----------|
| **Strength** 💪 | 12 | +1 |
| **Dexterity** 🏃 | 16 | +3 |
| **Constitution** ❤️ | 14 | +2 |
| **Intelligence** 🧠 | 13 | +1 |
| **Wisdom** 👁️ | 12 | +1 |
| **Charisma** 💬 | 10 | +0 |

## **Combat Stats** ⚔️
- **Armor Class:** 13 🛡️ (Leather Armor + Dex)
- **Hit Points:** 10 ❤️
- **Speed:** 30 feet 🏃‍♂️
- **Proficiency Bonus:** +2 ✨

## **Saving Throws** 🎲
- **Dexterity:** +5 🏃 (Proficient)
- **Intelligence:** +3 🧠 (Proficient)

## **Skills** 🎯
- **Acrobatics (Dex):** +3 🤸‍♂️
- **Investigation (Int):** +5 🔍 (Proficient + Expertise)
- **Perception (Wis):** +3 👀 (Proficient)
- **Sleight of Hand (Dex):** +5 🤲 (Proficient)
- **Stealth (Dex):** +7 🥷 (Proficient + Expertise)

## **Languages** 🗣️
- **Common**
- **Thieves' Cant** 🤫

## **Features & Traits** ⭐

### **Rogue Features:** 🗡️
- **Expertise:** Investigation 🔍, Stealth 🥷 (double proficiency bonus)
- **Sneak Attack:** **1d6** damage ⚡
- **Thieves' Cant:** Secret language of rogues and criminals 🤫

### **${characterBackground} Features:** 🎭
- **Background Feature:** Varies by background 🛠️

## **Equipment** 🎒

### **Weapons:** ⚔️
- Shortsword 🗡️ (1d6+3 piercing, finesse)
- Shortbow + 20 arrows 🏹 (1d6+3 piercing, range 80/320)
- 2 daggers 🗡️ (1d4+3 piercing, finesse, light, thrown 20/60)

### **Armor & Protection:** 🛡️
- Leather armor 🦺 (AC 11 + Dex modifier)

### **Adventuring Gear:** 🎒
- **Burglar's pack** 🎒 (backpack, bag of 1000 ball bearings, 10 feet of string, bell, 5 candles, crowbar, hammer, 10 pitons, hooded lantern, 2 flasks of oil, 5 days rations, tinderbox, waterskin, 50 feet hempen rope)
- **Thieves' tools** 🔧
- **Leather armor** 🦺

## **Personality Traits** 🎭
- **Trait 1:** I always have a plan for what to do when things go wrong 🧠
- **Trait 2:** I am always calm, no matter what the situation 😌

## **Ideals** 💡
- **Freedom:** Chains are meant to be broken, as are those who would forge them ⛓️‍💥

## **Bonds** 💖
- **My tools:** My tools are symbols of my past life, and I carry them so that I will never forget my roots 🔧

## **Flaws** ⚠️
- **Trust:** I have trouble trusting in my allies 🤝❌

*Last Updated: ${new Date().toISOString()}*`;
	}

	private generateProgressionMD(): string {
		return `# Character Progression & Growth

## Experience & Leveling
- **Current Level:** 1
- **Current XP:** 0/300
- **Next Level:** 2

## Milestone Achievements
*No achievements yet - will be updated as character progresses.*

## Skills Development
*Character skills will be tracked here as they improve.*

## Story Progression
*Key story moments and character development will be recorded here.*

*Last Updated: ${new Date().toISOString()}*`;
	}

	private generateSpellBookMD(): string {
		return `# Spell Book & Abilities

## Known Spells
*No spells known yet - will be updated as character learns magic.*

## Spell Slots
*No spell slots available - will be updated when character gains spellcasting.*

## Special Abilities
### Sneak Attack
- **Damage**: 1d6 (Level 1)
- **Conditions**: Advantage on attack or ally within 5 feet of target

### Thieves' Cant
- Secret language known by rogues and criminals

*Last Updated: ${new Date().toISOString()}*`;

	}

	upgradeCharacterSheetFormat(characterId: string = 'character_sheet') {
		const file = this.files.get(characterId);
		if (!file) return;

		// Parse existing data
		const content = file.content;
		const name = content.match(/# (.+?) - Character Sheet/)?.[1] || 'Unknown';
		const classMatch = content.match(/\*\*Class\*\*:\s*(.+)/)?.[1] || 'Fighter';
		const backgroundMatch = content.match(/\*\*Background\*\*:\s*(.+)/)?.[1] || 'Folk Hero';

		// Generate new format
		const newContent = this.generateCharacterSheetMD(name, classMatch, backgroundMatch);

		// Update the file
		file.content = newContent;
		file.lastUpdated = new Date();
		this.saveToStorage();
	}

	// Save files to localStorage
	private saveToStorage() {
		if (browser) {
			const filesArray = Array.from(this.files.values());
			localStorage.setItem('dungeonmaster-context-files', JSON.stringify(filesArray));
		}
	}

	// Load files from localStorage
	loadFromStorage() {
		if (browser) {
			try {
				const stored = localStorage.getItem('dungeonmaster-context-files');
				if (stored) {
					const filesArray: ContextFile[] = JSON.parse(stored);
					this.files.clear();
					filesArray.forEach(file => {
						this.files.set(file.id, file);
					});
				}
			} catch (error) {
				console.error('Failed to load context files:', error);
			}
		}
	}

	// Get all files for debugging
	getAllFiles(): ContextFile[] {
		return Array.from(this.files.values());
	}

	// Export files as .md downloads
	exportFile(fileId: string) {
		const file = this.files.get(fileId);
		if (!file) return;

		const blob = new Blob([file.content], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = file.filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	extractCharacterFromContextFiles(contextFiles: ContextFile[]): any {
		const characterSheet = contextFiles.find(file => file.id === 'character_sheet');

		if (!characterSheet) {
			return {
				name: 'Unknown Adventurer',
				class: 'Unknown Class',
				level: 'Unknown Level',
				background: 'Unknown Background',
			};
		}

		const content = characterSheet.content;

		// ✅ Use the same parsing logic as Sidebar
		const nameMatch = content.match(/\*\*Name\*\*:\s*(.+)/);
		const classMatch = content.match(/\*\*Class\*\*:\s*(.+?)(?:\s*⚔️|\s*🗡️|\s*🏹|\s*📚)/);
		const levelMatch = content.match(/\*\*Level\*\*:\s*(\d+)/);
		const backgroundMatch = content.match(/\*\*Background\*\*:\s*(.+?)(?:\s*🎭|\s*👤)/);

		return {
			name: nameMatch ? nameMatch[1].trim() : 'Unknown Adventurer',
			class: classMatch ? classMatch[1].trim() : 'Unknown Class',
			level: levelMatch ? parseInt(levelMatch[1]) : 1,
			background: backgroundMatch ? backgroundMatch[1].trim() : 'Unknown Background',
		}
	}
}
export const contextFileManager = new ContextFileManager();