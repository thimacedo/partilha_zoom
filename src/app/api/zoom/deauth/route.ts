import { NextResponse } from 'next/server';
import { verifyZoomSignature, validateZoomWebhook } from '@/lib/zoom';

/**
 * Zoom App Deauthorization Endpoint
 * Mandatory for Zoom App Marketplace compliance.
 */
export async function POST(request: Request) {
  const bodyText = await request.text();
  const body = JSON.parse(bodyText);

  // 1. Handle CRC (Challenge-Response Check)
  if (body.event === 'url_validation') {
    const secretToken = process.env.ZOOM_WEBHOOK_SECRET_TOKEN || '';
    const response = validateZoomWebhook(body.payload.plainToken, secretToken);
    return NextResponse.json(response);
  }

  // 2. Verify Signature
  const signature = request.headers.get('x-zm-signature') || '';
  const timestamp = request.headers.get('x-zm-request-timestamp') || '';
  const secretToken = process.env.ZOOM_WEBHOOK_SECRET_TOKEN || '';

  if (!verifyZoomSignature(signature, timestamp, bodyText, secretToken)) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }

  // 3. Handle Deauthorization logic
  if (body.event === 'app_deauthorized') {
    const { payload } = body;
    console.log(`User ${payload.user_id} deauthorized SPH Timer at ${payload.deauthorization_time}`);
    
    // TODO: Clear user data from database if any is stored
    // In SPH Timer, we mostly use local storage, but if we had server-side state, we'd clear it here.
  }

  return NextResponse.json({ message: 'Success' });
}
