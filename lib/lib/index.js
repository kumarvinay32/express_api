"use strict";

const system = require("express")();
const configs = require("../config");
const getEnv = require("./getEnv");
const favicon = require("./favicon");
system.use((req, res, next) => {
    Object.assign(req, configs);
    if (Object.hasOwnProperty.call(req.config, 'enable_security_header') && req.config.enable_security_header) {
        system.use(require("./securityHandler"));
    }
    getEnv(req);
    require("./languageHandler")(req);
    system.use(require("./requestHandler"));
    if (Object.hasOwnProperty.call(req.config, 'loadFavicon') && req.config.loadFavicon) {
        system.use(favicon(req.config.loadFavicon));
    }
    system.use(require(req._routes_dir));
    system.use(require("./404Handler"));
    system.use(require("./errorHandler"));
    next();
});
module.exports = system;
