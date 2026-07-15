# @krvinay/express_api v2.1.0

Adds `req.getConnectionORM()` for isolated Sequelize model loading, ad-hoc database credentials for `getConnection()`, a `disableSequelizeORM` opt-out, and a batch of correctness fixes across the response pipeline and utilities. One breaking change, scoped to the standalone `@krvinay/express_api/mysql` export.

## 💥 Breaking changes

- **The standalone `@krvinay/express_api/mysql` export now exposes exactly two functions: `getConnection()` and `getConnectionORM()`.** `mysql.db` and `mysql.dbConnection` (and the previously leaked internals like `config`/`writeLog`) are gone. Both functions accept a configured `db_name` or an ad-hoc credentials object, the raw Sequelize instance is available on either result as `.connection`, and models loaded via `getConnectionORM()` are isolated per target. Use `mysql.getConnectionORM('default')` instead of `mysql.db` — same model access (`orm.User`), returned directly instead of assembled by hand:
  ```js
  // ❌ removed
  const models = mysql.db;
  models.connection = models.getConnection();
  module.exports = models;
  // ✅ v2.1.0
  module.exports = mysql.getConnectionORM('default');
  ```
- **`req.dbConnection()` / `req.db.getConnection()` on the per-request `req` object keep working** — still the raw-Sequelize accessor, `db_name` only (no ad-hoc credentials). Only the standalone `mysql` export lost `.db`/`.dbConnection`; `req.db` and `req.dbConnection()` built by the framework middleware keep working throughout v2.x (but are now deprecated — see Deprecations below).

## ✨ New

### `disableSequelizeORM` config flag
- With `bindDatabase: true`, `req.db` is mapped exactly as in v2.0.0 (`sequelize`, `Op`, `QueryTypes`, `<db_name>_connection` per database, every loaded model, and the `getConnection` alias). Set `disableSequelizeORM: true` in `appConfig.js` if you just need raw SQL — **`req.db` is then not created at all** (`req.db` is `undefined`). Database connections are still opened, and `req.getConnection()` and on-demand `req.getConnectionORM()` calls keep working regardless of this flag:
  ```js
  req.config = {
      disableSequelizeORM: true, // req.db is not created; getConnection/getConnectionORM still work
  };
  ```

### Ad-hoc database credentials
- `getConnection()` now accepts a credentials object instead of a configured `db_name`, so you can connect to a database that isn't declared in `src/config/database.js`:
  ```js
  const conn = req.getConnection({ host, username, password, database });
  ```
- Same field shape as an entry in `database.js` (`host`, `username`, `password`, `database`, `token`, `pool`, `timezone`, `logging`, …). Connections are cached and reused per unique credential set, so repeated calls with the same credentials don't open a new connection pool each time.

### `getConnectionORM()`
- New function that loads Sequelize models into their **own isolated object** — `orm.<ModelName>` — instead of the shared `req.db`. Pass a configured `db_name` to reuse its connection with independent model bindings, or ad-hoc credentials with a **required** `models` field naming the folder to load:
  ```js
  const orm = req.getConnectionORM('default');
  const tenantOrm = req.getConnectionORM({ host, username, password, database, models: 'default' });
  ```
- Results are cached per target (same `db_name`, or same credentials + `models` folder), so repeated calls reuse the same object. Throws if a credentials object omits `models`. Prefer this over loading models onto ad-hoc connections through the shared `req.db` — two connections loading a model of the same name into `req.db` would otherwise overwrite each other.

## ⚠️ Deprecations

