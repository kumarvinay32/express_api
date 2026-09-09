# Express API Microservice

A comprehensive Node.js API microservice framework built on Express, MySQL2, and Sequelize. This package provides a complete, production-ready setup to rapidly develop robust APIs — in JavaScript or TypeScript.

## 🆕 What's new in v2.2.0

- **`closeConnection()` for ad-hoc connections** — asynchronously close and evict cached ad-hoc database connection pools by passing the credentials object, available via `req.closeConnection()` and the standalone `mysql.closeConnection()` export, releasing idle connections and memory (see [Database access](#-database-access))
- **Clean installations** — removed the `postinstall` script from `package.json` for completely silent, script-free installs during `npm install` and CI/CD runs

<details>
<summary>What's new in v2.1.0</summary>

- **Breaking: `mysql.db` and `mysql.dbConnection` removed from the standalone `@krvinay/express_api/mysql` export** — use `mysql.getConnectionORM('default')` instead (see [Database access](#-database-access)). `req.db` / `req.dbConnection` / `req.db.getConnection` on the per-request `req` object keep working (but see the deprecations below)
- **`req.getConnectionORM()`** — new function that loads Sequelize models into an isolated object (`orm.<ModelName>`) instead of the shared `req.db`, so loading a model folder for an ad-hoc/tenant connection can't overwrite models loaded elsewhere. Works for configured databases too — `req.getConnectionORM('default')` — with its own independent model bindings (see [Database access](#-database-access))
- **Ad-hoc database credentials** — `getConnection()` now accepts a credentials object to connect to a database that isn't declared in `src/config/database.js`, with automatic per-credential connection caching (see [Database access](#-database-access))
- **`disableSequelizeORM` config flag** — set `disableSequelizeORM: true` in `appConfig.js` when you only need raw SQL: `req.db` is then not created at all (`undefined`). Database connections are still opened, and `req.getConnection()` / on-demand `req.getConnectionORM()` keep working regardless
- **Deprecated: `req.db` and `req.dbConnection()`** — everything exposed on `req.db` (models, `sequelize`, `Op`, `QueryTypes`, `<db_name>_connection`, `getConnection`) and the `req.dbConnection()` helper are deprecated and **will be removed in v3.0.0**. Use `req.getConnectionORM(db_name?)` for models/`Op`/`QueryTypes` and `req.getConnection(db_name?).connection` for the raw Sequelize instance. Both still work throughout v2.x — a one-time `DeprecationWarning` is emitted on first use of each
- **Fix:** Sequelize model loading now runs synchronously and fully completes during startup, closing a race window where requests could arrive before `req.db` was populated
- **Fix:** `util.pluralize`/`util.singularize` — uninflected words (`sheep`, `fish`, `news`, `series`, …) were being inflected anyway, and some singularize rules leaked a literal `$2` into the result (`series` → `s$2eries`)
- **Fix:** `util.get_ipv4_addr` now finds the IPv4 address in a comma-separated list (e.g. an `X-Forwarded-For` chain) — previously only the first comma was handled — and non-numeric segments (`a.b.c.d`) are no longer accepted as IPv4
- **Fix:** `util.generate_password` — a charset typo duplicated `a` and made `z` unreachable in alphanumeric passwords
- **Fix:** `util.underscore` no longer throws on strings without an uppercase letter; `util.format`/`req.formatMessage` no longer drop falsy placeholder values (`0`, `false`)
- **Fix:** `res.json(null)` (or any JSON scalar) no longer crashes the auto-format response pipeline — scalars are wrapped as `data`
- **Fix:** thread calls without a callback no longer crash the parent process when the child responds; error-handler redirects URL-encode the error message; nested `req.writeLog` paths (`'payments/refunds'`) now work on Windows too

</details>

<details>
<summary>What's new in v2.0.0</summary>

- **First-class TypeScript support** — every application file can be `.js` or `.ts`; the installer scaffolds TypeScript projects and full typings ship with the package (see [TypeScript Support](#-typescript-support))
- **`npx express-api init`** — interactive scaffolding CLI (source dir, language, Express version) that scaffolds the project, records the dependencies at your chosen versions in `package.json`, and installs them — nothing runs automatically on `npm install`
- **Hardened runtime** — thread workers report crashes instead of hanging, CORS preflight no longer crashes on missing config, invalid HTTP codes are sanitized, `util.mt_rand`/`generate_password` use cryptographically secure randomness, and the undeclared `uuid` dependency was replaced with Node's built-in `crypto.randomUUID`
- **Your project owns its dependencies** — `express`, `sequelize`, and `mysql2` are no longer pre-installed by npm; `npx express-api init` installs them at the versions you choose and records them in your `package.json` (see [Installation](#-installation))
- **Express 4 and 5 compatible** — the accepted `express` range is `^4.21.2 || ^5.0.0`
- **Async route errors are caught** — a rejected `async` handler is forwarded to the framework's error handler and returns the standard error envelope, on Express 4 too (which natively ignores handler promises). `try/catch + next(err)` still works and is still recommended for custom handling
- **Breaking:** the deprecated `util`, `threads`, and `mysql` properties on the main export were removed — see [Migrating to v2](#-migrating-to-v2)

</details>

## 🚚 Migrating to v2

The properties attached to the main export (deprecated since v1) were removed. Import the subpath modules instead:

```js
// ❌ v1 (removed)
const api = require("@krvinay/express_api");
api.util.pluralize('user');
api.threads('index', 'main', payload, headers, callback);
api.mysql.getConnection();

// ✅ v2
const util = require("@krvinay/express_api/util");
const threads = require("@krvinay/express_api/threads");
const mysql = require("@krvinay/express_api/mysql");

util.pluralize('user');
threads('index', 'main', payload, headers, callback);
mysql.getConnection();
```

Everything else is backward compatible: `server.use(require("@krvinay/express_api"))`, the `req` API, response envelope, configs, and scaffolded project layout are unchanged.

## 🚚 Migrating to v2.1

Only the standalone `@krvinay/express_api/mysql` export changed — `.db` and `.dbConnection` were removed from it. Replace the old model-loading pattern with `getConnectionORM`:

```js
// ❌ v2.0 (removed, standalone mysql export only)
const models = mysql.db;
models.connection = models.getConnection();
module.exports = models;

// ✅ v2.1
module.exports = mysql.getConnectionORM('default');
```

`req.db`, `req.dbConnection()`, and `req.db.getConnection()` on the per-request `req` object keep working unchanged in v2.1 — no immediate changes needed there. Note that `req.db` and `req.dbConnection()` are now deprecated (removal planned for v3.0.0), so prefer `req.getConnectionORM()` and `req.getConnection().connection` in new code.

Everything else is unchanged: `req.db.<ModelName>`, `req.getConnection(db_name)`, route/model/config conventions, and the scaffolded project layout all continue to work as before.

## ✨ Features

- **🚀 Guided Setup** - `npx express-api init` scaffolds a complete project structure
- **📊 Auto Response Formatting** - Consistent API response structure out of the box
- **🗄️ Flexible Database Support** - Powered by MySQL2 and Sequelize with connection pooling. Supports MySQL1-style callback query syntax (`connection.query(sql, callback)`) without any code changes
- **🛠️ Configurable Error Messages** - Customize database error messages to match your needs
- **🌍 Multilingual Support** - Built-in internationalization for response messages
- **📝 Response Logger Hook** - Configurable logging for all API responses
- **⚡ Thread Support** - Execute functions asynchronously with minimal code changes. Accepts an optional `timeout` (ms) — if the child process does not respond in time it is killed and the callback receives an error
- **🔍 Thread Logging** - Enhanced debugging capabilities for threaded operations
- **📚 Helper Function Library** - Pre-built utilities to accelerate API development
- **📄 File Logging** - Generate log files instead of console output
- **🔐 Response Header Management** - Built-in CORS and header configuration (no additional packages needed)
- **🟦 First-class TypeScript Support** - Write your app in JavaScript or TypeScript (or mix both). All application files (`appConfig`, `database`, routes, models, helpers, lang, activities) can be `.js` or `.ts`. `npx express-api init` scaffolds `.ts` sources for TypeScript projects, and full typings (including the enriched `req` object) ship with the package
- **🤖 Claude AI Agent Ready** - Ships with `CLAUDE.md` — a complete agent guide so Claude Code knows your project's exact API patterns, conventions, and architecture without any prompting

## 📦 Installation

### Project dependencies — installed by `init`, not by npm

Installing `@krvinay/express_api` pulls in **only the framework itself — zero dependencies**. `express`, `sequelize`, `mysql2`, and `dotenv` are declared as *optional peers*, so npm does **not** pre-install them — instead, `npx express-api init` asks which Express version you want and then installs everything at your chosen versions:

- `express` — `4`, `5`, or an exact version, exactly as you answered (both Express 4 `^4.21.2` and Express 5 `^5.0.0` are supported; rejected `async` route handlers reach the error handler on either)
- `sequelize`, `mysql2`, `dotenv` — kept if already installed/declared, otherwise the latest release
- TypeScript projects additionally get `typescript`, `ts-node`, `@types/node`, and `@types/express` (matching your Express major) as `devDependencies`

Everything is recorded in your `package.json`, so your project fully owns the versions, and `init` installs them in the foreground before it returns. Until `init` has run, the framework cannot be required — its error message will remind you to run it.

### Scaffolding — complete the setup with `init`

`npm install` only installs the package. **Run `npx express-api init` once to complete the setup**:

```sh
npm install @krvinay/express_api
npx express-api init
```

`init` asks for the source directory, the language (`js`/`ts`), and the Express version (`4`, `5`, or a specific version); press Enter to accept the shown defaults. It then scaffolds the project, sets `main`/`start` in your `package.json`, records the dependencies at your chosen versions, and installs them — after `init` finishes, `npm start` just works. Should you forget to run it, requiring the framework tells you exactly that.

Flags for non-interactive use:

```sh
npx express-api init --yes          # accept defaults, no questions
npx express-api init --lang=ts      # force TypeScript templates
npx express-api init --src=app      # custom source directory
npx express-api init --express=4    # use Express 4 (also accepts 5 or a specific version like 4.21.2)
```

Notes:

- The Express question is only asked when your `package.json` doesn't declare express yet, and its default is whatever is already installed — nothing gets upgraded implicitly. Answering `4` or `5` installs the newest release of that major; the explicit `--express` flag overrides a previously recorded version.
- Your choices are persisted: the language lands in `.env` as `SRC_LANG` (next to `SRC`), the versions in `package.json`.
- Only missing files are ever created — existing files are never overwritten, and re-running `init` is always safe.
- Flags, `--yes`, or a non-interactive shell (scripts, CI) skip the prompts and use defaults / env vars.

Instead of the interactive prompts or CLI flags, `npx express-api init` can also be configured via environment variables or a `.env` file. If nothing is set, defaults apply.

| Variable   | Description                  | Default | Options        |
|------------|------------------------------|---------|----------------|
| `SRC`      | Application source directory | `src`   | Any valid path |
| `SRC_LANG` | Language of scaffolded files | auto    | `js` / `ts` (auto-detects `ts` when a `tsconfig.json` exists) |

### Method 1: Via env — Linux / macOS

```sh
SRC=src SRC_LANG=ts npx express-api init --yes
```

### Method 2: Via env — Windows (CMD or PowerShell)

```sh
# Install cross-env if not already installed
npm install --save-dev cross-env

npx cross-env SRC=src SRC_LANG=ts npx express-api init --yes
```

### Method 3: Via `.env` file

Create a `.env` file in your project root before running `init`:

```env
NODE_ENV=dev
SRC=src
SRC_LANG=js
```

Then run `npx express-api init --yes`.

## 🚀 Getting Started

### Fresh Installation

1. Create a new project directory:
```sh
mkdir my-api-project
cd my-api-project
```

2. Initialize npm:
```sh
npm init -y
```

3. Install the package:
```sh
npm install @krvinay/express_api
```

4. Complete the setup (asks src dir, language & Express version, then installs everything):
```sh
npx express-api init
```

5. Start your application:
```sh
npm start
```

### Integrating with Existing Projects

If you're installing this package in an existing project, you'll need to:

1. Edit `routes/index.js` to integrate with your existing route structure
2. Merge any conflicting configuration files

> [!TIP]
> Set `SRC="/"` to skip source directory creation. The package will treat your root directory as the source directory.

## 📁 Project Structure

The installer generates the following structure:

```
project-root/
├── src/                          # Source directory (configurable via SRC)
│   ├── activities/               # Thread-related files and functions
│   │   └── index.js              # Sample thread function
│   ├── config/                   # Configuration files
│   │   ├── appConfig.js          # Main configuration file
│   │   └── database.js           # Database connection config
│   ├── helpers/                  # Utility function library
│   │   └── index.js              # Helper functions
│   ├── lang/                     # Internationalization files
│   │   ├── en.js                 # English translations
│   │   └── hi.js                 # Hindi translations
│   ├── logs/                     # Log files directory
│   ├── models/                   # Database models
│   │   ├── datasource/           # Sequelize table schemas
│   │   └── index.js              # Database connection (MySQL/Sequelize)
│   └── routes/                   # API route definitions
│       └── index.js              # Main route file
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── README.md                     # Project documentation
├── tsconfig.json                 # (TypeScript projects only)
└── server.js                     # Application entry point
```

In TypeScript projects all of the above source files are scaffolded as `.ts` (`server.ts`, `appConfig.ts`, …). The framework loads `.js`, `.cjs`, `.ts`, and `.cts` files interchangeably, so you can also mix languages within one project.
## ⚙️ Configuration

### For New Projects

`npx express-api init` creates a `server.js` file for you. Simply run:
```sh
node server.js
```

### For Existing Projects

> [!NOTE]
> If you already have a `server.js` file, update it with the following code:

```javascript
require("dotenv").config();
const server = require('express')();
const { json, urlencoded } = require('express');
const default_port = 8080;

server.use(json({ limit: '50mb', extended: true }));
server.use(urlencoded({ limit: '50mb', extended: true }));
server.use(require("@krvinay/express_api"));

server.listen(process.env.PORT || default_port, () => {
    console.log(`Server running on port ${process.env.PORT || default_port}`);
});
```

## 🟦 TypeScript Support

The framework works with JavaScript and TypeScript projects — no build step required.

### New TypeScript project

```sh
mkdir my-api-project && cd my-api-project
npm init -y
npm install @krvinay/express_api
npx express-api init --lang=ts   # scaffolds .ts sources and installs everything
npm start                        # runs ts-node server.ts
```

`init --lang=ts` creates `.ts` sources (`server.ts`, `src/config/appConfig.ts`, `src/routes/index.ts`, …), creates a `tsconfig.json` if missing, and sets `"start": "ts-node server.ts"`. It also records and installs the TypeScript toolchain as `devDependencies` — `typescript`, `ts-node`, `@types/node`, and `@types/express` (matching your Express major). Versions you already have installed or declared are always kept (never upgraded); anything missing is installed at its latest published version. If your project already has a `tsconfig.json`, TypeScript is detected automatically — no `--lang` needed.

### How it runs

Every application file (`appConfig`, `database`, routes, models, helpers, lang files, activities) may be `.js`, `.cjs`, `.ts`, or `.cts` — the framework resolves whichever exists. Both `module.exports = …` and `export default …` are supported. You can run the app with any of:

- `ts-node server.ts` / `tsx server.ts` — TypeScript entry point
- `node server.js` — plain Node entry point; when the framework encounters a `.ts` application file it transparently registers `ts-node` (or `tsx` / `@swc-node/register`, whichever is installed) in transpile-only mode. Type checking is your project's job (`npx tsc --noEmit`).

Background activities (threads) written in TypeScript work too — the forked worker loads them through the same loader.

### Typings

The package ships full type declarations, including an Express `Request` augmentation, so `req.data`, `req.db`, `req.getConnection()`, `req.writeLog()`, `req.formatMessage()` etc. are all typed in your route handlers:

```ts
import { Router, Request, Response, NextFunction } from 'express';

const routes = Router();

routes.get('/users', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const conn = req.getConnection();                    // typed MySqlUtil wrapper
        const users = await conn.querySync('SELECT * FROM users WHERE id = ?', req.data.id);
        res.json({ data: { users } });
    } catch (err) {
        next(err);
    }
});

export default routes;
```

## 🔧 Environment Configuration

```env
# Node Application environment
NODE_ENV=dev

# Server Configuration
PORT=8080

# Source Directory (default: src)
SRC=src

# Database Configuration (add your database credentials)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=your_database
```

## 📖 Usage

Once installed and configured, you can start building your API by:

1. **Adding Routes** - Define your endpoints in `src/routes/index.js` (or `.ts`)
2. **Creating Models** - Add database models in `src/models/`
3. **Writing Helpers** - Create utility functions in `src/helpers/`
4. **Configuring Languages** - Add translations in `src/lang/`
5. **Implementing Threads** - Add background tasks in `src/activities/`
### Package exports

| Import | Provides |
|--------|----------|
| `@krvinay/express_api` | The framework middleware to mount with `server.use(...)` |
| `@krvinay/express_api/util` | Static utility helpers (`pluralize`, `md5`, `uuid`, `generate_password`, date helpers, …) |
| `@krvinay/express_api/threads` | `threads(activity, execFunction, payload, headers, callback, timeout?)` — run an activity in a child process |
| `@krvinay/express_api/mysql` | Standalone database access (`getConnection()`, `getConnectionORM()`, `closeConnection()`) outside a request context |

```js
// JavaScript
const util = require("@krvinay/express_api/util");
const threads = require("@krvinay/express_api/threads");
const mysql = require("@krvinay/express_api/mysql");
```

```ts
// TypeScript
import util from "@krvinay/express_api/util";
import threads from "@krvinay/express_api/threads";
import mysql from "@krvinay/express_api/mysql";
```

### 🗄️ Database access

By default, every database in `src/config/database.js` is connected, and (when `bindDatabase` is `true` and `disableSequelizeORM` is not set) `req.db` is mapped exactly as in v2.0.0: the Sequelize models of every configured database merged together (`req.db.<ModelName>`), plus `sequelize`, `Op`, `QueryTypes`, one `<db_name>_connection` per database, and the `getConnection` alias.

> [!WARNING]
> **`req.db` and `req.dbConnection()` are deprecated and will be removed in v3.0.0.** Everything has a direct replacement: `req.getConnectionORM(db_name?)` returns the same models plus `sequelize`/`Op`/`QueryTypes`/`connection` as an isolated object, and `req.getConnection(db_name?).connection` is the raw Sequelize instance. Both keep working for the whole v2.x line; the first use of each emits a one-time `DeprecationWarning`.

Set `disableSequelizeORM: true` in `appConfig.js` if you just need raw SQL — `req.db` is then not created at all (`req.db` is `undefined`). Database connections are still opened, and `req.getConnection()` and on-demand `req.getConnectionORM()` calls keep working regardless:

```js
req.config = {
    disableSequelizeORM: true, // req.db is not created; getConnection/getConnectionORM still work
};
```

`req.getConnection(db_name?)` returns a `MySqlUtil` wrapper for raw SQL. It accepts either a configured `db_name`, or a credentials object to connect to a database outside `src/config/database.js`; ad-hoc connections are cached per unique credential set, so repeated calls with the same credentials reuse one connection instead of opening a new pool each time. The raw Sequelize instance is always available via `.connection`:

```js
const conn = req.getConnection();                                            // default db
const conn = req.getConnection('analytics');                                 // named db from database.js
const conn = req.getConnection({ host, username, password, database });      // ad-hoc credentials
const rawSequelize = conn.connection;                                        // raw Sequelize instance
```

`req.dbConnection(db_name?)` returns the raw Sequelize instance directly for a configured `db_name` — **deprecated, removed in v3.0.0** (as is its `req.db.getConnection` alias). Use `req.getConnection(db_name?).connection` instead, which also supports ad-hoc credentials:

```js
const rawSequelize = req.getConnection().connection;            // default db (preferred)
const rawSequelize = req.getConnection('analytics').connection; // named db from database.js

// deprecated equivalents, still working in v2.x:
const rawSequelize = req.dbConnection();            // default db
const rawSequelize = req.dbConnection('analytics'); // named db from database.js
```

`req.getConnectionORM(db_name?)` loads Sequelize models into their **own isolated object** — accessible as `orm.<ModelName>` — instead of the shared `req.db`. Pass a configured `db_name` to reuse its connection with independent model bindings, or ad-hoc credentials with a **required** `models` field naming the folder to load:

```js
const orm = req.getConnectionORM('default');                                                       // isolated copy, own connection
const tenantOrm = req.getConnectionORM({ host, username, password, database, models: 'default' });  // ad-hoc, `models` required
const user = await orm.User.findOne({ where: { id: req.data.id } });
```

Results are cached per target, so repeated calls with the same `db_name`, or the same credentials + `models`, return the same object. Throws if a credentials object omits `models`. Use this instead of loading models onto ad-hoc connections through the shared `req.db` — since `req.db` is one object shared by every request, two connections loading a model of the same name would otherwise overwrite each other.

`await req.closeConnection(credentials)` (or `await mysql.closeConnection(credentials)`) closes the cached ad-hoc Sequelize connection pool and removes it from the internal connection cache. Use this to release database connections when finished with dynamic tenant or temporary credentials:

```js
const credentials = { host, username, password, database };
const conn = req.getConnection(credentials);
// ... run queries ...

await req.closeConnection(credentials); // closes the pool and evicts from cache
```

> [!NOTE]
> The standalone `@krvinay/express_api/mysql` export (used outside a request context) exposes `getConnection()`, `getConnectionORM()`, and `closeConnection()` — and nothing else; it has no `.db` or `.dbConnection`. `getConnection` and `getConnectionORM` accept a configured `db_name` or ad-hoc credentials, both give you the raw Sequelize instance via `.connection`, and models loaded through `getConnectionORM()` are isolated per target. `closeConnection(credentials)` closes and evicts cached ad-hoc connections. Use `mysql.getConnectionORM('default')` where you previously used `mysql.db`.

## 🤖 Claude AI Agent

Every project scaffolded by this package includes `CLAUDE.md` at its root — a complete agent guide that instructs Claude exactly how to write APIs using this framework's patterns and conventions.

### What it covers

- Full `req` object API reference (`req.data`, `req.db`, `req.getConnection`, `req.closeConnection`, `req.util`, `req.getEnv`, `req.writeLog`, `req.formatMessage`, …)
- Standard response envelope format and all shape rules
- Route writing conventions in JS and TS
- Raw SQL via `MySqlUtil` and Sequelize ORM patterns
- `appConfig` and `database` config file templates
- i18n message key patterns with auto-translation
- Activity/thread pattern with `(req, payload)` signature
- Logging, security headers, common patterns, and anti-patterns

### Activate with Claude Code

Copy `CLAUDE.md` into `.claude/` to have Claude Code load it automatically as project context every time you open the project:

```sh
mkdir -p .claude
cp CLAUDE.md .claude/CLAUDE.md
```

Claude will then follow all conventions automatically — no prompting needed.

## 👤 Author

**Vinay Kumar**
- Package: [@krvinay/express_api](https://www.npmjs.com/package/@krvinay/express_api)

## 🆘 Support

For issues and questions, please visit the [GitHub repository](https://github.com/kumarvinay32/express_api) or open an issue.
