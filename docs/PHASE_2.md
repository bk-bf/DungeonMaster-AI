# Phase 2: LLM Integration Sprint - Detailed Development Roadmap

**Duration**: 5-7 days  
**Goal**: Replace mock AI with Google Gemini 2.5 Flash API integration and implement core D&D mechanics  
**Success Criteria**: Complete solo D&D sessions possible with AI-generated narratives

**Core Player Flow**: Player Input → Intent Analysis → Context Retrieval → Rule Validation → Dice Processing → Consequence Application → Narrative Generation → File Updates

---

## **🔥 Critical Path (P0) - Must Complete**

### **Day 11: Google Gemini API Setup**
**Flow Focus**: **Narrative Generation** + **Context Retrieval** foundation

- [x] **TESTABLE**: Set up Google AI Studio account and generate API key 
- [x] **TESTABLE**: Install Google Generative AI SDK with npm install @google/generative-ai
- [x] **TESTABLE**: Create Gemini service module with API integration
- [x] **TESTABLE**: Replace mock AI responses with actual Gemini API calls in chat interface
- [ ] **VERIFIABLE**: AI generates coherent responses to basic D&D prompts
- [ ] **VERIFIABLE**: Response times under 5 seconds with API calls

**Player Flow Implementation**:
- **Context Retrieval**: Basic campaign message history passed to Gemini API
- **Narrative Generation**: Real AI-generated D&D narratives replace mock responses
- **File Updates**: Campaign messages stored in existing campaign store

### **Day 12: D&D Prompt Engineering & Context**
**Flow Focus**: **Intent Analysis** + **Context Retrieval** + **Narrative Generation**

- [ ] **TESTABLE**: Create D&D-specific prompt templates optimized for Gemini 2.5 Flash
- [ ] **TESTABLE**: Implement campaign context management using Gemini's 1M token context
- [ ] **TESTABLE**: Add response filtering to maintain D&D tone and character consistency
- [ ] **VERIFIABLE**: AI consistently responds as a Dungeon Master character
- [ ] **VERIFIABLE**: Campaign continuity maintained across multiple interactions

**Player Flow Implementation**:
- **Intent Analysis**: Gemini prompt templates help interpret player actions and intentions
- **Context Retrieval**: Enhanced context management with large context window
- **Narrative Generation**: Optimized prompts generate higher quality D&D narratives
- **File Updates**: Better context tracking for campaign state persistence

### **Day 13: Character Sheet System**
**Flow Focus**: **Context Retrieval** + **Rule Validation** foundation

- [ ] **TESTABLE**: Create character data structure with D&D 5e stats (STR, DEX, CON, INT, WIS, CHA)
- [ ] **TESTABLE**: Build character creation component with stat generation
- [ ] **TESTABLE**: Link character information to campaign store and Gemini API prompts
- [ ] **VERIFIABLE**: Players can create and modify character sheets
- [ ] **VERIFIABLE**: Character stats influence AI narrative responses

**Player Flow Implementation**:
- **Context Retrieval**: Character stats and abilities available to Gemini for decision making
- **Rule Validation**: Character sheet enforces D&D 5e stat ranges and class restrictions
- **Narrative Generation**: Gemini incorporates character abilities into story responses
- **File Updates**: Character data persisted alongside campaign messages

### **Day 14: Dice Rolling & Game Mechanics**
**Flow Focus**: **Rule Validation** + **Dice Processing** + **Consequence Application**

- [ ] **TESTABLE**: Implement core dice utilities (d20, advantage/disadvantage, modifiers)
- [ ] **TESTABLE**: Create D&D 5e mechanics (ability checks, saving throws, attack rolls)
- [ ] **TESTABLE**: Integrate dice rolling with Gemini API responses for automatic resolution
- [ ] **VERIFIABLE**: Dice results display correctly in chat interface
- [ ] **VERIFIABLE**: Gemini incorporates dice outcomes into narrative continuation

**Player Flow Implementation**:
- **Rule Validation**: D&D 5e mechanics validate what actions are possible
- **Dice Processing**: Automated dice rolling with proper modifiers and advantage/disadvantage
- **Consequence Application**: Dice results determine success/failure outcomes
- **Narrative Generation**: Gemini generates story consequences based on dice results
- **File Updates**: Dice results and outcomes stored in campaign history

### **Day 15: Spell Database & Integration**
**Flow Focus**: **Rule Validation** + **Context Retrieval** + **Consequence Application**

- [ ] **TESTABLE**: Create spell database with D&D 5e spell descriptions and mechanics
- [ ] **TESTABLE**: Implement spell slot tracking and management system
- [ ] **TESTABLE**: Add spell information to character sheets and Gemini API context
- [ ] **VERIFIABLE**: Spellcasters can view and use appropriate spells
- [ ] **VERIFIABLE**: Gemini understands and narrates spell effects correctly

**Player Flow Implementation**:
- **Context Retrieval**: Spell database provides detailed spell information to Gemini
- **Rule Validation**: Spell slot tracking enforces D&D 5e casting limitations
- **Consequence Application**: Spell effects properly applied to game state
- **Narrative Generation**: Gemini generates appropriate descriptions of spell effects
- **File Updates**: Spell usage and remaining slots tracked in character data

---

## **⭐ High Impact (P1) - Implement If Time Allows**

### **Day 11-12: Enhanced Gemini Features**
**Flow Focus**: **Intent Analysis** + **Narrative Generation** improvements

