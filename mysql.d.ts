/**
 * Sequelize Operator Types
 */
import { Op } from "./operators";

/**
 * Sequelize Query Types
 */
export declare enum QueryTypes {
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
export declare class Sequelize {
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
export declare type TransactionOptions = {
    isolationLevel?: string;
    type?: string;
};

export declare class Transaction {
    commit(): Promise<void>;
    rollback(): Promise<void>;
}

declare namespace Mysql {
    // Escaping & formatting
    export function escapeId(...params: any[]): string;
    export function escape(value: any): string;
    export function format(sql: string, values?: any[]): string;
    export function raw(sql: string): object;

    // Synchronous-like Promises
    export function querySync<T = any>(sql: string, ...params: any[]): Promise<T>;
    export function beginTransactionSync(isolationLevel?: string): Promise<void>;
    export function commitSync(): Promise<void>;
    export function rollbackSync(): Promise<void>;

    // Standard async with callbacks
    export function query<T = any>(
        sql: string,
        params: any[] | object,
        callback: (err: Error | null, result?: T) => void
    ): void;

    export function beginTransaction(callback: (err: Error | null) => void): void;
    export function commit(callback: (err: Error | null) => void): void;
    export function rollback(callback: (err: Error | null) => void): void;
}

/**
 * get Mysql connection to perform desired operation.
 * @param db_name database name configured on appConfig.
 */
export function getConnection(db_name?: string): typeof Mysql;

/**
 * get Sequelize connection to perform desired operation.
 * @param db_name database name configured on appConfig.
 */
export function dbConnection(db_name?: string): Sequelize;

/**
 * Type for `db` object
 */
export interface sequelize {
    sequelize: Sequelize;
    Op: typeof Op;
    QueryTypes: typeof QueryTypes;
    getConnection: typeof dbConnection;
}

/**
 * Singleton `db` object
 */

export interface database {
    db: sequelize;
    getConnection: typeof getConnection;
    dbConnection: typeof dbConnection;
}

export declare const db: database;

export = db;