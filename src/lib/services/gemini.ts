// src/lib/services/gemini.ts - SECURE CLIENT-SIDE VERSION
class GeminiService {
	async generateResponse(prompt: string): Promise<string> {
		try {
			console.log('Sending request to secure API endpoint...');
			const startTime = Date.now();

			const response = await fetch('/api/gemini', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prompt })
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'API request failed');
			}

			const data = await response.json();
			const endTime = Date.now();

			console.log(`Gemini response received in ${endTime - startTime}ms`);

			return this.cleanResponse(data.response);

		} catch (error) {
			console.error('Gemini API error:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			throw new Error(`Failed to generate response: ${errorMessage}`);
		}
	}

	private cleanResponse(rawResponse: string): string {
		// Clean up the response for D&D context
		let cleaned = rawResponse
			.trim()
			.replace(/\*\*(.*?)\*\*/g, '**$1**') // Preserve markdown bold
			.replace(/^\*\s+/gm, '- ') // Convert asterisk lists to markdown
			.replace(/\n{3,}/g, '\n\n'); // Normalize excessive line breaks

		return cleaned;
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
