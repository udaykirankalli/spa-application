import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const activeUser = req.activeUser?.userId ?? 'anonymous';
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms user=${activeUser}`);
  });

  next();
}
