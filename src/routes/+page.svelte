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
