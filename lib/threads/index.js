'use strict';

const { fork } = require("child_process");
const path = require('path');

module.exports = (activity = 'index', execFunction = 'main', payload = {}, headers = {}, callback, timeout) => {
    // execArgv is cleared so the child is a plain node process even when the
    // parent runs under ts-node/tsx or with an inspector port attached;
    // TypeScript activities are handled by the package's own loader.
    const child = fork(path.join(__dirname, "subProcess.js"), {
        stdio: "inherit",
        execArgv: []
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
    child.on('exit', (code, signal) => {
        if (!done) {
            finish(new Error(`Thread "${activity}.${execFunction}" exited unexpectedly (code: ${code}, signal: ${signal})`));
        }
    });
    child.send({ activity, execFunction, payload, headers });
}
