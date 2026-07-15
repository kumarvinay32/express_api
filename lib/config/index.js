"use strict";

const config = require("./configs");
const logger = require("./logger");
const req = {};
config(req);
logger(req);

const { bindDatabase = true, bindUtil = true, disableSequelizeORM = false } = req.config;

if (bindUtil) {
    req.util = require("../util");
    req.util.log = req.writeLog;
    req.util.env = (req, key) => req.getEnv(key);
}

if (bindDatabase) {
    require("./database")(req);
    require("../database")(req);
    // req.dbConnection is deprecated and will be removed in v3.0.0 — use
    // req.getConnection(db_name?).connection instead. One-time warning on
    // first call.
    let dbConnectionDeprecationWarned = false;
    req.dbConnection = (db_name) => {
        if (!dbConnectionDeprecationWarned) {
            dbConnectionDeprecationWarned = true;
            process.emitWarning(
                'req.dbConnection() is deprecated and will be removed in v3.0.0 — use ' +
                'req.getConnection(db_name?).connection (or req.getConnectionORM(db_name?).connection) ' +
                'for the raw Sequelize instance.',
                'DeprecationWarning'
            );
        }
        return req._conn[(db_name && Object.hasOwnProperty.call(req._conn, db_name)) ? db_name : 'default'];
    }
    // req.db keeps the v2.0.0 shape: sequelize/Op/QueryTypes, every loaded
    // model, and the getConnection alias. With disableSequelizeORM: true,
    // req.db is not created at all — use req.getConnection(db_name?) for raw
    // SQL and req.getConnectionORM(db_name?) for on-demand model loading.
    if (!disableSequelizeORM) {
        // sequelize/Op/QueryTypes come from the spread below — every
        // getConnectionORM result carries the same module-level values.
        const db = {};
        for (const db_name in req.config.databases) {
            const { connection, ...orm } = req.getConnectionORM(db_name);
            Object.assign(db, orm);
        }
        db.getConnection = req.dbConnection;
        // Everything on req.db is deprecated and will be removed in v3.0.0 —
        // use req.getConnectionORM(db_name?) for models/Op/QueryTypes and
        // req.getConnection(db_name?) for connections (raw Sequelize instance
        // via .connection). A single DeprecationWarning is emitted on first access.
        let dbDeprecationWarned = false;
        req.db = new Proxy(db, {
            get(target, prop, receiver) {
                if (!dbDeprecationWarned && typeof prop === 'string') {
                    dbDeprecationWarned = true;
                    process.emitWarning(
                        'req.db is deprecated and will be removed in v3.0.0 — use req.getConnectionORM(db_name?) ' +
                        'for models (orm.<ModelName>, orm.Op, orm.QueryTypes) and req.getConnection(db_name?) for ' +
                        'connections (raw Sequelize instance via .connection).',
                        'DeprecationWarning'
                    );
                }
                return Reflect.get(target, prop, receiver);
            }
        });
    }
}

module.exports = req;
