// Utility to create MCP response
export function createSuccessResponse(
  data: any,
  metadata?: Record<string, any>
): any {
  return {
    success: true,
    data,
    metadata,
  };
}

export function createErrorResponse(
  error: string,
  metadata?: Record<string, any>
): any {
  return {
    success: false,
    error,
    metadata,
  };
}
