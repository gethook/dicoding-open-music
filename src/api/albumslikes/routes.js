const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.postAlbumLikeHandler(request, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.getAlbumLikeHandler(request, h),
  },
];

module.exports = routes;
