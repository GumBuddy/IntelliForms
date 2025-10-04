/**
 * Función de Google Cloud para notificar que un archivo fue subido y procesarlo
 *
 * Este endpoint recibe el nombre del archivo y puede iniciar un procesamiento adicional
 * (por ejemplo, análisis, validación, mover a otra carpeta, etc.)
 *
 * @module notifyFileUploaded
 */

// Aquí puedes importar otras dependencias si es necesario
const { PubSub } = require('@google-cloud/pubsub');
const pubsub = new PubSub();

// Nombre del tema de Pub/Sub que activará la generación del formulario
const TOPIC_NAME = process.env.FORM_GENERATION_TOPIC || 'projects/intelliforms-424618/topics/form-generation-topic';

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
    const { fileName, template } = request.body;
    if (!fileName || !template) {
      response.status(400).json({
        success: false,
        error: 'Faltan los parámetros fileName y template.'
      });
      return;
    }

    // Prepara los datos para enviar al siguiente paso
    const messageData = {
      fileName,
      template,
      bucket: process.env.BUCKET_NAME || 'intelliforms-uploads'
    };

    // Publica un mensaje en el tema de Pub/Sub para iniciar la extracción y generación
    const dataBuffer = Buffer.from(JSON.stringify(messageData));
    const messageId = await pubsub.topic(TOPIC_NAME).publishMessage({ data: dataBuffer });

    console.log(`Mensaje ${messageId} publicado en ${TOPIC_NAME} para el archivo ${fileName}.`);

    response.status(200).json({
      success: true,
      message: `Archivo ${fileName} notificado. El procesamiento ha comenzado.`,
      messageId: messageId
    });
  } catch (error) {
    console.error('Error en notifyFileUploaded:', error);
    response.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor.'
    });
  }
};
