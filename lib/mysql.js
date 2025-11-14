"use strict";
const config = require("./config/configs");
const logger = require("./config/logger");
const mysql = require("./database");
const req = {};
config(req);
logger(req);
mysql(req);

module.exports = req;