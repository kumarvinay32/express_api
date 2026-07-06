"use strict";

const fs = require('fs');
const path = require('path');
const DEFAULT_DATA = require("./constants");
const TS_DATA = require("./constants-ts");

const OWN_PKG = require('../package.json');
const { execSync } = require('child_process');

/**
 * Load KEY=VALUE pairs from an env file into process.env (existing values
 * win). Uses dotenv when available, with a minimal parser fallback so init
 * works before any dependency has been installed.
 */
const loadEnvFile = (file) => {
    if (!fs.existsSync(file)) {
        return;
    }
    try {
        require('dotenv').config({ path: file, override: false, quiet: true });
        return;
    } catch (err) { /* dotenv not installed yet — parse manually */ }
    try {
        for (const line of fs.readFileSync(file).toString().split(/\r?\n/)) {
            const match = line.match(/^\s*(?:export\s+)?([\w.]+)\s*=\s*(.*)\s*$/);
            if (!match) {
                continue;
            }
            const value = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
            if (process.env[match[1]] === undefined) {
                process.env[match[1]] = value;
            }
        }
    } catch (err) { /* unreadable env file — plain env vars still work */ }
};

/**
 * Dev dependencies a TypeScript project needs to typecheck and run
 * (`npm start` uses ts-node). Recorded at their latest version unless the
 * project already has them installed or declared.
 */
const TS_DEV_DEPENDENCIES = ['typescript', 'ts-node', '@types/node', '@types/express'];

/**
 * Latest published version of a package (^-ranged), resolved from the npm
 * registry. `spec` may include a range (e.g. "express@4" resolves the newest
 * 4.x). Falls back to the "latest" dist-tag when the registry cannot be
 * reached (offline), which npm resolves at install time.
 */
const latestVersion = (spec) => {
    try {
        const output = execSync(`npm view ${JSON.stringify(spec)} version`, {
            stdio: ['ignore', 'pipe', 'ignore'],
            timeout: 15000,
        }).toString().trim();
        // ranged specs print one line per matching version — take the newest
        const versions = output.match(/\d+\.\d+\.\d+[-+.\w]*/g);
        const version = versions && versions.length ? versions[versions.length - 1] : '';
        return version ? `^${version}` : 'latest';
    } catch (err) {
        return 'latest';
    }
};

/**
 * Turn an express version answer ("4", "5", "4.18.2", "^4.18.0", "v5") into
 * a range for package.json. Majors resolve to the newest release of that
 * major; explicit versions are kept (^-ranged when no prefix is given).
 */
const resolveExpressRange = (input) => {
    const value = (input || '').trim().replace(/^v/i, '');
    if (!value) {
        return null;
    }
    if (/^[45]$/.test(value)) {
        const resolved = latestVersion(`express@${value}`);
        return resolved === 'latest' ? `^${value}.0.0` : resolved;
    }
    if (/^[~^]?\d+(\.\d+){1,2}$/.test(value)) {
        return /^[~^]/.test(value) ? value : `^${value}`;
    }
    return null;
};

/**
 * Version of a package as actually installed in the consumer's node_modules,
 * or null when it cannot be resolved.
 */
const installedVersion = (rootDirectory, name) => {
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(rootDirectory, 'node_modules', name, 'package.json')).toString());
        return `^${pkg.version}`;
    } catch (err) {
        return null;
    }
}

const checkCreateDir = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
        fs.writeFileSync(path.join(directory, 'empty'), '');
    }
}

const checkWriteText = (file, text) => {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, text);
        return true;
    }
    return false;
}

/**
 * Scaffold an application into rootDirectory. Only missing files are created;
 * nothing existing is ever overwritten.
 *
 * @param {object} options
 * @param {string} options.rootDirectory target project root.
 * @param {string} [options.src] source directory name (defaults to SRC env or 'src').
 * @param {string} [options.srcLang] 'js' | 'ts' — defaults to SRC_LANG env, or
 *   auto-detection ('ts' when the project has a tsconfig.json).
 * @param {string} [options.expressVersion] express version choice: '4', '5' or
 *   a specific version. Recorded in dependencies unless express is already
 *   declared there. Omitted → keep the installed version (or latest).
 * @param {function} [options.log] logger (defaults to console.log).
 */
