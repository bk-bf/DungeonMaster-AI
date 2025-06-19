<script lang="ts">
	import { ChatDisplay, ChatInput } from "$lib/components/chat";
	import type { Message } from "$lib/components/chat";

	let messages: Message[] = [
		{
			id: 1,
			type: "assistant",
			content:
				"Welcome to your D&D adventure! I am your AI Dungeon Master. What would you like to do?",
		},
		{
			id: 2,
			type: "user",
			content: "I want to explore the mysterious forest.",
		},
		{
			id: 3,
			type: "assistant",
			content:
				"You step into the Whispering Woods. Ancient trees tower above you, their branches creating a canopy that filters the sunlight into dancing patterns. You hear the distant sound of running water and the rustle of leaves. What do you do next?",
		},
		{
			id: 4,
			type: "user",
			content: "//Fireball",
		},
		{
			id: 5,
			type: "assistant",
			content: `## 📜 Spell: Fireball

🎲 **Level:** 3rd  
📚 **School:** Evocation  
⏳ **Casting Time:** 1 action  
📏 **Range/Area:** 150 ft. (20 ft. radius)  
🧩 **Components:** V, S, M *  
⏱️ **Duration:** Instantaneous  
🛡️ **Attack/Save:** DEX Save  
💥 **Damage/Effect:** 🔥 Fire  

*A bright streak flashes from your pointing finger  to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.*

*The fire spreads around corners. It ignites flammable objects in the area that aren't being worn or carried.*

⬆️ **At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.

### 💥 **Damage**
🔥 8d6 fire damage`,
		},
		{
			id: 6,
			type: "assistant",
			content: `Your enhanced Fireball spell with emojis`, // (the one you just created,
		},
		{
			id: 7,
			type: "user",
			content: `//Aldric the Bold`, // (the one you just created,
		},
		{
			id: 8,
			type: "assistant",
			content: `## Character: Aldric the Bold

**Race:** Human  
**Class:** Fighter  
**Level:** 3  

*A weathered warrior with scars telling tales of countless battles...*

### Equipment
- Longsword +1
- Chain mail armor
- Shield with family crest
- 50 gold pieces`,
		},
		{
			id: 9,
			type: "user",
			content: `//Quests`, // (the one you just created,
		},
		{
			id: 10,
			type: "assistant",
			content: `# 📜 Current Quests

## 🏰 Main Quest: The Dragon's Hoard
**Objective:** Retrieve the stolen crown from the ancient dragon's lair  
**Reward:** 1000 gold pieces  
**Status:** *In Progress*

## 🌲 Side Quest: Lost in the Woods
### Objectives:
- Find the missing merchant caravan
- Rescue any survivors  
- Return valuable cargo to town

### Rewards:
1. 200 gold pieces
2. Merchant's favor
3. Safe passage through the forest

*The forest grows darker as you venture deeper...*`,
		},
	];

	let isLoading = false;
	let showSettings = false;

	function handleSendMessage(event: CustomEvent<string>) {
		const messageContent = event.detail;

		// Add user message
		messages = [
			...messages,
			{
				id: messages.length + 1,
				type: "user",
				content: messageContent,
			},
		];

		// Set loading state
		isLoading = true;

		// Simulate AI response
		setTimeout(() => {
			messages = [
				...messages,
				{
					id: messages.length + 1,
					type: "assistant",
					content: `You said: "${messageContent}". The adventure continues...`,
				},
			];
			isLoading = false;
		}, 1000);
	}

	function toggleSettings() {
		showSettings = !showSettings;
	}
</script>

<!-- Full height chat interface -->
<div class="h-full flex flex-col relative">
	<!-- Settings button in top-right corner -->
	<div class="absolute top-4 right-4 z-10">
		<button
			type="button"
			onclick={toggleSettings}
			class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-colors"
			aria-label="Settings"
		>
			<svg
				class="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
		</button>

		<!-- Settings dropdown -->
		{#if showSettings}
			<div
				class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
			>
				<button
					class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
					>Theme Settings</button
				>
				<button
					class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
					>Export Campaign</button
				>
				<button
					class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
					>Clear History</button
				>
				<hr class="my-1" />
				<button
					class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
					>Help & Support</button
				>
			</div>
		{/if}
	</div>

	<!-- Chat Display Component -->
	<ChatDisplay {messages} {isLoading} />

	<!-- Chat Input Component -->
	<ChatInput disabled={isLoading} on:send={handleSendMessage} />
</div>