- **`req.db` — everything it exposes is deprecated and will be removed in v3.0.0.** That covers the merged models (`req.db.<ModelName>`), `req.db.sequelize`, `req.db.Op`, `req.db.QueryTypes`, `req.db.<db_name>_connection`, and `req.db.getConnection`.
- **`req.dbConnection()` is deprecated and will be removed in v3.0.0.** Use `req.getConnection(db_name?).connection` instead — same raw Sequelize instance, and it also supports ad-hoc credentials.

  Replacements, available today:
  ```js
  // models + sequelize/Op/QueryTypes (isolated per target, cached)
  const orm = req.getConnectionORM();            // or ('db_name') / ({ ...credentials, models })
  const user = await orm.User.findOne({ where: { id } });

  // raw Sequelize instance
  const conn = req.getConnection().connection;   // or req.getConnectionORM().connection

  // raw SQL wrapper
  const sql = req.getConnection();               // or ('db_name') / ({ ...credentials })
  ```
  Both keep working (and `req.db` keeps its exact v2.0.0 shape) for the whole v2.x line — a one-time `DeprecationWarning` is emitted on the first use of each, and the TypeScript declarations flag them as `@deprecated`.

## 🔧 Fixes & hardening

- Sequelize model loading ran as a fire-and-forget async call during startup, so incoming requests could race ahead of `req.db` being fully populated. Model loading is now fully synchronous and completes before the server can accept traffic.
- **Response pipeline:** `res.json(null)` — or any JSON scalar (`123`, `true`) — crashed the auto-format handler (`Cannot convert undefined or null to object`) and turned the request into a 500. Scalars are now wrapped as `data` in the standard envelope.
- **`util.pluralize` / `util.singularize`:** the uninflected-word regexes were built with literal `/` delimiters inside the pattern, so they never matched — `pluralize('sheep')` returned `'sheeps'`, `'fish'` → `'fishes'`. Additionally, singularize rules that reference a second capture group leaked a literal `$2` into the output (`singularize('movies')` → `'m$2ovie'`). Both fixed; `pluralize` also returns the input word unchanged (instead of `undefined`) when no rule matches.
- **`util.get_ipv4_addr`:** only the first comma in a comma-separated IP list was normalized, so a typical `X-Forwarded-For` chain (`2001:db8::1, 10.0.0.1`) returned `''` instead of `10.0.0.1`. Octets are also validated numerically now — `a.b.c.d` no longer passes as an IPv4 address (same validation applied to `req.getEnv('remote-addr')`).
- **`util.generate_password`:** a charset typo (`…jklmanop…`) duplicated `a` and shifted the alphabet, so `z` could never appear in `AaN`/default passwords and `a` was twice as likely. Charset corrected.
- **`util.underscore`:** threw `TypeError` on input without any uppercase letter; now returns the lowercased word.
- **`util.format` / `req.formatMessage`:** falsy placeholder values (`0`, `false`) were rendered as empty strings; now rendered literally.
- **Threads:** calling `threads(...)` without a callback crashed the parent process when the child responded or timed out; the callback is now optional (fire-and-forget).
- **Error handler:** the `forceRedirect` redirect now URL-encodes the error message, so messages containing `&`, `#`, or spaces no longer produce a malformed redirect URL.
- **`req.writeLog`:** nested log paths (`req.writeLog('payments/refunds', …)`) now create the intermediate directories correctly on Windows as well (path handling was POSIX-only).
- **Typings:** `util.add_minutes` is correctly typed as returning `string`; `date_diff`'s documented default unit corrected to `'D'` (days); removed a `getConnectionORM` declaration from the `req.db` type that does not exist at runtime (use `req.getConnectionORM()`).

## 📦 Upgrading from v2.0.0

1. If you use the standalone `mysql.db` pattern (`const models = mysql.db; ...`), replace it with `mysql.getConnectionORM('default')`.
2. Everything else keeps working: `req.db.<ModelName>`, `req.getConnection(db_name)`, `req.dbConnection(db_name)`, and route/model/config conventions all behave as before. Note that `req.db` and `req.dbConnection()` are now deprecated (removed in v3.0.0) — migrate to `req.getConnectionORM()` / `req.getConnection().connection` at your own pace during v2.x.

---

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
