"use strict";
if (!process.env?.SRC) {
    require("dotenv").config({ quiet: true, override: false });
}
const { join, dirname, resolve } = require("path");
const fs = require("fs");
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
    if (!fs.existsSync(join(req._conf_dir, "database.js"))) {
        throw new ConfigError(`Config file not found. Path:"${join(req._conf_dir, "database.js")}"`);
    }
    const dbConf = require(join(req._conf_dir, "database.js"));
    if (!req.config) {
        req.config = {};
    }
    req.config.databases = dbConf;
}