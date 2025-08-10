// Centralized logging utility for AlphaSphere-AI
// Replaces console.log statements with proper logging

interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  private level: number;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';
    this.level = this.isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;
  }

  private formatMessage(level: string, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (context) {
      return `${prefix} ${message} ${JSON.stringify(context)}`;
    }
    return `${prefix} ${message}`;
  }

  private shouldLog(level: number): boolean {
    return level <= this.level;
  }

  error(message: string, context?: any): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      console.error(this.formatMessage('ERROR', message, context));
    }
  }

  warn(message: string, context?: any): void {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  info(message: string, context?: any): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.info(this.formatMessage('INFO', message, context));
    }
  }

  debug(message: string, context?: any): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, context));
    }
  }

  // Trading-specific logging methods
  trade(action: string, symbol: string, quantity: number, price: number): void {
    this.info(`Trade executed: ${action} ${quantity} ${symbol} @ $${price}`);
  }

  apiCall(service: string, endpoint: string, success: boolean, responseTime?: number): void {
    const message = `API call to ${service}/${endpoint} ${success ? 'succeeded' : 'failed'}`;
    const context = responseTime ? { responseTime: `${responseTime}ms` } : undefined;
    
    if (success) {
      this.debug(message, context);
    } else {
      this.warn(message, context);
    }
  }

  performance(operation: string, duration: number): void {
    this.debug(`Performance: ${operation} took ${duration}ms`);
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports for common use cases
export const logTrade = logger.trade.bind(logger);
export const logApiCall = logger.apiCall.bind(logger);
export const logPerformance = logger.performance.bind(logger);

export default logger;

