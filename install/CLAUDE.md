# Claude Agent Guide — @krvinay/express_api

This guide tells Claude how to write APIs using the `@krvinay/express_api` framework. Follow these patterns and conventions exactly when generating route handlers, models, helpers, and activities.

---

## Project Structure

```
project-root/
├── src/
│   ├── activities/       # Background thread functions
│   │   └── index.js
│   ├── config/
│   │   ├── appConfig.js        # Main config — CORS, lang, db refs, flags
│   │   └── database.js         # Database credentials (not committed to git)
│   ├── helpers/
│   │   └── index.js            # Helper class extending req.util
│   ├── lang/
│   │   ├── en.js               # English i18n keys (always .js)
│   │   └── hi.js               # Hindi i18n keys
│   ├── logs/                   # Auto-created log files land here
│   ├── models/
│   │   ├── datasource/
│   │   │   └── <db_name>/      # One folder per database
│   │   │       ├── User.js     # Sequelize model file
│   │   │       └── init-models.js  # Optional: bulk model loader
│   │   └── index.js            # Exports mysql or Sequelize connection
│   └── routes/
│       └── index.js            # All route definitions
├── server.js                   # Entry point
└── .env                        # NODE_ENV, PORT, SRC, DB_*
```

File extensions inside `src/` are `.js`.

---

## The `req` Object

The package enriches every Express `req` with the following properties. Use them in every route handler and activity.

| Property | Type | Description |
|---|---|---|
| `req.data` | `object` | Merged `{ ...req.body, ...req.query }` — always use this instead of reading body/query separately |
| `req.db` | `object` | Sequelize models + `{ sequelize, Op, QueryTypes }` |
| `req.db.<ModelName>` | Sequelize model | Access a loaded model by name (e.g. `req.db.User`) |
| `req.db.getConnection(db_name?)` | function | Returns the raw Sequelize instance for `db_name` (defaults to `'default'`) |
| `req.getConnection(db_name?)` | function | Returns a `MySqlUtil` instance wrapping the Sequelize connection — use for raw SQL |
| `req.dbConnection(db_name?)` | function | Alias for `req.db.getConnection` — returns raw Sequelize instance |
| `req.config` | `object` | App config from `appConfig.js` (databases key removed per-request) |
| `req.util` | `util class` | Static utility helpers (pluralize, date, uuid, hash, …) |
| `req.getEnv(key)` | function | Read request-level environment info (`'host'`, `'remote-addr'`, `'url'`, `'base-url'`, `'full-url'`, `'https'`, `'protocol'`, or any header name) |
| `req.writeLog(fname?, message, append?)` | function | Write to `src/logs/<fname>.log`. Omit `fname` to write to `debug.log` |
| `req.formatMessage(key, ...values)` | function | Translate a message key using the active language file; supports `?` placeholders |
| `req._lng_messages` | `object` | Raw key→string map for the active language |
| `req.response_logger` | function | Called after every response — override in `appConfig` for custom logging |
| `req.app_lang` | `string` | Active language code (`'en'`, `'hi'`, …) |
| `req.NODE_ENV` | `string` | `process.env.NODE_ENV` |
| `req.begin_timestamp` | `Date` | When the request arrived |
| `req.end_timestamp` | `Date` | When the response was sent |

---

## Standard Response Format

All `res.json()` responses are automatically wrapped by `autoFormatResponse` (when enabled in `appConfig`):

```json
{
  "error": false,
  "code": 200,
  "message": "",
  "timestamp": 1712345678000,
  "data": {}
}
```

### Rules

- Set `error: true` when reporting a failure.
- Set `code` to an appropriate HTTP status code; the response HTTP status is set to match.
- Put result payload in `data`.
- `message` can be a plain string or an i18n key (translated automatically if `lang` is enabled).
- Any extra top-level keys not in `{error, code, message, data, timestamp, forceLogin}` are merged into `data`.
- Set `forceLogin: true` alongside `error: true` to return `code: 403` and include `"forceLogin": true` in the response.

```js
// Success
res.json({ data: { users } });

// Success with message
res.json({ message: 'USERS_FETCHED', data: { users } });

// Error
res.json({ error: true, code: 400, message: 'INVALID_INPUT' });

// Force re-login
res.json({ error: true, forceLogin: true, message: 'SESSION_EXPIRED' });
```

