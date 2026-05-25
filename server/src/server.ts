import cors from 'cors';
import express from 'express';
import { v4 as uuid } from 'uuid';
import { authenticate, requireAdmin } from './auth';
import { delayedResponse } from './delay';
import { requestLogger } from './logger';
import { readDatabase, toPublicUser, writeDatabase } from './storage';
import { AccountStatus, UserRole } from './types';
import {
  isAccountStatus,
  isUserRole,
  readOptionalText,
  readRequiredText
} from './validators';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use(requestLogger);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', api: 'role-access-api' });
});

app.post('/api/auth/login', delayedResponse, async (req, res) => {
  const payload = req.body as Record<string, unknown>;
  const userId = readRequiredText(payload, 'userId');
  const password = readRequiredText(payload, 'password');
  const role = payload['role'];

  if (!userId || !password || !isUserRole(role)) {
    res.status(400).json({ message: 'User ID, password, and valid role are required.' });
    return;
  }

  const database = await readDatabase();
  const matchingUser = database.users.find(
    (user) => user.userId === userId && user.password === password && user.role === role
  );

  if (!matchingUser || matchingUser.status !== 'Active') {
    res.status(401).json({ message: 'Invalid credentials, role, or inactive account.' });
    return;
  }

  const token = uuid();
  database.sessions = database.sessions.filter((session) => session.userId !== matchingUser.userId);
  database.sessions.push({ token, userId: matchingUser.userId, createdAt: new Date().toISOString() });
  await writeDatabase(database);

  res.json({ token, user: toPublicUser(matchingUser) });
});

app.get('/api/auth/me', authenticate, delayedResponse, (req, res) => {
  res.json({ user: req.activeUser });
});

app.post('/api/auth/logout', authenticate, async (req, res) => {
  const authorization = req.header('authorization') ?? '';
  const token = authorization.replace(/^Bearer\s+/i, '').trim();
  const database = await readDatabase();
  database.sessions = database.sessions.filter((session) => session.token !== token);
  await writeDatabase(database);
  res.status(204).send();
});

app.get('/api/records', authenticate, delayedResponse, async (req, res) => {
  const database = await readDatabase();
  const activeUser = req.activeUser;
  const records =
    activeUser?.role === 'Admin'
      ? database.records
      : database.records.filter((record) => record.ownerUserId === activeUser?.userId);

  res.json({
    records,
    accessNote:
      activeUser?.role === 'Admin'
        ? 'Admin can view all records across the organization.'
        : 'General users can view records assigned to their own user ID.'
  });
});

app.get('/api/users', authenticate, requireAdmin, delayedResponse, async (_req, res) => {
  const database = await readDatabase();
  res.json({ users: database.users.map(toPublicUser) });
});

app.post('/api/users', authenticate, requireAdmin, async (req, res) => {
  const payload = req.body as Record<string, unknown>;
  const userId = readRequiredText(payload, 'userId');
  const displayName = readRequiredText(payload, 'displayName');
  const password = readRequiredText(payload, 'password');
  const role = payload['role'];
  const status = payload['status'] ?? 'Active';

  if (!userId || !displayName || !password || !role) {
    res.status(400).json({ message: 'User ID, display name, password, and role are required.' });
    return;
  }

  if (!isUserRole(role)) {
    res.status(400).json({ message: 'Role must be General User or Admin.' });
    return;
  }

  if (!isAccountStatus(status)) {
    res.status(400).json({ message: 'Status must be Active or Disabled.' });
    return;
  }

  const database = await readDatabase();
  if (database.users.some((user) => user.userId === userId)) {
    res.status(409).json({ message: 'User ID already exists.' });
    return;
  }

  const newUser = {
    id: `u-${uuid()}`,
    userId,
    displayName,
    department: readOptionalText(payload, 'department') ?? 'Unassigned',
    role,
    password,
    status,
    accessLevel: readOptionalText(payload, 'accessLevel') ?? 'Standard application access'
  };

  database.users.push(newUser);
  await writeDatabase(database);
  res.status(201).json({ user: toPublicUser(newUser) });
});

app.patch('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
  const database = await readDatabase();
  const user = database.users.find((entry) => entry.id === req.params.id);

  if (!user) {
    res.status(404).json({ message: 'User was not found.' });
    return;
  }

  const payload = req.body as Record<string, unknown>;
  const role = payload['role'];
  const status = payload['status'];

  if (role && !isUserRole(role)) {
    res.status(400).json({ message: 'Role must be General User or Admin.' });
    return;
  }

  if (status && !isAccountStatus(status)) {
    res.status(400).json({ message: 'Status must be Active or Disabled.' });
    return;
  }

  Object.assign(user, {
    displayName: readOptionalText(payload, 'displayName') ?? user.displayName,
    department: readOptionalText(payload, 'department') ?? user.department,
    role: role ?? user.role,
    status: status ?? user.status,
    accessLevel: readOptionalText(payload, 'accessLevel') ?? user.accessLevel,
    password: readOptionalText(payload, 'password') ?? user.password
  });

  await writeDatabase(database);
  res.json({ user: toPublicUser(user) });
});

app.delete('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
  const database = await readDatabase();
  const user = database.users.find((entry) => entry.id === req.params.id);

  if (!user) {
    res.status(404).json({ message: 'User was not found.' });
    return;
  }

  if (user.userId === req.activeUser?.userId) {
    res.status(400).json({ message: 'Admin cannot delete the account currently in use.' });
    return;
  }

  database.users = database.users.filter((entry) => entry.id !== req.params.id);
  database.sessions = database.sessions.filter((session) => session.userId !== user.userId);
  await writeDatabase(database);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Role access API is running on http://localhost:${port}`);
});
