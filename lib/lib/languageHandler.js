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

const _format = (message, ...values) => {
    if (values == null || !Array.isArray(values) || values.length <= 0) {
        return message;
    }
    let chunkIndex = 0;
    let placeholdersRegex = /\?/g;
    let result = '';
    let valuesIndex = 0;
    let match;
    while (valuesIndex < values.length && (match = placeholdersRegex.exec(message))) {
        result += message.slice(chunkIndex, match.index) + (values[valuesIndex] || '');
        chunkIndex = placeholdersRegex.lastIndex;
        valuesIndex++;
    }
    if (chunkIndex === 0) {
        return message;
    }
    if (chunkIndex < message.length) {
        return result + message.slice(chunkIndex);
    }
    return result;
};

module.exports = (req) => {
    if (Object.hasOwnProperty.call(req, "config") && Object.hasOwnProperty.call(req.config, "lang") && req.config.lang) {
        if (!Object.hasOwnProperty.call(req.config, "lang_var") || !req.config.lang_var) {
            throw new ConfigError("Application language identifier not defined, Please define 'lang_var' in appConfig.js.");
        }
        req.app_lang = ((typeof req.config.lang_var === 'function' ? req.config.lang_var(req) : req.getEnv(req.config.lang_var)) || req.config.lang_default || 'en').toLowerCase();
        if (!fs.existsSync(path.join(req._lang_dir, `${req.app_lang}.js`))) {
            throw new ConfigError(`Language "${req.app_lang}" file not found. Path: ${path.join(req._lang_dir, `${req.app_lang}.js`)}`);
        }
        req._lng_messages = require(path.join(req._lang_dir, `${req.app_lang}.js`));
        req.formatMessage = function (...args) {
            let message = args[0] || ``;
            if (Object.hasOwnProperty.call(req._lng_messages, message)) {
                args[0] = req._lng_messages[message];
            }
            return _format(...args)
        }
        global.formatMessage = function (...args) {
            return req.formatMessage(...args);
        }
    }
}