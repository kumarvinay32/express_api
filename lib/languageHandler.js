"use strict";

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
    if (Object.hasOwnProperty.call(req, "config") && Object.hasOwnProperty.call(req.config, "lang") && req.config.lang) {
        if (!Object.hasOwnProperty.call(req.config, "lang_var") || !req.config.lang_var) {
            throw new ConfigError("Application language identifier not defined, Please define 'lang_var' in appConfig.js.");
        }
        req.app_lang = (req.util.env(req, req.config.lang_var) || req.config.lang_default || 'en').toLowerCase();
        if (!fs.existsSync(path.join(req._lang_dir, `${req.app_lang}.js`))) {
            throw new ConfigError(`Language "${req.app_lang}" file not found. Path: ${path.join(req._lang_dir, `${req.app_lang}.js`)}`);
        }
        req._lng_messages = require(path.join(req._lang_dir, `${req.app_lang}.js`));
        req.formatMessage = function () {
            let message = arguments[0] || ``;
            if (Object.hasOwnProperty.call(req._lng_messages, message)) {
                arguments[0] = req._lng_messages[message];
            }
            return req.util.format(...arguments)
        }
        global.formatMessage = function (...args) {
            return req.formatMessage(...args);
        }
    }
}