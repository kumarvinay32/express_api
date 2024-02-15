"use strict";

const config = require("./configs");
const logger = require("./logger");
const util = require("../util");
const db = require("../database");
const req = { util };
config(req);
logger(req);
db(req);
module.exports = req;