# Detailed Prompt Flow Analysis for DungeonMaster AI

Based on the search results and your current implementation, here's exactly which prompts are being sent to Gemini and when:

## **Current Prompt Flow (Day 11 Implementation)**

### **When a User Sends a Message**

#### **Step 1: User Action Triggers Handler**
```typescript
// User types: "I want to explore the cave entrance"
// This triggers handleSendMessage() in your +page.svelte
```

#### **Step 2: Context Building**
```typescript
// Your code builds context from campaign history:
const context = {
  characterName: 'Adventurer', // Currently hardcoded
  characterClass: 'Fighter',   // Currently hardcoded
  characterLevel: 1,           // Currently hardcoded
  recentHistory: messages.slice(-5).map(m => 
    `${m.type === 'user' ? 'Player' : 'DM'}: ${m.content}`
  ),
  currentLocation: 'Starting Village' // Currently hardcoded
};
```

#### **Step 3: Prompt Construction**
The `buildDungeonMasterPrompt()` function creates this **exact prompt** that gets sent to Gemini:

```
You are an expert Dungeon Master running a D&D 5e campaign. You create engaging, immersive narratives that respond to player actions. Keep responses between 100-200 words. Always stay in character as the DM. Never break the fourth wall or mention that you're an AI.

Character: Adventurer (Level 1 Fighter)
Current Location: Starting Village

Recent Events:
DM: Welcome to your D&D adventure! I am your AI Dungeon Master. What would you like to do?
Player: I want to explore the cave entrance

Player Action: I want to explore the cave entrance

As the Dungeon Master, describe what happens next in this D&D adventure. Include sensory details, potential consequences, and opportunities for the player to make their next choice.
```

## **Enhanced Prompt Flow (Day 12 Implementation)**

### **When Enhanced Prompts Are Used**

#### **Character Creation Prompt**
```typescript
// Triggered when: User wants to create a character
// Function: buildCharacterCreationPrompt(playerPreferences)
```

**Example Prompt Sent to Gemini:**
```
You are an expert D&D character creation assistant and narrative designer. Based on the player's preferences, create a compelling character concept that will lead to an engaging campaign.

PLAYER PREFERENCES AND BACKGROUND:
I'm 26, love zero-to-hero narratives, favorite characters like Drizzt Do'Urden, enjoy complex character development, prefer human race, like dual classes but starting with warrior or rogue...

ANALYSIS REQUIREMENTS:
1. Identify core themes the player enjoys from their preferences
2. Create a character concept that embodies these themes
3. Design a compelling backstory with built-in character growth potential
4. Suggest starting class and multiclass potential
5. Create an engaging adventure hook

[... formatting requirements ...]

Create a character concept that will naturally lead to the type of story this player will love, with clear progression from humble beginnings to potential greatness.
```

#### **Campaign Start Prompt**
```typescript
// Triggered when: Starting a new campaign with created character
// Function: buildCampaignStartPrompt(characterConcept, preferences)
```

**Example Prompt Sent to Gemini:**
```
You are a master Dungeon Master beginning a new D&D 5e campaign. Create an engaging opening scene that establishes the world, introduces the character's current situation, and presents the first adventure hook.

CHARACTER CONCEPT:
Aldric Thorne, a 24-year-old human who was once a promising apprentice at the prestigious Academy of Arcane Arts. Born to common folk, you earned your place through pure intellect and determination. However, a catastrophic magical experiment went horribly wrong...

PLAYER PREFERENCES:
Zero-to-hero narratives, deep character development, moral complexity, redemption arcs...

OPENING SCENE REQUIREMENTS:
- Start with atmospheric location description using ## header and emojis
- Establish character's current circumstances and emotional state
- Introduce a compelling NPC with a personal request/problem
[... detailed formatting requirements ...]

Create an opening that immediately draws the player into their character's world and presents meaningful choices that reflect their preferred narrative themes.
```

#### **Enhanced Gameplay Prompt**
```typescript
// Triggered when: User sends any message during gameplay
// Function: buildDungeonMasterPrompt(playerAction, enhancedContext)
```

