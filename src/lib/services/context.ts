// src/lib/services/context.ts

import { playerPreferencesStore } from '$lib/stores/playerPreferences';
import { get } from 'svelte/store';
import type { CampaignContext, PlayerPreferences, ContextFile, EntityExtraction } from '$lib/types';
import { contextFileManager } from './contextFiles';


export class CampaignContextManager {
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

	// Change from private to public
	public parseCharacterFromMD(markdown: string): any {
		const character: any = {};

		// Extract character info from markdown
		const nameMatch = markdown.match(/\*\*Name\*\*:\s*(.+)/);
		if (nameMatch) character.name = nameMatch[1].trim();

		const classMatch = markdown.match(/\*\*Class\*\*:\s*(.+)/);
		if (classMatch) character.class = classMatch[1].trim();

		const levelMatch = markdown.match(/\*\*Level\*\*:\s*(\d+)/);
		if (levelMatch) character.level = parseInt(levelMatch[1]);

		const backgroundMatch = markdown.match(/\*\*Background\*\*:\s*(.+)/);
		if (backgroundMatch) character.background = backgroundMatch[1].trim();

		return character;
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

	formatMessageForHistory(type: 'user' | 'assistant', content: string): string {
		const speaker = type === 'user' ? 'Player' : 'DM';
		return `${speaker}: ${content}`;
	}
}

export const contextManager = new CampaignContextManager();