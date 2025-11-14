'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const ProxyConnectionManager = require('./driver');
const mysql = require('./mysql');
const systemTimeZone = () => {
    let tzo = Number((new Date()).getTimezoneOffset());
    let tzs = '-';
    if (tzo <= 0) {
        tzs = '+';
        tzo *= -1;
    }
    return tzs + `${Math.floor(tzo / 60)}`.padStart(2, "0") + ":" + `${tzo % 60}`.padStart(2, "0");
}
class ConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

const readDbModels = async (req, db_name) => {
    try {
        req.db[`${db_name}_connection`] = req._conn[db_name];
        if (fs.existsSync(path.join(req._models_dir, db_name))) {
            if (fs.existsSync(path.join(req._models_dir, db_name, 'init-models.js'))) {
                const models = require(path.join(req._models_dir, db_name, 'init-models.js'))(req._conn[db_name]);
                Object.assign(req.db, models);
            } else {
                const files = fs.readdirSync(path.join(req._models_dir, db_name));
                await Promise.all(files.map(async (file) => {
                    if (file.indexOf('.') !== 0 && file.slice(-3) === '.js' && file !== 'index.js' && file !== 'init-models.js') {
                        const model = require(path.join(req._models_dir, db_name, file))(req._conn[db_name], Sequelize.DataTypes);
                        req.db[model.name] = model;
                    }
                }));
                await Promise.all(Object.keys(req.db).map(async (modelName) => {
                    if (Object.hasOwnProperty.call(req.db[modelName], 'associate') && req.db[modelName].associate) {
                        req.db[modelName].associate(req.db);
                    }
                }));
            }
        }
    } catch (error) {
        throw error;
    }
};

module.exports = (req) => {
    if (!Object.hasOwnProperty.call(req, "config") || !Object.hasOwnProperty.call(req.config, "databases")) {
        throw new ConfigError(`DataBase Configuration not found.`);
    }
    if (typeof req.config.databases != "object") {
        throw new ConfigError(`Invalid DataBase Configuration.`);
    }
    req.db = { sequelize: Sequelize, Op: Sequelize.Op, QueryTypes: Sequelize.QueryTypes };
    req._conn = [];
    Sequelize.DATE.types.mysql = ['DATE'];
    for (const db_name in req.config.databases) {
        let dbConf = req.config.databases[db_name];
        if (typeof dbConf != 'object') {
            throw new ConfigError(`Invalid Database Configuration for: ${db_name}`);
        }
        if (!(Object.hasOwnProperty.call(dbConf, 'token') || (Object.hasOwnProperty.call(dbConf, 'username') && Object.hasOwnProperty.call(dbConf, 'password') && Object.hasOwnProperty.call(dbConf, 'database')))) {
            throw new ConfigError(`Invalid Database Configuration for: ${db_name}, Provide either token, or username, password, and database.`);
        }
        if (!Object.hasOwnProperty.call(dbConf, 'host')) {
            throw new ConfigError(`Invalid Database Configuration for: ${db_name}, host is missing.`);
        }
        dbConf.dialect = "mysql";
        dbConf.dialectOptions = {
            connectTimeout: isNaN(dbConf.connectTimeout) ? 30 * 1000 : dbConf.connectTimeout,
            multipleStatements: true,
            dateStrings: true
        }
        if (Object.hasOwnProperty.call(dbConf, 'dateStrings')) {
            dbConf.dialectOptions.dateStrings = dbConf.dateStrings ? true : false;
            delete dbConf.dateStrings;
        }
        if (Object.hasOwnProperty.call(dbConf, 'multipleStatements')) {
            dbConf.dialectOptions.multipleStatements = dbConf.multipleStatements ? true : false;
            delete dbConf.multipleStatements;
        }
        if (!Object.hasOwnProperty.call(dbConf, 'timezone')) {
            dbConf.timezone = systemTimeZone();
        }
        if (Object.hasOwnProperty.call(dbConf, 'logging') && typeof dbConf.logging === 'function') {
            const logger = dbConf.logging;
            dbConf.logging = (sql, ...rest) => {
                logger(sql.replace('SELECT 1;', ''), ...rest);
            }
            dbConf.logQueryParameters = true;
            dbConf.benchmark = true;
        } else {
            dbConf.logging = false;
        }
        if (!Object.hasOwnProperty.call(dbConf, 'pool')) {
            dbConf.pool = { min: 0, max: 5, idle: 500, acquire: 60000, evict: 500 };
        }
        const { database = 'db', username = 'user', password = 'pwd', token = '', host, connectTimeout, ...extraConfig } = dbConf;
        dbConf.password = '********';
        if (token) {
            const sequelize = new Sequelize(database, username, password, extraConfig);
            sequelize.connectionManager = new ProxyConnectionManager(
                sequelize.dialect,
                sequelize,
                () => token,
                host
            );
            req._conn[db_name] = sequelize;
        } else {
            req._conn[db_name] = new Sequelize(database, username, password, { ...extraConfig, host });
        }
        readDbModels(req, db_name);
    }
    req.dbConnection = (db_name) => {
        return req._conn[(db_name && Object.hasOwnProperty.call(req._conn, db_name)) ? db_name : 'default'];
    }
    req.db.getConnection = req.dbConnection;
    req.getConnection = (db_name) => {
        return new mysql(req._conn[(db_name && Object.hasOwnProperty.call(req._conn, db_name)) ? db_name : 'default']);
    }
}