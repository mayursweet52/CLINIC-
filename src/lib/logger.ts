import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const pinoInstance = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      },
});

export const logger = {
  info: (msgOrObj: any, ...args: any[]) => {
    (pinoInstance.info as any)(msgOrObj, ...args);
  },
  warn: (msgOrObj: any, ...args: any[]) => {
    (pinoInstance.warn as any)(msgOrObj, ...args);
  },
  error: (msgOrObj: any, ...args: any[]) => {
    (pinoInstance.error as any)(msgOrObj, ...args);
  },
  debug: (msgOrObj: any, ...args: any[]) => {
    (pinoInstance.debug as any)(msgOrObj, ...args);
  }
};

export default logger;
