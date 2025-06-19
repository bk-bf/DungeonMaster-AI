<script lang="ts">
	import { ChatDisplay, ChatInput } from "$lib/components/chat";
	import { campaignStore } from "$lib/stores/campaigns";
	import { SettingsButton } from "$lib/components/ui";

	let isLoading = false;

	// Reactive statement to get current campaign messages
	$: activeCampaign = $campaignStore.campaigns.find(
		(c) => c.id === $campaignStore.activeCampaignId,
	);
	$: messages = activeCampaign?.messages || [];

	function handleSendMessage(event: CustomEvent<string>) {
		const messageContent = event.detail;

		// Add user message to store
		campaignStore.addMessage({
			type: "user",
			content: messageContent,
		});

		// Set loading state
		isLoading = true;

		// Simulate AI response
		setTimeout(() => {
			campaignStore.addMessage({
				type: "assistant",
				content: `You said: "${messageContent}". The adventure continues...`,
			});
			isLoading = false;
		}, 1000);
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
</div>
