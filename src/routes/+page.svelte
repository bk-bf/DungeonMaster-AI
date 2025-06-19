<script lang="ts">
	import { ChatDisplay, ChatInput } from "$lib/components/chat";
	import { campaignStore } from "$lib/stores/campaigns";
	import { SettingsButton } from "$lib/components/ui";
	import { geminiService } from "$lib/services/gemini";
	import { buildDungeonMasterPrompt } from "$lib/services/prompts";
	import type { Message } from "$lib/components/chat";

	let isLoading = false;
	let usageStats = { requestCount: 0, estimatedTokens: 0, responseTime: 0 };

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

		// Set loading state
		isLoading = true;

		try {
			// Check if Gemini API is available
			if (!(await geminiService.isAvailable())) {
				throw new Error(
					"Gemini API not available. Check your API key configuration.",
				);
			}

			// Build context from campaign history
			const context = {
				characterName: "Adventurer", // Will be dynamic later
				characterClass: "Fighter",
				characterLevel: 1,
				recentHistory: messages
					.slice(-5)
					.map(
						(m) =>
							`${m.type === "user" ? "Player" : "DM"}: ${m.content}`,
					),
				currentLocation: "Starting Village",
			};

			// Generate AI response using Gemini
			const prompt = buildDungeonMasterPrompt(messageContent, context);
			console.log(
				"Sending prompt to Gemini:",
				prompt.substring(0, 200) + "...",
			);

			const startTime = Date.now();
			const aiResponse = await geminiService.generateResponse(prompt);
			const responseTime = Date.now() - startTime;

			console.log(
				"Received response from Gemini:",
				aiResponse.substring(0, 100) + "...",
			);

			// Update usage stats (estimated values since geminiService doesn't return usage data)
			usageStats = {
				requestCount: usageStats.requestCount + 1,
				estimatedTokens:
					usageStats.estimatedTokens + Math.ceil(prompt.length / 4), // Rough token estimation
				responseTime: responseTime,
			};

			// Add AI response to store
			campaignStore.addMessage({
				type: "assistant",
				content: aiResponse,
			});
		} catch (error) {
			console.error("Gemini API Error:", error);

			// Fallback response with error info
			campaignStore.addMessage({
				type: "assistant",
				content: `*The Dungeon Master seems momentarily distracted by otherworldly forces...*

I apologize, but I'm having trouble accessing my knowledge right now. Please try again in a moment.

**Error**: ${error instanceof Error ? error.message : String(error)}

*In the meantime, you notice your surroundings more clearly...*`,
			});
		} finally {
			isLoading = false;
		}
	}

	// Function to check current usage
	async function checkUsage() {
		try {
			const response = await fetch("/api/gemini");
			const data = await response.json();
			if (data.usage) {
				usageStats = data.usage;
			}
		} catch (error) {
			console.error("Failed to fetch usage stats:", error);
		}
	}
</script>

<!-- Full height chat interface -->
<div class="h-full flex flex-col relative">
	<!-- Settings button positioned in top-right corner -->
	<div class="absolute top-4 right-4 z-10">
		<SettingsButton />
	</div>

	<!-- Chat Display Component -->
	<ChatDisplay {messages} {isLoading} />

	<!-- Chat Input Component -->
	<ChatInput disabled={isLoading} on:send={handleSendMessage} />

	<!-- Usage stats in bottom-left corner -->
	<div
		class="absolute bottom-23 right-0 z-10 text-xs text-gray-500 bg-white/80 rounded px-2 py-1"
	>
		📊 {usageStats.requestCount} requests today
	</div>
</div>
