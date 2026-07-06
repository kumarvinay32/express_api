# Express API Microservice

A comprehensive Node.js API microservice framework built on Express, MySQL2, and Sequelize. This package provides a complete, production-ready setup to rapidly develop robust APIs — in JavaScript or TypeScript.

## 🆕 What's new in v2.0.0

- **First-class TypeScript support** — every application file can be `.js` or `.ts`; the installer scaffolds TypeScript projects and full typings ship with the package (see [TypeScript Support](#-typescript-support))
- **`npx express-api init`** — interactive scaffolding CLI (source dir, language, Express version) that scaffolds the project, records the dependencies at your chosen versions in `package.json`, and installs them — nothing runs automatically on `npm install`
- **Hardened runtime** — thread workers report crashes instead of hanging, CORS preflight no longer crashes on missing config, invalid HTTP codes are sanitized, `util.mt_rand`/`generate_password` use cryptographically secure randomness, and the undeclared `uuid` dependency was replaced with Node's built-in `crypto.randomUUID`
- **Your project owns its dependencies** — `express`, `sequelize`, and `mysql2` are no longer pre-installed by npm; `npx express-api init` installs them at the versions you choose and records them in your `package.json` (see [Installation](#-installation))
- **Express 4 and 5 compatible** — the accepted `express` range is `^4.21.2 || ^5.0.0`
- **Async route errors are caught** — a rejected `async` handler is forwarded to the framework's error handler and returns the standard error envelope, on Express 4 too (which natively ignores handler promises). `try/catch + next(err)` still works and is still recommended for custom handling
- **Breaking:** the deprecated `util`, `threads`, and `mysql` properties on the main export were removed — see [Migrating to v2](#-migrating-to-v2)

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
| `@krvinay/express_api/mysql` | Standalone database access (`getConnection()`, `dbConnection()`, `db`) outside a request context |

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

## 🤖 Claude AI Agent

Every project scaffolded by this package includes `CLAUDE.md` at its root — a complete agent guide that instructs Claude exactly how to write APIs using this framework's patterns and conventions.

### What it covers

- Full `req` object API reference (`req.data`, `req.db`, `req.getConnection`, `req.util`, `req.getEnv`, `req.writeLog`, `req.formatMessage`, …)
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
