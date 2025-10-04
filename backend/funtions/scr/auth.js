/**
 * @fileoverview Utilidades de autenticación para los endpoints.
 */

/**
 * Valida si la solicitud contiene una API Key válida en la cabecera x-api-key.
 * @param {object} request - El objeto de solicitud de la Cloud Function.
 * @returns {boolean} - True si está autorizado, false en caso contrario.
 */
function isAuthorized(request) {
  const apiKey = process.env.API_KEY;
  // Soporta tanto request.get('header') de Express como request.headers['header'] de Node.
  const clientKey = request.get ? request.get('x-api-key') : request.headers['x-api-key'];
  return !!(apiKey && clientKey && apiKey === clientKey);
}

module.exports = { isAuthorized };