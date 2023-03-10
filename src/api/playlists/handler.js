const ClientError = require('../../exceptions/ClientError');

/* eslint-disable no-underscore-dangle */
class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postPlayistSongHandler = this.postPlayistSongHandler.bind(this);
    this.getPlayistSongsHandler = this.getPlayistSongsHandler.bind(this);
    this.deletePlayistSongByIdHandler = this.deletePlayistSongByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialsId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist({ name, owner: credentialsId });
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: { playlistId },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: owner } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(owner);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: owner } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(id, owner);
    await this._service.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus.',
    };
  }

  async postPlayistSongHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(playlistId, owner);
    await this._validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    await this._service.addSong(playlistId, songId);
    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan lagu ke dalam playlist',
    });
    response.code(201);
    return response;
  }

  async getPlayistSongsHandler(request) {
    const { id } = request.params;
    const { id: owner } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(id, owner);
    const playlist = await this._service.getPlaylistById(id);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlayistSongByIdHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: owner } = request.auth.credentials;
      await this._service.verifyPlaylistOwner(playlistId, owner);
      await this._validator.validatePlaylistSongPayload(request.payload);
      const { songId } = request.payload;
      await this._service.deleteSong(playlistId, songId);
      return {
        status: 'success',
        message: 'Berhasil menghapus lagu ke dari playlist',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // server error
      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = PlaylistsHandler;
