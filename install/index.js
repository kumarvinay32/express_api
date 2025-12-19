"use strict";

const fs = require('fs');
const path = require('path');
const DEFAULT_DATA = require("./constants");
const rootDirectory = path.dirname(path.dirname(path.dirname(path.dirname(path.resolve(__dirname)))));
const envFilePath = path.join(rootDirectory, '.env');

const checkCreareDir = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
        fs.writeFileSync(path.join(directory, 'empty'), '');
    }
}

const checkCrearefile = (directory, file_name) => {
    let key = file_name;
    if (!file_name) {
        file_name = 'index'
        key = directory.split(path.sep).pop();
    }
    const _dir_path = path.join(directory, `${file_name}.js`);
    if (!fs.existsSync(_dir_path)) {
        fs.writeFileSync(_dir_path, Buffer.from(DEFAULT_DATA[key], 'base64').toString());
    }
}

const checkWriteText = (directory, text) => {
    if (!fs.existsSync(directory)) {
        fs.writeFileSync(directory, text);
    }
}
const src = process.env.SRC || 'src';
checkWriteText(envFilePath, `NODE_ENV=dev\nSRC=${src}`);
require("dotenv").config({ path: envFilePath });

(async () => {
    try {
        const _src_dir = path.join(rootDirectory, process.env.SRC == undefined ? "src" : process.env.SRC);
        checkCreareDir(_src_dir);
        checkCreareDir(path.join(_src_dir, 'config'));
        checkCreareDir(path.join(_src_dir, 'models'));
        checkCreareDir(path.join(_src_dir, 'models', 'datasource'));
        checkCreareDir(path.join(_src_dir, 'routes'));
        checkCreareDir(path.join(_src_dir, 'helpers'));
        checkCreareDir(path.join(_src_dir, 'logs'));
        checkCreareDir(path.join(_src_dir, 'lang'));
        checkCreareDir(path.join(_src_dir, 'activities'));
        checkCrearefile(path.join(_src_dir, 'config'), 'appConfig');
        checkCrearefile(path.join(_src_dir, 'config'), 'database');
        checkCrearefile(path.join(_src_dir, 'lang'), 'en');
        checkCrearefile(path.join(_src_dir, 'lang'), 'hi');
        checkCrearefile(path.join(_src_dir, 'routes'), '');
        checkCrearefile(path.join(_src_dir, 'helpers'), '');
        checkCrearefile(path.join(_src_dir, 'activities'), '');
        checkCrearefile(path.join(_src_dir, 'models'), '');
        checkWriteText(path.join(_src_dir, 'models', 'datasource', 'Database Named Folder'), 'Create Database named folder as per DB Config.');
        checkWriteText(path.join(rootDirectory, '.gitignore'), Buffer.from(`IyBVc2VyIHNwZWNpZmljICYgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgZmlsZXMgIwojIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjCm5vZGVfbW9kdWxlcwpwYWNrYWdlLWxvY2suanNvbgouZW52Ci5lbnYuKgoqL2xvZ3MvKi4qCiovbG9ncy8qLyouKgoqLm1vCioub2xkCioucGRmCioueGxzCioueGxzeAoqLnppcAoqL2NvbmZpZy8qLioKISovY29uZmlnL2FwcENvbmZpZy5qcwplY29zeXN0ZW0uY29uZmlnLmpzCiMgSURFIGFuZCBlZGl0b3Igc3BlY2lmaWMgZmlsZXMgIwojIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMKL25icHJvamVjdAouaWRlYQoudnNjb2RlCi8ucHJvamVjdAovLmJ1aWxkcGF0aAovLnNldHRpbmdzLwoKIyBPUyBnZW5lcmF0ZWQgZmlsZXMgIwojIyMjIyMjIyMjIyMjIyMjIyMjIyMjCi5EU19TdG9yZQouRFNfU3RvcmU/Ci5fKgouU3BvdGxpZ2h0LVYxMDAKLlRyYXNoZXMKSWNvbj8KZWh0aHVtYnMuZGIKVGh1bWJzLmRiCg==`, 'base64').toString());
        checkWriteText(path.join(rootDirectory, 'readme.md'), Buffer.from(DEFAULT_DATA['readme'], 'base64').toString());
        checkWriteText(path.join(rootDirectory, 'favicon.svg'), Buffer.from(DEFAULT_DATA['favicon'], 'base64').toString());
        checkCrearefile(rootDirectory, 'server');
        let packageJs = JSON.parse(fs.readFileSync(path.join(rootDirectory, 'package.json')).toString());
        packageJs.main = 'server.js';
        fs.writeFileSync(path.join(rootDirectory, 'package.json'), JSON.stringify(packageJs, null, 2));
    } catch (err) {
        console.log(err.message);
    }
})()
