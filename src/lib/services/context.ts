// src/lib/services/context.ts

import { playerPreferencesStore } from '$lib/stores/playerPreferences';
import { get } from 'svelte/store';
import { contextFileManager } from './contextFiles';

import type {
	CampaignContext,
	ContextFile,
	EntityExtraction,
	PlayerPreferences,
	CharacterData,
	Campaign,
	Message
} from '$lib/types';

export class CampaignContextManager {
	//context tonken lenght depricated?
	private maxContextLength = 50000;
	private maxHistoryMessages = 10;

	async buildFullContext(
		playerAction: string,
		campaignHistory: string[],
		character: any,
		playerPreferences?: PlayerPreferences | null  // ✅ Accept both null and undefined
	): Promise<CampaignContext> {

		// Handle both null and undefined
		if (!playerPreferences) {
			const preferencesStore = get(playerPreferencesStore);
			playerPreferences = preferencesStore.preferences || undefined;
		}

		// Extract entities from player input
		const extraction = contextFileManager.extractEntities(playerAction);

		// Retrieve relevant context files
		const relevantFiles = contextFileManager.retrieveRelevantContext(extraction);

		// Build enhanced context with file-based information
		const relevantHistory = this.trimHistory(campaignHistory);

		// Extract dynamic character info from character sheet file
		const characterSheet = relevantFiles.find(f => f.id === 'character_sheet');
		const dynamicCharacter = this.parseCharacterFromMD(characterSheet?.content || '');

		return {
			characterName: dynamicCharacter.name || character?.name || 'Adventurer',
			characterClass: dynamicCharacter.class || character?.class || 'Fighter',
			characterLevel: dynamicCharacter.level || character?.level || 1,
			characterBackground: dynamicCharacter.background || character?.background || 'Folk Hero',
			recentHistory: relevantHistory,
			currentLocation: this.extractCurrentLocation(relevantHistory),
			playerPreferences,
			contextFiles: relevantFiles, // Add relevant files to context
			entityExtraction: extraction // Add extraction info for LLM
		};
	}

	public parseCharacterFromMD(markdown: string): any {
		// Use contextFileManager's parsing logic to avoid duplication
		const dummyFile: ContextFile = {
			id: 'temp',
			filename: 'temp.md',
			content: markdown,
			tags: ['character'],
			lastUpdated: new Date(),
			priority: 10
		};

		return contextFileManager.extractCharacterFromContextFiles([dummyFile]);
	}

	// Update character progression after AI response
	async updateCharacterProgression(playerAction: string, aiResponse: string) {
		const extraction = contextFileManager.extractEntities(playerAction);

		// Detect events that should update character progression
		if (extraction.actionType === 'combat' && aiResponse.includes('victory')) {
			contextFileManager.updateCharacterProgression('combat_victory', {
				enemy: this.extractEnemyFromResponse(aiResponse),
				xp: 50, // Could be dynamic based on enemy
				tactics: extraction.keywords.join(', ')
			});
		}

		if (extraction.entities.some(e => e.startsWith('spell:'))) {
			const spellName = extraction.entities.find(e => e.startsWith('spell:'))?.split(':')[1];
			contextFileManager.updateCharacterProgression('spell_cast', {
				spellName,
				level: 1,
				target: 'enemy',
				result: 'success'
			});
		}
	}

	private extractEnemyFromResponse(response: string): string {
		// Simple enemy extraction - could be more sophisticated
		const enemies = ['goblin', 'orc', 'skeleton', 'wolf', 'bandit'];
		for (const enemy of enemies) {
			if (response.toLowerCase().includes(enemy)) {
				return enemy;
			}
		}
		return 'unknown enemy';
	}

	private trimHistory(history: string[]): string[] {
		if (history.length <= this.maxHistoryMessages) {
			return history;
		}
		return history.slice(-this.maxHistoryMessages);
	}

	private extractCurrentLocation(history: string[]): string {
		// Extract location from the most recent history entries
		const recentEntries = history.slice(-3).join(' ').toLowerCase();

		// Simple location detection - could be enhanced
		const locations = ['tavern', 'forest', 'dungeon', 'castle', 'village', 'cave', 'mountain', 'river'];
		for (const location of locations) {
			if (recentEntries.includes(location)) {
				return location;
			}
		}
		return 'unknown location';
	}

