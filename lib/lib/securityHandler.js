'use strict';

const { v4: generateRequestId } = require('uuid');


const isAllowedOrigin = (origin, allowedOrigins = []) => {
    if (!origin) return false;

    try {
        const originUrl = new URL(origin);
        const originHost = originUrl.host;

        return allowedOrigins.some(entry => {
            // Exact match
            if (!entry.includes('*')) {
                return origin === entry;
            }

            // Wildcard subdomain match
            const wildcardMatch = entry.match(/^https?:\/\/\*\.(.+)$/);
            if (!wildcardMatch) return false;
            const allowedBaseDomain = wildcardMatch[1];

            // Prevent *.com, *.co.uk etc
            if (allowedBaseDomain.split('.').length < 2) return false;

            return (
                originHost === allowedBaseDomain ||
                originHost.endsWith(`.${allowedBaseDomain}`)
            );
        });
    } catch {
        return false;
    }
};

// Middleware for CORS and Security Headers
const bindResponseHeaders = (req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';

    // ---------- Hardening ----------
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    // ---------- CORS ----------
    const origin = req.headers.origin;
    const allowedOrigins = Array.isArray(req.config?.allowedOrigins) ? req.config.allowedOrigins : [];

    if (!isProduction && allowedOrigins.includes('*')) {
        // Dev/Test: allow all origins, no credentials
        res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (isAllowedOrigin(origin, allowedOrigins)) {
        // Prod: explicit allowlist only
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        // Cache isolation (ASVS V14.5)
        res.setHeader('Vary', 'Origin');
    }

    // ---------- Security Headers ----------
    res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=(), payment=()'
    );
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Cache-Control', 'no-store');

    // ---- Custom headers ----
    if (req.config?.headers && typeof req.config.headers === 'object') {
        Object.entries(req.config.headers).forEach(([key, value]) => {
            if (value && typeof value === "string" && typeof key === 'string')
                res.setHeader(key, value);
        });
    }

    // ---------- Preflight ----------
    if (req.method === 'OPTIONS') {

        // Allowed methods (ASVS V8.3)
        let methods = req.config.allowedMethods || 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
        if (methods.join) {
            methods = methods.join(',');
        }
        res.setHeader(
            'Access-Control-Allow-Methods',
            methods
        );

        // Allowed headers (ASVS V13.2)

        let allowHeaders = req.config.allowedHeaders;
        if (allowHeaders.join) {
            allowHeaders = allowHeaders.join(',');
        }
        res.setHeader(
            'Access-Control-Allow-Headers',
            ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Correlation-ID', ...allowHeaders.split(",")].join(", ")
        );

        res.setHeader('Access-Control-Max-Age', '86400');

        res.statusCode = 204;
        res.setHeader('Content-Length', '0');
        return res.end();
    }

    // ---------- Traceability ----------
    res.setHeader(
        'X-Request-ID',
        req.headers['x-request-id'] || generateRequestId()
    );
    res.setHeader(
        'X-Correlation-ID',
        req.headers['x-correlation-id'] || generateRequestId()
    );
    next();
};

module.exports = bindResponseHeaders;