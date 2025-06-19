<script lang="ts">
    interface Message {
        id: number;
        type: "user" | "assistant";
        content: string;
    }

    interface Props {
        messages?: Message[];
        isLoading?: boolean;
    }

    let { messages = [], isLoading = false }: Props = $props();

    let messagesContainer: HTMLDivElement;

    // Auto-scroll to bottom when new messages arrive
    $effect(() => {
        if (messages.length > 0 && messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 10);
        }
    });
</script>

<!-- Messages area with scrollable container -->
<div bind:this={messagesContainer} class="flex-1 overflow-y-auto p-6 space-y-4">
    {#each messages as message (message.id)}
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
                            {message.type === "user" ? "You" : "Dungeon Master"}
                        </div>
                        <div
                            class="bg-{message.type === 'user'
                                ? 'gray'
                                : 'gray'}-200 rounded-lg p-3"
                        >
                            <p class="text-gray-800">{message.content}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/each}

    <!-- Loading indicator -->
    {#if isLoading}
        <div class="flex justify-start">
            <div class="max-w-[80%]">
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                        <div
                            class="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center"
                        >
                            <span class="text-sm font-medium">DM</span>
                        </div>
                    </div>
                    <div class="flex-1">
                        <div class="text-sm text-gray-500 mb-1">
                            Dungeon Master
                        </div>
                        <div class="bg-gray-100 rounded-lg p-3">
                            <div class="flex items-center space-x-1">
                                <div
                                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                ></div>
                                <div
                                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style="animation-delay: 0.1s"
                                ></div>
                                <div
                                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style="animation-delay: 0.2s"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
