"use strict";

/**
 * TypeScript project templates.
 * Used by the installer instead of the JavaScript templates (constants.js)
 * when the target project is a TypeScript project.
 */

const appConfig = `'use strict';

import { Request } from 'express';

/**
 * Request Initializer
 * -------------------------------
 * Configures request-level settings and utilities. Enriches the \`req\`
 * object with configuration, security, localization, database bindings,
 * and centralized logging.
 */
export default (req: Request) => {

    /**
     * Centralized configuration controlling application behavior
     * for the lifetime of a single request.
     */
    req.config = {

        // Attach common utility helpers to \`req.util\`
        bindUtil: true,

        // Attach database helpers: req.getConnection(), req.getConnectionORM() (and the deprecated req.db / req.dbConnection() — removed in v3)
        bindDatabase: true,

        // true: req.db is not created at all; req.getConnection()/req.getConnectionORM() still work
        disableSequelizeORM: false,

        // Disable console.log / console.info output globally when set to true
        disableConsoleLog: false,
        disableConsoleInfo: false,

        // Automatically wrap responses in a standard API format
        // { error, code, message, timestamp, data }
        autoFormatResponse: true,

        // Default HTTP status code used for handled errors
        responseErrorCode: 422,

        // Enable or disable built-in security header handling
        enable_security_header: true,

        // Additional custom response headers
        headers: {
            "Server": "Unknown"
        },

        // Allowed CORS origins
        allowedOrigins: ['*'],

        // Allowed HTTP methods for CORS
        allowedMethods: 'GET, POST, OPTIONS',

        // Whitelisted request headers accepted from clients like token etc
        allowedHeaders: [],

        // Enable or disable multilingual support
        lang: true,

        // Determine request language dynamically (falls back to English)
        lang_var: (req: Request) => req.getEnv('app_lng') || 'en',

        // Default application language
        lang_default: 'en',

        // Generic database error message exposed to clients
        db_error_message: "MYSQL_ERROR",

        // URLs that do NOT require token-based authentication
        whitelist_urls: [
            "user/login"
        ]
    };

    /**
     * Centralized Request / Response Logger
     * Logs execution time, request metadata, request payload,
     * response data, and error information.
     */
    req.response_logger = (req: Request, err: Error | null | undefined, res: any) => {

        // Calculate total request execution duration
        const execution_duration =
            (req.end_timestamp as Date).getTime() - req.begin_timestamp.getTime();

        // Green: < 250ms | Yellow: 250-500ms | Red: > 500ms
        const colour =
            execution_duration > 500 ? 31 :
                (execution_duration < 250 ? 32 : 33);

        console.info(
            \`\\x1b[\${colour}m%s\\x1b[0m\`,
            \`\${req.method} \${req.getEnv('req-url')} :- \` +
            \`\${Math.floor(execution_duration / 1000)}s \` +
            \`\${execution_duration % 1000}ms\`
        );

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

        // Sequelize errors are logged separately for DB debugging
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
const databases = {
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
        pool: {
            min: 0,
            max: 5,
            idle: 200,
            acquire: 60 * 1000,
            evict: 200
        },
        logging: mysql_log
    }
};

/** === MySQL Logger === */
function mysql_log(sql: string, benchmark?: number) {
    console.log('sql', \`\${benchmark}::\${sql}\`);
}

export default databases;
`;

const en = `export default {
    notFoundMessage: \`API "?" not found.\`,
    MYSQL_ERROR: \`We are facing some technical difficulties, Please try later.\`,
    UNAUTHORIZED: \`Unauthorized access.\`,
    APP_WORKING: \`Working...\`,
}
`;

const hi = `export default {
    notFoundMessage: \`ए पी आई "?" नहीं मिला।\`,
    MYSQL_ERROR: \`हमें कुछ तकनीकी कठिनाइयों का सामना करना पड़ रहा है, कृपया बाद में प्रयास करें।\`,
    UNAUTHORIZED: \`अनाधिकृत उपयोग।\`,
    APP_WORKING: \`काम कर रहा है...\`,
}
`;

