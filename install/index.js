"use strict";

const fs = require('fs');
const path = require('path');
const DEFAULT_DATA = require("./constants");
const rootDirectory = path.resolve(__dirname, '../../../');
const envFilePath = path.join(rootDirectory, '.env');
const readline = require('readline');
function promptQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

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
        key = directory.split("/").pop();
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

(async () => {
    try {
        if (!fs.existsSync(envFilePath)) {
            let src = await promptQuestion(`What would be your project source folder Default("/") : `);
            fs.writeFileSync(envFilePath, `NODE_ENV=dev\nSRC=${src || ""}\n`);
        }
        require("dotenv").config({ path: envFilePath });
        const _src_dir = path.join(rootDirectory, process.env.SRC || "/");
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
        checkCrearefile(path.join(_src_dir, 'lang'), 'en');
        checkCrearefile(path.join(_src_dir, 'lang'), 'hi');
        checkCrearefile(path.join(_src_dir, 'routes'), '');
        checkCrearefile(path.join(_src_dir, 'helpers'), '');
        checkCrearefile(path.join(_src_dir, 'activities'), '');
        checkWriteText(path.join(_src_dir, 'models', 'datasource', 'Database Named Folder'), 'Create Database named folder as per DB Config.');
        checkWriteText(path.join(_src_dir, '.gitignore'), Buffer.from(`IyBVc2VyIHNwZWNpZmljICYgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgZmlsZXMgIwojIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjCm5vZGVfbW9kdWxlcwpwYWNrYWdlLWxvY2suanNvbgouZW52Ci5lbnYuKgoqL2xvZ3MvKi4qCiovbG9ncy8qLyouKgoqLm1vCioub2xkCioucGRmCioueGxzCioueGxzeAoqLnppcAoqL2NvbmZpZy8qLioKISovY29uZmlnL2FwcENvbmZpZy5qcwplY29zeXN0ZW0uY29uZmlnLmpzCiMgSURFIGFuZCBlZGl0b3Igc3BlY2lmaWMgZmlsZXMgIwojIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMKL25icHJvamVjdAouaWRlYQoudnNjb2RlCi8ucHJvamVjdAovLmJ1aWxkcGF0aAovLnNldHRpbmdzLwoKIyBPUyBnZW5lcmF0ZWQgZmlsZXMgIwojIyMjIyMjIyMjIyMjIyMjIyMjIyMjCi5EU19TdG9yZQouRFNfU3RvcmU/Ci5fKgouU3BvdGxpZ2h0LVYxMDAKLlRyYXNoZXMKSWNvbj8KZWh0aHVtYnMuZGIKVGh1bWJzLmRiCg==`, 'base64').toString());
        checkWriteText(path.join(_src_dir, 'readme.md'), Buffer.from(`IyMgQWJvdXQKClRoaXMgaXMgYSBzaW1wbGUgY3VzdG9taXplZCBOT0RFLUpTIHNldHVwIGZvciBkZXZlbG9waW5nIEFQSXMKCiMjIEdsb2JhbCBFbnZpcm9ubWVudAoKLSAqKiBOb2RlIEpTOiAxNC4xNS4wIC0gKiogW0luc3RhbGwgTm9kZSBKc10oaHR0cHM6Ly9ub2RlanMub3JnL2VuL2Rvd25sb2FkLykqKiAqKgotICoqIE5vZGVtb246IDIuMC42ICoqCi0gKiogU2VxdWVsaXplIENMSTogNi4yLjAgLSAqKiBbU2VxdWVsaXplIFJlZmVyZW5jZV0oaHR0cHM6Ly9zZXF1ZWxpemUub3JnL21hc3Rlci8pKiogKioK`, 'base64').toString());
    } catch (err) {
        console.log(err);
    }
})()
