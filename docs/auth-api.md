# Auth & User Management API

Module owner: **Saud** · Base URL: `http://localhost:5000/api`

All protected endpoints expect a JWT in the header:

```
Authorization: Bearer <token>
```

The token is returned by **register** and **login** and stays valid for `JWT_EXPIRES_IN` (default 7 days).

---

## Auth

### POST `/auth/register`

| Body field | Type   | Required |
| ---------- | ------ | -------- |
| `name`     | string | yes (2–50 chars) |
| `email`    | string | yes (unique, case-insensitive) |
| `password` | string | yes (min 6 chars) |

**201** →

```json
{
  "token": "<jwt>",
  "user": {
    "_id": "…", "name": "Saud", "email": "saud@test.com",
    "avatar": "", "isOnline": true, "lastSeen": "…", "createdAt": "…"
  }
}
```

Errors: `400` missing/invalid fields · `409` email already registered.

### POST `/auth/login`

Body: `{ "email", "password" }`

**200** → same shape as register. Sets `isOnline: true`.

Errors: `400` missing fields · `401` invalid credentials.

### POST `/auth/logout` 🔒

No body. Sets `isOnline: false` and stamps `lastSeen`.

**200** → `{ "message": "Logged out successfully" }`

---

## Users

### GET `/users/me` 🔒

**200** → `{ "user": { …profile } }` — the authenticated user.

### PUT `/users/me` 🔒

Any subset of:

| Body field        | Notes |
| ----------------- | ----- |
| `name`            | new display name |
| `avatar`          | image URL (empty string clears it) |
| `currentPassword` + `newPassword` | both required to change password |

**200** → `{ "user": { …updated profile } }`
Errors: `401` wrong current password · `400` validation.

### GET `/users` 🔒

**200** → `{ "users": [ …profiles ] }` — everyone except the requester,
sorted by name. Intended for the chat sidebar / new-conversation picker.

### GET `/users/:id` 🔒

**200** → `{ "user": { …profile } }` · `404` unknown id · `400` malformed id.

---

## Notes for integration

- The password hash is **never** serialized — `user.toProfile()` controls the public shape.
- `middleware/authMiddleware.js` exports:
  - `protect` — Express middleware that sets `req.user` (a full Mongoose `User` doc).
  - `verifyToken(token)` — for the **Socket.IO handshake** (Farhan):

    ```js
    const { verifyToken } = require('./middleware/authMiddleware');

    io.use(async (socket, next) => {
      try {
        const user = await verifyToken(socket.handshake.auth.token);
        if (!user) return next(new Error('Unauthorized'));
        socket.user = user;
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
    ```

- `isOnline` / `lastSeen` are set on login/logout today; the socket layer should
  also flip them on connect/disconnect for live presence (Siri's module reads them).

## Running without MongoDB installed

```bash
cd server
npm install
npm run smoke       # full auth test suite against an in-memory MongoDB
npm run dev:memory  # run the API on an in-memory MongoDB (data resets on exit)
```

With a real MongoDB: copy `.env.example` to `.env`, set `MONGO_URI`, then `npm run dev`.
