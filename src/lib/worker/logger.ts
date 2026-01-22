// Worker Logger Module
// Centralized logging system for WebAssembly worker using functional approach

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

interface LoggerInstance {
  logs: LogEntry[];
  maxLogs: number;
  logLevel: "debug" | "info" | "warn" | "error";
  log: (level: string, message: string, data?: any) => void;
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
  getLogs: (level?: string) => LogEntry[];
  clearLogs: () => void;
  exportLogs: () => string;
}

// Create logger instance
function createLogger(): LoggerInstance {
  const logs: LogEntry[] = [];
  let maxLogs = 1000;
  let logLevel: "debug" | "info" | "warn" | "error" = "debug";

  const log = (level: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      data,
    };

    logs.push(logEntry);

    // Keep only recent logs
    if (logs.length > maxLogs) {
      logs.splice(0, logs.length - maxLogs);
    }

    // Console output with formatting
    const prefix = `[WORKER] ${level.toUpperCase()}`;
    switch (level) {
      case "debug":
        console.log(prefix, message, data);
        break;
      case "info":
        console.info(prefix, message, data);
        break;
      case "warn":
        console.warn(prefix, message, data);
        break;
      case "error":
        console.error(prefix, message, data);
        break;
      default:
        console.log(prefix, message, data);
    }
  };

  return {
    logs,
    get maxLogs() {
      return maxLogs;
    },
    set maxLogs(value: number) {
      maxLogs = value;
    },
    get logLevel() {
      return logLevel;
    },
    set logLevel(value: "debug" | "info" | "warn" | "error") {
      logLevel = value;
    },
    log,
    debug: (message: string, data?: any) => log("debug", message, data),
    info: (message: string, data?: any) => log("info", message, data),
    warn: (message: string, data?: any) => log("warn", message, data),
    error: (message: string, data?: any) => log("error", message, data),
    getLogs: (level?: string) => {
      if (level) {
        return logs.filter((log) => log.level === level.toUpperCase());
      }
      return logs;
    },
    clearLogs: () => {
      logs.length = 0;
    },
    exportLogs: () => JSON.stringify(logs, null, 2),
  };
}

// Create and export singleton instance
const logger = createLogger();

export { logger };
export type { LogEntry, LoggerInstance };
