'use strict';

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = (req, res, next) => {
    let notFoundMessage = `API '${req.getEnv('uri')}' not found.`;
    if (Object.hasOwnProperty.call(req, 'app_lang') && req.app_lang && Object.hasOwnProperty.call(req._lng_messages, 'notFoundMessage')) {
        notFoundMessage = req.formatMessage('notFoundMessage', req.getEnv('uri'));
    }
    res._err_obj = new NotFoundError(notFoundMessage);
    res.json({
        error: true,
        message: res._err_obj.message,
        code: 404
    });
};