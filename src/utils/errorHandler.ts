// Centralized error handling utility
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ error: Error; timestamp: Date; context: string }> = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  logError(error: Error, context: string = 'Unknown'): void {
    const errorEntry = {
      error,
      timestamp: new Date(),
      context
    };

    this.errorLog.push(errorEntry);
    
    // Keep only last 50 errors
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50);
    }

    console.error(`[${context}] Error:`, error);
  }

  getErrorLog(): Array<{ error: Error; timestamp: Date; context: string }> {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  handleAsyncError(promise: Promise<any>, context: string): Promise<any> {
    return promise.catch(error => {
      this.logError(error, context);
      throw error;
    });
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Error boundary hook
export function useErrorHandler() {
  const logError = (error: Error, context: string) => {
    errorHandler.logError(error, context);
  };

  const handleAsyncError = (promise: Promise<any>, context: string) => {
    return errorHandler.handleAsyncError(promise, context);
  };

  return { logError, handleAsyncError };
}