// src/routes/api/session/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const cookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: 'lax' as const,
	path: '/',
	maxAge: 60 * 60 * 24 * 30 // 30 days
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const sessionData = await request.json();

		// Set session cookie
		cookies.set('dungeonmaster-session', JSON.stringify(sessionData), cookieOptions);

		return json({ success: true });
	} catch (error) {
		console.error('Failed to save session:', error);
		return json({ error: 'Failed to save session' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const sessionCookie = cookies.get('dungeonmaster-session');

		if (sessionCookie) {
			const sessionData = JSON.parse(sessionCookie);
			return json({ session: sessionData });
		}

		return json({ session: null });
	} catch (error) {
		console.error('Failed to load session:', error);
		return json({ session: null });
	}
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	try {
		// Clear the session cookie by setting it to expire immediately
		cookies.set('dungeonmaster-session', '', {
			...cookieOptions,
			maxAge: 0,
			expires: new Date(0)
		});

		return json({ success: true });
	} catch (error) {
		console.error('Failed to clear session:', error);
		return json({ error: 'Failed to clear session' }, { status: 500 });
	}
};
