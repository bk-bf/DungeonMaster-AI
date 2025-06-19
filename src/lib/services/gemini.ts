// src/lib/services/gemini.ts - SECURE CLIENT-SIDE VERSION
class GeminiService {
	async generateResponse(prompt: string): Promise<string> {
		try {
			console.log('Sending request to secure API endpoint...');
			const startTime = Date.now();

			const response = await this.generateResponseWithRetry(prompt);
			const endTime = Date.now();

			console.log(`Gemini response received in ${endTime - startTime}ms`);

			return this.cleanResponse(response);

		} catch (error) {
			console.error('Gemini API error:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			throw new Error(`Failed to generate response: ${errorMessage}`);
		}
	}

	async generateResponseWithRetry(prompt: string, retries = 3): Promise<string> {
		for (let i = 0; i < retries; i++) {
			try {
				const response = await fetch('/api/gemini', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ prompt })
				});

				if (response.status === 429) {
					// Rate limit hit - wait before retry
					const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
					console.warn(`Rate limit hit, waiting ${waitTime}ms before retry ${i + 1}/${retries}`);
					await new Promise(resolve => setTimeout(resolve, waitTime));
					continue;
				}

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || `HTTP ${response.status}`);
				}

				const data = await response.json();
				return data.response;

			} catch (error) {
				if (i === retries - 1) throw error;
				await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
			}
		}

		throw new Error('Max retries exceeded');
	}

	private cleanResponse(rawResponse: string): string {
		let cleaned = rawResponse.trim();

		// Check if response was cut off mid-sentence
		if (!this.isCompleteResponse(cleaned)) {
			console.warn('Response appears to be cut off, may need higher token limit');
		}


		// Remove forbidden phrases
		//cleaned = cleaned.replace(/What's your move\?\s*🎯?\s*$/gm, '');


		// Remove trailing emojis if they're orphaned
		//cleaned = cleaned.replace(/\s*🎯\s*$/, '');

		// Remove AI disclaimers and meta-commentary
		cleaned = cleaned.replace(/^(As an AI|I'm an AI|I am an AI).*?\n/gm, '');
		cleaned = cleaned.replace(/\(.*?Note:.*?\)/g, '');
		cleaned = cleaned.replace(/\*\*Note:.*?\*\*/g, '');

		// Fix common formatting issues
		cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '**$1**'); // Preserve markdown bold
		cleaned = cleaned.replace(/^\*\s+/gm, '- '); // Convert asterisk lists to markdown
		cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Normalize line breaks

		// Ensure proper D&D formatting
		if (!cleaned.includes('##')) {
			cleaned = `## **Current Scene** 🏰\n\n${cleaned}`;
		}

		return cleaned;
	}

	private isCompleteResponse(response: string): boolean {
		// Check for common signs of incomplete responses
		const incompletePatterns = [
			/\d+$/, // Ends with a number (like "about 10")
			/\w+\s*$/, // Ends abruptly mid-word
			/,\s*$/, // Ends with comma
			/\.\.\.$/, // Ends with ellipsis
		];

		const hasCallToAction = response.includes('🎯') ||
			response.includes('What\'s your') ||
			response.includes('How do you') ||
			response.includes('choice');

		const seemsIncomplete = incompletePatterns.some(pattern => pattern.test(response));

		return hasCallToAction && !seemsIncomplete;
	}

	private validateDnDResponse(response: string): boolean {
		// Check for required D&D elements
		const hasLocationHeader = /## \*\*.*?\*\*/.test(response);
		const hasActionPrompt = response.includes('What would you like') || response.includes('You can:');
		const hasCallToAction = response.includes('What\'s your move?');
		const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(response);

		return hasLocationHeader && hasActionPrompt && hasCallToAction && hasEmojis;
	}

	async isAvailable(): Promise<boolean> {
		try {
			const response = await fetch('/api/gemini', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: 'test' })
			});
			return response.ok;
		} catch {
			return false;
		}
	}
}

export const geminiService = new GeminiService();