const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async likes(albumId, userId) {
    const album = await this.getAlbumById(albumId);
    const likedAlbum = await this.getLikedAlbum(albumId, userId);

    if (!likedAlbum) {
      const id = `albumlike-${nanoid(16)}`;
      const query = {
        text: 'INSERT INTO albums_likes VALUES($1, $2, $3) RETURNING id',
        values: [id, albumId, userId],
      };

      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError('Gagal menyukai album');
      }

      this._cacheService.delete(`albumlikes:${album.id}`);

      return result.rows[0].id;
    }

    const query = {
      text: 'DELETE FROM albums_likes WHERE id = $1 RETURNING id',
      values: [likedAlbum.id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal tidak menyukai album, id tidak ditemukan');
    }
    this._cacheService.delete(`albumlikes:${album.id}`);

    return result.rows[0];
  }

  async countAlbumLikes(albumId) {
    try {
      // mendapatkan jumlah likes album dari cache
      const result = await this._cacheService.get(`albumlikes:${albumId}`);
      return { likes: result, source: 'cache' };
    } catch (error) {
      // jika gagal queri dari database
      const query = {
        text: 'SELECT COUNT(*) AS likes FROM albums_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const { likes } = result.rows[0];
      await this._cacheService.set(`albumlikes:${albumId}`, likes);
      return { likes, source: 'db' };
    }
  }

  async getLikedAlbum(albumId, userId) {
    const query = {
      text: 'SELECT * FROM albums_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      return false;
    }
    return result.rows[0];
  }

  async getAlbumById(albumId) {
    const query = {
      text: 'SELECT id, name, year, cover_url FROM albums WHERE id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return result.rows[0];
  }
}

module.exports = AlbumsLikesService;
