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
    req.util.log = (fname, message, append = true) => {
        let log_file_name = 'debug.log';
        if (message == undefined) {
            message = fname;
        } else {
            log_file_name = fname + '.log';
        }
        if (typeof message === 'object') {
            message = JSON.stringify(message, null, 2);
        }
        const f_name = log_file_name.split(path.sep).pop();
        fs.mkdirSync(path.join(req._logs_dir, log_file_name.replace(f_name, '')), { recursive: true });
        if (append) {
            fs.appendFileSync(path.join(req._logs_dir, log_file_name), req.util.curdate() + ': ' + message + '\n');
        } else {
            fs.writeFileSync(path.join(req._logs_dir, log_file_name), req.util.curdate() + ': ' + message + '\n');
        }
    }

    /**
     * Log message to Console if NODE_ENV != 'production'.
     * 
     * @param {any} message message to print on console
     * @param {any} optionalParams optional extra messages
     */
    const console_log = console.log;
    console.log = (...messages) => {
        if (req.NODE_ENV != 'production') {
            console_log.call(this, ...messages);
        }
    }
}