**Example Enhanced Prompt Sent to Gemini:**
```
You are an expert Dungeon Master running a D&D 5e campaign. You create engaging, immersive narratives with the quality and depth of professional storytelling.

CRITICAL FORMATTING REQUIREMENTS:
- Use markdown formatting with ## for location headers
- Add relevant emojis to enhance atmosphere (🏰🌙⚔️🎲✨🔥💀🌟)
- Bold important items, NPCs, and locations with **text**
- End with "What would you like [character] to do? 🤔" followed by 3-4 specific action suggestions
- Include a final "What's your move? 🎯" call to action

NARRATIVE STYLE REQUIREMENTS:
- Write in second person ("You see...", "You hear...")
- Create vivid, immersive descriptions with sensory details
- Include atmospheric elements (lighting, sounds, smells, temperature)
- Show character emotions and internal thoughts subtly
- Maintain D&D 5e authenticity with proper terminology

CHARACTER CONTEXT:
Name: Aldric Thorne
Class: Rogue
Level: 1
Background: Folk Hero
Location: The Weary Traveler Tavern

RECENT CAMPAIGN EVENTS:
DM: ## **The Weary Traveler Tavern - Evening** 🍺🌙 The warm glow of candlelight flickers across the worn wooden tables...
Player: I agree to help Henrik find his granddaughter
DM: Henrik's relief is palpable as he grips your shoulder...

PLAYER PREFERENCES (tailor narrative accordingly):
- Favorite themes: Growth through adversity, mentorship, hidden potential
- Preferred depth: Complex characters with internal conflicts
- Narrative style: Zero-to-hero progression with moral complexity

CURRENT PLAYER ACTION: "I want to gather my equipment and head to the Whispering Woods"

Respond as the Dungeon Master with:
1. Location header with emojis
2. Vivid scene description (150-200 words)
3. Character interaction or consequence
4. Action prompt with specific suggestions
5. Final "What's your move?" call

Example format:
## **Location Name - Time** 🌙⚔️
[Immersive description with sensory details and atmosphere]
**What would you like [character] to do?** 🤔
You can:
- [Specific action 1]
- [Specific action 2] 
- [Specific action 3]
- Or suggest a different course of action
What's your move? 🎯
```

## **Prompt Timing and Triggers**

### **When Each Prompt Type Is Sent**

| User Action | Prompt Function | When It's Triggered |
|-------------|----------------|-------------------|
| **"Create character"** | `buildCharacterCreationPrompt()` | Character creation phase |
| **"Start campaign"** | `buildCampaignStartPrompt()` | Beginning new campaign |
| **Any gameplay message** | `buildDungeonMasterPrompt()` | Every user message during play |
| **Test scenarios** | `buildTestPrompt()` | Development testing only |

### **Context Evolution Over Time**

#### **Message 1 (Campaign Start)**
```
Recent Events: [Empty - new campaign]
Player Action: "I want to start an adventure"
```

#### **Message 5 (Mid-Campaign)**
```
Recent Events:
DM: Welcome to the tavern...
Player: I talk to the bartender
DM: The bartender looks up...
Player: I ask about local rumors
DM: He leans in and whispers...

Player Action: "I want to investigate the mysterious cave"
```

#### **Message 20 (Deep Campaign)**
```
Recent Events: [Last 5 messages from ongoing story]
Character: Now Level 2 with updated stats
Location: Deep in Whispering Woods
Player Action: "I cast my newly learned spell"
```

## **Key Differences Between Prompt Types**

### **Basic vs Enhanced Prompts**

| Aspect | Day 11 Basic | Day 12 Enhanced |
|--------|-------------|-----------------|
| **Length** | ~300 words | ~800+ words |
| **Formatting** | Basic instructions | Detailed markdown/emoji requirements |
| **Context** | Simple character info | Full player preferences + detailed context |
| **Output Control** | General guidelines | Specific format requirements |
| **Personalization** | Generic | Tailored to player's favorite themes |

### **Prompt Size Management**

```typescript
// Context trimming to stay within Gemini's limits
private trimHistory(history: string[]): string[] {
  let totalLength = 0;
  const trimmedHistory = [];
  
  // Keep most recent messages that fit in ~50,000 characters
  for (let i = history.length - 1; i >= 0 && trimmedHistory.length < 10; i--) {
    const message = history[i];
    if (totalLength + message.length < 35000) { // Reserve space for prompt template
      trimmedHistory.unshift(message);
      totalLength += message.length;
    }
  }
  return trimmedHistory;
}
```

## **Actual API Call Flow**

### **What Happens Behind the Scenes**

1. **User types message** → `handleSendMessage()` triggered
2. **Context built** → Recent history + character info gathered
3. **Prompt constructed** → Template filled with actual data
4. **API call made** → Prompt sent to `/api/gemini` endpoint
5. **Server processes** → Gemini API receives full prompt
6. **Response returned** → Cleaned and formatted for display
7. **UI updated** → Message appears in chat

### **Network Request Example**
```json
// POST /api/gemini
{
  "prompt": "You are an expert Dungeon Master running a D&D 5e campaign...\n\nCURRENT PLAYER ACTION: \"I examine the cave entrance for traps\""
}
```

This detailed flow shows exactly how your user's simple message like "I examine the cave" becomes a comprehensive, context-rich prompt that enables Gemini to generate engaging D&D narratives!

