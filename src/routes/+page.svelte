<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { ChatDisplay, ChatInput } from "$lib/components/chat";
	import { campaignStore } from "$lib/stores/campaigns";
	import { SettingsButton } from "$lib/components/ui";
	import {
		buildDungeonMasterPrompt,
		buildCollaborativeCreationPrompt,
		determinePromptType,
	} from "$lib/services/prompts";
	import { contextManager } from "$lib/services/context";
	import { contextFileManager } from "$lib/services/contextFiles";
	import CharacterSetup from "$lib/components/character/CharacterSetup.svelte";
	import ContextTester from "$lib/components/debug/ContextTester.svelte";
	import { sessionManager } from "$lib/services/session";
	import { onMount } from "svelte";
	import type { CampaignState, PlayerPreferences } from "$lib/types";

	let isLoading = false;
	let showContextTester = false;
	let showCharacterSetup = false;
	let sessionLoaded = false;

	// ✅ NEW: Collaborative creation state
	let campaignState: CampaignState = {
		mode: "gameplay",
		creationPhase: "complete",
		collaborativeData: {
			playerPreferences: {},
		},
	};

	// ✅ ADD THIS NEW FUNCTION
	async function storePromptForDebugging(
		messageId: number,
		prompt: string,
		response: string,
	) {
		try {
			await fetch("/api/prompts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messageId, prompt, response }),
			});
		} catch (error) {
			console.error("Failed to store prompt for debugging:", error);
		}
	}

	// ✅ NEW: Update collaborative progress
	async function updateCollaborativeProgress(playerResponse: string) {
		switch (campaignState.creationPhase) {
			case "concept":
				campaignState.collaborativeData.characterConcept =
					playerResponse;
				campaignState.creationPhase = "background";
				break;

			case "background":
				campaignState.collaborativeData.backgroundDetails =
					playerResponse;
				campaignState.creationPhase = "world";
				break;

			case "world":
				campaignState.collaborativeData.worldElements = playerResponse;
				campaignState.creationPhase = "integration";
				break;

			case "integration":
				// Generate final character sheet and world files
				await generateFinalCharacterAndWorld();
				campaignState.mode = "gameplay";
				campaignState.creationPhase = "complete";
				break;
		}
	}

	// ✅ NEW: Generate character and world from collaborative data
	async function generateFinalCharacterAndWorld() {
		try {
			console.log(
				"🎭 Generating character and world from collaborative data...",
			);

			// Create character sheet from collaborative data
			const characterSheet =
				await contextManager.generateCharacterFromCollaborativeData(
					campaignState.collaborativeData,
				);

			// Initialize context files with generated data
			await contextFileManager.initializeFromCollaborativeData(
				characterSheet,
				campaignState.collaborativeData,
			);

			console.log("✅ Character and world generation complete!");
		} catch (error) {
			console.error("❌ Failed to generate character and world:", error);
		}
	}

	// ✅ NEW: Auto-start collaborative creation
	async function autoStartCollaborativeCreation(
		preferences: PlayerPreferences,
	) {
		console.log("🎭 Starting collaborative character creation...");

		// Set up campaign state for collaborative creation
		campaignState = {
			mode: "character_creation",
			creationPhase: "concept",
			collaborativeData: {
				playerPreferences: preferences,
			},
		};

		// Generate and send the first collaborative prompt
		const initialPrompt = buildCollaborativeCreationPrompt(
			"",
			campaignState,
		);

		try {
			const response = await fetch("/api/gemini", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt: initialPrompt }),
			});

			if (!response.ok) {
				throw new Error(`API Error: ${response.status}`);
			}

			const data = await response.json();

			// Add the initial collaborative creation message
			campaignStore.addMessage({
				type: "assistant",
				content: data.response,
			});

			console.log("✅ Collaborative creation started successfully!");
		} catch (error) {
			console.error("❌ Failed to start collaborative creation:", error);

			// Fallback message
			campaignStore.addMessage({
				type: "assistant",
				content: `## 🎭 **Welcome to Collaborative Character Creation!**
				
I'm excited to help you create the perfect D&D character! Let's start by discussing what kind of hero you'd like to play.

What type of story appeals to you most? Are you drawn to:
- 🗡️ **Heroic adventures** with clear good vs evil
- 🔮 **Mysterious quests** uncovering ancient secrets  
- ⚔️ **Personal journeys** of growth and redemption
- 🏹 **Survival stories** using wit and skill

Tell me what excites you about D&D adventures!`,
			});
		}
	}

	// ✅ Wait for session to load before showing character setup
	$: {
		if (sessionLoaded) {
			const files = contextFileManager.getAllFiles();
			const hasCharacterSheet = files.some(
				(f) => f.id === "character_sheet",
			);
			const hasActiveSession = sessionManager.hasActiveSession();

			showCharacterSetup = !hasCharacterSheet && !hasActiveSession;
		}
	}

	// ✅ Load session data on mount
	onMount(async () => {
		try {
			console.log("🔄 Starting session restoration...");

			// Wait for session restoration to complete
			await campaignStore.restoreFromSession();
			console.log("✅ Session restoration completed");

			// Load context files
			contextFileManager.loadFromStorage();
			console.log("✅ Context files loaded");

			// Mark session as loaded
			sessionLoaded = true;
			console.log("✅ Session marked as loaded");
		} catch (error) {
			console.error("❌ Failed to restore session:", error);
			// Still mark as loaded even if restoration fails
			sessionLoaded = true;
		}
	});

	// Your existing reactive statements and functions...
	$: activeCampaign = $campaignStore.campaigns.find(
		(c) => c.id === $campaignStore.activeCampaignId,
	);
	$: messages = activeCampaign?.messages || [];

	// ✅ ENHANCED: Handle both collaborative creation and regular gameplay
	async function handleSendMessage(event: CustomEvent<string>) {
		const messageContent = event.detail;

		// Add user message
		campaignStore.addMessage({
			type: "user",
			content: messageContent,
		});

		isLoading = true;

		try {
			let prompt: string;

			// ✅ NEW: Determine prompt type based on campaign state
			const promptType = determinePromptType(
				messageContent,
				campaignState,
			);

			if (promptType === "collaborative_creation") {
				// ✅ Handle collaborative character creation
				console.log(
					`🎭 Collaborative creation phase: ${campaignState.creationPhase}`,
				);

				// Update progress based on user response
				await updateCollaborativeProgress(messageContent);

				// Generate appropriate prompt for current phase
				prompt = buildCollaborativeCreationPrompt(
					messageContent,
					campaignState,
				);
			} else {
				// ✅ Handle regular gameplay
				console.log("⚔️ Regular gameplay mode");

				// Build campaign history for context
				const campaignHistory = messages.map((m: any) =>
					contextManager.formatMessageForHistory(m.type, m.content),
				);

				// Get character data from context files
				const characterFiles = contextFileManager.getAllFiles();
				const characterSheet = characterFiles.find(
					(f) => f.id === "character_sheet",
				);
				const character = characterSheet
					? contextManager.parseCharacterFromMD(
							characterSheet.content,
						)
					: {
							name: "Adventurer",
							class: "Fighter",
							level: 1,
							background: "Folk Hero",
						};

				// Get player preferences from collaborative data or use defaults
				const playerPreferences = campaignState.collaborativeData
					.playerPreferences || {
					favoriteGenres: ["Zero-to-hero", "Character growth"],
					preferredNarrativeStyle:
						"Deep character development with moral complexity",
					preferredThemes: [
						"Growth through adversity",
						"Finding purpose",
					],
				};

				// Build full context using context manager
				const context = await contextManager.buildFullContext(
					messageContent,
					campaignHistory,
					character,
					playerPreferences,
				);

				// Generate AI response using enhanced context
				prompt = buildDungeonMasterPrompt(messageContent, context);
			}

			// Make API call
			const response = await fetch("/api/gemini", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "API request failed");
			}

			const data = await response.json();

			// Add AI response
			const aiMessage = {
				type: "assistant" as const,
				content: data.response,
			};

			campaignStore.addMessage(aiMessage);

			// ✅ Only update character progression in gameplay mode
			if (promptType === "standard_gameplay") {
				// Update character progression
				await contextManager.updateCharacterProgression(
					messageContent,
					data.response,
				);
			}

			// Store prompt for debugging - get the message ID after adding
			const currentMessages = messages;
			const lastMessageId =
				currentMessages[currentMessages.length - 1]?.id;

			if (lastMessageId) {
				await storePromptForDebugging(
					lastMessageId,
					prompt,
					data.response,
				);
			}
		} catch (error) {
			console.error("Enhanced Gemini API Error:", error);

			campaignStore.addMessage({
				type: "assistant",
				content: `## **The Weary Traveler Tavern - Evening** 🌙

*The Dungeon Master seems momentarily distracted by otherworldly forces...*

*Error: ${error instanceof Error ? error.message : String(error)}*

What's your move? 🎯`,
			});
		} finally {
			isLoading = false;
		}
	}

	function handleCharacterSetupComplete(event: CustomEvent) {
		const { collaborativeMode, preferences, setupType } = event.detail;

		showCharacterSetup = false;

		if (collaborativeMode) {
			// ✅ Enhanced collaborative data handling
			console.log("🎭 Collaborative preferences received:", preferences);

			// Extract collaborative data for context pipeline
			const collaborativeData = preferences._collaborativeData || {
				favoriteMedia: "",
				heroType: "",
				rawInput: {
					favoriteMedia: "",
					heroType: "",
					age: preferences.age,
				},
			};

			autoStartCollaborativeCreation({
				...preferences,
				collaborativeData,
			});
		} else {
			// Traditional setup
			console.log("⚔️ Traditional setup completed");
		}
	}

	function toggleContextTester() {
		showContextTester = !showContextTester;
	}
