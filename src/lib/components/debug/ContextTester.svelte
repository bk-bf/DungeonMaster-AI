<script lang="ts">
	import { contextManager } from "$lib/services/context";
	import { buildDungeonMasterPrompt } from "$lib/services/prompts";
	import type { PlayerPreferences } from "$lib/types";

	let testResults = "";
	let isLoading = false;

	// Test data
	const testPlayerAction = "I want to explore the mysterious cave";
	const testCampaignHistory = [
		"DM: Welcome to your adventure!",
		"Player: I look around the tavern",
		"DM: You see a crowded room with many patrons",
	];
	const testCharacter = {
		name: "Aldric",
		class: "Rogue",
		level: 2,
		background: "Folk Hero",
	};
	const testPlayerPreferences: PlayerPreferences = {
		favoriteGenres: ["Zero-to-hero", "Character growth"],
		preferredNarrativeStyle:
			"Deep character development with moral complexity",
		preferredThemes: ["Growth through adversity", "Mentorship"],
	};

	async function testContextBuilding() {
		isLoading = true;

		try {
			// ✅ CORRECT - Await the async context building
			const context = await contextManager.buildFullContext(
				testPlayerAction,
				testCampaignHistory,
				testCharacter,
				testPlayerPreferences,
			);

			// ✅ Now context is the actual CampaignContext object
			const prompt = buildDungeonMasterPrompt(testPlayerAction, context);

			testResults = `✅ Context Built Successfully!

📊 Context Details:
- Character: ${context.characterName} (Level ${context.characterLevel} ${context.characterClass})
- Background: ${context.characterBackground}
- Location: ${context.currentLocation}
- History Messages: ${context.recentHistory.length}
- Player Preferences: ${context.playerPreferences ? "Loaded" : "None"}

🎯 Player Preferences:
- Genres: ${context.playerPreferences?.favoriteGenres?.join(", ") || "None"}
- Style: ${context.playerPreferences?.preferredNarrativeStyle || "None"}
- Themes: ${context.playerPreferences?.preferredThemes?.join(", ") || "None"}

📝 Generated Prompt Length: ${prompt.length} characters

🔍 Prompt Preview (first 500 chars):
${prompt.substring(0, 500)}...

✅ All systems working correctly!`;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			const errorStack =
				error instanceof Error
					? error.stack
					: "No stack trace available";

			testResults = `❌ Error: ${errorMessage}

Stack trace:
${errorStack}`;
		} finally {
			isLoading = false;
		}
	}

	async function testFullAPIIntegration() {
		isLoading = true;

		try {
			// ✅ CORRECT - Await the async context building
			const context = await contextManager.buildFullContext(
				testPlayerAction,
				testCampaignHistory,
				testCharacter,
				testPlayerPreferences,
			);

			const prompt = buildDungeonMasterPrompt(testPlayerAction, context);

			// Test actual API call
			const response = await fetch("/api/gemini", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt }),
			});

			if (!response.ok) {
				throw new Error(`API Error: ${response.status}`);
			}

			const data = await response.json();

			testResults = `✅ Full API Integration Test Successful!

📊 Context: Built successfully with player preferences
🚀 API Call: Completed in ${response.headers.get("response-time") || "unknown"}ms
📝 Response Length: ${data.response.length} characters

🎭 AI Response:
${data.response}

✅ Context system fully integrated and working!`;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			testResults = `❌ API Integration Error: ${errorMessage}`;
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
	<h2 class="text-2xl font-bold text-gray-900 mb-4">
		🧪 Context System Testing
	</h2>

	<div class="space-y-4 mb-6">
		<div class="bg-gray-50 p-4 rounded-lg">
			<h3 class="font-semibold mb-2">Test Data:</h3>
			<p><strong>Action:</strong> {testPlayerAction}</p>
			<p>
				<strong>Character:</strong>
				{testCharacter.name} (Level {testCharacter.level}
				{testCharacter.class})
			</p>
			<p>
				<strong>History:</strong>
				{testCampaignHistory.length} messages
			</p>
			<p>
				<strong>Preferences:</strong>
				{testPlayerPreferences.favoriteGenres?.join(", ")}
			</p>
		</div>

		<div class="flex space-x-4">
			<button
				onclick={testContextBuilding}
				disabled={isLoading}
				class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
			>
				{isLoading ? "🔄 Testing..." : "🧪 Test Context Building"}
			</button>

			<button
				onclick={testFullAPIIntegration}
				disabled={isLoading}
				class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
			>
				{isLoading ? "🔄 Testing..." : "🚀 Test Full API Integration"}
			</button>
		</div>
	</div>

	{#if testResults}
		<div
			class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap"
		>
			{testResults}
		</div>
	{/if}
</div>
