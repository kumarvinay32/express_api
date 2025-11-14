const fs = require('fs');
const crypto = require('crypto');
const maxAge = 60 * 60 * 24 * 30 * 1000;
const imgType = {
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
  png: 'image/png',
}
function favicon(path) {
  var icon // favicon cache
  return function favicon(req, res, next) {
    if (req._parsedUrl?.pathname !== '/favicon.ico') {
      next();
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = req.method === 'OPTIONS' ? 200 : 405;
      res.setHeader('Allow', 'GET, HEAD, OPTIONS');
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }

    if (icon) {
      send(req, res, icon);
      return
    }

    fs.readFile(path, function (err, buf) {
      if (err) return next(err);
      icon = createIcon(buf, maxAge, path.slice(-3));
      send(req, res, icon);
    });
  }
}

function send(req, res, icon) {
  const headers = icon.headers;
  const keys = Object.keys(headers);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    res.setHeader(key, headers[key])
  }
  res.statusCode = 200
  res.setHeader('Content-Length', icon.body.length)
  res.end(icon.body)
}

function createIcon(buf, maxAge, type = 'ico') {
  return {
    body: buf,
    headers: {
      'Cache-Control': 'public, max-age=' + Math.floor(maxAge / 1000),
      'ETag': etag(buf),
      'Content-Type': imgType[type] || `image/x-icon`
    }
  }
}

function etag(entity) {
  if (entity.length === 0) {
    return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';
  }

  const hash = crypto
    .createHash('sha1')
    .update(entity, 'utf8')
    .digest('base64')
    .substring(0, 27);

  const len = typeof entity === 'string' ? Buffer.byteLength(entity, 'utf8') : entity.length;

  return '"' + len.toString(16) + '-' + hash + '"';
}

module.exports = favicon;