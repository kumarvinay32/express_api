/**
 * express api
 * Copyright(c) 2024-2025 Vinay Kumar
 * MIT Licensed
 *
 */

import { Handler } from 'express';
import Util = require('./util');
import Threads = require('./threads');
import Mysql = require('./mysql');

/**
 * Everything the framework adds to the Express request object,
 * available in every route handler, middleware and activity.
 */
declare module 'express-serve-static-core' {
    interface Request {
        /** Merged request payload: `{ ...req.body, ...req.query }` — always prefer this over body/query. */
        data: Record<string, any>;

        /** Sequelize models by name (e.g. `req.db.User`) + `sequelize`, `Op`, `QueryTypes`, `getConnection`. */
        db: Mysql.Database;

        /** Application config from `appConfig` (the `databases` key is removed per request). */
        config: Record<string, any>;

        /** Static utility helpers (pluralize, date, uuid, hash, …). */
        util: typeof Util;

        /** MySQL1-compatible wrapper for raw SQL over the named database (defaults to `'default'`). */
        getConnection(db_name?: string): Mysql.Connection;

        /** Raw Sequelize instance for the named database (defaults to `'default'`). */
        dbConnection(db_name?: string): Mysql.Sequelize;

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

declare const expressApi: Handler & {
    /**
     * @deprecated This export will be removed in v2.0.0
     * Use following instead:
     * ```js
     * const util = require("@krvinay/express_api/util");
     * ```
     */
    util: typeof Util;

    /**
     * @deprecated This export will be removed in v2.0.0
     * Use following instead:
     * ```js
     * const threads = require("@krvinay/express_api/threads");
     * ```
     */
    threads: typeof Threads;

    /**
     * @deprecated This export will be removed in v2.0.0
     * Use following instead:
     * ```js
     * const mysql = require("@krvinay/express_api/mysql");
     * ```
     */
    mysql: typeof Mysql;
};

export = expressApi;
