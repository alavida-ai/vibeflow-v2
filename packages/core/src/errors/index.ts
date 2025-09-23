// Base error class
class VibeflowError extends Error {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.originalError = originalError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toLogObject(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : undefined
    };
  }
}

// Specific error classes
export class DatabaseError extends VibeflowError {
  constructor(message = 'Database operation failed', originalError?: Error) {
    super(message, originalError);
  }
}

export class ValidationError extends VibeflowError {
  constructor(message = 'Validation failed', originalError?: Error) {
    super(message, originalError);
  }
}

export class EnvironmentError extends VibeflowError {
  constructor(message = 'Environment error', originalError?: Error) {
    super(message, originalError);
  }
}

export class ApiError extends VibeflowError {
  constructor(message = 'API request failed', originalError?: Error) {
    super(message, originalError);
  }
}

export class AuthError extends VibeflowError {
  constructor(message = 'Authentication failed', originalError?: Error) {
    super(message, originalError);
  }
}

export class NetworkError extends VibeflowError {
  constructor(message = 'Network operation failed', originalError?: Error) {
    super(message, originalError);
  }
}

export class ConfigError extends VibeflowError {
  constructor(message = 'Configuration error', originalError?: Error) {
    super(message, originalError);
  }
}

// Clean API access
export const Errors = {
  DatabaseError: (message?: string, originalError?: Error) => new DatabaseError(message, originalError),
  ValidationError: (message?: string, originalError?: Error) => new ValidationError(message, originalError),
  ApiError: (message?: string, originalError?: Error) => new ApiError(message, originalError),
  AuthError: (message?: string, originalError?: Error) => new AuthError(message, originalError),
  NetworkError: (message?: string, originalError?: Error) => new NetworkError(message, originalError),
  ConfigError: (message?: string, originalError?: Error) => new ConfigError(message, originalError)
};

// Helper function to log errors
export function logError(logger: any, error: unknown, context?: Record<string, any>) {
  if (error instanceof VibeflowError) {
    logger.error({ ...error.toLogObject(), ...context }, error.message);
  } else if (error instanceof Error) {
    logger.error({ 
      name: error.name, 
      message: error.message, 
      stack: error.stack,
      ...context 
    }, error.message);
  } else {
    logger.error({ error: String(error), ...context }, 'Unknown error');
  }
}
