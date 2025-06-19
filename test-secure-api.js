// test-secure-api.js
async function testSecureAPI() {
	try {
		const response = await fetch('http://localhost:5173/api/gemini', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				prompt: 'You are a Dungeon Master. A player enters a dark cave. What happens? (Keep response under 100 words)'
			})
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();
		console.log('✅ Secure API working!');
		console.log('Response:', data.response);

	} catch (error) {
		console.error('❌ API test failed:', error);
	}
}

testSecureAPI();
