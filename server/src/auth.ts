import { Request, Response, NextFunction } from 'express';
import { readDatabase, toPublicUser } from './storage';
import { PublicUser } from './types';

declare global {
  namespace Express {
    interface Request {
      activeUser?: PublicUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authorization = req.header('authorization') ?? '';
  const token = authorization.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    res.status(401).json({ message: 'Missing authorization token.' });
    return;
  }

  const database = await readDatabase();
  const session = database.sessions.find((entry) => entry.token === token);
  const storedUser = session ? database.users.find((user) => user.userId === session.userId) : undefined;

  if (!storedUser || storedUser.status !== 'Active') {
    res.status(401).json({ message: 'Session is invalid or the account is disabled.' });
    return;
  }

  req.activeUser = toPublicUser(storedUser);
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.activeUser?.role !== 'Admin') {
    res.status(403).json({ message: 'Admin role is required for this action.' });
    return;
  }

  next();
}
