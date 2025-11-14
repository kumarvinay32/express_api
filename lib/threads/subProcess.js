'use strict';

const config = require("../config");
const path = require("path");
const fs = require("fs");
const getEnv = require("../lib/getEnv");

process.on("message", async ({ activity = 'index', execFunction = 'main', payload = {}, headers = {} }) => {
    let req = { method: 'THREAD', secure: true, originalUrl: `/${activity}/${execFunction}`, protocol: 'file', headers: headers, connection: {}, ...config, begin_timestamp: new Date() };
    getEnv(req);
    const send = process.send;
    process.send = function (body) {
        try {
            req.end_timestamp = new Date();
            req.thread_response_logger(req, req._err_obj, body);
            return send.call(this, body);
        } catch (err) {
            let resp = {
                error: true,
                message: err.message
            }
            req._err_obj = err;
            return send.call(this, resp);
        }
    };
    try {
        const activity_path = path.join(req._activity_dir, `${activity}.js`);
        if (!fs.existsSync(activity_path)) {
            throw new Error(`Activity not found. Path: "${activity_path}"`);
        }
        const activities = require(activity_path);
        if (typeof activities[execFunction] !== "function") {
            throw new Error(`Activity Function (${execFunction}) not defined. Path: "${activity_path}"`);
        }
        const output = await activities[execFunction](req, payload);
        process.send(output);
    } catch (err) {
        let resp = {
            error: true,
            message: err.message
        }
        if (Object.hasOwnProperty.call(req.config, 'db_error_message') && req.config.db_error_message) {
            if (Object.hasOwnProperty.call(err, 'name') && err.name.indexOf("Sequelize") !== -1) {
                resp.message = req.config.db_error_message;
            }
        }
        req._err_obj = err;
        process.send(resp);
    }
});