const routes = `import { Router, Request, Response, NextFunction } from 'express';
import util from '../helpers';

const routes = Router();

/**
 * Construct path to Route actions.
 *
 * routes.<get|post|put|delete>('<Url path>', ...<Middlewares>, <action>);
 *
 */

routes.all("/", (req: Request, res: Response, next: NextFunction) => {
    res.json({
        message: "APP_WORKING"
    });
});

routes.all("/thread", async (req: Request, res: Response, next: NextFunction) => {
    const tresp = await util.execNewThreadSync(req);
    res.json(tresp);
});

export default routes;
`;

const helpers = `import util from "@krvinay/express_api/util";
import threads from "@krvinay/express_api/threads";
import { Request } from "express";

class commonFunctions extends util {

    /**
     * @param req Express Request
     * @param activity Activity file name
     * @param execFunction Function name defined on Activity class
     * @param payload payload to be passed over function
     * @param callback callback function containing error and response as parameter.
     */
    static execNewThread(req: Request, activity: string, execFunction: string, payload: object, callback: (err: Error | null | undefined, resp?: any) => void) {
        threads(activity, execFunction, payload, { ...req.headers }, (err, resp) => {
            callback(err, resp);
        });
    }

    /**
     * @param req Express Request
     * @param activity Activity file name
     * @param execFunction Function name defined on Activity class
     * @param payload payload to be passed over function
     * @return response object after executing the provided function.
     * @throws Error Object on error event.
     */
    static async execNewThreadSync(req: Request, activity: string = 'index', execFunction: string = 'main', payload: object = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            commonFunctions.execNewThread(req, activity, execFunction, payload, (err, data) => {
                if (err) { reject(err); } else { resolve(data); }
            });
        });
    }

    /**
     * Gets an environment variable from available sources, and provides emulation
     * for unsupported or inconsistent environment variables.
     *
     * @param req Node Express request object.
     * @param key Environment variable name.
     * @return Environment variable setting.
     */
    static env(req: Request, key: string): string {
        return req.getEnv(key) || '';
    }

    /** Define your non database common function here */
}

export default commonFunctions;
`;

const activities = `class Activities {

    /**
     * @param req Request-like object (db, util, config, writeLog, etc.)
     * @param payload Data sent from the calling route
     */
    static async main(req: any, payload: any) {
        try {
            return { message: "Response from thread", ...payload };
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

}

export default Activities;
`;

const models = `import mysql from "@krvinay/express_api/mysql";

/**
 * Return Mysql connection for default database configuration.
 * This will allow you to execute raw sqls.
 * for detailed document see: https://www.npmjs.com/package/@krvinay/mysql
 */
export default mysql.getConnection();

// Or connect with ad-hoc credentials instead of a configured db name
// (same shape as src/config/database.js; connection is cached per credentials):
// export default mysql.getConnection({ host, username, password, database });

/**
 * Return Sequelize models for default database configuration.
 * This will allow you to execute raw sqls as well as Sequelize ORM.
 * for detailed document see: https://sequelize.org
 */
// export default mysql.getConnectionORM('default');
`;

const server = `import 'dotenv/config';
import express, { json, urlencoded } from 'express';
import api from '@krvinay/express_api';

const server = express();
const default_port = 8080;

server.use(json({ limit: '50mb' }));
server.use(urlencoded({ limit: '50mb', extended: true }));
server.use(api);

server.listen(Number(process.env.PORT) || default_port, () => {
    console.log("Server running on port " + (Number(process.env.PORT) || default_port));
});
`;

const tsconfig = (src) => JSON.stringify({
    compilerOptions: {
        target: "ES2020",
        module: "nodenext",
        moduleResolution: "nodenext",
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        resolveJsonModule: true,
    },
    include: [`${src}/**/*`, "server.ts"],
    exclude: ["node_modules"],
}, null, 2) + "\n";

module.exports = { appConfig, database, en, hi, routes, helpers, activities, models, server, tsconfig };
