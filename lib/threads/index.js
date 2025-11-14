'use strict';

const { fork } = require("child_process");
const path = require('path');

module.exports = (activity = 'index', execFunction = 'main', payload = {}, headers = {}, callback) => {
    const child = fork(path.join(__dirname, "subProcess.js"), {
        stdio: "inherit"
    });
    child.on('message', (resp) => {
        child.kill();
        if (typeof resp === "object" && Object.hasOwnProperty.call(resp, 'error') && resp.error) {
            callback(new Error(resp.message || "Something went wrong!"));
        } else {
            callback(undefined, resp);
        }
    });
    child.send({ activity, execFunction, payload, headers });
}