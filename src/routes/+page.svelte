<script lang="ts">
	import { ChatDisplay, ChatInput } from "$lib/components/chat";
	import { campaignStore } from "$lib/stores/campaigns";
	import { SettingsButton } from "$lib/components/ui";
	import { buildDungeonMasterPrompt } from "$lib/services/prompts";
	import { contextManager } from "$lib/services/context";
	import ContextTester from "$lib/components/debug/ContextTester.svelte";
	import type { Message } from "$lib/components/chat";

	let isLoading = false;
	let showContextTester = false;

	// Reactive statement to get current campaign messages
	$: activeCampaign = $campaignStore.campaigns.find(
		(c) => c.id === $campaignStore.activeCampaignId,
	);
	$: messages = activeCampaign?.messages || [];

	async function handleSendMessage(event: CustomEvent<string>) {
		const messageContent = event.detail;

		// Add user message to store
		campaignStore.addMessage({
			type: "user",
			content: messageContent,
		});

		isLoading = true;

		try {
			// Build campaign history for context
			const campaignHistory = messages.map(
				(m) => `${m.type}: ${m.content}`,
			);

			// Get character data
			const character = {
				name: activeCampaign?.characterName || "Adventurer",
				class: activeCampaign?.characterClass || "Fighter",
				level: activeCampaign?.characterLevel || 1,
				background: activeCampaign?.characterBackground || "Folk Hero",
			};

			// Get player preferences
			const playerPreferences = activeCampaign?.playerPreferences || {
				favoriteGenres: [
					"Zero-to-hero",
					"Character growth",
					"Mentorship",
				],
				preferredNarrativeStyle:
					"Deep character development with moral complexity",
				preferredThemes: [
					"Growth through adversity",
					"Finding purpose",
				],
			};

			// ✅ CORRECT - Await the async context building
			const context = await contextManager.buildFullContext(
				messageContent,
				campaignHistory,
				character,
				playerPreferences,
			);

			// Generate AI response using enhanced context
			const prompt = buildDungeonMasterPrompt(messageContent, context);
			console.log("Sending context-enhanced prompt to Gemini...");

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

			// Add AI response to store
			campaignStore.addMessage({
				type: "assistant",
				content: data.response,
			});

			// ✅ Update character progression after successful response
			await contextManager.updateCharacterProgression(
				messageContent,
				data.response,
			);
		} catch (error) {
			console.error("Enhanced Gemini API Error:", error);

			// Enhanced fallback response
			campaignStore.addMessage({
				type: "assistant",
				content: `## **The Weary Traveler Tavern - Evening** 🌙

*The Dungeon Master seems momentarily distracted by otherworldly forces...*

The candlelight flickers strangely as an unseen magical disturbance ripples through the tavern. You notice the other patrons pause their conversations, sensing something amiss in the air.

*Old Henrik* looks concerned. "Did you feel that, lad? Something's not right tonight..."

Your rogue instincts suggest waiting for the disturbance to pass, investigating the source of the magical interference, or asking *Henrik* if he's experienced this before.

*Error: ${error instanceof Error ? error.message : "An unknown error occurred"}*

What's your move? 🎯`,
			});
		} finally {
			isLoading = false;
		}
	}

	function toggleContextTester() {
		showContextTester = !showContextTester;
	}
</script>

<!-- Full height chat interface -->
<div class="h-full flex flex-col relative">
	<!-- Settings and Debug buttons in top-right corner -->
	<div class="absolute top-4 right-4 z-10 flex space-x-2">
		<button
			onclick={toggleContextTester}
			class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
			aria-label="Toggle Context Tester"
		>
			🧪
		</button>
		<SettingsButton />
	</div>

	{#if showContextTester}
		<!-- Context Tester Overlay -->
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
