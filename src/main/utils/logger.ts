import electronLog from 'electron-log';

electronLog.transports.file.level = 'info';
electronLog.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

const sanitizeMessage = (msg: string): string => {
  return msg
    .replace(/\/Users\/[^/]+/g, '/Users/[REDACTED]')
    .replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\[REDACTED]')
    .replace(/\/home\/[^/]+/g, '/home/[REDACTED]');
};

export const logger = {
  info: (message: string, ...args: any[]) => {
    electronLog.info(sanitizeMessage(message), ...args);
  },
  warn: (message: string, ...args: any[]) => {
    electronLog.warn(sanitizeMessage(message), ...args);
  },
  error: (message: string, error?: Error | any) => {
    if (error instanceof Error) {
      electronLog.error(sanitizeMessage(message), error.message, error.stack);
    } else {
      electronLog.error(sanitizeMessage(message), error);
    }
  },
  debug: (message: string, ...args: any[]) => {
    electronLog.debug(sanitizeMessage(message), ...args);
  },
};
