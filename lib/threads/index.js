'use strict';

const { fork } = require("child_process");
const path = require('path');

module.exports = (activity = 'index', execFunction = 'main', payload = {}, headers = {}, callback, timeout) => {
    const child = fork(path.join(__dirname, "subProcess.js"), {
        stdio: "inherit"
    });
    let done = false;
    const finish = (err, result) => {
        if (done) return;
        done = true;
        if (timer) clearTimeout(timer);
        child.kill();
        callback(err, result);
    };
    const timer = timeout > 0 ? setTimeout(() => {
        finish(new Error(`Thread timeout: "${activity}.${execFunction}" did not respond within ${timeout}ms`));
    }, timeout) : null;
    child.on('message', (resp) => {
        if (typeof resp === "object" && Object.hasOwnProperty.call(resp, 'error') && resp.error) {
            finish(new Error(resp.message || "Something went wrong!"));
        } else {
            finish(undefined, resp);
        }
    });
    child.on('error', (err) => finish(err));
    child.send({ activity, execFunction, payload, headers });
}