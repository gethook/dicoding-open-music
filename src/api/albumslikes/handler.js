class AlbumsLikesHandler {
  constructor(service) {
    this._service = service;
  }

  async postAlbumLikeHandler(request, h) {
    const userId = request.auth.credentials.id;
    const albumId = request.params.id;
    await this._service.likes(albumId, userId);
    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai/batal menyukai album',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikeHandler(request, h) {
    const albumId = request.params.id;
    const countLikes = await this._service.countAlbumLikes(albumId);
    const response = h.response({
      status: 'success',
      data: { likes: parseInt(countLikes.likes, 10) },
    });
    if (countLikes.source === 'cache') {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = AlbumsLikesHandler;