---

## Writing Routes

```js
// src/routes/index.js
'use strict';

const express = require('express');
const router = express.Router();

// Public routes (no auth middleware needed if listed in whitelist_urls in appConfig)
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.data;  // always use req.data
        const user = await req.db.User.findOne({ where: { email } });
        if (!user) return res.json({ error: true, code: 404, message: 'USER_NOT_FOUND' });
        res.json({ data: { token: '...' } });
    } catch (err) {
        next(err);  // pass to errorHandler — message is i18n-translated automatically
    }
});

// Protected route
router.get('/users', async (req, res, next) => {
    try {
        const users = await req.db.User.findAll();
        res.json({ data: { users } });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
```

### Key Route Rules

- **Always use `req.data`** instead of `req.body` or `req.query` directly.
- **Always call `next(err)`** on catch — never `res.json({ error: true })` inside catch unless you need a custom error shape.
- The global `errorHandler` catches anything passed to `next(err)` and returns `{ error: true, code: responseErrorCode, message: err.message }`. It translates `err.message` through i18n automatically.
- Throw with an i18n key to get auto-translated error messages: `throw new Error('INVALID_INPUT')`.

---

## Database — Raw SQL via MySqlUtil

Use `req.getConnection()` for MySQL1-style raw SQL. It wraps Sequelize but exposes a familiar callback/async API.

```js
// Async/await (preferred)
const conn = req.getConnection();                  // default DB
const conn = req.getConnection('analytics');       // named DB

// SELECT
const rows = await conn.querySync('SELECT * FROM users WHERE id = ?', userId);

// INSERT — returns OkPacket (insertId, affectedRows, etc.)
const result = await conn.querySync('INSERT INTO users SET ?', { name, email });
console.log(result.insertId);

// UPDATE / DELETE
await conn.querySync('UPDATE users SET active = ? WHERE id = ?', 1, userId);

// Parameterised with array
await conn.querySync('SELECT * FROM orders WHERE user_id = ? AND status = ?', [userId, 'pending']);

// Transactions
const tx = await conn.beginTransactionSync();
try {
    await tx.querySync('INSERT INTO orders SET ?', orderData);
    await tx.querySync('UPDATE inventory SET qty = qty - 1 WHERE id = ?', itemId);
    await tx.commitSync();
} catch (err) {
    await tx.rollbackSync();
    throw err;
}

// Callback style (legacy/compatibility)
conn.query('SELECT * FROM users', (err, rows) => { ... });
```

### SQL escaping helpers

```js
conn.escape(value)           // escape a value
conn.escapeId(identifier)    // escape a column/table name
conn.format(sql, values)     // format a query string manually
conn.raw(sql)                // mark a string as raw (no escaping)
```

---

## Database — Sequelize ORM via `req.db`

Model files live in `src/models/datasource/<db_name>/`. Each file exports a function `(sequelize, DataTypes) => Model`.

```js
// src/models/datasource/default/User.js
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('User', {
        id:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name:  { type: DataTypes.STRING },
        email: { type: DataTypes.STRING, unique: true },
    }, { tableName: 'users', timestamps: true });
};
```

Usage in routes:

```js
// ORM queries
const user = await req.db.User.findOne({ where: { id: req.data.id } });
const all  = await req.db.User.findAll({ where: { active: 1 }, order: [['name', 'ASC']] });
await req.db.User.create({ name, email });
await req.db.User.update({ active: 0 }, { where: { id } });

// Raw SQL via Sequelize instance
const conn = req.dbConnection();   // raw Sequelize instance
const rows = await conn.query('SELECT * FROM users', { type: req.db.QueryTypes.SELECT });
```

---

## appConfig.js

