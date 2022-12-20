const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: (request, h) => handler.postExportPlaylistHandler(request, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
];

module.exports = routes;
