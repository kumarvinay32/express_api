"use strict";
const config = require("./config/database");
const logger = require("./config/logger");
const database = require("./database");
const req = {};
config(req);
logger(req);
database(req);

/**
 * Standalone database access, outside a request context. Exposes exactly two
 * functions — both accept a configured db_name or an ad-hoc credentials
 * object, and the raw Sequelize instance is available on the result as
 * `.connection`:
 *   getConnection(db_name?|credentials?)    → MySqlUtil wrapper for raw SQL
 *   getConnectionORM(db_name?|credentials?) → isolated Sequelize models (orm.<ModelName>)
 */
module.exports = {
    getConnection: req.getConnection,
    getConnectionORM: req.getConnectionORM,
};