```js
// src/config/appConfig.js
module.exports = (req) => {
    req.config = {
        // --- Behaviour flags ---
        autoFormatResponse: true,       // wrap all res.json() in standard envelope
        bindDatabase: true,             // attach req.db and req.getConnection
        bindUtil: true,                 // attach req.util

        // --- Security headers ---
        enable_security_header: true,
        allowedOrigins: ['https://yourapp.com', 'https://*.yourapp.com'],
        // allowedOrigins: ['*']        // dev only (non-production)
        allowedMethods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        allowedHeaders: 'X-Custom-Header',

        // --- Database error masking ---
        db_error_message: 'Database error. Please try again.',

        // --- Console suppression ---
        disableConsoleLog: false,
        disableConsoleInfo: false,

        // --- i18n ---
        lang: true,
        lang_var: 'accept-language',    // header name or function(req) => langCode
        lang_default: 'en',

        // --- Custom response headers ---
        headers: { 'X-App-Version': '1.0.0' },

        // --- Public (no-auth) routes ---
        whitelist_urls: ['/login', '/health'],

        // --- Database references ---
        databases: require('./database')(req),
    };

    // --- Response logger hook ---
    req.response_logger = (req, err, response) => {
        if (err) req.writeLog('errors', err.stack);
    };
};
```

---

## database.js

```js
// src/config/database.js
module.exports = (req) => ({
    default: {
        host:     process.env.DB_HOST,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        // pool: { min: 2, max: 20, idle: 30000, acquire: 30000, evict: 1000 }
        // timezone: '+05:30'
        // dateStrings: true
        // logging: (sql, ms) => req.writeLog('queries', `[${ms}ms] ${sql}`)
    },
    analytics: {
        host:     process.env.ANALYTICS_DB_HOST,
        username: process.env.ANALYTICS_DB_USER,
        password: process.env.ANALYTICS_DB_PASSWORD,
        database: process.env.ANALYTICS_DB_NAME,
    }
});
```

---

## i18n — Language Files

```js
// src/lang/en.js
module.exports = {
    USER_NOT_FOUND:   'User not found.',
    INVALID_INPUT:    'Invalid input provided.',
    SESSION_EXPIRED:  'Your session has expired. Please log in again.',
    USERS_FETCHED:    'Users retrieved successfully.',
    WELCOME:          'Welcome, ?!',      // ? is replaced by formatMessage positional args
};
```

Usage:

```js
// Auto-translated via errorHandler (throw with key)
throw new Error('USER_NOT_FOUND');

// Auto-translated via requestHandler (res.json with key as message)
res.json({ error: true, code: 404, message: 'USER_NOT_FOUND' });

// Manual translation with placeholder substitution
const msg = req.formatMessage('WELCOME', userName);  // "Welcome, Alice!"
```

---

## Helpers

```js
// src/helpers/index.js
'use strict';
const util = require('@krvinay/express_api/util');

class Helper extends util {
    static sanitize(str) {
        return (str || '').trim().toLowerCase();
    }

    static paginate(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        return { limit, offset };
    }
}

module.exports = Helper;
```

Usage in routes:

```js
const Helper = require('../helpers');
const clean = Helper.sanitize(req.data.email);
const { limit, offset } = Helper.paginate(req.data.page, req.data.limit);
```

Built-in `util` static methods available on `req.util`:

| Method | Description |
|---|---|
| `util.obj_merge(target, ...sources)` | Deep merge objects |
| `util.get_ipv4_addr(mixed)` | Extract IPv4 from mixed IP string |
| `util.pluralize(word)` | English plural form |
| `util.singularize(word)` | English singular form |
| `util.log(fname, message, append?)` | Alias for `req.writeLog` |
| `util.env(req, key)` | Alias for `req.getEnv(key)` |
| Date helpers | Inherited from `date` base class |

---

## Activities (Background Threads)

Activities run in a forked child process. The child process has access to `req` (including `req.db`, `req.util`, etc.) and the `payload` sent from the parent.

```js
// src/activities/index.js
'use strict';

module.exports = {
    /**
     * @param {object} req  - Full req object (db, util, config, writeLog, etc.)
     * @param {object} payload - Data sent from the calling route
     * @returns {any}  - Returned value is sent back as thread result
     */
    async main(req, payload) {
        const { userId } = payload;
        const conn = req.getConnection();
        const rows = await conn.querySync('SELECT * FROM jobs WHERE user_id = ?', userId);
        return { jobs: rows };
    },

    async sendEmail(req, payload) {
        // long-running work here
        return { sent: true };
    }
};
```

Calling a thread from a route:

