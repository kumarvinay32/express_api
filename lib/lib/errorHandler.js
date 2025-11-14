'use strict';

module.exports = (err, req, res, next) => {
    if (res.headersSent) {
        return req.writeLog("HeaderSentErr", `Action: ${req.getEnv('uri')}\r\n${err.stack}`);
    }
    const { responseErrorCode = 500 } = req.config || { responseErrorCode: 500 };
    let resp = {
        error: true,
        code: responseErrorCode || 500,
        message: err.message,
        data: {}
    }
    if (Object.hasOwnProperty.call(req, 'app_lang') && req.app_lang && Object.hasOwnProperty.call(req._lng_messages, resp.message)) {
        resp.message = req._lng_messages[resp.message];
    }
    res._err_obj = err;
    if (Object.hasOwnProperty.call(res, "forceRedirect") && res.forceRedirect && Object.hasOwnProperty.call(res, "redirectUrl") && res.redirectUrl) {
        res.redirect(302, `${res.redirectUrl}?error_message=${resp.message}`)
    } else {
        res.json(resp);
    }
};