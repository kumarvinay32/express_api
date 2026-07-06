'use strict';

/*!
 * express api
 * Copyright(c) 2024-2025 Vinay Kumar
 * MIT Licensed
 *
 * Dual JavaScript/TypeScript module loader.
 * Resolves application files (appConfig, database, routes, lang, models,
 * activities) written either in JavaScript or TypeScript and loads them
 * through a single entry point.
 */

const fs = require('fs');
const path = require('path');

const JS_EXTENSIONS = ['.js', '.cjs'];
const TS_EXTENSIONS = ['.ts', '.cts'];
const SUPPORTED_EXTENSIONS = [...JS_EXTENSIONS, ...TS_EXTENSIONS];

class LoaderError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

let tsRuntimeReady = false;

/**
 * Register a TypeScript require hook on demand.
 * If the process is already running under ts-node/tsx (require.extensions['.ts'] present)
 * nothing needs to be done. Otherwise try the loaders a consumer project is
 * most likely to have installed.
 */
const ensureTsRuntime = () => {
    if (tsRuntimeReady || require.extensions['.ts']) {
        tsRuntimeReady = true;
        return;
    }
    const registrars = [
        // skipProject: this registration is a pure runtime transpiler for
        // application files; type checking belongs to the project's own tsc.
        () => require('ts-node').register({
            transpileOnly: true,
            skipProject: true,
            compilerOptions: {
                module: 'nodenext',
                moduleResolution: 'nodenext',
                target: 'ES2020',
                esModuleInterop: true,
                resolveJsonModule: true,
            },
        }),
        () => require('tsx/cjs'),
        () => require('@swc-node/register/register').register(),
    ];
    for (const register of registrars) {
        try {
            register();
            if (require.extensions['.ts']) {
                tsRuntimeReady = true;
                return;
            }
        } catch (err) { /* try next loader */ }
    }
    throw new LoaderError(
        'TypeScript source file detected but no TypeScript runtime is available. ' +
        'Install one of "ts-node", "tsx" or "@swc-node/register" in your project ' +
        '(e.g. `npm i -D ts-node typescript`), or run your app with a TypeScript-aware runtime.'
    );
};

/**
 * Check whether a file is a loadable module source file (.js/.cjs/.ts/.cts,
 * excluding TypeScript declaration files).
 *
 * @param {string} file file name or path.
 * @returns {boolean}
 */
const isModuleFile = (file) => {
    if (/\.d\.[cm]?ts$/.test(file)) {
        return false;
    }
    return SUPPORTED_EXTENSIONS.includes(path.extname(file));
};

/**
 * Resolve a module base path (with or without extension) to an existing
 * .js/.cjs/.ts/.cts file. JavaScript extensions win when both exist.
 *
 * @param {string} basePath absolute path, optionally including an extension.
 * @returns {string|null} resolved file path or null when nothing matches.
 */
const resolveModuleFile = (basePath) => {
    if (isModuleFile(basePath) && fs.existsSync(basePath)) {
        return basePath;
    }
    const withoutExt = SUPPORTED_EXTENSIONS.includes(path.extname(basePath))
        ? basePath.slice(0, -path.extname(basePath).length)
        : basePath;
    for (const ext of SUPPORTED_EXTENSIONS) {
        if (fs.existsSync(withoutExt + ext)) {
            return withoutExt + ext;
        }
    }
    return null;
};

/**
 * Require a resolved module file, registering the TypeScript runtime first
 * when needed, and unwrap `export default` transpiled modules so both
 * `module.exports = x` and `export default x` behave identically.
 *
 * @param {string} file resolved file path (as returned by resolveModuleFile).
 * @returns {any} loaded module.
 */
const requireModule = (file) => {
    if (TS_EXTENSIONS.includes(path.extname(file))) {
        ensureTsRuntime();
    }
    const mod = require(file);
    if (mod && mod.__esModule && mod.default !== undefined) {
        return mod.default;
    }
    return mod;
};

/**
 * Resolve and load a module in one step.
 *
 * @param {string} basePath absolute path, optionally including an extension.
 * @returns {any} loaded module.
 * @throws {LoaderError} when no matching file exists.
 */
const loadModule = (basePath) => {
    const file = resolveModuleFile(basePath);
    if (!file) {
        throw new LoaderError(
            `Module not found. Path: "${basePath}(${SUPPORTED_EXTENSIONS.join('|')})"`
        );
    }
    return requireModule(file);
};

module.exports = {
    SUPPORTED_EXTENSIONS,
    TS_EXTENSIONS,
    LoaderError,
    isModuleFile,
    resolveModuleFile,
    requireModule,
    loadModule,
};
