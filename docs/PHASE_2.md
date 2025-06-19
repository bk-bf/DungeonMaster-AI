# Phase 2: LLM Integration Sprint - Detailed Development Roadmap

**Duration**: 5-7 days  
**Goal**: Replace mock AI with real Chronos-Hermes 13B integration and implement core D&D mechanics  
**Success Criteria**: Complete solo D&D sessions possible with AI-generated narratives

**Core Player Flow**: Player Input → Intent Analysis → Context Retrieval → Rule Validation → Dice Processing → Consequence Application → Narrative Generation → File Updates

---

## **🔥 Critical Path (P0) - Must Complete**

### **Day 11: LLM Foundation Setup**
**Flow Focus**: **Narrative Generation** + **Context Retrieval** foundation

- [ ] **TESTABLE**: Install llama.cpp and download Chronos-Hermes 13B GGUF model
- [ ] **TESTABLE**: Create LLM service module with subprocess integration
- [ ] **TESTABLE**: Replace mock AI responses with actual LLM calls in chat interface
- [ ] **VERIFIABLE**: AI generates coherent responses to basic D&D prompts
- [ ] **VERIFIABLE**: Response times under 10 seconds on local hardware

**Player Flow Implementation**:
- **Context Retrieval**: Basic campaign message history passed to AI
- **Narrative Generation**: Real AI-generated D&D narratives replace mock responses
- **File Updates**: Campaign messages stored in existing campaign store

### **Day 12: D&D Prompt Engineering & Context**
**Flow Focus**: **Intent Analysis** + **Context Retrieval** + **Narrative Generation**

- [ ] **TESTABLE**: Create D&D-specific prompt templates for DM behavior
- [ ] **TESTABLE**: Implement campaign context management using message history
- [ ] **TESTABLE**: Add response filtering to maintain D&D tone and remove AI disclaimers
- [ ] **VERIFIABLE**: AI consistently responds as a Dungeon Master character
- [ ] **VERIFIABLE**: Campaign continuity maintained across multiple interactions

**Player Flow Implementation**:
- **Intent Analysis**: AI prompt templates help interpret player actions and intentions
- **Context Retrieval**: Enhanced context management pulls relevant campaign history
- **Narrative Generation**: Improved prompts generate higher quality D&D narratives
- **File Updates**: Better context tracking for campaign state persistence

### **Day 13: Character Sheet System**
**Flow Focus**: **Context Retrieval** + **Rule Validation** foundation

- [ ] **TESTABLE**: Create character data structure with D&D 5e stats (STR, DEX, CON, INT, WIS, CHA)
- [ ] **TESTABLE**: Build character creation component with stat generation
- [ ] **TESTABLE**: Link character information to campaign store and AI prompts
- [ ] **VERIFIABLE**: Players can create and modify character sheets
- [ ] **VERIFIABLE**: Character stats influence AI narrative responses

**Player Flow Implementation**:
- **Context Retrieval**: Character stats and abilities available to AI for decision making
- **Rule Validation**: Character sheet enforces D&D 5e stat ranges and class restrictions
- **Narrative Generation**: AI incorporates character abilities into story responses
- **File Updates**: Character data persisted alongside campaign messages

### **Day 14: Dice Rolling & Game Mechanics**
**Flow Focus**: **Rule Validation** + **Dice Processing** + **Consequence Application**

- [ ] **TESTABLE**: Implement core dice utilities (d20, advantage/disadvantage, modifiers)
- [ ] **TESTABLE**: Create D&D 5e mechanics (ability checks, saving throws, attack rolls)
- [ ] **TESTABLE**: Integrate dice rolling with AI responses for automatic resolution
- [ ] **VERIFIABLE**: Dice results display correctly in chat interface
- [ ] **VERIFIABLE**: AI incorporates dice outcomes into narrative continuation

