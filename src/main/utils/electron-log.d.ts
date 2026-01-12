declare module 'electron-log' {
  const log: {
    transports: {
      file: {
        level: string;
        format: string;
      };
    };
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
  };

  export default log;
}
