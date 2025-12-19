"use strict";

const config = require("./configs");
const logger = require("./logger");
const req = {};
config(req);
logger(req);

const { bindDatabase = true, bindUtil = true } = req.config;

if (bindUtil) {
    req.util = require("../util");
    req.util.log = req.writeLog;
    req.util.env = (req, key) => req.getEnv(key);
}

if (bindDatabase) {
    require("./database")(req);
    require("../database")(req);
}

module.exports = req;
