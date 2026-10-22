/**
 * Pure Domain Rules for Omnichannel Email, SMS & WhatsApp Template Rendering
 * Zero external framework or database dependencies.
 */

export function renderTemplate(
  templateBody: string,
  mergeData: Record<string, string | number>,
): { rendered: string; missingTags: string[] } {
  const missingTags: string[] = [];
  const tagRegex = /\{{1,2}([a-zA-Z0-9_]+)\}{1,2}/g;

  const rendered = templateBody.replace(tagRegex, (match, tagName) => {
    if (Object.prototype.hasOwnProperty.call(mergeData, tagName)) {
      const val = mergeData[tagName];
      return val !== null && val !== undefined ? String(val) : '';
    }
    missingTags.push(tagName);
    return match; // Keep placeholder if missing
  });

  return {
    rendered,
    missingTags: [...new Set(missingTags)],
  };
}

export function sanitizeChatMessage(body: string): string {
  if (!body) return '';
  return body
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  // E.164 phone number standard validation (+ followed by 7 to 15 digits)
  const e164Regex = /^\+?[1-9]\d{6,14}$/;
  return e164Regex.test(phone.replace(/[\s\-()]/g, ''));
}
