import { APIError } from './errors';

const API_URL = 'http://localhost:8000/api/v1';

// Generic API client wrapper
export async function api<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const { headers, ...rest } = options;

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            // Important: send cookies with requests
            credentials: 'include',
            ...rest,
        });

        if (!response.ok) {
            let errorData: any = {};
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                try {
                    errorData = await response.json();
                } catch {
                    // If JSON parsing fails, use status text
                }
            }

            // Extract error message
            let errorMessage = errorData.detail || errorData.message || response.statusText;
            
            // Handle validation errors (422) - extract field-specific errors
            if (response.status === 422 && errorData.detail) {
                if (Array.isArray(errorData.detail)) {
                    // Pydantic validation errors format
                    const fieldErrors = errorData.detail.map((err: any) => {
                        const field = err.loc?.join('.') || 'field';
                        return `${field}: ${err.msg}`;
                    }).join(', ');
                    errorMessage = fieldErrors || errorMessage;
                }
            }

            throw new APIError(
                errorMessage || `API error: ${response.statusText}`,
                response.status,
                errorData
            );
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    } catch (error) {
        // Re-throw APIError as-is
        if (error instanceof APIError) {
            throw error;
        }
        
        // Handle network errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new APIError(
                'Network error: Unable to connect to the server. Please check your connection.',
                0
            );
        }
        
        // Re-throw unknown errors
        throw error;
    }
}
