'use strict';

const { v4: generateRequestId } = require('uuid');

module.exports = (req, res, next) => {
    req.begin_timestamp = new Date();
    if (Object.hasOwnProperty.call(req.config, 'enable_security_header') && req.config.enable_security_header) {
        bindResponseHeaders(req, res);
    }
    let send = res.send;
    req.data = { ...req.body, ...req.query };
    res.send = function (body) {
        req.end_timestamp = new Date();
        if (!req.config.autoFormatResponse) {
            req.response_logger(req, res._err_obj, body);
            send.call(this, body);
            return;
        }
        let resp = {
            error: false,
            code: 200,
            message: '',
            timestamp: req.end_timestamp.getTime(),
            data: {}
        }
        let response = {};
        if (typeof body === "string") {
            try { response = JSON.parse(body); } catch (error) { response = { data: body } }
        } else if (body) {
            req.response_logger(req, res._err_obj, body);
            send.call(this, body);
            return;
        }
        if (Object.hasOwnProperty.call(response, "error")) {
            resp.error = response.error ? true : false;
            delete response.error;
        }
        if (Object.hasOwnProperty.call(response, "message")) {
            resp.message = response.message;
            delete response.message;
        }
        if (Object.hasOwnProperty.call(response, "code")) {
            resp.code = response.code;
            delete response.code;
        }
        delete response.timestamp;
        if (Object.hasOwnProperty.call(response, "forceLogin")) {
            req.forceLogin = response.forceLogin ? true : false;
            delete response.forceLogin;
        }
        if (Object.hasOwnProperty.call(response, "data")) {
            resp.data = response.data;
            delete response.data;
        }
        if (Object.values(response).length > 0) {
            if (Object.values(resp.data).length > 0) {
                resp.data = { ...response, data: resp.data };
            } else {
                resp.data = response;
            }
        }
        if (resp.error === true && req.forceLogin === true) {
            resp.forceLogin = true;
            resp.code = 403;
        }
        req.response_logger(req, res._err_obj, resp);
        if (Object.hasOwnProperty.call(req.config, 'db_error_message') && req.config.db_error_message) {
            if (res._err_obj && Object.hasOwnProperty.call(res._err_obj, 'name') && res._err_obj.name.indexOf("Sequelize") !== -1) {
                resp.message = req.config.db_error_message;
            }
        }
        if (Object.hasOwnProperty.call(req, 'app_lang') && req.app_lang && Object.hasOwnProperty.call(req._lng_messages, resp.message)) {
            resp.message = req._lng_messages[resp.message];
        }
        res.status(resp.code);
        send.call(this, JSON.stringify(resp));
    };
    let redirect = res.redirect;
    res.redirect = function (...args) {
        req.end_timestamp = new Date();
        req.response_logger(req, res._err_obj, args);
        redirect.call(this, ...args);
    }
    next();
};

// Middleware for CORS and Security Headers
const bindResponseHeaders = (req, res) => {
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    res.header('X-XSS-Protection', '1; mode=block');

    // Cross-Origin Resource Sharing (CORS)
    let allowedOrigins = req.config.allowedOrigins || ['*']; // Trusted origins
    if (typeof allowedOrigins === 'string') {
        allowedOrigins = [allowedOrigins];
    }
    const origin = req.header('Origin') || '';
    if (allowedOrigins.length <= 0 || allowedOrigins.includes('*')) {
        res.header('Access-Control-Allow-Origin', '*');
    } else if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin); // Allow only trusted origins
        res.header('Access-Control-Allow-Credentials', 'true'); // Allow cookies and credentials
    } else if (origin.endsWith("." + allowedOrigins[0])) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin"); // important for caching
    }

    // Allow specific HTTP methods
    res.header('Access-Control-Allow-Methods', req.config.allowedMethods || 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD, TRACE, CONNECT');

    // Allow specific headers
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID, X-Correlation-ID');

    // Preflight cache duration
    res.header('Access-Control-Max-Age', '86400'); // Cache preflight responses for 24 hours

    // Custom Headers
    if (Object.hasOwnProperty.call(req.config, 'headers') && typeof req.config.headers === 'object') {
        for (const ht in req.config.headers) {
            if (req.config.headers[ht])
                res.header(ht, req.config.headers[ht]);
        }
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204); // No Content
    }

    // SOC 2 Security Headers
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload'); // Enforce HTTPS
    res.header('X-Content-Type-Options', 'nosniff'); // Prevent MIME type sniffing
    res.header('X-Frame-Options', 'DENY'); // Prevent clickjacking
    res.header('Content-Security-Policy', "default-src 'self';"); // Restrict resources to self
    res.header('Referrer-Policy', 'no-referrer'); // Prevent referrer information leaks
    res.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()'); // Restrict browser features
    res.header('X-Permitted-Cross-Domain-Policies', 'none'); // Disallow cross-domain policies
    res.header('Cache-Control', 'no-store'); // Disable caching of sensitive data

    // Traceability Headers
    res.header('Request-ID', req.headers['x-request-id'] || generateRequestId());
    res.header('Correlation-ID', req.headers['x-correlation-id'] || generateRequestId());
};
