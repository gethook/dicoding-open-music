/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumToModel } = require('../../utils');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [`album-${id}`, name, year, createdAt],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums(name, year) {
    let text = 'SELECT id, name, year FROM albums';
    const values = [];
    text += (name !== undefined || year !== undefined) ? ' WHERE' : '';
    if (name !== undefined && year !== undefined) {
      text += ' name LIKE $1 AND year = $2';
      values.push(`%${name}%`, year);
    } else if (name !== undefined && year === undefined) {
      text += ' name LIKE $1';
      values.push(`%${name}%`);
    } else if (name === undefined && year !== undefined) {
      text += ' year = $1';
      values.push(year);
    }
    const query = {
      text,
      values,
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year, cover_url FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const querySongs = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const songsResult = await this._pool.query(querySongs);
    const songs = songsResult.rows;

    const album = result.rows.map(mapAlbumToModel)[0];
    album.songs = songs;
    return album;
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album, id tidak ditemukan');
    }
  }

  async editAlbumCoverById(id, coverUrl) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET cover_url = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [coverUrl, updatedAt, id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album, id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus album, id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
