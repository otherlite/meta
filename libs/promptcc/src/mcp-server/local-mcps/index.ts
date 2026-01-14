import { LocalMCP } from "../types";
import { dslWorkflowMCP } from "./dsl-workflow";
import { validateDSLMCP } from "./validate-dsl";
import { codegenDSLMCP } from "./codegen-dsl";

export function registerLocalMCPs(): LocalMCP[] {
  return [dslWorkflowMCP, validateDSLMCP, codegenDSLMCP];
}

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