module.exports = ({ rootDirectory, src, srcLang, expressVersion, log = console.log }) => {
    const envFilePath = path.join(rootDirectory, '.env');
    loadEnvFile(envFilePath);

    /**
     * Project language: TypeScript templates are used when srcLang/SRC_LANG is
     * 'ts', or when the target project already has a tsconfig.json (unless
     * 'js' is passed to force JavaScript).
     */
    const lang = (srcLang || process.env.SRC_LANG || '').trim().toLowerCase();
    const useTs = lang === 'ts' || (lang !== 'js' && fs.existsSync(path.join(rootDirectory, 'tsconfig.json')));
    const scriptExt = useTs ? 'ts' : 'js';

    const checkCreateFile = (directory, file_name) => {
        let key = file_name;
        if (!file_name) {
            file_name = 'index';
            key = directory.split(path.sep).pop();
        }
        // Skip when the file already exists in either language.
        if (fs.existsSync(path.join(directory, `${file_name}.js`)) || fs.existsSync(path.join(directory, `${file_name}.ts`))) {
            return false;
        }
        if (useTs && TS_DATA[key]) {
            fs.writeFileSync(path.join(directory, `${file_name}.ts`), TS_DATA[key]);
        } else {
            fs.writeFileSync(path.join(directory, `${file_name}.js`), DEFAULT_DATA[key]);
        }
        return true;
    }

    src = (src || process.env.SRC || 'src').trim();
    checkWriteText(envFilePath, `NODE_ENV=dev\nSRC=${src}\nSRC_LANG=${useTs ? 'ts' : 'js'}`);
    // record the project language in an existing .env too (never overwrites
    // a value the user already set)
    if (!/^\s*SRC_LANG\s*=/m.test(fs.readFileSync(envFilePath).toString())) {
        fs.appendFileSync(envFilePath, `\nSRC_LANG=${useTs ? 'ts' : 'js'}\n`);
    }
    loadEnvFile(envFilePath);

    const _src_dir = path.join(rootDirectory, src);
    checkCreateDir(_src_dir);
    checkCreateDir(path.join(_src_dir, 'config'));
    checkCreateDir(path.join(_src_dir, 'models'));
    checkCreateDir(path.join(_src_dir, 'models', 'datasource'));
    checkCreateDir(path.join(_src_dir, 'routes'));
    checkCreateDir(path.join(_src_dir, 'helpers'));
    checkCreateDir(path.join(_src_dir, 'logs'));
    checkCreateDir(path.join(_src_dir, 'lang'));
    checkCreateDir(path.join(_src_dir, 'activities'));

    checkCreateFile(path.join(_src_dir, 'config'), 'appConfig');
    checkCreateFile(path.join(_src_dir, 'config'), 'database');
    checkCreateFile(path.join(_src_dir, 'lang'), 'en');
    checkCreateFile(path.join(_src_dir, 'lang'), 'hi');
    checkCreateFile(path.join(_src_dir, 'routes'), '');
    checkCreateFile(path.join(_src_dir, 'helpers'), '');
    checkCreateFile(path.join(_src_dir, 'activities'), '');
    checkCreateFile(path.join(_src_dir, 'models'), '');
    checkWriteText(
        path.join(_src_dir, 'models', 'datasource', 'Database Named Folder'),
        'Create Database named folder as per DB Config.'
    );

    let gitignoreBase = DEFAULT_DATA.gitignore;
    if (useTs) {
        gitignoreBase = gitignoreBase.replace('!*/config/appConfig.js', '!*/config/appConfig.ts\ndist');
    }
    checkWriteText(path.join(rootDirectory, '.gitignore'), gitignoreBase);
    checkWriteText(path.join(rootDirectory, '.cloudignore'), gitignoreBase);

    checkWriteText(
        path.join(rootDirectory, 'readme.md'),
        DEFAULT_DATA['readme']
    );
    checkWriteText(
        path.join(rootDirectory, 'CLAUDE.md'),
        fs.readFileSync(path.join(__dirname, 'CLAUDE.md')).toString()
    );
    checkWriteText(
        path.join(rootDirectory, 'favicon.svg'),
        DEFAULT_DATA['favicon']
    );
    const serverCreated = checkCreateFile(rootDirectory, 'server');
    if (useTs) {
        checkWriteText(path.join(rootDirectory, 'tsconfig.json'), TS_DATA.tsconfig(src));
    }

    // Touch the consumer's package.json only where something is missing:
    // never overwrite an existing main/start the user has configured.
    const packageJsonPath = path.join(rootDirectory, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJs = JSON.parse(fs.readFileSync(packageJsonPath).toString());
        let changed = false;
        if (serverCreated || !packageJs.main) {
            if (packageJs.main !== `server.${scriptExt}`) {
                packageJs.main = `server.${scriptExt}`;
                changed = true;
            }
        }
        if (!packageJs.scripts) {
            packageJs.scripts = {};
        }
        if (!packageJs.scripts.start) {
            packageJs.scripts.start = useTs ? 'ts-node server.ts' : 'node server.js';
            changed = true;
        }
        if (changed) {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJs, null, 2));
        }
        recordDependencies({ rootDirectory, useTs, expressVersion, log });
        if (useTs) {
            log('[@krvinay/express_api] TypeScript project detected — scaffolded .ts sources.');
        }
    } else {
        log('[@krvinay/express_api] No package.json found — skipped main/start setup. Run "npm init -y" first.');
        if (useTs) {
            log('[@krvinay/express_api] TypeScript project detected — scaffolded .ts sources.');
            log('[@krvinay/express_api] Make sure a TypeScript runtime is installed: npm i -D typescript ts-node @types/node @types/express');
        }
    }

    return { useTs, src, rootDirectory };
};

