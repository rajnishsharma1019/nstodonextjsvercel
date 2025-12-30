export class APIError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'APIError';
        Object.setPrototypeOf(this, APIError.prototype);
    }

    static isUnauthorized(error: unknown): boolean {
        return error instanceof APIError && error.statusCode === 401;
    }

    static isValidationError(error: unknown): boolean {
        return error instanceof APIError && error.statusCode === 422;
    }

    static isNotFound(error: unknown): boolean {
        return error instanceof APIError && error.statusCode === 404;
    }

    static isServerError(error: unknown): boolean {
        return error instanceof APIError && error.statusCode >= 500;
    }
}