	// Update the generateCharacterFromCollaborativeData method to use the enhanced data
	async generateCharacterFromCollaborativeData(collaborativeData: any): Promise<string> {
		const {
			characterConcept,
			backgroundDetails,
			worldElements,
			playerPreferences
		} = collaborativeData;

		// ✅ Enhanced to use PlayerPreferencesForm data
		const rawCollaborativeData = playerPreferences._collaborativeData;
		const favoriteMedia = rawCollaborativeData?.favoriteMedia || '';
		const heroType = rawCollaborativeData?.heroType || '';

		// Use the enhanced data for better character generation
		const characterSheet = `# Character Sheet
	
	## Basic Information
	**Name**: ${this.extractNameFromConcept(characterConcept || heroType)}
	**Class**: ${this.extractClassFromConcept(characterConcept || heroType)}
	**Level**: 1
	**Background**: ${this.extractBackgroundFromDetails(backgroundDetails || heroType)}
	**Race**: ${this.extractRaceFromConcept(characterConcept || heroType)}
	
	## Character Story
	### Concept
	${characterConcept || heroType}
	
	### Background
	${backgroundDetails || 'Background developed through collaborative creation'}
	
	### Inspirations
	**Favorite Media**: ${favoriteMedia}
	**Character Archetype**: ${heroType}
	
	### Preferences
	${JSON.stringify(playerPreferences, null, 2)}
	
	## Equipment
	${this.generateStartingEquipment(characterConcept || heroType, backgroundDetails || heroType)}
	
	## Personality
	- **Personality Traits**: ${playerPreferences.personalityTraits?.join(', ') || this.extractPersonalityFromData(characterConcept || heroType, backgroundDetails || heroType)}
	- **Ideals**: ${this.extractIdealsFromPreferences(playerPreferences)}
	- **Bonds**: ${this.extractBondsFromBackground(backgroundDetails || heroType)}
	- **Flaws**: ${this.extractFlawsFromConcept(characterConcept || heroType)}
	
	## Preferred Themes
	${playerPreferences.preferredThemes?.join(', ') || 'Adventure and growth'}
	
	## Preferred Genres
	${playerPreferences.favoriteGenres?.join(', ') || 'Character development'}
	
	## Notes
	Character created through collaborative creation process with enhanced player preferences.
	`;

		return characterSheet;
	}

	// ✅ HELPER METHODS FOR CHARACTER GENERATION
	// Replace the existing extractNameFromConcept method
	private extractNameFromConcept(concept: string): string {
		// Try to extract name from concept first
		const namePatterns = [
			/(?:named|called|known as)\s+([A-Z][a-z]+)/i,
			/^([A-Z][a-z]+)(?:\s+is|\s+was|\s+the)/i
		];

		for (const pattern of namePatterns) {
			const match = concept.match(pattern);
			if (match) {
				return match[1];
			}
		}

		// Fall back to random names based on character concept
		const fighterNames = ['Aelar', 'Beiro', 'Carric', 'Drannor'];
		const wizardNames = ['Enna', 'Galinndan', 'Heian', 'Himo'];
		const rogueNames = ['Andry', 'Berris', 'Dayereth', 'Enna'];
		const clericNames = ['Aramil', 'Aerdyl', 'Hadarai', 'Immeral'];
		const rangerNames = ['Ivellios', 'Laucian', 'Mindartis', 'Naal'];

		const lowerConcept = concept.toLowerCase();

		if (lowerConcept.includes('warrior') || lowerConcept.includes('fighter')) {
			return fighterNames[Math.floor(Math.random() * fighterNames.length)];
		} else if (lowerConcept.includes('magic') || lowerConcept.includes('wizard')) {
			return wizardNames[Math.floor(Math.random() * wizardNames.length)];
		} else if (lowerConcept.includes('rogue') || lowerConcept.includes('thief')) {
			return rogueNames[Math.floor(Math.random() * rogueNames.length)];
		} else if (lowerConcept.includes('cleric') || lowerConcept.includes('priest')) {
			return clericNames[Math.floor(Math.random() * clericNames.length)];
		} else if (lowerConcept.includes('ranger') || lowerConcept.includes('hunter')) {
			return rangerNames[Math.floor(Math.random() * rangerNames.length)];
		}

		// Default to fighter names
		return fighterNames[Math.floor(Math.random() * fighterNames.length)];
	}

	private extractClassFromConcept(concept: string): string {
		const lowerConcept = concept.toLowerCase();

		if (lowerConcept.includes('warrior') || lowerConcept.includes('fighter') || lowerConcept.includes('sword')) {
			return 'Fighter';
		} else if (lowerConcept.includes('magic') || lowerConcept.includes('wizard') || lowerConcept.includes('spell')) {
			return 'Wizard';
		} else if (lowerConcept.includes('rogue') || lowerConcept.includes('thief') || lowerConcept.includes('stealth')) {
			return 'Rogue';
		} else if (lowerConcept.includes('cleric') || lowerConcept.includes('priest') || lowerConcept.includes('divine')) {
			return 'Cleric';
		} else if (lowerConcept.includes('ranger') || lowerConcept.includes('hunter') || lowerConcept.includes('bow')) {
			return 'Ranger';
		}

		return 'Fighter'; // Default
	}