/**
 * Record peer dependencies (and, for TypeScript projects, the TS toolchain
 * dev dependencies) in the consumer's package.json. npm 7+ auto-installs
 * peers into node_modules but never declares them in the manifest — this
 * makes the versions the app runs on visible and owned by the project.
 * Idempotent: existing entries are never touched, so it is safe to run again
 * (the postinstall hook re-applies it after npm's own package.json save,
 * which would otherwise overwrite the dependencies recorded during install).
 *
 * @param {object} options
 * @param {string} options.rootDirectory target project root.
 * @param {boolean} [options.useTs] record the TS toolchain dev dependencies.
 * @param {string} [options.expressVersion] explicit express choice ('4', '5'
 *   or a specific version) — wins over installed/recorded versions.
 * @param {function} [options.log] logger (defaults to console.log).
 * @returns {boolean} whether package.json was modified.
 */
const recordDependencies = ({ rootDirectory, useTs, expressVersion, log = console.log }) => {
    const packageJsonPath = path.join(rootDirectory, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        return false;
    }
    const packageJs = JSON.parse(fs.readFileSync(packageJsonPath).toString());
    let changed = false;

    const declared = (name) =>
        (packageJs.dependencies && packageJs.dependencies[name]) || (packageJs.devDependencies && packageJs.devDependencies[name]);
    // Installed version wins (never upgrade what the project already runs);
    // otherwise resolve the fallback — a function so latest-version lookups
    // only happen when actually needed.
    const record = (name, target, fallbackRange) => {
        if (declared(name)) {
            return;
        }
        if (!packageJs[target]) {
            packageJs[target] = {};
        }
        packageJs[target][name] = installedVersion(rootDirectory, name)
            || (typeof fallbackRange === 'function' ? fallbackRange() : fallbackRange);
        changed = true;
    };

    // Runtime packages of the application: the framework's peers, marked
    // optional so npm does not pre-install them — the user chooses versions
    // at init time and init installs them.
    const peers = OWN_PKG.peerDependencies || {};
    const runtimeDeps = Object.keys(peers).filter((name) => !name.startsWith('@types/'));
    const expressRange = resolveExpressRange(expressVersion);
    for (const name of runtimeDeps) {
        // an explicit express choice (flag or prompt answer) wins over the
        // installed and previously recorded version — the interactive
        // prompt itself is only asked when express is not declared yet
        if (name === 'express' && expressRange) {
            if (!packageJs.dependencies) {
                packageJs.dependencies = {};
            }
            if (packageJs.dependencies.express !== expressRange) {
                packageJs.dependencies.express = expressRange;
                changed = true;
            }
            const installed = installedVersion(rootDirectory, 'express');
            if (!installed || installed !== expressRange) {
                log(`[@krvinay/express_api] express ${expressRange} recorded — run "npm install" to apply it.`);
            }
            continue;
        }
        record(name, 'dependencies', () => latestVersion(name));
    }

    // TypeScript projects additionally need the TS toolchain as dev
    // dependencies: typescript + ts-node (npm start) and the typings.
    // @types/express follows the express major in use.
    let missingDevDeps = false;
    if (useTs) {
        const expressDecl = (packageJs.dependencies && packageJs.dependencies.express) || installedVersion(rootDirectory, 'express') || '';
        const majorMatch = expressDecl.match(/(\d+)/);
        const expressMajor = majorMatch ? majorMatch[1] : null;
        for (const name of TS_DEV_DEPENDENCIES) {
            const spec = (name === '@types/express' && expressMajor) ? `@types/express@${expressMajor}` : name;
            if (name === '@types/express' && expressRange && expressMajor && !declared(name)) {
                // explicit express choice — the typings must match that
                // major even when another major is already installed
                if (!packageJs.devDependencies) {
                    packageJs.devDependencies = {};
                }
                packageJs.devDependencies[name] = latestVersion(spec);
                changed = true;
            } else {
                record(name, 'devDependencies', () => latestVersion(spec));
            }
            if (!installedVersion(rootDirectory, name)) {
                missingDevDeps = true;
            }
        }
        if (missingDevDeps) {
            log('[@krvinay/express_api] Dev dependencies recorded (typescript, ts-node, @types/node, @types/express) — run "npm install" before "npm start".');
        }
    }

    if (changed) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJs, null, 2));
    }
    return changed;
};

