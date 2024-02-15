'use strict';

const { fork } = require("child_process");
const path = require('path');

module.exports = (activity = 'index', execFunction = 'main', payload = {}, headers = {}, callback) => {
    const child = fork(path.join(__dirname, "subProcess.js"));
    child.send({ activity, execFunction, payload, headers });
    child.on('message', (resp) => { child.kill(); callback(null, resp) });
}