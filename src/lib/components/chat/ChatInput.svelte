<script lang="ts">
    import { createEventDispatcher } from "svelte";

    interface Props {
        disabled?: boolean;
        placeholder?: string;
    }

    let { disabled = false, placeholder = "Describe your action..." }: Props =
        $props();

    const dispatch = createEventDispatcher<{
        send: string;
    }>();

    let messageText = $state("");

    function sendMessage() {
        if (messageText.trim()) {
            dispatch("send", messageText.trim());
            messageText = "";
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
</script>

<!-- Rest of your component stays the same -->
<div class="flex-shrink-0 border-t border-gray-200 bg-white p-4">
    <div class="relative">
        <textarea
            bind:value={messageText}
            {placeholder}
            class="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700 max-h-32 overflow-y-auto"
            rows="1"
            onkeydown={handleKeydown}
            oninput={handleInput}
        ></textarea>

        <div class="absolute right-2 bottom-0.75 h-full flex items-center">
            <button
                type="button"
                onclick={sendMessage}
                disabled={!messageText.trim()}
                class="bg-red-800 text-white w-9 h-9 rounded-md hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                aria-label="Send message"
            >
                <svg
                    class="w-4 h-4"
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
