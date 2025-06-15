
export function isValidOperationalTarget(target: string): boolean {
  try {
    const url = new URL(target);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

export async function parseRequestBody(req: Request, operationId: string): Promise<any> {
  let bodyText: string | undefined;
  try {
    bodyText = await req.text();
  } catch (parseError) {
    throw { err: 'Failed to decode request payload', details: parseError };
  }

  if (!bodyText || bodyText.trim() === '' || bodyText.trim() === '{}' || bodyText.trim() === 'null') {
    throw { err: "Missing or empty request body in POST." };
  }
  let requestData: any;
  try {
    requestData = JSON.parse(bodyText);
  } catch (e) {
    throw { err: "POST body is not valid JSON", details: bodyText };
  }
  if (!requestData || typeof requestData !== 'object') {
    throw { err: "POST body did not resolve to a valid object", details: bodyText };
  }
  return requestData;
}