```js
const execNewThreadSync = require('@krvinay/express_api/threads');

// Fire and forget (no timeout)
execNewThreadSync('index', 'sendEmail', { userId: req.data.userId }, req.headers, (err, result) => {
    if (err) return req.writeLog('thread_errors', err.message);
    req.writeLog('threads', result);
});

// With timeout (kills child if no response within N ms)
execNewThreadSync('index', 'main', req.data, req.headers, (err, result) => {
    if (err) req.writeLog('errors', err.message);
}, 5000);
```

### Thread Rules

- The activity file must live in `src/activities/<activity>.js`.
- The exported function name is passed as `execFunction` (default `'main'`).
- The function receives `(req, payload)` and must return a value or a Promise.
- `throw new Error(...)` inside an activity is caught and returned as `{ error: true, message }`.
- `timeout` is optional — omit it entirely if you do not want the child killed after a deadline.
- Always pass `req.headers` as the `headers` argument so the child has full request context.

---

## Logging

```js
// Write to src/logs/debug.log (default)
req.writeLog(someObject);
req.writeLog('Something happened');

// Write to src/logs/payments.log
req.writeLog('payments', { txId, amount });

// Write to src/logs/payments/refunds.log (nested path)
req.writeLog('payments/refunds', refundData);

// Overwrite instead of append
req.writeLog('report', reportData, false);
```

---

## Environment Variables

```env
NODE_ENV=dev           # dev | production
PORT=8080
SRC=src                # source directory (set during install)

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=secret
DB_NAME=mydb
```

Access in code: `process.env.DB_HOST` or via `req.getEnv('host')` for request-level values.

---

## Security Headers (appConfig)

When `enable_security_header: true`, the middleware automatically sets:

- `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Permitted-Cross-Domain-Policies`, `Cache-Control: no-store`
- CORS headers based on `allowedOrigins` (exact match + wildcard subdomain `*.domain.com`)
- `X-Powered-By` and `Server` headers are removed
- `X-Request-ID` and `X-Correlation-ID` are set per request

Configure `allowedOrigins: ['*']` only in non-production for open CORS. In production, list explicit origins.

---

## Common Patterns

### Authentication middleware

```js
// src/routes/index.js
const authMiddleware = (req, res, next) => {
    const whitelist = req.config.whitelist_urls || [];
    if (whitelist.includes(req.path)) return next();
    const token = req.headers.authorization;
    if (!token) return res.json({ error: true, code: 401, message: 'UNAUTHORIZED' });
    // verify token ...
    next();
};

router.use(authMiddleware);
```

### Pagination

```js
router.get('/items', async (req, res, next) => {
    try {
        const page  = parseInt(req.data.page)  || 1;
        const limit = parseInt(req.data.limit) || 20;
        const offset = (page - 1) * limit;
        const conn = req.getConnection();
        const [total] = await conn.querySync('SELECT COUNT(*) as cnt FROM items');
        const items   = await conn.querySync('SELECT * FROM items LIMIT ? OFFSET ?', limit, offset);
        res.json({ data: { items, total: total.cnt, page, limit } });
    } catch (err) {
        next(err);
    }
});
```

### Transactions

```js
router.post('/transfer', async (req, res, next) => {
    const conn = req.getConnection();
    const tx = await conn.beginTransactionSync();
    try {
        await tx.querySync('UPDATE wallets SET balance = balance - ? WHERE id = ?', req.data.amount, req.data.from);
        await tx.querySync('UPDATE wallets SET balance = balance + ? WHERE id = ?', req.data.amount, req.data.to);
        await tx.commitSync();
        res.json({ message: 'TRANSFER_SUCCESS' });
    } catch (err) {
        await tx.rollbackSync();
        next(err);
    }
});
```

---

## What NOT to do

- Do NOT read `req.body` or `req.query` directly — always use `req.data`.
- Do NOT `res.json({ error: true, message: err.message })` inside a catch — call `next(err)` instead.
- Do NOT import `express` inside route files and create a new `Router` in a way that bypasses the package's middleware — always export a standard Express router.
- Do NOT put database credentials directly in `appConfig.js` — keep them in `database.js` loaded from `.env`.
- Do NOT `console.log` sensitive data — use `req.writeLog` to write to files.
- Do NOT mutate `req.config` in route handlers — it is shallow-cloned per request but shared read-only.
