'use strict';

const config = require("../config");
const path = require("path");
const fs = require("fs");

process.on("message", async ({ activity = 'index', execFunction = 'main', payload = {}, headers = {} }) => {
    let req = { method: 'THREAD', secure: true, originalUrl: `/${activity}/${execFunction}`, protocol: 'file', headers: headers, connection: {}, get: (k) => { return headers[k] || '' }, ...config };
    try {
        req.begin_timestamp = new Date();
        const send = process.send;
        process.send = function (body) {
            req.end_timestamp = new Date();
            let resp = {
                error: false,
                code: 200,
                message: '',
                is_child: true,
                timestamp: req.end_timestamp.getTime(),
                data: {}
            }
            let response = {};
            if (typeof body === "string") {
                try { response = JSON.parse(body); } catch (error) { response = { data: body } }
            } else if (body) {
                req.thread_response_logger(req, req._err_obj, body);
                return send.call(this, body);
            }
            if (Object.hasOwnProperty.call(response, "error")) {
                resp.error = response.error ? true : false;
                delete response.error;
            }
            if (Object.hasOwnProperty.call(response, "message")) {
                resp.message = response.message;
                delete response.message;
            }
            if (Object.hasOwnProperty.call(response, "code")) {
                resp.code = response.code;
                delete response.code;
            }
            delete response.timestamp;
            if (Object.hasOwnProperty.call(response, "forceLogin")) {
                req.forceLogin = response.forceLogin ? true : false;
                delete response.forceLogin;
            }
            if (Object.hasOwnProperty.call(response, "data")) {
                resp.data = response.data;
                delete response.data;
            }
            if (Object.values(response).length > 0) {
                if (Object.values(resp.data).length > 0) {
                    resp.data = { ...response, data: resp.data };
                } else {
                    resp.data = response;
                }
            }
            if (resp.error === true && req.forceLogin === true) {
                resp.forceLogin = true;
                resp.code = 403;
            }
            if (Object.hasOwnProperty.call(req, 'app_lang') && req.app_lang && Object.hasOwnProperty.call(req._lng_messages, resp.message)) {
                resp.message = req._lng_messages[resp.message];
            }
            req.thread_response_logger(req, req._err_obj, resp);
            if (Object.hasOwnProperty.call(req.config, 'db_error_message') && req.config.db_error_message) {
                if (req._err_obj && Object.hasOwnProperty.call(req._err_obj, 'name') && req._err_obj.name.indexOf("Sequelize") !== -1) {
                    resp.message = req.config.db_error_message;
                }
            }
            if (Object.hasOwnProperty.call(req, 'app_lang') && req.app_lang && Object.hasOwnProperty.call(req._lng_messages, resp.message)) {
                resp.message = req._lng_messages[resp.message];
            }
            return send.call(this, JSON.stringify(resp));
        };
        const activity_path = path.join(req._activity_dir, `${activity}.js`);
        if (!fs.existsSync(activity_path)) {
            throw new Error(`Activity not found. Path:"${activity_path}"`);
        }
        const activities = require(activity_path);
        if (typeof activities[execFunction] !== "function") {
            throw new Error(`Activity Function (${execFunction}) not defined. Path:"${activity_path}"`);
        }
        const output = await activities[execFunction](req, payload);
        process.send(output);
    } catch (err) {
        let resp = {
            error: true,
            code: 422,
            message: err.message,
            data: {}
        }
        if (Object.hasOwnProperty.call(req, 'app_lang') && req.app_lang && Object.hasOwnProperty.call(req._lng_messages, resp.message)) {
            resp.message = req._lng_messages[resp.message];
        }
        req._err_obj = err;
        process.send(resp);
    }
});