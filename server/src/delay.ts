import { Request, Response, NextFunction } from 'express';

export function delayedResponse(req: Request, _res: Response, next: NextFunction): void {
  const requestedDelay = Number(req.query.delayMs ?? 0);
  const delayMs = Number.isFinite(requestedDelay) ? Math.min(Math.max(requestedDelay, 0), 5000) : 0;

  if (delayMs === 0) {
    next();
    return;
  }

  setTimeout(next, delayMs);
}
