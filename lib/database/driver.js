const http = require("http");
const https = require("https");
const url = require("url");
const EventEmitter = require("events");

/**
 * Minimal HTTP request to proxy API
 */
function requestJSON(targetUrl, body, token) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(targetUrl);
    const lib = parsedUrl.protocol === "https:" ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * ProxyConnection mimicking mysql2 connection
 */
class ProxyConnection extends EventEmitter {
  constructor(token, baseUrl) {
    super();
    this.token = token;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this._closed = false;
    this._sessionId = null;

    // Sequelize compatibility
    this.pool = new EventEmitter();
    this.pool.setMaxListeners = this.pool.setMaxListeners || (() => { });
    this.threadId = Math.floor(Math.random() * 10000);
    this.config = { host: baseUrl, user: token };
  }

  _normalizeSQL(sqlOrOptions) {
    let sql;
    if (typeof sqlOrOptions === "object") {
      sql = sqlOrOptions.sql || sqlOrOptions.query;
    } else {
      sql = sqlOrOptions;
    }
    if (typeof sql !== "string") {
      throw new Error("SQL must be a string");
    }
    return sql;
  }

  query(sqlOrOptions, values, callback) {
    if (this._closed) {
      const err = new Error("Connection closed");
      if (callback) return callback(err);
      return Promise.reject(err);
    }

    if (typeof values === "function") {
      callback = values;
      values = [];
    }

    const sql = this._normalizeSQL(sqlOrOptions);
    const payload = { query: sql, values: values || [] };
    if (this._sessionId) payload.sessionId = this._sessionId;

    const queryPromise = requestJSON(`${this.baseUrl}/execute-sql`, payload, this.token)
      .then((data) => {
        if (!data.success) throw new Error(data.error || "Proxy execution error");
        return [data.rows || [], data.fields || []];
      })
      .catch((err) => {
        this.emit("error", err);
        throw err;
      });

    // Wrap promise in a query-like object
    const queryWrapper = new EventEmitter();

    queryPromise.then(([rows, fields]) => {
      if (callback) callback(null, rows, fields);
      queryWrapper.emit("end", rows, fields);
    }).catch((err) => {
      if (callback) callback(err);
      queryWrapper.emit("error", err);
    });

    // Provide setMaxListeners for Sequelize
    queryWrapper.setMaxListeners = (n) => queryWrapper;

    // Promise support
    queryWrapper.promise = () => queryPromise;

    return queryWrapper;
  }

  execute(sql, values, callback) {
    return this.query(sql, values, callback);
  }

  beginTransaction(callback) {
    const promise = requestJSON(`${this.baseUrl}/transaction/start`, {}, this.token)
      .then((data) => {
        this._sessionId = data.sessionId;
        return data.sessionId;
      })
      .catch((err) => {
        this.emit("error", err);
        throw err;
      });

    if (callback) {
      promise.then((id) => callback(null, id)).catch(callback);
      return;
    }
    return promise;
  }

  commit(callback) {
    if (!this._sessionId) {
      const err = new Error("No active transaction");
      if (callback) return callback(err);
      return Promise.reject(err);
    }

    const promise = requestJSON(
      `${this.baseUrl}/transaction/commit`,
      { sessionId: this._sessionId },
      this.token
    ).then(() => {
      this._sessionId = null;
    });

    if (callback) {
      promise.then(() => callback(null)).catch(callback);
      return;
    }
    return promise;
  }

  rollback(callback) {
    if (!this._sessionId) {
      const err = new Error("No active transaction");
      if (callback) return callback(err);
      return Promise.reject(err);
    }

    const promise = requestJSON(
      `${this.baseUrl}/transaction/rollback`,
      { sessionId: this._sessionId },
      this.token
    ).then(() => {
      this._sessionId = null;
    });

    if (callback) {
      promise.then(() => callback(null)).catch(callback);
      return;
    }
    return promise;
  }

  end(callback) {
    this._closed = true;
    this.emit("end");
    if (callback) callback(null);
    return Promise.resolve();
  }

  release() {
    return this.end();
  }
}

/**
 * ProxyPool mimicking mysql2 pool
 */
class ProxyPool {
  constructor(token, baseUrl) {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  getConnection(callback) {
    const conn = new ProxyConnection(this.token, this.baseUrl);
    if (callback) callback(null, conn);
    return Promise.resolve(conn);
  }

  query(sql, values, callback) {
    const conn = new ProxyConnection(this.token, this.baseUrl);
    return conn.query(sql, values, callback);
  }

  end(callback) {
    if (callback) callback(null);
    return Promise.resolve();
  }
}

class ProxyConnectionManager {
  constructor(dialect, sequelize, tokenProvider, baseUrl) {
    this.sequelize = sequelize;
    this.dialect = dialect;
    this.tokenProvider = tokenProvider;
    this.baseUrl = baseUrl;
    this.pool = new ProxyPool(this.resolveToken(), this.baseUrl);
  }

  resolveToken() {
    return typeof this.tokenProvider === "function"
      ? this.tokenProvider()
      : this.tokenProvider;
  }

  async connect() {
    return new ProxyConnection(this.resolveToken(), this.baseUrl);
  }

  async disconnect(connection) {
    if (connection && connection.end) {
      await connection.end();
    }
  }

  async validate(connection) {
    return !!connection && !connection._closed;
  }

  getConnection() {
    return this.connect();
  }

  releaseConnection(connection) {
    return this.disconnect(connection);
  }
}

module.exports = ProxyConnectionManager;