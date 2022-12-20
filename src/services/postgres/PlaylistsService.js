/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [`playlist-${id}`, name, owner, createdAt, createdAt],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
            LEFT JOIN users ON users.id=playlists.owner 
            WHERE playlists.owner = $1`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
            LEFT JOIN users ON users.id=playlists.owner 
            WHERE playlists.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songlists 
            LEFT JOIN songs ON songs.id=songlists.song_id
            WHERE songlists.playlist_id = $1`,
      values: [id],
    };

    const songsResult = await this._pool.query(querySongs);
    const songs = songsResult.rows;

    const playlist = result.rows[0];
    playlist.songs = songs;
    return playlist;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id=$1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus playlists, id tidak ditemukan');
    }
  }

  async addSong(playlistId, songId) {
    const querySong = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };
    const song = await this._pool.query(querySong);
    if (!song.rows.length) {
      throw new NotFoundError('Lagu yang akan ditambahkan ke dalam playlist tidak ditemukan.');
    }
    const id = `songlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songlists VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');
    }
    return result.rows[0].id;
  }

  async deleteSong(playlistId, songId) {
    const query = {
      text: 'DELETE FROM songlists WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = PlaylistsService;
