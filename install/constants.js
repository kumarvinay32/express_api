"use strict";

/**
 * JavaScript project templates.
 * Used by the installer/CLI (install/scaffold.js) when scaffolding a
 * JavaScript project. TypeScript templates live in constants-ts.js.
 */

const appConfig = `'use strict';

/**
 * Request Initializer
 * -------------------------------
 * This module configures request-level settings and utilities.
 * It enriches the \`req\` object with configuration, security,
 * localization, database bindings, and centralized logging.
 */
module.exports = (req) => {

    /**
     * ==========================================================
     * Request Configuration
     * ==========================================================
     * Centralized configuration controlling application behavior
     * for the lifetime of a single request.
     */
    req.config = {

        /**
         * ------------------------------------------------------
         * Utility & Database Bindings
         * ------------------------------------------------------
         */

        // Attach common utility helpers to \`req.util\`
        bindUtil: true,

        // Attach database helpers: req.getConnection(), req.getConnectionORM() (and the deprecated req.db / req.dbConnection() — removed in v3)
        bindDatabase: true,

        // true: req.db is not created at all; req.getConnection()/req.getConnectionORM() still work
        disableSequelizeORM: false,


        /**
         * ------------------------------------------------------
         * Console Logging Controls
         * ------------------------------------------------------
         */

        // Disable console.log output globally when set to true
        disableConsoleLog: false,

        // Disable console.info output globally when set to true
        disableConsoleInfo: false,


        /**
         * ------------------------------------------------------
         * API Response Formatting
         * ------------------------------------------------------
         */

        // Automatically wrap responses in a standard API format
        // {
        //   error: false,
        //   code: 200,
        //   message: "Response",
        //   timestamp: <unix_timestamp>,
        //   data: {}
        // }
        autoFormatResponse: true,

        // Default HTTP status code used for handled errors
        // (used when no explicit error code is provided)
        responseErrorCode: 422,


        /**
         * ------------------------------------------------------
         * Security Headers & CORS Configuration
         * ------------------------------------------------------
         */

        // Enable or disable built-in security header handling
        enable_security_header: true,

        // Additional custom response headers
        // (applied only when security headers are enabled)
        headers: {
            "Server": "Unknown"
        },

        // Allowed CORS origins
        allowedOrigins: ['*'],

        // Allowed HTTP methods for CORS
        allowedMethods: 'GET, POST, OPTIONS',

        // Whitelisted request headers accepted from clients like token etc
        allowedHeaders: [],


        /**
         * ------------------------------------------------------
         * Multilingual / Localization Configuration
         * ------------------------------------------------------
         */

        // Enable or disable multilingual support
        lang: true,

        // Determine request language dynamically
        // Falls back to English if no language is provided
        lang_var: (req) => req.getEnv('app_lng') || 'en',

        // Default application language
        lang_default: 'en',


        /**
         * ------------------------------------------------------
         * Database Error Handling
         * ------------------------------------------------------
         */

        // Generic database error message exposed to clients
        db_error_message: "MYSQL_ERROR",


        /**
         * ------------------------------------------------------
         * Authentication Whitelist
         * ------------------------------------------------------
         */

        // URLs that do NOT require token-based authentication
        whitelist_urls: [
            "user/login"
        ]
    };


    /**
     * ==========================================================
     * Centralized Request / Response Logger
     * ==========================================================
     * Logs execution time, request metadata, request payload,
     * response data, and error information.
     */
    req.response_logger = (req, err, res) => {

        // Calculate total request execution duration
        const execution_duration =
            req.end_timestamp.getTime() - req.begin_timestamp.getTime();

        // Choose console color based on performance threshold
        // Green  : < 250ms
        // Yellow : 250 - 500ms
        // Red    : > 500ms
        const colour =
            execution_duration > 500 ? 31 :
            (execution_duration < 250 ? 32 : 33);

        // Log request method, URL, and execution time
        console.info(
            \`\\x1b[\${colour}m%s\\x1b[0m\`,
            \`\${req.method} \${req.getEnv('req-url')} :- \` +
            \`\${Math.floor(execution_duration / 1000)}s \` +
            \`\${execution_duration % 1000}ms\`
        );

        /**
         * Build structured log object for auditing and debugging
         */
        const log = {
            url: req.getEnv('req-url'),
            method: req.method,
            begin: req.begin_timestamp,
            end: req.end_timestamp,
            execution_duration,
            remote_addr: req.getEnv("remote-addr"),
            referer: req.getEnv('referer'),
            user_agent: req.getEnv('user-agent'),
            req_params: JSON.stringify(req.params),
            req_data: JSON.stringify(req.data),
            res_data: JSON.stringify(
                res || (err ? { error: err.message } : {})
            )
        };

        // Log every request/response pair
        console.log('req_res', log);

        /**
         * Error-specific logging
         * - Sequelize errors are logged separately for DB debugging
         * - Other errors are logged with full stack traces
         */
        if (err && err.name && err.name.includes("Sequelize")) {
            console.log('mysql_error', err.stack);
        } else if (err) {
            console.log('error', err.stack);
        }
    };


    /**
     * Alias for threaded or asynchronous logging use cases
     */
    req.thread_response_logger = req.response_logger;
};
`;

