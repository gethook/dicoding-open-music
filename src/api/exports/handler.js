class ExportsHandler {
  constructor(playlistsService, messageService, validator) {
    this._playlistsService = playlistsService;
    this._messageService = messageService;
    this._validator = validator;
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);
    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };
    await this._messageService.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
