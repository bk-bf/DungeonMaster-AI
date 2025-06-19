<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { ChatDisplay, ChatInput } from "$lib/components/chat";
	import { campaignStore } from "$lib/stores/campaigns";
	import { SettingsButton } from "$lib/components/ui";
	import { buildDungeonMasterPrompt } from "$lib/services/prompts";
	import { contextManager } from "$lib/services/context";
	import { contextFileManager } from "$lib/services/contextFiles";
	import CharacterSetup from "$lib/components/character/CharacterSetup.svelte";
	import ContextTester from "$lib/components/debug/ContextTester.svelte";
	import { sessionManager } from "$lib/services/session";

	let showCharacterSetup = false;
	let isLoading = false;
	let showContextTester = false;

	// Check if character setup is needed
	$: {
		const files = contextFileManager.getAllFiles();
		const hasCharacterSheet = files.some((f) => f.id === "character_sheet");
		const hasActiveSession = sessionManager.hasActiveSession();

		// Only show character setup if no character sheet AND no active session
		showCharacterSetup = !hasCharacterSheet && !hasActiveSession;
	}

	// Your existing reactive statements and functions...
	$: activeCampaign = $campaignStore.campaigns.find(
		(c) => c.id === $campaignStore.activeCampaignId,
	);
	$: messages = activeCampaign?.messages || [];

	async function handleSendMessage(event: CustomEvent<string>) {
		const messageContent = event.detail;

		campaignStore.addMessage({
			type: "user",
			content: messageContent,
		});

		isLoading = true;

		try {
			// Build campaign history for context
			const campaignHistory = messages.map((m) =>
				contextManager.formatMessageForHistory(m.type, m.content),
			);

			// Get character data from context files
			const characterFiles = contextFileManager.getAllFiles();
			const characterSheet = characterFiles.find(
				(f) => f.id === "character_sheet",
			);
			const character = characterSheet
				? contextManager.parseCharacterFromMD(characterSheet.content)
				: {
						name: "Adventurer",
						class: "Fighter",
						level: 1,
						background: "Folk Hero",
					};

			// Get player preferences
			const playerPreferences = activeCampaign?.playerPreferences || {
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
			const prompt = buildDungeonMasterPrompt(messageContent, context);

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

			campaignStore.addMessage({
				type: "assistant",
				content: data.response,
			});

			// Update character progression
			await contextManager.updateCharacterProgression(
				messageContent,
				data.response,
			);
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

	function handleCharacterSetupComplete() {
		showCharacterSetup = false;
		// Optionally start the first campaign automatically
		campaignStore.createCampaign("My First Adventure");
	}

	function toggleContextTester() {
		showContextTester = !showContextTester;
	}
</script>

<!-- Character Setup Modal (shows for new users) -->
{#if showCharacterSetup}
	<CharacterSetup on:complete={handleCharacterSetupComplete} />
{/if}

<!-- Full height chat interface -->
<div class="h-full flex flex-col relative">
	<!-- Settings and Debug buttons -->
	<div class="absolute top-4 right-4 z-10 flex space-x-2">
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
