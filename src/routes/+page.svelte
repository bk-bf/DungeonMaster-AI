<script lang="ts">
	let messageText = "";
</script>

<!-- Full height chat interface -->
<div class="h-full flex flex-col">
	<!-- Chat messages area -->
	<div class="flex-1 overflow-y-auto p-6">
		<div class="bg-gray-100 rounded-lg p-4 mb-4">
			<p class="text-gray-800">Welcome to your D&D adventure!</p>
		</div>
		<div class="bg-blue-100 rounded-lg p-4 mb-4">
			<p class="text-blue-800">
				Your AI Dungeon Master is ready to guide you.
			</p>
		</div>
	</div>

	<!-- Chat input area -->
	<div class="flex-shrink-0 border-t border-gray-200 p-4">
		<div class="flex space-x-2">
			<input
				bind:value={messageText}
				placeholder="Describe your action..."
				class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<button
				class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
			>
				Send
			</button>
		</div>
	</div>
</div>
