# Role Access SPA

Role Access SPA is an original Angular 12+ single page application with a TypeScript Node API. It demonstrates a practical login flow, role based access, delayed API calls, a logged-in user profile, user-specific records, and admin user management.

The project is intentionally small enough to review quickly, but the code is separated into the same layers normally used in a production SPA: Angular feature screens, shared core services, route guards, API middleware, persistence helpers, and typed request/response models.

## Demo Accounts

| Role | User ID | Password |
| --- | --- | --- |
| Admin | `admin01` | `Admin@123` |
| General User | `user01` | `User@123` |
| General User | `user02` | `User@456` |

## Run Locally

```bash
npm run install:all
npm start
```

Angular runs at `http://localhost:4200` and the API runs at `http://localhost:3000`.

To run the two parts separately:

```bash
npm run dev --prefix server
npm start --prefix client
```

To create production builds:

```bash
npm run build --prefix server
npm run build --prefix client
```

## Architecture

- `server/src` contains a small Express API written in TypeScript.
- `server/data/local-db.json` acts as the dummy local database.
- `client/src/app/core` contains shared models, services, guards, HTTP interceptor, and app initialization.
- `client/src/app/features` contains feature screens for login, dashboard, and admin user management.

The frontend uses `APP_INITIALIZER` through `StartupService` to load the active session when the app starts. API delay is controlled by the `delayMs` query parameter, for example `/api/records?delayMs=1500`, so async processing is easy to showcase during evaluation.

## Role Behavior

General users can sign in and view their own profile plus records assigned to their user ID. Admin users can view all records and open the user management screen, where they can create users, change roles, activate or disable accounts, and delete users other than the currently logged-in admin.

This makes the access difference visible in both the UI and the API:

- Angular guards prevent general users from opening `/admin/users`.
- The API `requireAdmin` middleware blocks user management endpoints unless the token belongs to an admin.
- The records endpoint filters records by `ownerUserId` for general users and returns all records for admins.

## Dummy Persistence Choice

The requirement allows local XML, MongoDB, or DynamoDB. This implementation uses `server/data/local-db.json` as a local database because it keeps the project easy to run during evaluation without cloud credentials or database setup. The storage code is isolated in `server/src/storage.ts`, so it can be replaced later with MongoDB or AWS DynamoDB without changing Angular components.

## Async Delay Demo

Several API calls accept `delayMs`:

```text
POST /api/auth/login?delayMs=900
GET /api/records?delayMs=1500
GET /api/users?delayMs=1000
```

The backend caps delay at five seconds. The UI shows loading messages while waiting, which demonstrates asynchronous processing on page load and during manual reloads.

## API Endpoints

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/records?delayMs=1500`
- `GET /api/users?delayMs=800`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

The API uses a simple bearer token stored in the local JSON database. It is intentionally lightweight for an assessment project, while keeping controllers, persistence, and auth responsibilities separated.

## Code Quality Notes

- Meaningful variable names are used instead of generated or copied names.
- UI state such as `loadingRecords`, `savingUser`, and `errorMessage` is kept inside the component that owns it.
- Shared API logic is moved into Angular services instead of being placed directly inside templates.
- Authentication headers are attached through an interceptor so API services stay focused on business actions.
