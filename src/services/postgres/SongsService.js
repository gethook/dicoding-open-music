/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongToModel } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title,
    year,
    genre,
    performer,
    duration = null,
    albumId = null,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [`song-${id}`, title, year, genre, performer, duration, albumId, createdAt, createdAt],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Songs gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    let text = 'SELECT id, title, performer FROM songs';
    const values = [];
    text += (title !== undefined || performer !== undefined) ? ' WHERE' : '';
    if (title !== undefined && performer !== undefined) {
      text += ' title ILIKE $1 AND performer ILIKE $2';
      values.push(`%${title}%`, `%${performer}%`);
    } else if (title !== undefined && performer === undefined) {
      text += ' title ILIKE $1';
      values.push(`%${title}%`);
    } else if (title === undefined && performer !== undefined) {
      text += ' performer ILIKE $1';
      values.push(`%${performer}%`);
    }
    const query = {
      text,
      values,
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT id, title, year, performer, genre, duration, album_id FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    return result.rows.map(mapSongToModel)[0];
  }

  async editSongById(id, {
    title,
    year,
    genre,
    performer,
    duration = null,
    albumId = null,
  }) {
    const updatedAt = new Date().toISOString();
    const objValues = {
      title, year, genre, performer, updated_at: updatedAt,
    };
    if (duration) {
      objValues.duration = duration;
    }
    if (albumId) {
      objValues.album_id = albumId;
    }
    const values = Object.values(objValues);
    const keys = Object.keys(objValues);
    const params = [];
    for (let index = 1; index <= keys.length; index++) {
      params.push(`${keys[index - 1]} = $${index}`);
    }
    let txtParams = params.join(',');
    values.push(id);
    txtParams += ` WHERE id = $${values.length}`;
    const query = {
      text: `UPDATE songs SET ${txtParams} RETURNING id`,
      values,
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu, id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id=$1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu, id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
