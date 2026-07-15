'use strict';

const fs = require('fs');
const path = require('path');

module.exports = (req) => {
    /**
     * Log message to a file.
     * 
     * @param {string} fname file name to be created to write log.
     * @param {any} message message to be written on file.
     * @param {boolean} append flag to append/replace message on file(default to true).
     */
    req.writeLog = (fname, message, append = true) => {
        let log_file_name = 'debug.log';
        if (message == undefined) {
            message = fname;
        } else {
            log_file_name = fname + '.log';
        }
        if (typeof message === 'object') {
            message = JSON.stringify(message, null, 2);
        }
        const log_file_path = path.join(req._logs_dir, log_file_name);
        fs.mkdirSync(path.dirname(log_file_path), { recursive: true });
        if (append) {
            fs.appendFileSync(log_file_path, (new Date()).toString() + ': ' + message + '\n');
        } else {
            fs.writeFileSync(log_file_path, (new Date()).toString() + ': ' + message + '\n');
        }
    }

    /**
     * Restrict Log message to Console if disableConsoleLog=true.
     * 
     * @param {any} message message to print on console
     * @param {any} optionalParams optional extra messages
     */
    const console_log = console.log;
    console.log = (...messages) => {
        if (!req.config.disableConsoleLog) {
            console_log.call(this, ...messages);
        }
    }

    /**
     * Restrict Log Info message to Console if disableConsoleInfo=true.
     * 
     * @param {any} message message to print on console
     * @param {any} optionalParams optional extra messages
     */
    const console_info = console.info;
    console.info = (...messages) => {
        if (!req.config.disableConsoleInfo) {
            console_info.call(this, ...messages);
        }
    }
}