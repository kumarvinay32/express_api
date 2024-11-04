"use strict";

require("dotenv").config();
const path = require("path");
const fs = require("fs");
class ConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = (req) => {
    req._root_dir = path.dirname(path.dirname(path.dirname(path.dirname(path.dirname(path.resolve(__dirname))))));
    req._src_dir = path.join(req._root_dir, process.env.SRC == undefined ? "src" : process.env.SRC);
    req._conf_dir = path.join(req._src_dir, "config");
    req._models_dir = path.join(req._src_dir, "models", "datasource");
    req._routes_dir = path.join(req._src_dir, "routes");
    req._logs_dir = path.join(req._src_dir, "logs");
    req._lang_dir = path.join(req._src_dir, "lang");
    req._activity_dir = path.join(req._src_dir, "activities");
    req.NODE_ENV = process.env.NODE_ENV || "development";
    if (!fs.existsSync(path.join(req._conf_dir, "appConfig.js"))) {
        throw new ConfigError(`Config file not found. Path:"${path.join(req._conf_dir, "appConfig.js")}"`);
    }
    require(path.join(req._conf_dir, "appConfig.js"))(req);
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
}