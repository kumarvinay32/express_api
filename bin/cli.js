#!/usr/bin/env node
"use strict";

/*!
 * express api
 * Copyright(c) 2024-2025 Vinay Kumar
 * MIT Licensed
 */

const fs = require('fs');
const path = require('path');
const scaffold = require('../install/scaffold');

// Load the project's .env so SRC / SRC_LANG defaults come from it
// (works even before any dependency is installed).
scaffold.loadEnvFile(path.join(process.cwd(), '.env'));
const HELP = `@krvinay/express_api

Usage:
  npx express-api init [options]   Scaffold the application into the current directory

Options:
  --src=<dir>       Source directory name (default: SRC env or "src")
  --lang=<js|ts>    Language of scaffolded files (default: SRC_LANG env, or
                    auto-detected — "ts" when a tsconfig.json exists)
  --express=<ver>   Express version to use: 4, 5 or a specific version
                    (e.g. 4.21.2). Asked interactively when express is not
                    yet declared in package.json; an already declared or
                    installed version is kept by default.
  --yes, -y         Skip prompts and use defaults / provided flags
  -h, --help        Show this help

Without --src/--lang/--express, init asks for them interactively (when run
in a terminal; in scripts and CI it falls back to the defaults).

Notes:
  Only missing files are created; existing files are never overwritten.
  Nothing runs automatically on "npm install" — run this command once after
  installing the package to complete the setup.
`;

const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith('-'));
const getFlag = (name) => {
    const flag = args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
    if (!flag) return undefined;
    const [, value] = flag.split('=');
    return value === undefined ? '' : value;
};

if (args.includes('-h') || args.includes('--help') || !command) {
    console.log(HELP);
    process.exit(command || args.length ? 0 : 1);
}

if (command !== 'init') {
    console.error(`Unknown command: "${command}"\n`);
    console.log(HELP);
    process.exit(1);
}

const isValidLang = (value) => ['js', 'ts'].includes((value || '').toLowerCase());
const isValidSrc = (value) => /^[^<>:"|?*\0]+$/.test(value) && !path.isAbsolute(value) && !value.includes('..');
const isValidExpress = (value) => {
    const v = (value || '').trim().replace(/^v/i, '');
    if (!/^[45]$/.test(v) && !/^[~^]?\d+(\.\d+){1,2}$/.test(v)) {
        return false;
    }
    return /^[45]/.test(v.replace(/^[~^]/, ''));
};

let lang = getFlag('lang');
if (lang && !isValidLang(lang)) {
    console.error(`Invalid --lang value: "${lang}" (expected "js" or "ts")`);
    process.exit(1);
}
let src = getFlag('src');
if (src && !isValidSrc(src)) {
    console.error(`Invalid --src value: "${src}" (expected a relative directory name)`);
    process.exit(1);
}
let expressVersion = getFlag('express');
if (expressVersion && !isValidExpress(expressVersion)) {
    console.error(`Invalid --express value: "${expressVersion}" (expected 4, 5 or a specific 4.x/5.x version)`);
    process.exit(1);
}

/** Express version declared in the project's package.json, if any. */
const declaredExpress = () => {
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')).toString());
        return (pkg.dependencies && pkg.dependencies.express) || (pkg.devDependencies && pkg.devDependencies.express) || null;
    } catch (err) {
        return null;
    }
};

/** Express version installed in node_modules, if any. */
const installedExpress = () => {
    try {
        return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'node_modules', 'express', 'package.json')).toString()).version;
    } catch (err) {
        return null;
    }
};

const promptInput = process.stdin;
const promptOutput = process.stdout;

const skipPrompts = args.includes('--yes') || args.includes('-y')
    || !process.stdin.isTTY || !process.stdout.isTTY;

let promptsClosed = false;

// classic callback readline — available on every Node version, unlike
// node:readline/promises (Node >= 17)
const askQuestion = (rl, text) => new Promise((resolve) => {
    let settled = false;
    const settle = (value) => {
        if (!settled) {
            settled = true;
            rl.removeListener('close', onClose);
            resolve(value);
        }
    };
    // Ctrl+D / stream closed — defaults for this and all remaining questions
    const onClose = () => {
        promptsClosed = true;
        settle('');
    };
    rl.once('close', onClose);
    rl.question(text, (answer) => settle(answer));
});

/**
 * Ask for any option not already provided via flags. Defaults mirror the
 * scaffolder: SRC / SRC_LANG env vars, then tsconfig.json auto-detection.
 */
