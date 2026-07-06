# @krvinay/express_api v2.0.0

A major release: full TypeScript support, a guided `init` CLI that owns your dependency versions, Express 4 & 5 compatibility, and a hardened runtime.

## 🌟 Highlights

```sh
npm install @krvinay/express_api   # installs only the framework — zero dependencies
npx express-api init               # asks src dir, js/ts, Express version — then scaffolds & installs everything
npm start
```

## 💥 Breaking changes

- **Deprecated main-export properties removed.** `require("@krvinay/express_api").util / .threads / .mysql` (deprecated since v1) are gone — use the subpath imports instead:
  ```js
  const util    = require("@krvinay/express_api/util");
  const threads = require("@krvinay/express_api/threads");
  const mysql   = require("@krvinay/express_api/mysql");
  ```
- **No more automatic scaffolding on `npm install`.** The postinstall hook was removed. Run `npx express-api init` once to complete the setup — if you forget, requiring the framework tells you exactly that.
- **Dependencies are no longer pre-installed.** `express`, `sequelize`, `mysql2`, and `dotenv` are optional peer dependencies now. `init` installs them at the versions you choose and records them in your `package.json`, so your project fully owns its versions.
- The CLI command is `express-api` (hyphen), e.g. `npx express-api init`.

## ✨ New

### First-class TypeScript support
- Every application file — `appConfig`, `database`, routes, models, helpers, lang files, activities — can be `.js`, `.cjs`, `.ts`, or `.cts`; `module.exports = …` and `export default …` both work.
- No build step required: run under `ts-node`/`tsx`, or plain `node` — the framework transparently registers a TypeScript transpiler (ts-node / tsx / @swc-node) when it meets a `.ts` file, including inside forked thread workers.
- Full typings ship with the package, including an Express `Request` augmentation: `req.data`, `req.db`, `req.config`, `req.util`, `req.getConnection()`, `req.dbConnection()`, `req.getEnv()`, `req.writeLog()`, `req.formatMessage()` and more are typed in route handlers.
- `init --lang=ts` scaffolds a complete TypeScript project (`server.ts`, typed routes/helpers/activities, `tsconfig.json`, `ts-node` start script) and installs the toolchain (`typescript`, `ts-node`, `@types/node`, `@types/express` matching your Express major) as `devDependencies`.

### `npx express-api init`
- Interactive setup: asks for the source directory, the language (`js`/`ts`), and the Express version (`4`, `5`, or a specific version) — Enter accepts the shown defaults.
- Non-interactive via flags (`--yes`, `--src=<dir>`, `--lang=js|ts`, `--express=4|5|x.y.z`) or `SRC`/`SRC_LANG` env vars / `.env`.
- Records your choices (`SRC_LANG` in `.env`, versions in `package.json`) and installs everything in the foreground — `npm start` works the moment init returns.
- Version policy: whatever is already installed or declared is never upgraded; missing packages are resolved to their latest published release (majors like `4` resolve to the newest 4.x).
- Idempotent: only missing files are created, existing files and declared versions are never touched — re-running is always safe.

### Express 4 and 5
- Accepted range: `express@^4.21.2 || ^5.0.0` (typings accept `@types/express` 4 or 5).
- Rejected `async` route handlers are forwarded to the framework's error handler on **both** majors — Express 4 natively ignores handler promises, which previously hung the request. Route methods, middlewares, and nested sub-routers are all covered.

## 🔧 Fixes & hardening

- Thread workers report crashes instead of hanging forever (child `exit` handler), and no longer inherit `execArgv` (safe under ts-node/tsx parents and attached debuggers).
- CORS preflight no longer crashes when `allowedHeaders`/`allowedMethods` are not configured.
- Invalid application-level `code` values (e.g. `9999`, `"E_CUSTOM"`) no longer crash `res.status()` — the body keeps your code, the HTTP status falls back to 500/200.
- `util.mt_rand` / `util.generate_password` use cryptographically secure randomness (`crypto.randomInt`).
- The undeclared `uuid` dependency was replaced with Node's built-in `crypto.randomUUID`.
- Fixed broken TypeScript declarations (`mysql.d.ts` mixed named exports with `export =`; `types` is now first in the `exports` map so TS actually resolves it).
- Installer templates are stored as readable source instead of base64 blobs.
- The setup CLI works on older Node runtimes too (classic `readline` instead of `node:readline/promises`), while the framework itself requires Node ≥ 18.

## 📦 Upgrading from v1

1. Replace any `api.util` / `api.threads` / `api.mysql` usages with the subpath imports shown above.
2. After installing v2, run `npx express-api init` once in each project — it records and installs your dependency versions (existing files and versions are left untouched).
3. Everything else is backward compatible: `server.use(require("@krvinay/express_api"))`, the `req` API, the response envelope, configs, and the project layout are unchanged.
