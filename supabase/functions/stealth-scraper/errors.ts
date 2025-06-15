
export function logAndRespondError(operationId: string, message: string, status = 400, details: any = undefined) {
  const response = {
    error: message,
    operation_id: operationId,
    details,
    timestamp: new Date().toISOString()
  };
  console.error(`❌ [${operationId}] ${message}`, details);
  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json'
    }
  });
}
