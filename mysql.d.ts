/**
 * express api
 * Copyright(c) 2024-2025 Vinay Kumar
 * MIT Licensed
 */

import { Op as SequelizeOp } from "./operators";

declare namespace mysql {
    /**
     * Sequelize Operator Types
     */
    const Op: typeof SequelizeOp;

    /**
     * Sequelize Query Types
     */
    enum QueryTypes {
        SELECT = 'SELECT',
        INSERT = 'INSERT',
        UPDATE = 'UPDATE',
        BULKUPDATE = 'BULKUPDATE',
        BULKDELETE = 'BULKDELETE',
        DELETE = 'DELETE',
        UPSERT = 'UPSERT',
        VERSION = 'VERSION',
        SHOWTABLES = 'SHOWTABLES',
        SHOWINDEXES = 'SHOWINDEXES',
        DESCRIBE = 'DESCRIBE',
        RAW = 'RAW',
        FOREIGNKEYS = 'FOREIGNKEYS',
    }

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
     * Type for the `db` object (req.db) — loaded Sequelize models are
     * available by model name (e.g. db.User).
     */
    interface Database {
        sequelize: typeof Sequelize;
        Op: typeof SequelizeOp;
        QueryTypes: typeof QueryTypes;
        getConnection(db_name?: string): Sequelize;
        [model: string]: any;
    }

    /**
     * get MySQL1-compatible connection to perform desired operation.
     * @param db_name database name configured on database config.
     */
    function getConnection(db_name?: string): Connection;

    /**
     * get raw Sequelize connection to perform desired operation.
     * @param db_name database name configured on database config.
     */
    function dbConnection(db_name?: string): Sequelize;

    /**
     * Singleton `db` object
     */
    const db: Database;
}

export = mysql;
