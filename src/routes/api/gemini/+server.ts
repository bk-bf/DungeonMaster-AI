// src/routes/api/gemini/+server.ts
import { json } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_AI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

// Simple usage tracking (in production, use a database)
let dailyUsage = {
	date: new Date().toDateString(),
	requests: 0,
	tokens: 0,
	errors: 0
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Reset daily counter if new day
		const today = new Date().toDateString();
		if (dailyUsage.date !== today) {
			dailyUsage = { date: today, requests: 0, tokens: 0, errors: 0 };
		}

		// Check if approaching limits (conservative estimates)
		if (dailyUsage.requests >= 800) { // Conservative daily limit
			return json({
				error: 'Daily usage limit approaching. Please try again tomorrow.',
				usage: dailyUsage
			}, { status: 429 });
		}

		const { prompt } = await request.json();

		if (!prompt) {
			return json({ error: 'Prompt is required' }, { status: 400 });
		}

		// Estimate token count (rough approximation: 1 token ≈ 4 characters)
		const estimatedInputTokens = Math.ceil(prompt.length / 4);

		console.log(`Request ${dailyUsage.requests + 1} - Estimated tokens: ${estimatedInputTokens}`);

		const model = genAI.getGenerativeModel({
			model: "gemini-2.0-flash-exp",
			generationConfig: {
				temperature: 0.7,
				topP: 0.8,
				topK: 40,
				maxOutputTokens: 300,
			}
		});

		const startTime = Date.now();
		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();
		const endTime = Date.now();

		// Update usage tracking
		dailyUsage.requests++;
		dailyUsage.tokens += estimatedInputTokens + Math.ceil(text.length / 4);

		console.log(`✅ Request completed in ${endTime - startTime}ms`);
		console.log(`📊 Daily usage: ${dailyUsage.requests} requests, ~${dailyUsage.tokens} tokens`);

		return json({
			response: text,
			usage: {
				requestCount: dailyUsage.requests,
				estimatedTokens: dailyUsage.tokens,
				responseTime: endTime - startTime
			}
		});

	} catch (error) {
		dailyUsage.errors++;
		console.error('❌ Gemini API error:', error);

		// Check if it's a rate limit error
		if (error instanceof Error && (error.message?.includes('429') || error.message?.includes('rate limit'))) {
			console.warn('🚨 Rate limit hit! Daily usage:', dailyUsage);
			return json({
				error: 'Rate limit exceeded. Please wait before making more requests.',
				usage: dailyUsage
			}, { status: 429 });
		}

		return json({ error: 'Failed to generate response' }, { status: 500 });
	}
};

// Add usage endpoint for monitoring
export const GET: RequestHandler = async () => {
	return json({ usage: dailyUsage });
};