const database = `/** ===Define Database Connections=== */
module.exports = {
    default: {
        /** Connection credentials */
        host: 'localhost',
        username: 'database_user',
        password: 'password',
        database: 'database_name',

        /** Optional proxy database configuration */
        // token: '<authentication token of proxy database server>',
        // host: '<proxy host URI>', // Example: https://db.test.in

        connectTimeout: 60 * 1000,
        pool: { min: 2, max: 20, idle: 30000, acquire: 30000, evict: 1000 },
        logging: mysql_log
    }
};

/** === MySQL Logger === */
function mysql_log(sql, benchmark) {
    console.log('sql', \`\${benchmark}::\${sql}\`);
}`;

const hi = `module.exports = {
    notFoundMessage: \`ए पी आई "?" नहीं मिला।\`,
    MYSQL_ERROR: \`हमें कुछ तकनीकी कठिनाइयों का सामना करना पड़ रहा है, कृपया बाद में प्रयास करें।\`,
    UNAUTHORIZED: \`अनाधिकृत उपयोग।\`,
    APP_WORKING: \`काम कर रहा है...\`,
}`;

const en = `module.exports = {
    notFoundMessage: \`API "?" not found.\`,
    MYSQL_ERROR: \`We are facing some technical difficulties, Please try later.\`,
    UNAUTHORIZED: \`Unauthorized access.\`,
    APP_WORKING: \`Working...\`,
}`;

const routes = `const routes = require('express').Router();
const util = require("../helpers");

/** 
 * Construct path to Route actions.
 * 
 * routes.<get|post|put|delete>('<Url path>',...<Middlewares>, <action>);
 * 
 */

routes.all("/", (req, res, next) => {
    res.json({
        message: "APP_WORKING"
    });
});

routes.all("/thread", async (req, res, next) => {
    const tresp = await util.execNewThreadSync(req);
    res.json(tresp);
});

module.exports = routes;`;

const helpers = `const util = require("@krvinay/express_api/util");
const threads = require("@krvinay/express_api/threads");

class commonFunctions extends util {

    /**
     * 
     * @param {Request} req Express Request 
     * @param {String} activity Activity file name
     * @param {String} execFunction Function name defined on Activity class
     * @param {Object} payload payload to be passed over function
     * @param {Function} callback callback function containing error and response as parameter.
     */
    static execNewThread(req, activity = 'index', execFunction = 'main', payload = {}, callback) {
        threads(activity, execFunction, payload, { ...req.headers }, (err, resp) => {
            callback(err, resp);
        });
    }

    /**
     * 
     * @param {Request} req Express Request 
     * @param {String} activity Activity file name
     * @param {String} execFunction Function name defined on Activity class
     * @param {Object} payload payload to be passed over function
     * @return response object after executing the provided function.
     * @throws Error Object on error event.
     */
    static async execNewThreadSync(req, activity = 'index', execFunction = 'main', payload = {}) {
        return new Promise((resolve, reject) => {
            commonFunctions.execNewThread(req, activity, execFunction, payload, (err, data) => {
                if (err) { reject(err); } else { resolve(data); }
            });
        });
    }

    /**
     * Gets an environment variable from available sources, and provides emulation
     * for unsupported or inconsistent environment variables.
     * Also exposes some additional custom environment information.
     *
     * @param {Request Object} req Node Express request object.
     * @param {string} key Environment variable name.
     * @return {string} Environment variable setting.
     */
    static env(req, key) {
        return req.getEnv(key) || '';
    }

    /** Define your non database common function here */
}
module.exports = commonFunctions; 
`;

