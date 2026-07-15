"use strict";
if (!process.env?.SRC) {
    require("dotenv").config({ quiet: true, override: false });
}
const { join, dirname, resolve } = require("path");
const { resolveModuleFile, requireModule, SUPPORTED_EXTENSIONS } = require("../loader");
class ConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = (req) => {
    req._root_dir = dirname(dirname(dirname(dirname(dirname(resolve(__dirname))))));
    req._src_dir = join(req._root_dir, process.env.SRC == undefined ? "src" : process.env.SRC);
    req._conf_dir = join(req._src_dir, "config");
    req._models_dir = join(req._src_dir, "models", "datasource");
    req._logs_dir = join(req._src_dir, "logs");
    const dbConfigFile = resolveModuleFile(join(req._conf_dir, "database"));
    if (!dbConfigFile) {
        throw new ConfigError(`Config file not found. Path:"${join(req._conf_dir, `database(${SUPPORTED_EXTENSIONS.join('|')})`)}". If the project is not set up yet, run "npx express-api init" to complete the setup.`);
    }
    let dbConf = requireModule(dbConfigFile);
    // database.js may export the config object directly, or a factory
    // function `(req) => ({ ... })` — both shapes are supported
    if (typeof dbConf === 'function') {
        dbConf = dbConf(req);
    }
    if (!req.config) {
        req.config = {};
    }
    req.config.databases = dbConf;
}
