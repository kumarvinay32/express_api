/*!
 * express api
 * Copyright(c) 2024-2025 Vinay Kumar
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
const express = require("./lib");
const util = require("./util");
const threads = require("./threads");
const mysql = require("./config");

/**
 * Expose initExpress Module.
 */
exports = module.exports = express;

/**
 * Expose `util`.
 */
exports.util = util;

/**
 * Expose `threads`.
 */
exports.threads = threads;

/**
 * Expose `mysql connection`.
 */
exports.mysql = mysql;