**Player Flow Implementation**:
- **Rule Validation**: D&D 5e mechanics validate what actions are possible
- **Dice Processing**: Automated dice rolling with proper modifiers and advantage/disadvantage
- **Consequence Application**: Dice results determine success/failure outcomes
- **Narrative Generation**: AI generates story consequences based on dice results
- **File Updates**: Dice results and outcomes stored in campaign history

### **Day 15: Spell Database & Integration**
**Flow Focus**: **Rule Validation** + **Context Retrieval** + **Consequence Application**

- [ ] **TESTABLE**: Create spell database with D&D 5e spell descriptions and mechanics
- [ ] **TESTABLE**: Implement spell slot tracking and management system
- [ ] **TESTABLE**: Add spell information to character sheets and AI context
- [ ] **VERIFIABLE**: Spellcasters can view and use appropriate spells
- [ ] **VERIFIABLE**: AI understands and narrates spell effects correctly

**Player Flow Implementation**:
- **Context Retrieval**: Spell database provides detailed spell information to AI
- **Rule Validation**: Spell slot tracking enforces D&D 5e casting limitations
- **Consequence Application**: Spell effects properly applied to game state
- **Narrative Generation**: AI generates appropriate descriptions of spell effects
- **File Updates**: Spell usage and remaining slots tracked in character data

---

## **⭐ High Impact (P1) - Implement If Time Allows**

### **Day 11-12: Enhanced AI Features**
**Flow Focus**: **Intent Analysis** + **Narrative Generation** improvements

- [ ] **TESTABLE**: Implement AI response streaming for real-time generation
- [ ] **TESTABLE**: Add fallback responses for AI model failures
- [ ] **TESTABLE**: Create response length control (target: 100-300 words)

**Player Flow Enhancement**:
- **Intent Analysis**: Better AI understanding of complex player intentions
- **Narrative Generation**: Improved response quality and consistency

### **Day 13-14: Advanced Character Features**
**Flow Focus**: **Context Retrieval** + **File Updates** enhancements

- [ ] **TESTABLE**: Add character sheet export to markdown format
- [ ] **TESTABLE**: Implement multiple character support per campaign
- [ ] **TESTABLE**: Create character equipment and inventory tracking

**Player Flow Enhancement**:
- **Context Retrieval**: Expanded character information for AI decision making
- **File Updates**: Enhanced character data persistence and export capabilities

### **Day 15: Combat & Advanced Mechanics**
**Flow Focus**: **Rule Validation** + **Dice Processing** + **Consequence Application**

- [ ] **TESTABLE**: Build combat initiative system for encounters
- [ ] **TESTABLE**: Add inventory management with item descriptions
- [ ] **TESTABLE**: Implement experience points and leveling mechanics

**Player Flow Enhancement**:
- **Rule Validation**: Complex combat rules and character progression
- **Dice Processing**: Initiative rolls and combat mechanics
- **Consequence Application**: Experience gain and character advancement

---

## **📋 Medium Impact (P2) - Nice to Have**

### **Performance & Polish**
**Flow Focus**: **Narrative Generation** + **File Updates** optimization

- [ ] **TESTABLE**: Add response caching for common AI scenarios
- [ ] **TESTABLE**: Implement keyboard shortcuts for frequent actions
- [ ] **TESTABLE**: Create enhanced loading animations for AI responses
- [ ] **TESTABLE**: Add prompt optimization for faster generation times

### **Extended D&D Features**
**Flow Focus**: **Context Retrieval** + **Consequence Application** expansion

- [ ] **TESTABLE**: Build procedural encounter generation system
- [ ] **TESTABLE**: Add weather and time tracking for immersion
- [ ] **TESTABLE**: Create NPC relationship tracking system

---

## **Player Flow Implementation Progress**

### **Day 11 Flow Coverage**
- ✅ **Context Retrieval**: Basic campaign history
- ✅ **Narrative Generation**: Real AI responses
- ✅ **File Updates**: Campaign message storage
- ❌ **Player Input**: (Already implemented)
- ❌ **Intent Analysis**: Basic (improved Day 12)
- ❌ **Rule Validation**: (Day 13-14)
- ❌ **Dice Processing**: (Day 14)
- ❌ **Consequence Application**: (Day 14-15)

