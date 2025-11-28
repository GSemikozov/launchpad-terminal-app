import { API_CONFIG } from '@app/config';
import type { ApiError, ApiResponse } from './types';

interface FetchOptions extends RequestInit {
  params?: Record<string, any>;
}

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/$/, '');

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw {
      message: `Invalid JSON response: ${text.substring(0, 100)}`,
      code: 'PARSE_ERROR',
      details: { text, status: response.status, statusText: response.statusText },
    } as ApiError;
  }
}

function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject({
        message: `Request timeout after ${timeoutMs}ms`,
        code: 'TIMEOUT',
        details: { timeout: timeoutMs },
      } as ApiError);
    }, timeoutMs);
  });
}

async function fetchApi<T>(endpoint: string, options?: FetchOptions): Promise<ApiResponse<T>> {
  const baseUrl = API_CONFIG.BASE_URL ? normalizeBaseUrl(API_CONFIG.BASE_URL) : '';
  let url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  if (options?.params) {
    const queryString = new URLSearchParams(
      Object.entries(options.params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    if (queryString) {
      url += `?${queryString}`;
    }
  }

  try {
    const headers: Record<string, string> = { ...options?.headers } as Record<string, string>;
    if (!(options?.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const fetchPromise = fetch(url, {
      ...options,
      headers,
    });

    const response = await Promise.race([
      fetchPromise,
      createTimeoutPromise(API_CONFIG.TIMEOUT),
    ]) as Response;

    if (!response) {
      throw {
        message: 'Network error: No response from server',
        code: 'NETWORK_ERROR',
        details: { url },
      } as ApiError;
    }

    if (response.status === 502) {
      throw {
        message: 'Bad Gateway: The server is temporarily unavailable',
        code: 'BAD_GATEWAY',
        details: {
          status: response.status,
          statusText: response.statusText,
          url,
          hint: 'Check if the API server is running and accessible',
        },
      } as ApiError;
    }

    if (response.status === 503) {
      throw {
        message: 'Service Unavailable: The server is temporarily overloaded',
        code: 'SERVICE_UNAVAILABLE',
        details: { status: response.status, statusText: response.statusText, url },
      } as ApiError;
    }

    if (response.status === 504) {
      throw {
        message: 'Gateway Timeout: The server did not respond in time',
        code: 'GATEWAY_TIMEOUT',
        details: { status: response.status, statusText: response.statusText, url },
      } as ApiError;
    }

    let data: any;
    try {
      data = await parseJsonResponse<any>(response);
    } catch (parseError) {
      if (!response.ok) {
        throw parseError;
      }
      data = {};
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || `API request failed: ${response.status} ${response.statusText}`,
        code: data?.code || `HTTP_${response.status}`,
        details: {
          ...data,
          status: response.status,
          statusText: response.statusText,
          url,
        },
      };
      throw error;
    }

    if (!data || typeof data !== 'object') {
      return {
        data: data as T,
        success: true,
      } as ApiResponse<T>;
    }

    if ('data' in data && 'success' in data) {
      return data as ApiResponse<T>;
    }

    return {
      data: data as T,
      success: true,
    } as ApiResponse<T>;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw {
        message: `Network error: ${error.message}`,
        code: 'NETWORK_ERROR',
        details: { originalError: error.message, url },
      } as ApiError;
    }

    if (error instanceof Error) {
      throw {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        details: { error, url },
      } as ApiError;
    }

    throw {
      message: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      details: { error, url },
    } as ApiError;
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body:
        body instanceof FormData || typeof body === 'string'
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
};
