/**
 * express api
 * Copyright(c) 2024-2025 Vinay Kumar
 * MIT Licensed
 * 
 */

import { Handler } from 'express';
import  * as Util  from './util';
import { threads as Threads } from './threads';
import { mysql as Mysql } from './mysql';

declare function express(): Handler;

/**
 * @deprecated This export will be removed in v2.0.0  
 * Use following instead:
 * ```js
 * const util = require("@krvinay/express_api/util");
 * ```
 */
express.util = Util;

/**
 * @deprecated This export will be removed in v2.0.0  
 * Use following instead:
 * ```js
 * const threads = require("@krvinay/express_api/threads");
 * ```
 */
express.threads = Threads;

/**
 * @deprecated This export will be removed in v2.0.0  
 * Use following instead:
 * ```js
 * const mysql = require("@krvinay/express_api/mysql");
 * ```
 */
express.mysql = Mysql;

export = express;