/**
 * Simple structured logger for MCP server
 * Provides level-based logging with timestamps and consistent formatting
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export class Logger {
  private debugMode: boolean;

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode;
  }

  private formatTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  private formatMessage(level: LogLevel, context: string, message: string): string {
    const timestamp = this.formatTimestamp();
    return `[${timestamp}] [${level}] [${context}] ${message}`;
  }

  debug(context: string, message: string): void {
    if (this.debugMode) {
      console.error(this.formatMessage('DEBUG', context, message));
    }
  }

  info(context: string, message: string): void {
    console.error(this.formatMessage('INFO', context, message));
  }

  warn(context: string, message: string): void {
    console.error(this.formatMessage('WARN', context, message));
  }

  error(context: string, message: string): void {
    console.error(this.formatMessage('ERROR', context, message));
  }

  /**
   * Log with custom level (for flexibility)
   */
  log(level: LogLevel, context: string, message: string): void {
    switch (level) {
      case 'DEBUG':
        this.debug(context, message);
        break;
      case 'INFO':
        this.info(context, message);
        break;
      case 'WARN':
        this.warn(context, message);
        break;
      case 'ERROR':
        this.error(context, message);
        break;
    }
  }
}

export default Logger;
