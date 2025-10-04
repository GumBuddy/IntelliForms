const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://us-central1-intelliforms-474101.cloudfunctions.net',
      changeOrigin: true,
    })
  );
};