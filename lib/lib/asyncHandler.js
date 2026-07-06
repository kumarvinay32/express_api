'use strict';

/*!
 * express api
 * Copyright(c) 2024-2025 Vinay Kumar
 * MIT Licensed
 *
 * Async error bridge for Express 4 (and harmless on Express 5).
 *
 * Express 4 ignores promises returned by route handlers, so a rejected async
 * handler never reaches the error middleware and the request hangs. This
 * module walks a router's layer stack after the routes module is loaded and
 * wraps every handler: a rejected returned promise (or a synchronous throw)
 * is forwarded to next(err) and lands in the framework's errorHandler.
 *
 * The wrappers intentionally return undefined so Express 5's native promise
 * handling does not double-report the same rejection.
 */

const wrapHandler = (fn) => {
    let wrapped;
    if (fn.length >= 4) {
        // error middleware — arity must stay 4, Express dispatches by fn.length
        wrapped = function (err, req, res, next) {
            try {
                const out = fn.call(this, err, req, res, next);
                if (out && typeof out.catch === 'function') {
                    out.catch(next);
                }
            } catch (e) {
                next(e);
            }
        };
    } else {
        wrapped = function (req, res, next) {
            try {
                const out = fn.call(this, req, res, next);
                if (out && typeof out.catch === 'function') {
                    out.catch(next);
                }
            } catch (e) {
                next(e);
            }
        };
    }
    wrapped._asyncWrapped = true;
    return wrapped;
};

const wrapLayer = (layer) => {
    const fn = layer.handle;
    if (typeof fn !== 'function' || fn._asyncWrapped) {
        return;
    }
    layer.handle = wrapHandler(fn);
};

/**
 * Recursively wrap all handlers registered on an Express router (including
 * route methods, middlewares and mounted sub-routers) so rejected async
 * handlers are forwarded to next(err).
 *
 * @param {object} router Express router (or app) whose stack to wrap.
 * @returns {object} the same router, with handlers wrapped in place.
 */
const wrapAsyncErrors = (router) => {
    const stack = router && (router.stack || (router._router && router._router.stack));
    if (!Array.isArray(stack)) {
        return router;
    }
    for (const layer of stack) {
        if (layer.route && Array.isArray(layer.route.stack)) {
            // route layer — wrap each method/middleware handler on the route
            layer.route.stack.forEach(wrapLayer);
        } else if (layer.handle && Array.isArray(layer.handle.stack)) {
            // mounted sub-router — recurse
            wrapAsyncErrors(layer.handle);
        } else {
            // plain middleware
            wrapLayer(layer);
        }
    }
    return router;
};

module.exports = wrapAsyncErrors;
