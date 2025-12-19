"use strict";

require("dotenv").config({ quiet: true, override: false });
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
    req._routes_dir = join(req._src_dir, "routes");
    req._logs_dir = join(req._src_dir, "logs");
    req._lang_dir = join(req._src_dir, "lang");
    req._activity_dir = join(req._src_dir, "activities");
    req.NODE_ENV = process.env.NODE_ENV || "development";
    if (!fs.existsSync(join(req._conf_dir, "appConfig.js"))) {
        throw new ConfigError(`Config file not found. Path:"${join(req._conf_dir, "appConfig.js")}"`);
    }
    require(join(req._conf_dir, "appConfig.js"))(req);
    if (!Object.hasOwnProperty.call(req, "response_logger") || typeof req.response_logger != "function") {
        req.response_logger = (req, err, res) => {
            if (err) {
                console.log(err.stack);
            }
        };
    }
    if (!Object.hasOwnProperty.call(req, "thread_response_logger") || typeof req.thread_response_logger != "function") {
        req.thread_response_logger = (req, err, res) => {
            if (err) {
                console.log(err.stack);
            }
        };
    }
    if (fs.existsSync(join(req._root_dir, 'favicon.ico'))) {
        req.config.loadFavicon = join(req._root_dir, 'favicon.ico');
    } else if (fs.existsSync(join(req._root_dir, 'favicon.png'))) {
        req.config.loadFavicon = join(req._root_dir, 'favicon.png');
    } else if (fs.existsSync(join(req._root_dir, 'favicon.svg'))) {
        req.config.loadFavicon = join(req._root_dir, 'favicon.svg');
    }
}