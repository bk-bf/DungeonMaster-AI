<script lang="ts">
	let messageText = "";
	let showSettings = false;
	let messages = [
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

	function sendMessage() {
		if (messageText.trim()) {
			messages = [
				...messages,
				{
					id: messages.length + 1,
					type: "user",
					content: messageText.trim(),
				},
			];

			const currentMessage = messageText.trim();
			messageText = "";

			setTimeout(() => {
				messages = [
					...messages,
					{
						id: messages.length + 1,
						type: "assistant",
						content: `You said: "${currentMessage}". The adventure continues...`,
					},
				];
			}, 1000);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		target.style.height = "auto";
		target.style.height = target.scrollHeight + "px";
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
			class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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

	<!-- Messages area with top padding for settings button -->
	<div class="flex-1 overflow-y-auto p-6 pt-16 space-y-4">
		{#each messages as message}
			<div
				class="flex {message.type === 'user'
					? 'justify-end'
					: 'justify-start'}"
			>
				<div
					class="max-w-[80%] {message.type === 'user'
						? 'order-2'
						: 'order-1'}"
				>
					<!-- Avatar -->
					<div class="flex items-start space-x-3">
						<div class="flex-shrink-0">
							<div
								class="w-8 h-8 rounded-full flex items-center justify-center {message.type ===
								'user'
									? 'bg-yellow-600 text-white'
									: 'bg-red-600 text-white'}"
							>
								<span class="text-sm font-medium">
									{message.type === "user" ? "Y" : "DM"}
								</span>
							</div>
						</div>

						<!-- Message content -->
						<div class="flex-1">
							<div class="text-sm text-gray-500 mb-1">
								{message.type === "user"
									? "You"
									: "Dungeon Master"}
							</div>
							<div
								class="bg-{message.type === 'user'
									? 'white'
									: 'gray'}-100 rounded-lg p-3"
							>
								<p class="text-gray-800">{message.content}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Input area fixed at bottom -->
	<div class="flex-shrink-0 border-t border-gray-200 bg-white p-4">
		<div class="flex items-end space-x-3">
			<!-- Input field -->
			<div class="flex-1">
				<textarea
					bind:value={messageText}
					placeholder="Describe your action... (Press Enter to send, Shift+Enter for new line)"
					class="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 max-h-32 overflow-y-auto"
					rows="1"
					onkeydown={handleKeydown}
					oninput={handleInput}
				/>
			</div>

			<!-- Send button -->
			<button
				type="button"
				onclick={sendMessage}
				disabled={!messageText.trim()}
				class="flex-shrink-0 bg-red-800 text-white px-6 py-3 rounded-lg hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				<svg
					class="w-5 h-5 rotate-90"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
					/>
				</svg>
			</button>
		</div>
	</div>
</div>
