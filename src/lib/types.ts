// src/lib/types.ts

// ✅ COLLABORATIVE CHARACTER CREATION TYPES
export interface CampaignState {
    mode: 'character_creation' | 'world_building' | 'gameplay';
    creationPhase: 'concept' | 'background' | 'world' | 'integration' | 'complete';
    collaborativeData: {
        characterConcept?: string;
        backgroundDetails?: string;
        worldElements?: string;
        playerPreferences: PlayerPreferences;
    };
}

// ✅ PLAYER PREFERENCES INTERFACE
export interface PlayerPreferences {
    favoriteGenres?: string[];
    favoriteCharacters?: string[];
    preferredNarrativeStyle?: string;
    age?: number;
    interests?: string[];
    favoriteBooks?: string[];
    favoriteMovies?: string[];
    favoriteGames?: string[];
    personalityTraits?: string[];
    preferredThemes?: string[];
    // ✅ NEW: Add collaborative data structure
    _collaborativeData?: {
        favoriteMedia: string;
        heroType: string;
        rawInput: {
            favoriteMedia: string;
            heroType: string;
            age?: number;
        };
    };
}

// ✅ EXISTING CAMPAIGN CONTEXT TYPES
export interface CampaignContext {
    contextFiles?: ContextFile[];
    entityExtraction?: EntityExtraction;
    playerPreferences?: PlayerPreferences;
    currentLocation?: string;
    recentHistory: string[];
    isCampaignStart?: boolean;
}

export interface ContextFile {
    id: string;
    filename: string;
    content: string;
    lastUpdated?: string;
}

export interface EntityExtraction {
    keywords: string[];
    entities: string[];
    actionType: string;
}

// ✅ CHARACTER CREATION TYPES
export interface CharacterData {
    name: string;
    class: string;
    level: number;
    background: string;
    hitPoints: string;
    armorClass: string;
    status: string;
    equipment: string;
    abilities: string;
    race?: string;
    abilityScores?: AbilityScores;
    skills?: string[];
    languages?: string[];
    tools?: string[];
}

export interface AbilityScores {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}

// ✅ CAMPAIGN MANAGEMENT TYPES
export interface Campaign {
    id: string;
    title: string;
    character: CharacterData;
    preferences: PlayerPreferences;
    state: CampaignState;
    createdAt: Date;
    lastPlayed: Date;
    messages: Message[];
}

// ✅ CHAT MESSAGE TYPES
export interface Message {
    id: number;
    type: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
    promptUsed?: string; // For prompt inspection feature
}

export interface ChatHistory {
    id: string;
    title: string;
    messages: Message[];
    lastUpdated: Date;
    characterData?: CharacterData;
    campaignState?: CampaignState;
}


// ✅ WORLD BUILDING TYPES
export interface WorldElement {
    id: string;
    type: 'location' | 'npc' | 'organization' | 'threat' | 'mystery';
    name: string;
    description: string;
    relationships?: string[];
    importance: 'minor' | 'major' | 'critical';
}

export interface NPC {
    id: string;
    name: string;
    role: string;
    personality: string;
    relationship: string;
    location?: string;
    importance: 'minor' | 'major' | 'critical';
}

export interface Location {
    id: string;
    name: string;
    type: 'settlement' | 'dungeon' | 'wilderness' | 'landmark';
    description: string;
    npcs?: string[]; // NPC IDs
    threats?: string[];
    significance: string;
}

// ✅ QUEST AND PROGRESSION TYPES
export interface Quest {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'completed' | 'failed' | 'paused';
    objectives: QuestObjective[];
    rewards?: string[];
    npcsInvolved?: string[];
}

export interface QuestObjective {
    id: string;
    description: string;
    completed: boolean;
    optional: boolean;
}

// ✅ GAME MECHANICS TYPES
export interface DiceRoll {
    type: string; // "d20", "2d6", etc.
    result: number;
    modifier: number;
    total: number;
    advantage?: boolean;
    disadvantage?: boolean;
    critical?: boolean;
}

export interface SkillCheck {
    skill: string;
    difficulty: number;
    roll: DiceRoll;
    success: boolean;
    description: string;
}

// ✅ UI COMPONENT TYPES
export interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
}

export interface InputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
    placeholder?: string;
    disabled?: boolean;
    error?: string;
}

// ✅ API RESPONSE TYPES
export interface APIResponse {
    success: boolean;
    data?: any;
    error?: string;
    timestamp: Date;
}

export interface PromptResponse {
    response: string;
    promptUsed: string;
    processingTime: number;
    tokensUsed?: number;
}

// ✅ FILE MANAGEMENT TYPES
export interface ExportData {
    campaign: Campaign;
    messages: Message[];
    contextFiles: ContextFile[];
    exportDate: Date;
    version: string;
}

export interface ImportResult {
    success: boolean;
    characterImported: boolean;
    campaignImported: boolean;
    messagesImported: boolean;
    errors?: string[];
}

// ✅ COLLABORATIVE CREATION PROGRESS TRACKING
export interface CreationProgress {
    currentPhase: CampaignState['creationPhase'];
    completedPhases: CampaignState['creationPhase'][];
    estimatedTimeRemaining: number; // minutes
    canProceed: boolean;
}

// ✅ PROMPT CONFIGURATION TYPES
export interface PromptConfig {
    type: 'collaborative_creation' | 'standard_gameplay' | 'character_start';
    phase?: CampaignState['creationPhase'];
    includePreferences: boolean;
    includeContext: boolean;
    maxTokens?: number;
}

// ✅ THEME AND UI STATE TYPES
export interface ThemeState {
    mode: 'light' | 'dark' | 'auto';
    primaryColor: string;
    fontSize: 'sm' | 'md' | 'lg';
}

export interface UIState {
    sidebarOpen: boolean;
    currentView: 'chat' | 'character' | 'inventory' | 'quests';
    loading: boolean;
    error?: string;
}

// ✅ TYPE GUARDS AND UTILITIES
export function isValidCampaignState(state: any): state is CampaignState {
    return (
        state &&
        typeof state.mode === 'string' &&
        ['character_creation', 'world_building', 'gameplay'].includes(state.mode) &&
        typeof state.creationPhase === 'string' &&
        ['concept', 'background', 'world', 'integration', 'complete'].includes(state.creationPhase) &&
        state.collaborativeData &&
        typeof state.collaborativeData === 'object'
    );
}

export function isMessage(obj: any): obj is Message {
    return (
        obj &&
        typeof obj.id === 'number' &&
        typeof obj.type === 'string' &&
        ['user', 'assistant'].includes(obj.type) &&
        typeof obj.content === 'string'
    );
}

// ✅ DEFAULT VALUES AND CONSTANTS
export const DEFAULT_CAMPAIGN_STATE: CampaignState = {
    mode: 'character_creation',
    creationPhase: 'concept',
    collaborativeData: {
        playerPreferences: {}
    }
};

export const DEFAULT_PLAYER_PREFERENCES: PlayerPreferences = {
    favoriteGenres: [],
    preferredThemes: [],
    preferredNarrativeStyle: 'balanced'
};

// ✅ ENUMS FOR BETTER TYPE SAFETY
export enum CreationPhase {
    CONCEPT = 'concept',
    BACKGROUND = 'background',
    WORLD = 'world',
    INTEGRATION = 'integration',
    COMPLETE = 'complete'
}

export enum CampaignMode {
    CHARACTER_CREATION = 'character_creation',
    WORLD_BUILDING = 'world_building',
    GAMEPLAY = 'gameplay'
}

export enum MessageType {
    USER = 'user',
    ASSISTANT = 'assistant'
}
