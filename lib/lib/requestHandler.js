module.exports = (req, res, next) => {
    req.begin_timestamp = new Date();
    res.removeHeader('X-Powered-By');
    res.header('Server', 'Custom');
    res.header('X-XSS-Protection', '1');
    let send = res.send;
    req.data = { ...req.body, ...req.query };
    res.send = function (body) {
        req.end_timestamp = new Date();
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
            return false;
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