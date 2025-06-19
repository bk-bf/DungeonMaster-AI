import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function testEnhancedPrompt() {
	const API_KEY = process.env.GOOGLE_AI_API_KEY;
	const genAI = new GoogleGenerativeAI(API_KEY);
	const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

	const enhancedPrompt = `You are a Dungeon Master running a D&D campaign. A player says: "I want to explore the mysterious cave entrance."

CRITICAL REQUIREMENTS:
- Write ONLY in second person ("You see...", "You hear...", "You feel...")
- NEVER use casual words like "okay", "alright", "well"
- Include rich sensory details (sight, sound, smell, touch, temperature)
- Create atmospheric tension and mood
- 150-200 words maximum
- END with 3-5 action recommendations in the following format: "You could [action 1], [action 2], or [action 3].... What do you want to do?"

Example action suggestions:
- "explore the area around you carefully"
- "dig into your memory if you recognize the growl"
- "check your equipment for useful items"

Describe what happens as they enter the cave, then provide specific action suggestions.`;

	console.log('Testing enhanced D&D prompt with action suggestions...');
	console.time('Response Time');

	const result = await model.generateContent(enhancedPrompt);
	const response = await result.response;
	const text = response.text();

	console.timeEnd('Response Time');
	console.log('Enhanced Response:');
	console.log('---');
	console.log(text);
	console.log('---');

	// Check if response ends with action suggestions
	if (text.includes('What do you want to do?')) {
		console.log('✅ Response includes action suggestions!');
	} else {
		console.log('❌ Response missing action suggestions format');
	}
}

testEnhancedPrompt();