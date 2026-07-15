'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Sequelize = require('sequelize');
const ProxyConnectionManager = require('./driver');
const mysql = require('./mysql');
const { resolveModuleFile, requireModule, isModuleFile } = require('../loader');
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

const buildConnection = (identifier, dbConf) => {
    if (typeof dbConf != 'object') {
        throw new ConfigError(`Invalid Database Configuration for: ${identifier}`);
    }
    if (!(Object.hasOwnProperty.call(dbConf, 'token') || (Object.hasOwnProperty.call(dbConf, 'username') && Object.hasOwnProperty.call(dbConf, 'password') && Object.hasOwnProperty.call(dbConf, 'database')))) {
        throw new ConfigError(`Invalid Database Configuration for: ${identifier}, Provide either token, or username, password, and database.`);
    }
    if (!Object.hasOwnProperty.call(dbConf, 'host')) {
        throw new ConfigError(`Invalid Database Configuration for: ${identifier}, host is missing.`);
    }
    dbConf.dialect = "mysql";
    dbConf.dialectOptions = {
        connectTimeout: isNaN(dbConf.connectTimeout) ? 10 * 1000 : dbConf.connectTimeout,
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
        dbConf.pool = { min: 2, max: 20, idle: 30000, acquire: 30000, evict: 1000 };
    }
    const { database = 'db', username = 'user', password = 'pwd', token = '', host, connectTimeout, ...extraConfig } = dbConf;
    if (token) {
        const sequelize = new Sequelize(database, username, password, extraConfig);
        sequelize.connectionManager = new ProxyConnectionManager(
            sequelize.dialect,
            sequelize,
            () => token,
            host
        );
        return sequelize;
    }
    return new Sequelize(database, username, password, { ...extraConfig, host });
};

const adhocConnectionKey = (credentials) => {
    return crypto.createHash('sha256').update(JSON.stringify({
        host: credentials.host,
        port: credentials.port,
        database: credentials.database,
        username: credentials.username,
        password: credentials.password,
        token: credentials.token
    })).digest('hex');
};

const loadModelsInto = (req, target, connectionLabel, folderName, connection) => {
    target[`${connectionLabel}_connection`] = connection;
    if (fs.existsSync(path.join(req._models_dir, folderName))) {
        const initModelsFile = resolveModuleFile(path.join(req._models_dir, folderName, 'init-models'));
        if (initModelsFile) {
            const models = requireModule(initModelsFile)(connection);
            Object.assign(target, models);
        } else {
            const files = fs.readdirSync(path.join(req._models_dir, folderName));
            files.forEach((file) => {
                const base = file.replace(/\.[^.]+$/, '');
                if (file.indexOf('.') !== 0 && isModuleFile(file) && base !== 'index' && base !== 'init-models') {
                    const model = requireModule(path.join(req._models_dir, folderName, file))(connection, Sequelize.DataTypes);
                    target[model.name] = model;
                }
            });
            Object.keys(target).forEach((modelName) => {
                if (target[modelName] && Object.hasOwnProperty.call(target[modelName], 'associate') && target[modelName].associate) {
                    target[modelName].associate(target);
                }
            });
        }
    }
};

module.exports = (req) => {
    if (!Object.hasOwnProperty.call(req, "config") || !Object.hasOwnProperty.call(req.config, "databases")) {
        throw new ConfigError(`DataBase Configuration not found.`);
    }
    if (typeof req.config.databases != "object") {
        throw new ConfigError(`Invalid DataBase Configuration.`);
    }
    req._conn = {};
    Sequelize.DATE.types.mysql = ['DATE'];
    for (const db_name in req.config.databases) {
        req._conn[db_name] = buildConnection(db_name, req.config.databases[db_name]);
    }
    req._adhocConn = {};
    const getOrBuildAdhocConnection = (credentials) => {
        const key = adhocConnectionKey(credentials);
        if (!Object.hasOwnProperty.call(req._adhocConn, key)) {
            const { models, ...connectionCreds } = credentials;
            req._adhocConn[key] = buildConnection('adhoc', connectionCreds);
        }
        return { key, connection: req._adhocConn[key] };
    }
    const resolveConnection = (target) => {
        if (target && typeof target === 'object') {
            return getOrBuildAdhocConnection(target).connection;
        }
        return req._conn[(target && Object.hasOwnProperty.call(req._conn, target)) ? target : 'default'];
    }
    req.getConnection = (target) => {
        return new mysql(resolveConnection(target));
    }
    req._ormCache = {};
    req.getConnectionORM = (target) => {
        let connection, folderName, cacheKey;
        if (target && typeof target === 'object') {
            if (!target.models) {
                throw new ConfigError(`getConnectionORM requires a "models" field naming the model folder to load.`);
            }
            const built = getOrBuildAdhocConnection(target);
            connection = built.connection;
            folderName = target.models;
            cacheKey = `adhoc:${built.key}:${folderName}`;
        } else {
            const db_name = (target && Object.hasOwnProperty.call(req._conn, target)) ? target : 'default';
            connection = req._conn[db_name];
            folderName = db_name;
            cacheKey = `dbname:${db_name}`;
        }
        if (!Object.hasOwnProperty.call(req._ormCache, cacheKey)) {
            const orm = { sequelize: Sequelize, Op: Sequelize.Op, QueryTypes: Sequelize.QueryTypes, connection };
            loadModelsInto(req, orm, folderName, folderName, connection);
            req._ormCache[cacheKey] = orm;
        }
        return req._ormCache[cacheKey];
    }
}
