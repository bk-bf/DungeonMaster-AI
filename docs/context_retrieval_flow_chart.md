# Context Retrieval System: Granular Flow Chart & Dynamic Character Progression

## **Current Context Retrieval Limitations**

### **What's Missing**
- **Static character data**: Hardcoded name, class, level
- **No progression tracking**: Character doesn't evolve
- **Limited context awareness**: Only recent message history
- **No semantic retrieval**: Can't find relevant past events
- **No persistent knowledge**: Important details get lost

## **Enhanced Context Retrieval Flow Chart**

```
Player Input
    ↓
Keyword/Entity Extraction
    ↓
Tag-Based File Retrieval
    ↓
Context Ranking & Selection
    ↓
Dynamic Character State Update
    ↓
Consolidated Context Assembly
    ↓
LLM Prompt Construction
```

## **Detailed Context Retrieval Breakdown**

### **Step 1: Keyword/Entity Extraction**
```typescript
// Extract entities and keywords from player input
Player Input: "I want to use my fire spell on the goblin"
Extracted Keywords: ["fire", "spell", "goblin", "combat", "magic"]
Extracted Entities: ["spell:fire", "creature:goblin", "action:attack"]
```

### **Step 2: Tag-Based File Retrieval**
```typescript
// Search for relevant .md files based on tags
Tags Triggered: #fire-magic, #combat, #spells, #goblins
Files Retrieved: 
- character_spells.md (contains fire spell details)
- combat_log.md (previous goblin encounters)
- character_progression.md (spell slot usage)
```

### **Step 3: Context Ranking & Selection**
```typescript
// Rank retrieved content by relevance
High Priority: Current spell slots, known fire spells
Medium Priority: Previous goblin encounters, combat tactics
Low Priority: General magic theory, distant combat history
```

### **Step 4: Dynamic Character State Update**
```typescript
// Update character progression based on action
Before: { fireSpells: ["Burning Hands"], spellSlots: { level1: 3 } }
After: { fireSpells: ["Burning Hands"], spellSlots: { level1: 2 }, lastSpellUsed: "Burning Hands" }
```

This enhanced Context Retrieval system provides:

Dynamic character progression that updates automatically

Tagged .md file system for semantic context retrieval

Entity extraction that triggers relevant context

Persistent character state that evolves organically

File-based knowledge that accumulates over time

The system now matches your vision of a context-aware D&D AI that builds knowledge dynamically and retrieves exactly the right information based on player input!