</script>

<!-- ✅ Only show character setup after session has loaded -->
{#if sessionLoaded && showCharacterSetup}
	<CharacterSetup on:complete={handleCharacterSetupComplete} />
{/if}

<!-- ✅ Show loading screen while session is loading -->
{#if !sessionLoaded}
	<div class="h-full flex items-center justify-center bg-gray-50">
		<div class="text-center">
			<div
				class="animate-spin rounded-full h-12 w-12 border-b-4 border-red-800 mx-auto mb-4"
			></div>
			<p class="text-gray-600">Loading your adventure...</p>
		</div>
	</div>
{:else}
	<!-- Full height chat interface -->
	<div class="h-full flex flex-col relative">
		<!-- Settings and Debug buttons -->
		<div class="absolute top-4 right-4 z-10 flex space-x-2">
			<!-- ✅ NEW: Show current creation phase indicator -->
			{#if campaignState.mode !== "gameplay"}
				<div
					class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
				>
					🎭 {campaignState.creationPhase}
				</div>
			{/if}

			<button
				onclick={toggleContextTester}
				class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
				aria-label="Toggle Context Tester"
			>
				🧪
			</button>
			<SettingsButton />
		</div>

		<!-- Context Tester Overlay -->
		{#if showContextTester}
			<div
				class="absolute inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center p-4"
			>
				<div class="relative">
					<button
						onclick={toggleContextTester}
						class="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
					>
						×
					</button>
					<ContextTester />
				</div>
			</div>
		{/if}

		<!-- Chat Display Component -->
		<ChatDisplay {messages} {isLoading} />

		<!-- Chat Input Component -->
		<ChatInput disabled={isLoading} on:send={handleSendMessage} />
	</div>
{/if}
