import pino from 'pino';
declare const logger: pino.Logger<never, boolean>;
export declare function createEngineLogger(engineName: string): pino.Logger<never, boolean>;
export declare function requestLogger(): (req: any, res: any, next: any) => void;
export declare function logError(logger: pino.Logger, error: Error, context?: Record<string, any>): void;
export declare const auditLogger: pino.Logger<never, boolean>;
export declare function auditLog(action: string, details: Record<string, any>, userId?: string): void;
export default logger;
//# sourceMappingURL=logger.d.ts.map