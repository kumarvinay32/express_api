/**
 * express api
 * Copyright(c) 2024-2025 Vinay Kumar
 * MIT Licensed
 */

import { Op as SequelizeOp } from "./operators";

declare namespace mysql {
    /**
     * Sequelize Query Types. At runtime the value map is available on
     * `req.db.QueryTypes` and on `getConnectionORM().QueryTypes` — the
     * standalone `mysql` export itself only exposes `getConnection` and
     * `getConnectionORM`. (Likewise, operators are on `req.db.Op` /
     * `getConnectionORM().Op`.)
     */
    type QueryTypes =
        | 'SELECT'
        | 'INSERT'
        | 'UPDATE'
        | 'BULKUPDATE'
        | 'BULKDELETE'
        | 'DELETE'
        | 'UPSERT'
        | 'VERSION'
        | 'SHOWTABLES'
        | 'SHOWINDEXES'
        | 'DESCRIBE'
        | 'RAW'
        | 'FOREIGNKEYS';

    /** Value map of QueryTypes, e.g. `QueryTypes.SELECT === 'SELECT'`. */
    type QueryTypesMap = { readonly [K in QueryTypes]: K };

    /**
     * Sequelize instance class
     */
    class Sequelize {
        constructor(db_name?: string);

        // Connection management
        authenticate(): Promise<void>;
        close(): Promise<void>;
        getDialect(): string;

        // Models
        define(modelName: string, attributes: Record<string, any>, options?: Record<string, any>): any;
        model(modelName: string): any;
        sync(options?: { force?: boolean; alter?: boolean }): Promise<void>;
        drop(options?: Record<string, any>): Promise<void>;

        // Raw queries
        query<T = any>(sql: string, options?: { replacements?: any[] | object; type?: QueryTypes }): Promise<[T[], any]>;

        // Transactions
        transaction<T>(callback: (t: Transaction) => Promise<T>): Promise<T>;
        transaction(options?: TransactionOptions, callback?: (t: Transaction) => Promise<any>): Promise<any>;

        // Hooks
        addHook(hookName: string, fn: (...args: any[]) => void): void;
    }

    /**
     * Transaction types
     */
    type TransactionOptions = {
        isolationLevel?: string;
        type?: string;
    };

    class Transaction {
        commit(): Promise<void>;
        rollback(): Promise<void>;
    }

    /**
     * MySQL1-compatible connection wrapper around a Sequelize connection,
     * as returned by req.getConnection() / mysql.getConnection().
     */
    interface Connection {
        /** Raw Sequelize instance behind this wrapper. */
        connection: Sequelize;

        // Escaping & formatting
        escapeId(...params: any[]): string;
        escape(value: any): string;
        format(sql: string, values?: any[]): string;
        raw(sql: string): object;

        // Promise based API
        querySync<T = any>(sql: string | object, ...params: any[]): Promise<T>;
        beginTransactionSync(isolationLevel?: string): Promise<Connection>;
        commitSync(): Promise<void>;
        rollbackSync(): Promise<void>;

        // Callback based API (MySQL1 style)
        query<T = any>(sql: string | object, ...params: any[]): void;
        beginTransaction(callback: (err: Error | null, connection?: Connection) => void): void;
        commit(callback: (err: Error | null) => void): void;
        rollback(callback: (err: Error | null) => void): void;
    }

    /**
     * Ad-hoc database credentials, same shape as an entry in `src/config/database.js`.
     * Pass this instead of a `db_name` to connect to a database not present in the
     * static config — the resulting connection is cached and reused for identical
     * credentials (host + port + database + username + password + token).
     */
    interface ConnectionCredentials {
        host: string;
        port?: number;
        database?: string;
        username?: string;
        password?: string;
        token?: string;
        pool?: { min?: number; max?: number; idle?: number; acquire?: number; evict?: number };
        timezone?: string;
        connectTimeout?: number;
        dateStrings?: boolean;
        multipleStatements?: boolean;
        logging?: (sql: string, ...rest: any[]) => void;
    }

    /**
     * Ad-hoc credentials for `getConnectionORM()` — same shape as
     * `ConnectionCredentials`, but `models` is required since it names the
     * folder whose Sequelize models get loaded and returned as `orm.<ModelName>`.
     */
    type OrmConnectionCredentials = ConnectionCredentials & { models: string };

    /**
     * Isolated set of Sequelize models bound to one connection, as returned by
     * `getConnectionORM()` — distinct from `req.db`, so loading the same model
     * folder against a different connection never overwrites models already
     * loaded elsewhere.
     */
    interface OrmModels {
        sequelize: typeof Sequelize;
        Op: typeof SequelizeOp;
        QueryTypes: QueryTypesMap;
        /** Raw Sequelize instance the models are bound to. */
        connection: Sequelize;
        [model: string]: any;
    }

    /**
     * Type for the `db` object (req.db) — loaded Sequelize models are
     * available by model name (e.g. db.User).
     * @deprecated `req.db` and all of its members will be removed in v3.0.0 —
     * use `req.getConnectionORM(db_name?)` (returns `OrmModels` with the same
     * `sequelize`/`Op`/`QueryTypes`/models) and `req.getConnection(db_name?).connection`
     * for raw connections.
     */
    interface Database {
        /** @deprecated Removed in v3.0.0 — use `getConnectionORM().sequelize`. */
        sequelize: typeof Sequelize;
        /** @deprecated Removed in v3.0.0 — use `getConnectionORM().Op`. */
        Op: typeof SequelizeOp;
        /** @deprecated Removed in v3.0.0 — use `getConnectionORM().QueryTypes`. */
        QueryTypes: QueryTypesMap;
        /**
         * Raw Sequelize instance for the named database (defaults to `'default'`). Only accepts a `db_name` — not ad-hoc credentials.
         * @deprecated Removed in v3.0.0 (as is `req.dbConnection`) — use `req.getConnection(db_name?).connection` instead.
         */
        getConnection(db_name?: string): Sequelize;
        /** @deprecated Model access via `req.db.<ModelName>` is removed in v3.0.0 — use `req.getConnectionORM(db_name?).<ModelName>`. */
        [model: string]: any;
    }

    /**
     * get MySQL1-compatible connection to perform desired operation.
     * @param db_name database name configured on database config, or an
     * ad-hoc credentials object to connect outside the static config.
     */
    function getConnection(db_name?: string | ConnectionCredentials): Connection;

    /**
     * Load Sequelize models into an isolated object — accessible as
     * `orm.<ModelName>` — instead of the shared `req.db`. Pass a configured
     * `db_name` to reuse its connection with a fresh, independent set of
     * model bindings, or ad-hoc credentials (with a required `models` folder)
     * to bind models to a connection outside the static config. Results are
     * cached per target, so repeated calls with the same target return the
     * same object. Throws if a credentials object omits `models`.
     * @param db_name database name configured on database config, or an
     * ad-hoc credentials object (with `models`) to connect outside the static config.
     */
    function getConnectionORM(db_name?: string | OrmConnectionCredentials): OrmModels;
}

export = mysql;
