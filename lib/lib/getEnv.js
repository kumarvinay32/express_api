'use strict';

const _get_ipv4 = (mixed) => {
    let ipv4 = '';
    for (const v of (mixed || '').replace(/,/g, ':').split(':')) {
        let ip = (v || '').trim().split('.');
        if (ip.length === 4) {
            let f = true;
            ip.forEach(function (i) {
                if (i < 0 || i > 255) { f = false; }
            });
            if (f) { ipv4 = v.trim(); }
        }
        if (ipv4.length > 0) { break; }
    }
    return ipv4;
}

module.exports = (req) => {

    if (!Object.hasOwnProperty.call(req, 'get') || typeof req.get !== 'function') {
        if (!Object.hasOwnProperty.call(req.headers) || typeof req.headers !== 'object') {
            req.headers = {};
        }
        req.get = (k) => {
            return req.headers[k] || ''
        }
    }

    /**
     * Gets an environment variable from available sources, and provides emulation
     * for unsupported or inconsistent environment variables.
     * Also exposes some additional custom environment information.
     *
     * @param {Request Object} req Node Express request object.
     * @param {string} key Environment variable name.
     * @return {string} Environment variable setting.
     */
    req.getEnv = (key) => {
        key = key.toLowerCase();
        if (key === 'host') {
            return req.get(key) || (req.socket ? `localhost:${req.socket.localPort}` : '');
        }
        if (key === 'https') {
            return req.secure;
        }
        if (key === 'remote-addr') {
            return _get_ipv4(req.get('x-forwarded-for') || req.connection.remoteAddress) || req.connection.remoteAddress;
        }
        if (key === 'protocol') {
            return req.protocol;
        }
        if (key === 'uri') {
            return req.originalUrl;
        }
        if (key === 'url') {
            return (req.originalUrl.split('?')[0]).substr(1);
        }
        if (key === 'base-url') {
            return req.protocol + '://' + req.getEnv('host');
        }
        if (key == 'full-url' || key == 'req-url') {
            return req.protocol + '://' + req.getEnv('host') + req.originalUrl;
        }
        return req.get(key) || '';
    }
}