	private extractRaceFromConcept(concept: string): string {
		const lowerConcept = concept.toLowerCase();

		if (lowerConcept.includes('elf')) return 'Elf';
		if (lowerConcept.includes('dwarf')) return 'Dwarf';
		if (lowerConcept.includes('halfling')) return 'Halfling';
		if (lowerConcept.includes('dragonborn')) return 'Dragonborn';
		if (lowerConcept.includes('tiefling')) return 'Tiefling';

		return 'Human'; // Default
	}

	private extractBackgroundFromDetails(details: string): string {
		const lowerDetails = details.toLowerCase();

		if (lowerDetails.includes('noble') || lowerDetails.includes('royal')) return 'Noble';
		if (lowerDetails.includes('criminal') || lowerDetails.includes('thief')) return 'Criminal';
		if (lowerDetails.includes('scholar') || lowerDetails.includes('study')) return 'Sage';
		if (lowerDetails.includes('soldier') || lowerDetails.includes('military')) return 'Soldier';
		if (lowerDetails.includes('merchant') || lowerDetails.includes('trade')) return 'Guild Artisan';

		return 'Folk Hero'; // Default
	}

	private generateStartingEquipment(concept: string, background: string): string {
		const characterClass = this.extractClassFromConcept(concept);
		const characterBackground = this.extractBackgroundFromDetails(background);

		let classEquipment = '';
		let backgroundEquipment = '';

		// Class-based equipment
		switch (characterClass) {
			case 'Fighter':
				classEquipment = 'Chain mail, shield, longsword, handaxe (2), light crossbow and 20 bolts';
				break;
			case 'Wizard':
				classEquipment = 'Quarterstaff, dagger, scholar\'s pack, spellbook, component pouch';
				break;
			case 'Rogue':
				classEquipment = 'Leather armor, shortsword, thieves\' tools, burglar\'s pack, dagger (2)';
				break;
			case 'Cleric':
				classEquipment = 'Scale mail, shield, mace, light crossbow, priest\'s pack, holy symbol';
				break;
			case 'Ranger':
				classEquipment = 'Scale mail, shortsword (2), longbow and quiver of 20 arrows, explorer\'s pack';
				break;
			default:
				classEquipment = 'Leather armor, simple weapon, explorer\'s pack';
		}

		// Background-based equipment
		switch (characterBackground) {
			case 'Noble':
				backgroundEquipment = 'Fine clothes, signet ring, scroll of pedigree, purse with 25 gp';
				break;
			case 'Criminal':
				backgroundEquipment = 'Crowbar, dark common clothes, belt pouch with 15 gp';
				break;
			case 'Sage':
				backgroundEquipment = 'Bottle of black ink, quill, small knife, letter, common clothes, belt pouch with 10 gp';
				break;
			case 'Soldier':
				backgroundEquipment = 'Insignia of rank, trophy, deck of cards, common clothes, belt pouch with 10 gp';
				break;
			case 'Guild Artisan':
				backgroundEquipment = 'Artisan\'s tools, letter of introduction, traveler\'s clothes, belt pouch with 15 gp';
				break;
			default:
				backgroundEquipment = 'Artisan\'s tools, shovel, iron pot, common clothes, belt pouch with 10 gp';
		}

		return `${classEquipment}\n\n**Background Equipment**: ${backgroundEquipment}`;
	}

	private extractPersonalityFromData(concept: string, background: string): string {
		return `Driven by their ${concept.toLowerCase()}, shows determination in pursuing their goals.`;
	}

	private extractIdealsFromPreferences(preferences: any): string {
		if (preferences.favoriteGenres?.includes('Zero-to-hero')) {
			return 'Growth through challenge and perseverance.';
		}
		return 'Justice and protecting the innocent.';
	}

	private extractBondsFromBackground(background: string): string {
		return `Connected to their past through ${background.toLowerCase()}.`;
	}

	private extractFlawsFromConcept(concept: string): string {
		return `Sometimes too focused on their goals, may overlook important details.`;
	}

	formatMessageForHistory(type: 'user' | 'assistant', content: string): string {
		const speaker = type === 'user' ? 'Player' : 'DM';
		return `${speaker}: ${content}`;
	}

}

export const contextManager = new CampaignContextManager();