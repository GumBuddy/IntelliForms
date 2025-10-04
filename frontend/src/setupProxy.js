const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // Redirige cualquier ruta que comience con /api
    createProxyMiddleware({
      target: 'http://localhost:8080', // La dirección de tu backend
      changeOrigin: true,
      pathRewrite: { '^/api': '' }, // Elimina /api del path antes de enviarlo al backend
    })
  );
};