const promptForMissingOptions = async () => {
    const defaultSrc = (process.env.SRC || 'src').trim();
    const defaultLang = (process.env.SRC_LANG || '').trim().toLowerCase()
        || (fs.existsSync(path.join(process.cwd(), 'tsconfig.json')) ? 'ts' : 'js');

    if (skipPrompts) {
        return;
    }

    let rl;
    try {
        rl = require('readline').createInterface({ input: promptInput, output: promptOutput });
    } catch (err) {
        // prompting unavailable — scaffold with defaults rather than failing
        src = src === undefined ? defaultSrc : src;
        lang = lang === undefined ? defaultLang : lang;
        return;
    }
    try {
        if (src === undefined) {
            while (!promptsClosed) {
                const answer = (await askQuestion(rl, `Source directory (${defaultSrc}): `)).trim();
                if (!answer) {
                    src = defaultSrc;
                    break;
                }
                if (isValidSrc(answer)) {
                    src = answer;
                    break;
                }
                promptOutput.write('Please enter a relative directory name (e.g. "src").\n');
            }
        }
        if (lang === undefined) {
            while (!promptsClosed) {
                const answer = (await askQuestion(rl, `Language js/ts (${defaultLang}): `)).trim().toLowerCase();
                if (!answer) {
                    lang = defaultLang;
                    break;
                }
                if (isValidLang(answer)) {
                    lang = answer;
                    break;
                }
                promptOutput.write('Please answer "js" or "ts".\n');
            }
        }
        // only ask when the project has not declared express yet; the default
        // keeps the installed version (never an implicit upgrade)
        if (expressVersion === undefined && !declaredExpress()) {
            const installed = installedExpress();
            const defaultExpress = installed || '5';
            while (!promptsClosed) {
                const answer = (await askQuestion(rl, `Express version 4/5 or specific (${defaultExpress}): `)).trim();
                if (!answer) {
                    expressVersion = defaultExpress;
                    break;
                }
                if (isValidExpress(answer)) {
                    expressVersion = answer;
                    break;
                }
                promptOutput.write('Please answer "4", "5" or a specific 4.x/5.x version (e.g. 4.21.2).\n');
            }
            if (expressVersion === undefined) {
                expressVersion = defaultExpress;
            }
        }
    } catch (err) {
        // Ctrl+D / closed stdin — fall back to defaults for anything unanswered.
        promptOutput.write('\n');
    } finally {
        rl.close();
    }
    if (src === undefined) src = defaultSrc;
    if (lang === undefined) lang = defaultLang;
};

/**
 * Install the recorded dependencies (express at the chosen version, sequelize,
 * mysql2, dotenv, and the TS toolchain for TypeScript projects) into the
 * project. Runs in the foreground so progress is visible.
 */
const installRecordedDependencies = () => {
    const { execFileSync } = require('child_process');
    const npmArgs = ['install', '--no-audit', '--no-fund'];
    const options = {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: { ...process.env },
    };
    // under "npx" npm_execpath points to npx-cli.js — translate it to the
    // sibling npm-cli.js, or fall back to the npm binary on PATH
    let npmCli = process.env.npm_execpath;
    if (npmCli && /npx-cli(\.[cm]?js)?$/.test(npmCli)) {
        const sibling = npmCli.replace(/npx-cli((\.[cm]?js)?)$/, 'npm-cli$1');
        npmCli = fs.existsSync(sibling) ? sibling : null;
    }
    if (npmCli && /\.[cm]?js$/.test(npmCli)) {
        execFileSync(process.execPath, [npmCli, ...npmArgs], options);
    } else {
        execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', npmArgs, options);
    }
};

(async () => {
    await promptForMissingOptions();
    const result = scaffold({
        rootDirectory: process.cwd(),
        src,
        srcLang: lang,
        expressVersion,
    });
    console.log(`[@krvinay/express_api] Scaffolded ${result.useTs ? 'TypeScript' : 'JavaScript'} application in ${result.rootDirectory} (src: ${result.src}).`);
    // install the recorded dependencies so the project is immediately runnable
    if (scaffold.needsInstall(process.cwd(), result.useTs)) {
        console.log('[@krvinay/express_api] Installing project dependencies…');
        try {
            installRecordedDependencies();
        } catch (err) {
            console.error(`[@krvinay/express_api] Dependency install failed (${err.message}) — run "npm install" manually.`);
        }
    }
    console.log('[@krvinay/express_api] Start it with: npm start');
})().catch((err) => {
    console.error(`[@krvinay/express_api] Scaffolding failed: ${err.message}`);
    process.exit(1);
});
