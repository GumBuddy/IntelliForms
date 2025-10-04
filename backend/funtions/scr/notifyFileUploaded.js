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
let pubsub; // Declarar pero no inicializar
const { isAuthorized } = require('./auth');

// Nombres de recursos obtenidos desde las variables de entorno para mayor portabilidad.
const TOPIC_NAME = process.env.PUBSUB_TOPIC_NAME;
const BUCKET_NAME = process.env.GCS_BUCKET_NAME;

/**
 * Función principal de Google Cloud Functions para manejar la notificación post-upload
 *
 * @param {Object} request - Objeto de solicitud HTTP
 * @param {Object} response - Objeto de respuesta HTTP
 */
const notifyFileUploadedHandler = async (request, response) => {
  try {
    // Validar variables de entorno al inicio de la ejecución
    if (!TOPIC_NAME || !BUCKET_NAME) {
      console.error('Error crítico: Las variables de entorno PUBSUB_TOPIC_NAME y GCS_BUCKET_NAME no están configuradas en el entorno de la función.');
      return response.status(500).json({ success: false, error: 'Error de configuración del servidor.' });
    }
    // Autenticación por API Key
    if (!isAuthorized(request)) {
      response.status(401).json({
        success: false,
        error: 'No autorizado. API key inválida.'
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
      bucket: BUCKET_NAME
    };

    // Publica un mensaje en el tema de Pub/Sub para iniciar la extracción y generación
    // Inicializar el cliente de PubSub si aún no existe (Lazy Initialization)
    if (!pubsub) {
      pubsub = new PubSub();
    }
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

module.exports = { notifyFileUploaded: notifyFileUploadedHandler };
