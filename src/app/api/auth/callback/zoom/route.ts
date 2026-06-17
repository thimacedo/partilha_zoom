import { NextResponse } from 'next/server';

/**
 * Zoom OAuth Callback Handler
 * Exchanges the authorization 'code' for an 'access_token'.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ message: 'Missing authorization code' }, { status: 400 });
  }

  try {
    // 1. Exchange code for tokens
    const clientId = (process.env.ZOOM_APP_CLIENT_ID || '').trim();
    const clientSecret = (process.env.ZOOM_APP_CLIENT_SECRET || '').trim();
    
    // Construct redirect URI dynamically if not set in ENV, but fallback to known pattern
    const url = new URL(request.url);
    const fallbackRedirectUri = `${url.origin}/api/auth/callback/zoom`;
    const envRedirectUri = (process.env.ZOOM_APP_REDIRECT_URI || '').trim();
    const redirectUri = envRedirectUri || fallbackRedirectUri;

    // DIAGNOSTIC LOGS (Check these in Vercel Dashboard -> Logs)
    console.log('--- Zoom OAuth Debug ---');
    console.log('Detected ClientID (start):', clientId.substring(0, 4) + '...');
    console.log('Final RedirectURI used:', redirectUri);
    console.log('Using ENV RedirectURI?', !!envRedirectUri);
    console.log('------------------------');

    if (!clientId || !clientSecret) {
      console.error('Missing Zoom credentials in environment variables');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Zoom token exchange failed:', data);
      return NextResponse.json({ message: 'Auth failed', error: data }, { status: 500 });
    }

    // 2. Token management
    // In a real app, you would store data.access_token and data.refresh_token in a session/DB.
    // For this prototype, we redirect back to the home page.
    
    const responseRedirect = NextResponse.redirect(new URL('/', request.url));
    
    // Set a cookie or session with the access token if needed
    // responseRedirect.cookies.set('zoom_access_token', data.access_token, { httpOnly: true, secure: true });

    return responseRedirect;
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