- [ ] **TESTABLE**: Implement D&D-optimized prompt engineering for Gemini 2.5 Flash
- [ ] **TESTABLE**: Add API error handling and fallback responses for network failures
- [ ] **TESTABLE**: Create response length control and quality optimization (target: 150-250 words)

**Player Flow Enhancement**:
- **Intent Analysis**: Better Gemini understanding of complex player intentions
- **Narrative Generation**: Improved response quality and consistency with API optimization

### **Day 13-14: Advanced Character Features**
**Flow Focus**: **Context Retrieval** + **File Updates** enhancements

- [ ] **TESTABLE**: Add character sheet export to markdown format
- [ ] **TESTABLE**: Implement multiple character support per campaign
- [ ] **TESTABLE**: Create character equipment and inventory tracking

**Player Flow Enhancement**:
- **Context Retrieval**: Expanded character information for Gemini decision making
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

- [ ] **TESTABLE**: Add response caching for common Gemini API scenarios
- [ ] **TESTABLE**: Implement keyboard shortcuts for frequent actions
- [ ] **TESTABLE**: Create enhanced loading animations for API responses
- [ ] **TESTABLE**: Add API usage monitoring and optimization for free tier limits

### **Extended D&D Features**
**Flow Focus**: **Context Retrieval** + **Consequence Application** expansion

- [ ] **TESTABLE**: Build procedural encounter generation system
- [ ] **TESTABLE**: Add weather and time tracking for immersion
- [ ] **TESTABLE**: Create NPC relationship tracking system

---

## **Technical Implementation Details**

### **File Structure**
```
src/lib/
├── services/
│   ├── gemini.ts           # Google Gemini API interface
│   ├── prompts.ts          # D&D prompt templates for Gemini
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
```

### **Gemini API Integration Architecture**
```typescript
// Core Gemini service interface
interface GeminiService {
  generateResponse(prompt: string, context: string[]): Promise<string>;
  isAvailable(): boolean;
  getUsageStats(): ApiUsageStats;
}

// D&D prompt system optimized for Gemini
interface PromptTemplate {
  systemPrompt: string;
  buildUserPrompt(action: string, context: CampaignContext): string;
  formatResponse(rawResponse: string): string;
}
```

---

## **Player Flow Implementation Progress**

### **Day 11 Flow Coverage**
- ✅ **Context Retrieval**: Basic campaign history via Gemini API
- ✅ **Narrative Generation**: Real Gemini-generated D&D narratives
- ✅ **File Updates**: Campaign message storage
- ❌ **Player Input**: (Already implemented)
- ❌ **Intent Analysis**: Basic (improved Day 12)
- ❌ **Rule Validation**: (Day 13-14)
- ❌ **Dice Processing**: (Day 14)
- ❌ **Consequence Application**: (Day 14-15)

### **Day 12 Flow Coverage**
- ✅ **Player Input**: Enhanced understanding via Gemini
- ✅ **Intent Analysis**: Gemini prompt templates
- ✅ **Context Retrieval**: Improved campaign context with 1M token window
- ✅ **Narrative Generation**: Better D&D responses from Gemini
- ✅ **File Updates**: Enhanced context tracking
- ❌ **Rule Validation**: (Day 13-14)
- ❌ **Dice Processing**: (Day 14)
- ❌ **Consequence Application**: (Day 14-15)

### **Day 13 Flow Coverage**
- ✅ **Player Input**: Character-aware
- ✅ **Intent Analysis**: Character context
- ✅ **Context Retrieval**: Character stats available to Gemini
- ✅ **Rule Validation**: Basic character rules
- ✅ **Narrative Generation**: Character-influenced via Gemini
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
- ✅ **Narrative Generation**: Result-based stories via Gemini
- ✅ **File Updates**: Complete state tracking

### **Day 15 Flow Coverage (Complete)**
- ✅ **Player Input**: Full action spectrum
- ✅ **Intent Analysis**: Complex action parsing
- ✅ **Context Retrieval**: Complete game state
- ✅ **Rule Validation**: Full D&D 5e rules
- ✅ **Dice Processing**: All dice mechanics
- ✅ **Consequence Application**: All game effects
- ✅ **Narrative Generation**: Rich storytelling via Gemini
- ✅ **File Updates**: Complete persistence

---

## **Success Metrics Aligned with Player Flow**

### **API Performance Metrics**
- **Gemini Response Time**: <5 seconds average (vs 70+ seconds local)
- **Response Quality**: 95%+ coherent D&D narratives (improved from local)
- **System Reliability**: 99.9% uptime (vs local crashes)
- **Cost Management**: Stay within Gemini free tier limits

### **Flow Completion Metrics**
- **Player Input → Intent Analysis**: Gemini correctly interprets 95%+ of player actions
- **Context Retrieval**: Relevant campaign/character info available with 1M token context
- **Rule Validation**: D&D 5e rules enforced correctly 95%+ of the time
- **Dice Processing**: All dice mechanics work with proper modifiers
- **Consequence Application**: Game state updates correctly based on outcomes
- **Narrative Generation**: Coherent stories incorporating all flow elements via Gemini
- **File Updates**: Complete campaign state preserved across sessions

### **Integration Testing**
- **End-to-End Flow**: Complete player action → Gemini response cycle under 5 seconds
- **Flow Consistency**: Each step properly feeds into the next
- **Error Handling**: Graceful API failure handling with user feedback
- **State Persistence**: Flow state survives browser refresh and session restart

This roadmap ensures that by Day 15, your complete player flow chart is fully implemented with Google Gemini 2.5 Flash API, creating a seamless D&D experience that rivals human DM quality while maintaining zero infrastructure costs and superior performance compared to local hosting.

