# Deployment (Backend)

## Required environment variables

- PORT (e.g. 5001)
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- JWT_SECRET (strong secret)
- CORS_ORIGIN (comma-separated list of allowed origins, e.g. `https://app.example.com,https://admin.example.com`)
- APP_VERSION (optional display value)

## Build and run

```bash
npm install
npm run migrate   # or db:migrate:* as needed
npm run start:prod
```

Health check:

- GET /api/health → `{ status: "ok", time, version, db }`

Notes:

- In production, stack traces are hidden by the centralized error handler.
- CORS is restricted to `CORS_ORIGIN`.


