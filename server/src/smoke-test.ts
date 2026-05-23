type LoginResult = {
  token: string;
  user: {
    userId: string;
    role: 'General User' | 'Admin';
  };
};

type RecordsResult = {
  records: Array<{
    id: string;
    ownerUserId: string;
  }>;
};

const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000/api';

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${options.method ?? 'GET'} ${path} failed with ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}

function bearer(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

async function login(userId: string, password: string, role: 'General User' | 'Admin'): Promise<LoginResult> {
  return requestJson<LoginResult>('/auth/login?delayMs=25', {
    method: 'POST',
    body: JSON.stringify({ userId, password, role })
  });
}

async function runSmokeTest(): Promise<void> {
  const adminLogin = await login('admin01', 'Admin@123', 'Admin');
  const adminRecords = await requestJson<RecordsResult>('/records?delayMs=25', {
    headers: bearer(adminLogin.token)
  });
  const adminUsers = await requestJson<{ users: unknown[] }>('/users?delayMs=25', {
    headers: bearer(adminLogin.token)
  });

  const generalLogin = await login('user01', 'User@123', 'General User');
  const generalRecords = await requestJson<RecordsResult>('/records?delayMs=25', {
    headers: bearer(generalLogin.token)
  });

  const generalHasOnlyOwnRecords = generalRecords.records.every(
    (record) => record.ownerUserId === generalLogin.user.userId
  );

  if (adminRecords.records.length <= generalRecords.records.length) {
    throw new Error('Admin should see more records than a general user.');
  }

  if (!generalHasOnlyOwnRecords) {
    throw new Error('General user received records owned by another account.');
  }

  if (adminUsers.users.length === 0) {
    throw new Error('Admin user list should not be empty.');
  }

  console.log('Smoke test passed: login, role filtering, admin users, and delayed API calls are working.');
}

runSmokeTest().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
