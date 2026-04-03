"use strict";

const system = require("express")();
const configs = require("../config");
const getEnv = require("./getEnv");
const favicon = require("./favicon");

system.use((req, res, next) => {
    Object.assign(req, configs);
    req.config = { ...configs.config };
    delete req.config.databases;
    getEnv(req);
    require("./languageHandler")(req);
    next();
});

if (configs.config && configs.config.enable_security_header) {
    system.use(require("./securityHandler"));
}
system.use(require("./requestHandler"));
if (configs.config && configs.config.loadFavicon) {
    system.use(favicon(configs.config.loadFavicon));
}
system.use(require(configs._routes_dir));
system.use(require("./404Handler"));
system.use(require("./errorHandler"));

module.exports = system;
