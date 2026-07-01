const formatMessage = (level: string, message: string) => {
  return `[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}`;
};

export const logger = {
  info(message: string) {
    console.log(formatMessage('info', message));
  },
  warn(message: string) {
    console.warn(formatMessage('warn', message));
  },
  error(message: string) {
    console.error(formatMessage('error', message));
  }
};
