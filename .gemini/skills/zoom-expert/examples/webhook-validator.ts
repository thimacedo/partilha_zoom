import crypto from 'crypto';

/**
 * Zoom Webhook CRC (Challenge-Response Check) Validator
 * 
 * When you add a new Webhook URL in the Zoom App Marketplace, 
 * Zoom sends a 'url_validation' event to your endpoint.
 * You must respond with the hashed plainToken to verify ownership.
 */
export function validateZoomWebhook(
  plainToken: string,
  secretToken: string
): { plainToken: string; encryptedToken: string } {
  // Hash the plainToken using your App's Secret Token (HMAC-SHA256)
  const hash = crypto
    .createHmac('sha256', secretToken)
    .update(plainToken)
    .digest('hex');

  return {
    plainToken: plainToken,
    encryptedToken: hash
  };
}

/**
 * Zoom Event Signature Validator
 * 
 * Use this to verify that incoming webhook payloads are actually from Zoom.
 */
export function verifyZoomSignature(
  headerSignature: string,
  headerTimestamp: string,
  requestBody: string,
  secretToken: string
): boolean {
  // Construct the message string
  const message = `v0:${headerTimestamp}:${requestBody}`;
  
  // Compute the signature
  const hash = crypto
    .createHmac('sha256', secretToken)
    .update(message)
    .digest('hex');
  
  const signature = `v0=${hash}`;

  // Use timingSafeEqual to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(headerSignature),
    Buffer.from(signature)
  );
}
