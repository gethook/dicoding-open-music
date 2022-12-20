const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;
