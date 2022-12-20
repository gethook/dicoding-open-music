const InvariantError = require('../../exceptions/InvariantError');
const { SongPaylodSchema } = require('./schema');

const SongsValidator = {
  validateSongPayload: (paylod) => {
    const validationResult = SongPaylodSchema.validate(paylod);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error);
    }
  },
};

module.exports = SongsValidator;
