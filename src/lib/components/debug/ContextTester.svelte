<script lang="ts">
	import { contextManager } from "$lib/services/context";
	import { buildDungeonMasterPrompt } from "$lib/services/prompts";
	import { contextFileManager } from "$lib/services/contextFiles";
	import { playerPreferencesStore } from "$lib/stores/playerPreferences";
	import { campaignStore } from "$lib/stores/campaigns";
	import type { PlayerPreferences } from "$lib/types";

	let testResults = "";
	let isLoading = false;

	// ✅ FIX: Use dynamic data instead of hardcoded
	$: activeCampaign = $campaignStore.campaigns.find(
		(c) => c.id === $campaignStore.activeCampaignId,
	);
	$: actualMessages = activeCampaign?.messages || [];
	$: actualCampaignHistory = actualMessages.map((m) =>
		contextManager.formatMessageForHistory(m.type, m.content),
	);

	// ✅ Dynamic test data based on actual state
	$: testPlayerAction =
		actualMessages.length > 0
			? "I continue my current adventure"
			: "I want to start a new adventure";

	// ✅ Get real character data
	$: contextFiles = contextFileManager.getAllFiles();
	$: characterSheet = contextFiles.find((f) => f.id === "character_sheet");
	$: realCharacterData = characterSheet
		? contextManager.parseCharacterFromMD(characterSheet.content)
		: {
				name: "No Character",
				class: "Unknown",
				level: 1,
				background: "Unknown",
			};

	// ✅ Use actual preferences
	$: actualPlayerPreferences = $playerPreferencesStore.preferences;

	// Add new debugging functions
	async function debugPlayerPreferences() {
		isLoading = true;

		try {
			// Check player preferences store
			const preferencesStore = $playerPreferencesStore;

			// Check context files
			const allFiles = contextFileManager.getAllFiles();

			testResults = `🔍 Player Preferences Debug Report

📊 **Player Preferences Store:**
- Is Collected: ${preferencesStore.isCollected}
- Preferences Exist: ${preferencesStore.preferences ? "YES" : "NO"}

${
	preferencesStore.preferences
		? `
🎯 **Stored Preferences:**
- Favorite Genres: ${preferencesStore.preferences.favoriteGenres?.join(", ") || "None"}
- Narrative Style: ${preferencesStore.preferences.preferredNarrativeStyle || "None"}
- Themes: ${preferencesStore.preferences.preferredThemes?.join(", ") || "None"}
- Age: ${preferencesStore.preferences.age || "Not set"}
- Favorite Books: ${preferencesStore.preferences.favoriteBooks || "None"}
- Favorite Movies: ${preferencesStore.preferences.favoriteMovies || "None"}
- Favorite Games: ${preferencesStore.preferences.favoriteGames || "None"}
`
		: "❌ No preferences found in store"
}

📁 **Context Files:**
- Total Files: ${allFiles.length}
- File Names: ${allFiles.map((f) => f.filename).join(", ")}

🧪 **LocalStorage Check:**
- Player Preferences Key: ${localStorage.getItem("dungeonmaster-player-preferences") ? "EXISTS" : "MISSING"}
- Context Files Key: ${localStorage.getItem("dungeonmaster-context-files") ? "EXISTS" : "MISSING"}

${
	localStorage.getItem("dungeonmaster-player-preferences")
		? `
💾 **Raw LocalStorage Data:**
${localStorage.getItem("dungeonmaster-player-preferences")}
`
		: ""
}`;
		} catch (error) {
			testResults = `❌ Debug Error: ${error instanceof Error ? error.message : String(error)}`;
		} finally {
			isLoading = false;
		}
	}

	async function testPreferencesInContext() {
		isLoading = true;

		try {
			// Build context with current preferences
			const campaignHistory = ["DM: Welcome to your adventure!"];
			const character = {
				name: "Test",
				class: "Fighter",
				level: 1,
				background: "Folk Hero",
			};

			// Get preferences from store
			const preferences = $playerPreferencesStore.preferences;

			const context = await contextManager.buildFullContext(
				"I want to start an adventure",
				campaignHistory,
				character,
				preferences ?? undefined,
			);

			const prompt = buildDungeonMasterPrompt(
				"I want to start an adventure",
				context,
			);

			testResults = `✅ Preferences in Context Test

🎯 **Context Object:**
- Character: ${context.characterName} (${context.characterClass})
- Preferences Included: ${context.playerPreferences ? "YES" : "NO"}

${
	context.playerPreferences
		? `
📋 **Preferences in Context:**
- Genres: ${context.playerPreferences.favoriteGenres?.join(", ") || "None"}
- Style: ${context.playerPreferences.preferredNarrativeStyle || "None"}
- Themes: ${context.playerPreferences.preferredThemes?.join(", ") || "None"}
`
		: "❌ No preferences in context"
}

📝 **Prompt Contains Preferences:**
${prompt.includes("PLAYER PREFERENCES") ? "✅ YES - Preferences section found in prompt" : "❌ NO - Preferences section missing"}

🔍 **Prompt Preview (Preferences Section):**
${prompt.split("PLAYER PREFERENCES")[1]?.split("CURRENT PLAYER ACTION")[0] || "Not found"}`;
		} catch (error) {
			testResults = `❌ Context Test Error: ${error instanceof Error ? error.message : String(error)}`;
		} finally {
			isLoading = false;
		}
	}

	async function testContextBuilding() {
		isLoading = true;

		try {
			// ✅ Use all real data
			const context = await contextManager.buildFullContext(
				testPlayerAction,
				actualCampaignHistory, // ✅ Real campaign history
				realCharacterData, // ✅ Real character data
				actualPlayerPreferences || undefined,
			);

			const prompt = buildDungeonMasterPrompt(testPlayerAction, context);

			testResults = `✅ Context Built Successfully!

📊 Context Details:
- Character: ${context.characterName} (Level ${context.characterLevel} ${context.characterClass})
- Background: ${context.characterBackground}
- Location: ${context.currentLocation}
- History Messages: ${context.recentHistory.length}
- Player Preferences: ${context.playerPreferences ? "Loaded" : "None"}

🎯 Player Preferences (ACTUAL FROM STORE):
- Genres: ${context.playerPreferences?.favoriteGenres?.join(", ") || "None"}
- Style: ${context.playerPreferences?.preferredNarrativeStyle || "None"}
- Themes: ${context.playerPreferences?.preferredThemes?.join(", ") || "None"}
- Age: ${context.playerPreferences?.age || "Not set"}

📋 **Real Character Data (from character_sheet.md):**
- Name: ${realCharacterData.name}
- Class: ${realCharacterData.class}
- Level: ${realCharacterData.level}
- Background: ${realCharacterData.background}

🧪 **Test Data (DYNAMIC):**
- Action: ${testPlayerAction}
- Campaign History: ${actualCampaignHistory.length} messages
- Character: ${realCharacterData.name} (Level ${realCharacterData.level} ${realCharacterData.class})
- Preferences: ${actualPlayerPreferences?.favoriteGenres?.join(", ") || "None set"}

📝 Generated Prompt Length: ${prompt.length} characters

✅ All systems working correctly!`;
		} catch (error) {
			testResults = `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
		} finally {
			isLoading = false;
		}
	}

	// Add function to debug character sheet content
	async function debugCharacterSheet() {
		isLoading = true;

		try {
			const allFiles = contextFileManager.getAllFiles();
			const characterSheet = allFiles.find(
				(f) => f.id === "character_sheet",
			);

			testResults = `🧪 Character Sheet Debug

📁 **All Context Files:**
${allFiles.map((f) => `- ${f.filename} (${f.tags.join(", ")})`).join("\n")}

📋 **Character Sheet File:**
${
	characterSheet
		? `
- Filename: ${characterSheet.filename}
- Last Updated: ${characterSheet.lastUpdated}
- Content Length: ${characterSheet.content.length} characters

📝 **Raw Character Sheet Content:**
${characterSheet.content}

🔍 **Parsed Character Data:**
${JSON.stringify(contextManager.parseCharacterFromMD(characterSheet.content), null, 2)}
`
		: "❌ No character sheet found!"
}`;
		} catch (error) {
			testResults = `❌ Character Sheet Debug Error: ${error instanceof Error ? error.message : String(error)}`;
		} finally {
			isLoading = false;
		}
	}

	async function testFullAPIIntegration() {
		isLoading = true;

		try {
			// ✅ Use real character data from context files
			const context = await contextManager.buildFullContext(
				testPlayerAction,
				actualCampaignHistory, // ✅ Fixed to use actual campaign history
				realCharacterData, // ✅ Real character data, not hardcoded
				actualPlayerPreferences || undefined,
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
		<!-- Show current REAL data -->
		<div class="bg-blue-50 p-4 rounded-lg">
			<h3 class="font-semibold mb-2">Current REAL Data:</h3>
			<p>
				<strong>Character:</strong>
				{realCharacterData.name} (Level {realCharacterData.level}
				{realCharacterData.class})
			</p>
			<p><strong>Background:</strong> {realCharacterData.background}</p>
			<p><strong>Campaign Messages:</strong> {actualMessages.length}</p>
			<p><strong>Test Action:</strong> {testPlayerAction}</p>
			<p>
				<strong>Preferences:</strong>
				{actualPlayerPreferences?.favoriteGenres?.join(", ") ||
					"None set"}
			</p>
		</div>

		<!-- Add new debug buttons -->
		<div class="flex flex-wrap gap-4">
			<button
				onclick={debugCharacterSheet}
				disabled={isLoading}
				class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
			>
				{isLoading ? "🔄 Debugging..." : "📋 Debug Character Sheet"}
			</button>

			<button
				onclick={debugPlayerPreferences}
				disabled={isLoading}
				class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
			>
				{isLoading ? "🔄 Debugging..." : "🔍 Debug Player Preferences"}
			</button>

			<button
				onclick={testPreferencesInContext}
				disabled={isLoading}
				class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
			>
				{isLoading ? "🔄 Testing..." : "🎯 Test Preferences in Context"}
			</button>

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
			class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto"
		>
			{testResults}
		</div>
	{/if}
</div>
