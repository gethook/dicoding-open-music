/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('albums_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
  /**
   * Menambahkan constraint UNIQUE, kombinasi dari kolom album_id dan user_id.
   * Guna menghindari duplikasi data
   */
  pgm.addConstraint('albums_likes', 'unique_album_id_and_user_id', 'UNIQUE(album_id, user_id)');

  /**
   * memberikan constraint foreign key pada kolom album_id dan user_id
   * terhadap albums.id dan users.id
   * */
  pgm.addConstraint('albums_likes', 'fk_albums_likes.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
  pgm.addConstraint('albums_likes', 'fk_albums_likes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('albums_likes');
};
