import { Context } from 'hono';
import { ZodError } from 'zod';
import { ApiResponse } from '@kisanify/shared';

export function handleGlobalError(err: Error, c: Context): Response {
  console.error('[API Error]:', err);

  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }
    };
    return c.json(response, 400);
  }

  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected server error occurred'
    }
  };

  return c.json(response, 500);
}

export function formatSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  };
}

export function formatErrorResponse(code: string, message: string, details?: any): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
}