const activities = `class Activities {

    static async main(req, payload) {
        try {
            return { message: "Response from thread", ...payload };
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

}

module.exports = Activities;`;

const models = `const mysql = require("@krvinay/express_api/mysql");
/**
 * Return Mysql connection for default databasee configuration present in appConfig.js.
 * This will allow you to execute raw sqls.
 * for detailed document see: https://www.npmjs.com/package/@krvinay/mysql
 */
module.exports = mysql.getConnection();

// Or connect with ad-hoc credentials instead of a configured db name
// (same shape as src/config/database.js; connection is cached per credentials):
// module.exports = mysql.getConnection({ host, username, password, database });

/**
 * Return Sequelize models for default database configuration present in appConfig.js.
 * This will allow you to execute raw sqls as well as Sequelize ORM.
 * for detailed document see: https://sequelize.org
 */
// module.exports = mysql.getConnectionORM('default');`;

const server = `require("dotenv").config({ quiet: true });
const server = require('express')();
const { json, urlencoded } = require('express');
const default_port = 8080;

server.use(json({ limit: '50mb', extended: true }));
server.use(urlencoded({ limit: '50mb', extended: true }));
server.use(require("@krvinay/express_api"));

server.listen(process.env.PORT || default_port, () => {
    console.log("Server running on port " + (process.env.PORT || default_port));
});`;

const readme = `# API Development Guide

Welcome to your Express API Microservice! This guide will help you start building APIs quickly and efficiently.

## Quick Start

Your project is now set up with a complete API structure. Start the development server:
\`\`\`sh
node server.js
\`\`\`

Your API will be available at \`http://localhost:8080\` (or your configured PORT).

## Project Structure Overview

\`\`\`
src/
|---- activities/      # Background tasks and threaded operations
|---- config/          # Application configuration
|---- helpers/         # Utility functions
|---- lang/            # Multi-language support
|---- logs/            # Application logs
|---- models/          # Database models and connections
|---- routes/          # API endpoints
\`\`\`

## Usage

1. **Adding Routes** - Define your endpoints in \`src/routes/index.js\`
2. **Creating Models** - Add database models in \`src/models/\`
3. **Writing Helpers** - Create utility functions in \`src/helpers/\`
4. **Configuring Languages** - Add translations in \`src/lang/\`
5. **Implementing Threads** - Add background tasks in \`src/activities/\`
6. **Logging** - Logs are generated in \`src/logs/\`


## Claude AI Agent

This project includes \`CLAUDE.md\` a built-in agent guide that instructs Claude how to write APIs using this package's exact patterns, conventions, and architecture.

### Enhance your workflow with Claude Code

Place \`CLAUDE.md\` inside \`.claude/\` so Claude Code loads it automatically as project context every time you open this project:

\`\`\`sh
mkdir -p .claude
cp CLAUDE.md .claude/CLAUDE.md
\`\`\`

Once in place, Claude will automatically follow all conventions \`req.data\` usage, \`next(err)\` error handling, response envelope format, i18n key patterns, thread/activity structure, and database access patterns without needing explicit prompting.

## Additional Resources

- [Express Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)

## Need Help?

- Check the logs in \`src/logs/\` directory
- Review the configuration in \`src/config/appConfig.js\`
- Ensure database credentials are correct in \`.env\`
- Verify all dependencies are installed: \`npm install\`

---

**Happy Coding!**

Start building amazing APIs with your Express Microservice framework.
`;

const favicon = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="256" height="128" viewBox="0 0 256 128"><text x="49%" y="59%" text-anchor="middle" dominant-baseline="middle" fill="#0A0" style="font-size:120px;font-weight:800;font-family:sans-serif;" >KEA</text></svg>`;

const gitignore = `# User specific & automatically generated files #
#################################################
node_modules
package-lock.json
.env
.env.*
*/logs/*.*
*/logs/*/*.*
*.mo
*.old
*.pdf
*.xls
*.xlsx
*.zip
*/config/*.*
!*/config/appConfig.js
ecosystem.config.js
# IDE and editor specific files #
#################################
/nbproject
.idea
.vscode
/.project
/.buildpath
/.settings/

# OS generated files #
######################
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
Icon?
ehthumbs.db
Thumbs.db
`;

module.exports = { appConfig, database, hi, en, routes, helpers, activities, models, server, readme, favicon, gitignore };
