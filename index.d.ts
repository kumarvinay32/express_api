/**
 * express api
 * Copyright(c) 2024-2025 Vinay Kumar
 * MIT Licensed
 *
 */

import { Handler } from 'express';
import Util = require('./util');
import Mysql = require('./mysql');

/**
 * Everything the framework adds to the Express request object,
 * available in every route handler, middleware and activity.
 */
declare module 'express-serve-static-core' {
    interface Request {
        /** Merged request payload: `{ ...req.body, ...req.query }` — always prefer this over body/query. */
        data: Record<string, any>;

        /**
         * Sequelize models by name (e.g. `req.db.User`) + `sequelize`, `Op`, `QueryTypes`, `<db_name>_connection`, `getConnection`. With `disableSequelizeORM: true`, `req.db` is not created at all — it is `undefined`; use `req.getConnection()` / `req.getConnectionORM()` instead.
         * @deprecated `req.db` (and everything on it) will be removed in v3.0.0 — use `req.getConnectionORM(db_name?)` for models/`Op`/`QueryTypes` and `req.getConnection(db_name?)` for connections (raw Sequelize instance via `.connection`).
         */
        db: Mysql.Database;

        /** Application config from `appConfig` (the `databases` key is removed per request). */
        config: Record<string, any>;

        /** Static utility helpers (pluralize, date, uuid, hash, …). */
        util: typeof Util;

        /** MySQL1-compatible wrapper for raw SQL over the named database (defaults to `'default'`), or an ad-hoc credentials object. Raw Sequelize instance is available via `.connection`. */
        getConnection(db_name?: string | Mysql.ConnectionCredentials): Mysql.Connection;

        /**
         * Raw Sequelize instance for the named database (defaults to `'default'`). Only accepts a `db_name` — not ad-hoc credentials.
         * @deprecated Will be removed in v3.0.0 — use `req.getConnection(db_name?).connection` (or `req.getConnectionORM(db_name?).connection`) instead.
         */
        dbConnection(db_name?: string): Mysql.Sequelize;

        /** Load Sequelize models into an isolated object (`orm.<ModelName>`), separate from `req.db`. See `Mysql.getConnectionORM`. */
        getConnectionORM(db_name?: string | Mysql.OrmConnectionCredentials): Mysql.OrmModels;

        /** Request-level environment info: `'host'`, `'remote-addr'`, `'url'`, `'base-url'`, `'full-url'`, `'https'`, `'protocol'`, or any header name. */
        getEnv(key: string): any;

        /**
         * Write to `src/logs/<fname>.log`. Call with a single argument to write to `debug.log`.
         * @param append append (default) or overwrite the log file.
         */
        writeLog(fname_or_message: any, message?: any, append?: boolean): void;

        /** Translate a message key using the active language file; supports `?` placeholders. */
        formatMessage(key: string, ...values: any[]): string;

        /** Called after every response — override in `appConfig` for custom logging. */
        response_logger(req: Request, err: Error | null | undefined, response: any): void;

        /** Called after every thread/activity response — override in `appConfig`. */
        thread_response_logger(req: Request, err: Error | null | undefined, response: any): void;

        /** Active language code (`'en'`, `'hi'`, …) when `lang` is enabled. */
        app_lang?: string;

        /** Raw key → string map for the active language. */
        _lng_messages?: Record<string, string>;

        /** process.env.NODE_ENV */
        NODE_ENV: string;

        /** When the request arrived. */
        begin_timestamp: Date;

        /** When the response was sent. */
        end_timestamp?: Date;

        /** Set by the response formatter when a `forceLogin` response is returned. */
        forceLogin?: boolean;
    }
}

/**
 * The framework middleware — mount it on your Express app:
 * ```js
 * server.use(require("@krvinay/express_api"));
 * ```
 * Utilities are available as subpath imports:
 * `@krvinay/express_api/util`, `@krvinay/express_api/threads`, `@krvinay/express_api/mysql`.
 */
declare const expressApi: Handler;

export = expressApi;
