// src/routes/api/gemini/+server.ts
import { json } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_AI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { prompt } = await request.json();

		if (!prompt) {
			return json({ error: 'Prompt is required' }, { status: 400 });
		}

		const model = genAI.getGenerativeModel({
			model: "gemini-2.0-flash-exp",
			generationConfig: {
				temperature: 0.7,
				topP: 0.8,
				topK: 40,
				maxOutputTokens: 300,
			}
		});

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();

		return json({ response: text });

	} catch (error) {
		console.error('Gemini API error:', error);
		return json({ error: 'Failed to generate response' }, { status: 500 });
	}
};
