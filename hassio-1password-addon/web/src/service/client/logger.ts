import { Logger, createLogger, format, transports } from 'winston';

export type { Logger };

const loggerFormat = format.printf(({ level, message, timestamp, ...rest }) => {
  return `${timestamp} [${level}] ${message} ${Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''}`;
});

const logLevel = ['debug', 'info'].includes(process.env.APP_LOG_LEVEL as string)
  ? process.env.APP_LOG_LEVEL
  : 'debug';

export const logger = createLogger({
  level: logLevel,
  format: format.combine(
    format.cli(),
    format.splat(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    loggerFormat
  ),
  transports: [new transports.Console()]
});
