/**
 * Función de Google Cloud para notificar que un archivo fue subido y procesarlo
 *
 * Este endpoint recibe el nombre del archivo y puede iniciar un procesamiento adicional
 * (por ejemplo, análisis, validación, mover a otra carpeta, etc.)
 *
 * @module notifyFileUploaded
 */

// Aquí puedes importar otras dependencias si es necesario

/**
 * Función principal de Google Cloud Functions para manejar la notificación post-upload
 *
 * @param {Object} request - Objeto de solicitud HTTP
 * @param {Object} response - Objeto de respuesta HTTP
 */
// --- Autenticación por API Key ---
function isAuthorized(request) {
  const apiKey = process.env.API_KEY;
  const clientKey = request.get('x-api-key') || request.headers['x-api-key'];
  return apiKey && clientKey && apiKey === clientKey;
}

exports.notifyFileUploaded = async (request, response) => {
  try {
    // Autenticación por API Key
    if (!isAuthorized(request)) {
      response.status(401).json({
        success: false,
        error: 'No autorizado. API key inválida.'
      });
      return;
    }
    if (request.method !== 'POST') {
      response.status(405).json({
        success: false,
        error: 'Método no permitido. Use POST.'
      });
      return;
    }
    const { fileName } = request.body;
    if (!fileName) {
      response.status(400).json({
        success: false,
        error: 'Falta el parámetro fileName.'
      });
      return;
    }
    // Aquí puedes agregar lógica de procesamiento del archivo
    // Por ejemplo: analizar, validar, mover, etc.
    response.status(200).json({
      success: true,
      message: `Archivo ${fileName} notificado y procesado correctamente.`
    });
  } catch (error) {
    console.error('Error en notifyFileUploaded:', error);
    response.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor.'
    });
  }
};
