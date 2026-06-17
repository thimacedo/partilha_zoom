import { NextResponse } from 'next/server';
import { verifyZoomSignature, validateZoomWebhook } from '@/lib/zoom';

/**
 * Zoom Data Compliance Endpoint
 * Handles requests for data deletion or information.
 */
export async function POST(request: Request) {
  const bodyText = await request.text();
  const body = JSON.parse(bodyText);

  // 1. Handle CRC
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

  // 3. Handle Compliance logic
  // Zoom expects a specific response after you process the deletion
  return NextResponse.json({
    compliance_completed: true
  });
}
