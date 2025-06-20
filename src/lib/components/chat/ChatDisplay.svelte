<script lang="ts">
    import { parseMarkdown } from "$lib/utils/markdown";

    // ✅ ADD THESE STATE VARIABLES
    let promptData = $state<{
        prompt: string;
        response: string;
        timestamp: string;
        loading: boolean;
        error: string | null;
    }>({
        prompt: "",
        response: "",
        timestamp: "",
        loading: false,
        error: null,
    });

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
    let showPromptModal = $state(false);
    let selectedMessageId = $state<number | null>(null);

    // Auto-scroll to bottom when new messages arrive
    $effect(() => {
        if (messages.length > 0 && messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 10);
        }
    });

    // Function to open the prompt inspector modal
    async function openPromptInspector(messageId: number) {
        selectedMessageId = messageId;
        showPromptModal = true;

        // Reset state
        promptData = {
            prompt: "",
            response: "",
            timestamp: "",
            loading: true,
            error: null,
        };

        try {
            const response = await fetch(`/api/prompts?messageId=${messageId}`);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                );
            }

            const data = await response.json();

            promptData = {
                prompt: data.prompt,
                response: data.response,
                timestamp: new Date(data.timestamp).toLocaleString(),
                loading: false,
                error: null,
            };
        } catch (error) {
            promptData = {
                prompt: "",
                response: "",
                timestamp: "",
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch prompt data",
            };
        }
    }
    // Function to copy prompt to clipboard
    function copyToClipboard(text: string) {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                console.log("Copied to clipboard");
            })
            .catch((err) => {
                console.error("Failed to copy to clipboard:", err);
            });
    }
    // Function to close the prompt modal
    function closePromptModal() {
        showPromptModal = false;
        selectedMessageId = null;
    }
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
                    <div class="flex-shrink-0 relative">
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

                        <!-- Prompt Inspector Button - Only for DM messages -->
                        {#if message.type === "assistant"}
                            <button
                                onclick={() => openPromptInspector(message.id)}
                                class="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                                title="View prompt"
                            >
                                <span class="text-[10px]">?</span>
                            </button>
                        {/if}
                    </div>

                    <!-- Message bubble content with markdown support -->
                    <div class="flex-1">
                        <div class="text-sm text-gray-500 mb-1">
                            {message.type === "user" ? "You" : "Dungeon Master"}
                        </div>
                        <div
                            class="bg-{message.type === 'user'
                                ? 'white'
                                : 'white'}-200 rounded-lg p-3"
                        >
                            <!-- Render markdown content -->
                            <div class="markdown-content">
                                {@html parseMarkdown(message.content)}
                            </div>
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

<!-- PROMPT MODAL -->
{#if showPromptModal}
    <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
        <div
            class="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full mx-4"
        >
            <div class="flex items-center justify-between p-4 border-b">
                <h3 class="text-lg font-semibold text-gray-900">
                    🔍 Prompt Inspector - Message #{selectedMessageId}
                </h3>
                <button
                    onclick={closePromptModal}
                    class="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center"
                >
                    ×
                </button>
            </div>

            <div class="p-4 overflow-y-auto max-h-[75vh]">
                {#if promptData.loading}
                    <div class="flex items-center justify-center py-8">
                        <div
                            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
                        ></div>
                        <span class="ml-2 text-gray-600"
                            >Loading prompt data...</span
                        >
                    </div>
                {:else if promptData.error}
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 class="text-red-800 font-semibold mb-2">
                            ❌ Error Loading Prompt
                        </h4>
                        <p class="text-red-600">{promptData.error}</p>
                        <p class="text-sm text-red-500 mt-2">
                            This might happen if the prompt wasn't stored or the
                            message is too old.
                        </p>
                    </div>
                {:else}
                    <div class="space-y-6">
                        <!-- Metadata -->
                        <div class="bg-blue-50 rounded-lg p-4">
                            <h4 class="font-semibold text-blue-900 mb-2">
                                📊 Metadata
                            </h4>
                            <p class="text-sm text-blue-700">
                                <strong>Message ID:</strong>
                                {selectedMessageId}<br />
                                <strong>Timestamp:</strong>
                                {promptData.timestamp}
                            </p>
                        </div>

                        <!-- Prompt Section -->
                        <div class="bg-gray-50 rounded-lg">
                            <div
                                class="flex items-center justify-between p-4 border-b border-gray-200"
                            >
                                <h4 class="font-semibold text-gray-900">
                                    📝 Sent Prompt
                                </h4>
                                <button
                                    onclick={() =>
                                        copyToClipboard(promptData.prompt)}
                                    class="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm transition-colors"
                                >
                                    📋 Copy
                                </button>
                            </div>
                            <div class="p-4">
                                <pre
                                    class="text-xs text-gray-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border overflow-x-auto">{promptData.prompt}</pre>
                            </div>
                        </div>

                        <!-- Response Section -->
                        <div class="bg-green-50 rounded-lg">
                            <div
                                class="flex items-center justify-between p-4 border-b border-green-200"
                            >
                                <h4 class="font-semibold text-green-900">
                                    🤖 AI Response
                                </h4>
                                <button
                                    onclick={() =>
                                        copyToClipboard(promptData.response)}
                                    class="px-3 py-1 bg-green-200 hover:bg-green-300 text-green-700 rounded text-sm transition-colors"
                                >
                                    📋 Copy
                                </button>
                            </div>
                            <div class="p-4">
                                <div class="bg-white p-3 rounded border">
                                    <div class="markdown-content text-sm">
                                        {@html parseMarkdown(
                                            promptData.response,
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Analysis Section -->
                        <div class="bg-yellow-50 rounded-lg p-4">
                            <h4 class="font-semibold text-yellow-900 mb-2">
                                📊 Quick Analysis
                            </h4>
                            <div class="text-sm text-yellow-800 space-y-1">
                                <p>
                                    <strong>Prompt Length:</strong>
                                    {promptData.prompt.length.toLocaleString()} characters
                                </p>
                                <p>
                                    <strong>Response Length:</strong>
                                    {promptData.response.length.toLocaleString()}
                                    characters
                                </p>
                                <p>
                                    <strong>Has Character Context:</strong>
                                    {promptData.prompt.includes(
                                        "CHARACTER CONTEXT",
                                    )
                                        ? "✅ Yes"
                                        : "❌ No"}
                                </p>
                                <p>
                                    <strong>Has Player Preferences:</strong>
                                    {promptData.prompt.includes(
                                        "PLAYER PREFERENCES",
                                    )
                                        ? "✅ Yes"
                                        : "❌ No"}
                                </p>
                                <p>
                                    <strong>Has Context Files:</strong>
                                    {promptData.prompt.includes(
                                        "RELEVANT CONTEXT FILES",
                                    )
                                        ? "✅ Yes"
                                        : "❌ No"}
                                </p>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>

            <div class="flex justify-end p-4 border-t bg-gray-50">
                <button
                    onclick={closePromptModal}
                    class="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}
