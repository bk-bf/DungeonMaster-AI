// src/lib/utils/markdown.ts
import { marked } from 'marked';
import hljs from 'highlight.js';
import type { Tokens } from 'marked';

// Create custom renderer with synchronous highlight.js
const renderer = new marked.Renderer();

// Custom code block styling with synchronous highlighting
renderer.code = function (token: Tokens.Code): string {
    const code = token.text;
    const language = token.lang;

    let highlighted: string;

    try {
        if (language && hljs.getLanguage(language)) {
            highlighted = hljs.highlight(code, { language }).value;
        } else {
            highlighted = hljs.highlightAuto(code).value;
        }
    } catch (err) {
        // Fallback to plain text if highlighting fails
        highlighted = code;
    }

    return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code class="hljs">${highlighted}</code></pre>`;
};

// Configure marked for synchronous operation
marked.use({
    renderer,
    breaks: true,
    gfm: true,
    async: false  // Force synchronous operation
});

// Export synchronous markdown parser
export function parseMarkdown(text: string): string {
    try {
        const result = marked(text);
        // Ensure we return a string, not a Promise
        return typeof result === 'string' ? result : '';
    } catch (error) {
        console.error('Markdown parsing error:', error);
        return text; // Fallback to original text
    }
}
