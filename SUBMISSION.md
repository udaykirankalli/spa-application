# Submission Notes

Date prepared: May 26, 2026

## Requirement Mapping

| Assessment Requirement | Implementation |
| --- | --- |
| Angular 12+ SPA | Angular 16 application in `client` using modules, routing, reactive forms, guards, and services. |
| Node.js or TypeScript source | TypeScript Express API in `server/src`. |
| Login page with User ID, Password, Role | `LoginComponent` posts credentials and selected role to `/api/auth/login`. |
| Dummy API with storage | API uses `server/data/local-db.json` through `storage.ts`. |
| Roles: General User and Admin | Shared role types are used by Angular models and server validation. |
| Logged-in user details | `DashboardComponent` shows user ID, role, status, department, and access level. |
| API call for user records | `RecordService` calls `/api/records`; API filters records by role. |
| Table display | Dashboard renders accessible records in table format. |
| Admin user management | `AdminComponent` creates, updates role/status, deletes, and reloads users. |
| API delay parameter | `delayMs` query parameter is supported by login, records, and users APIs. |
| Async processing showcase | Login, dashboard, and admin screens show loading states while delayed APIs respond. |
| User service and app load | `UserService`, `AuthService`, `RecordService`, and `StartupService` modularize app startup and API access. |

## Verification Commands

Run these before submission:

```bash
npm run build --prefix server
npm run build --prefix client
```

Optional API smoke test:

```bash
npm run dev --prefix server
npm run smoke --prefix server
```

Run the smoke test in a second terminal after the server starts.

## Demo Credentials

| Role | User ID | Password |
| --- | --- | --- |
| Admin | `admin01` | `Admin@123` |
| General User | `user01` | `User@123` |
| General User | `user02` | `User@456` |

## Design and Code Notes

- Components focus on screen behavior while API logic stays in Angular services.
- Auth state is restored on app load through `APP_INITIALIZER`.
- Route guards protect dashboard and admin routes.
- Backend middleware handles token authentication, admin authorization, request delay, and request logging.
- The local JSON database keeps the assessment easy to run without cloud credentials while leaving persistence isolated for replacement with MongoDB or DynamoDB.
