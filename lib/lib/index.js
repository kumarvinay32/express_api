"use strict";

const system = require("express")();
const configs = require("../config");
system.use((req, res, next) => {
    Object.assign(req, configs);
    require("./languageHandler")(req);
    system.use(require("./requestHandler"));
    system.use(require(req._routes_dir));
    system.use(require("./404Handler"));
    system.use(require("./errorHandler"));
    next();
});
module.exports = system;