/**
 * Whether the dependencies recorded in package.json are actually satisfied by
 * node_modules — i.e. every recorded package is installed, and the installed
 * express major matches the declared one. Used by the deferred postinstall
 * helper to decide if a follow-up "npm install" is needed (e.g. the user
 * picked Express 4 while npm had already installed 5 as a peer).
 *
 * @param {string} rootDirectory target project root.
 * @param {boolean} [useTs] also check the TS toolchain dev dependencies.
 * @returns {boolean}
 */
const needsInstall = (rootDirectory, useTs) => {
    const packageJsonPath = path.join(rootDirectory, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        return false;
    }
    let packageJs;
    try {
        packageJs = JSON.parse(fs.readFileSync(packageJsonPath).toString());
    } catch (err) {
        return false;
    }
    const declaredRange = (name) =>
        (packageJs.dependencies && packageJs.dependencies[name]) || (packageJs.devDependencies && packageJs.devDependencies[name]);
    const majorOf = (version) => {
        const match = (version || '').match(/(\d+)/);
        return match ? match[1] : null;
    };

    const peers = OWN_PKG.peerDependencies || {};
    const names = Object.keys(peers).filter((name) => !name.startsWith('@types/'));
    if (useTs) {
        names.push(...TS_DEV_DEPENDENCIES);
    }
    for (const name of names) {
        const range = declaredRange(name);
        if (!range) {
            continue;
        }
        const installed = installedVersion(rootDirectory, name);
        if (!installed) {
            return true;
        }
        if (name === 'express' && majorOf(range) && majorOf(range) !== majorOf(installed)) {
            return true;
        }
    }
    return false;
};

module.exports.recordDependencies = recordDependencies;
module.exports.loadEnvFile = loadEnvFile;
module.exports.needsInstall = needsInstall;
