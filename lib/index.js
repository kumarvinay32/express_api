/*!
 * express api
 * Copyright(c) 2024-2025 Vinay Kumar
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
let express;
try {
    express = require("./lib");
} catch (err) {
    // the app's runtime dependencies are installed by "npx express-api init",
    // not by npm — point there when they are missing
    if (err.code === 'MODULE_NOT_FOUND' && /'(express|sequelize|mysql2|dotenv)'/.test(err.message)) {
        err.message += '\nProject dependencies are not installed — run "npx express-api init" to complete the setup.';
    }
    throw err;
}

/**
 * Expose initExpress Module.
 *
 * The deprecated `util`, `threads` and `mysql` properties were removed in
 * v2.0.0 — use the subpath exports instead:
 *   require("@krvinay/express_api/util")
 *   require("@krvinay/express_api/threads")
 *   require("@krvinay/express_api/mysql")
 */
exports = module.exports = express;

