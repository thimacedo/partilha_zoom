import crypto from 'crypto';

/**
 * Zoom Webhook CRC (Challenge-Response Check) Validator
 */
export function validateZoomWebhook(
  plainToken: string,
  secretToken: string
): { plainToken: string; encryptedToken: string } {
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
 */
export function verifyZoomSignature(
  headerSignature: string,
  headerTimestamp: string,
  requestBody: string,
  secretToken: string
): boolean {
  const message = `v0:${headerTimestamp}:${requestBody}`;
  
  const hash = crypto
    .createHmac('sha256', secretToken)
    .update(message)
    .digest('hex');
  
  const signature = `v0=${hash}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(headerSignature),
      Buffer.from(signature)
    );
  } catch (e) {
    return false;
  }
}