### **Day 12 Flow Coverage**
- ✅ **Player Input**: Enhanced understanding
- ✅ **Intent Analysis**: AI prompt templates
- ✅ **Context Retrieval**: Improved campaign context
- ✅ **Narrative Generation**: Better D&D responses
- ✅ **File Updates**: Enhanced context tracking
- ❌ **Rule Validation**: (Day 13-14)
- ❌ **Dice Processing**: (Day 14)
- ❌ **Consequence Application**: (Day 14-15)

### **Day 13 Flow Coverage**
- ✅ **Player Input**: Character-aware
- ✅ **Intent Analysis**: Character context
- ✅ **Context Retrieval**: Character stats available
- ✅ **Rule Validation**: Basic character rules
- ✅ **Narrative Generation**: Character-influenced
- ✅ **File Updates**: Character persistence
- ❌ **Dice Processing**: (Day 14)
- ❌ **Consequence Application**: (Day 14-15)

### **Day 14 Flow Coverage**
- ✅ **Player Input**: Action interpretation
- ✅ **Intent Analysis**: Action understanding
- ✅ **Context Retrieval**: Full character context
- ✅ **Rule Validation**: D&D 5e mechanics
- ✅ **Dice Processing**: Automated rolling
- ✅ **Consequence Application**: Outcome determination
- ✅ **Narrative Generation**: Result-based stories
- ✅ **File Updates**: Complete state tracking

### **Day 15 Flow Coverage (Complete)**
- ✅ **Player Input**: Full action spectrum
- ✅ **Intent Analysis**: Complex action parsing
- ✅ **Context Retrieval**: Complete game state
- ✅ **Rule Validation**: Full D&D 5e rules
- ✅ **Dice Processing**: All dice mechanics
- ✅ **Consequence Application**: All game effects
- ✅ **Narrative Generation**: Rich storytelling
- ✅ **File Updates**: Complete persistence

---

## File Structure

src/lib/
├── services/
│   ├── llm.ts              # Core LLM interface
│   ├── prompts.ts          # D&D prompt templates
│   └── context.ts          # Campaign context management
├── game/
│   ├── character.ts        # Character sheet logic
│   ├── dice.ts            # Dice rolling utilities
│   ├── mechanics.ts       # D&D 5e rule implementations
│   └── spells.ts          # Spell system
├── data/
│   ├── spells.json        # D&D 5e spell database
│   ├── classes.json       # Character class definitions
│   └── races.json         # Character race definitions
└── stores/
    ├── campaigns.ts       # Existing campaign store
    └── character.ts       # Character sheet store

## LLM Integration Architecture

```
// Core LLM service interface
interface LLMService {
  generateResponse(prompt: string, context: string[]): Promise<string>;
  isAvailable(): boolean;
  getModelInfo(): ModelInfo;
}

// D&D prompt system
interface PromptTemplate {
  systemPrompt: string;
  buildUserPrompt(action: string, context: CampaignContext): string;
  formatResponse(rawResponse: string): string;
}
```

## **Success Metrics Aligned with Player Flow**

### **Flow Completion Metrics**
- **Player Input → Intent Analysis**: AI correctly interprets 90%+ of player actions
- **Context Retrieval**: Relevant campaign/character info available for all decisions
- **Rule Validation**: D&D 5e rules enforced correctly 95%+ of the time
- **Dice Processing**: All dice mechanics work with proper modifiers
- **Consequence Application**: Game state updates correctly based on outcomes
- **Narrative Generation**: Coherent stories incorporating all flow elements
- **File Updates**: Complete campaign state preserved across sessions

### **Integration Testing**
- **End-to-End Flow**: Complete player action → AI response cycle under 10 seconds
- **Flow Consistency**: Each step properly feeds into the next
- **Error Handling**: Graceful failure at any flow step with user feedback
- **State Persistence**: Flow state survives browser refresh and session restart

.