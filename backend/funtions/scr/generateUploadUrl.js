/**
 * Función de Google Cloud para generar URLs firmadas de Google Cloud Storage
 * 
 * Este módulo implementa una función HTTP que genera URLs firmadas para subir archivos
 * a Google Cloud Storage. Valida los tipos de archivo permitidos y maneja errores
 * de manera robusta, siguiendo los requisitos del proyecto IntelliForms.
 * 
 * @module generateSignedUrl
 */

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const { isAuthorized } = require('./auth');

// Configuración de variables de entorno
const BUCKET_NAME = process.env.BUCKET_NAME || 'intelliforms-uploads';
const URL_EXPIRATION_TIME = parseInt(process.env.URL_EXPIRATION_TIME || '15', 10) * 60 * 1000; // 15 minutos por defecto

// Tipos de archivo permitidos según el MVP de IntelliForms
const ALLOWED_FILE_TYPES = {
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

/**
 * Valida si la extensión de archivo está permitida
 * 
 * @param {string} fileExtension - Extensión del archivo (ej: '.pdf', '.txt')
 * @returns {boolean} - True si la extensión es válida, false en caso contrario
 */
function isValidFileExtension(fileExtension) {
  // Normalizar la extensión a minúsculas y asegurar que tenga punto al inicio
  const normalizedExtension = fileExtension.startsWith('.') 
    ? fileExtension.toLowerCase() 
    : `.${fileExtension.toLowerCase()}`;
  
  return Object.prototype.hasOwnProperty.call(ALLOWED_FILE_TYPES, normalizedExtension);
}

/**
 * Obtiene el tipo MIME correspondiente a una extensión de archivo
 * 
 * @param {string} fileExtension - Extensión del archivo (ej: '.pdf', '.txt')
 * @returns {string} - Tipo MIME correspondiente
 * @throws {Error} - Si la extensión no está permitida
 */
function getMimeType(fileExtension) {
  const normalizedExtension = fileExtension.startsWith('.') 
    ? fileExtension.toLowerCase() 
    : `.${fileExtension.toLowerCase()}`;
  
  if (!isValidFileExtension(normalizedExtension)) {
    throw new Error(`Extensión de archivo no permitida: ${fileExtension}. Extensiones válidas: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`);
  }
  
  return ALLOWED_FILE_TYPES[normalizedExtension];
}

/**
 * Genera una URL firmada para subir un archivo a Google Cloud Storage
 * 
 * @param {string} fileName - Nombre del archivo sin extensión
 * @param {string} fileExtension - Extensión del archivo (ej: '.pdf', '.txt')
 * @param {number} [fileSize] - Tamaño del archivo en bytes (opcional, recomendado)
 * @returns {Promise<Object>} - Promesa que resuelve con un objeto que contiene la URL firmada
 * @throws {Error} - Si hay un error en la generación de la URL
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
async function generateSignedUrl(fileName, fileExtension, fileSize) {
  try {
    // Validar que el nombre del archivo no esté vacío
    if (!fileName || typeof fileName !== 'string' || fileName.trim() === '') {
      throw new Error('El nombre del archivo no puede estar vacío');
    }
    // Validar que la extensión sea válida
    if (!fileExtension || typeof fileExtension !== 'string') {
      throw new Error('La extensión del archivo es requerida');
    }
    // Validar tamaño de archivo si se proporciona
    if (fileSize !== undefined && fileSize !== null) {
      if (typeof fileSize !== 'number' || isNaN(fileSize) || fileSize <= 0) {
        throw new Error('El tamaño del archivo debe ser un número positivo.');
      }
      if (fileSize > MAX_FILE_SIZE) {
        throw new Error(`El archivo excede el tamaño máximo permitido (${MAX_FILE_SIZE / (1024*1024)} MB).`);
      }
    }
    // Obtener el tipo MIME
    const mimeType = getMimeType(fileExtension);
    // Normalizar la extensión
    const normalizedExtension = fileExtension.startsWith('.') 
      ? fileExtension.toLowerCase() 
      : `.${fileExtension.toLowerCase()}`;
    // Crear el nombre completo del archivo
    const fullFileName = `${fileName}${normalizedExtension}`;
    // Obtener referencia al bucket
    const bucket = storage.bucket(BUCKET_NAME);
    // Crear referencia al archivo
    const file = bucket.file(fullFileName);
    // Configurar opciones para la URL firmada
    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + URL_EXPIRATION_TIME,
      contentType: mimeType
    };
    // Generar la URL firmada
    const [signedUrl] = await file.getSignedUrl(options);
    // Retornar la información necesaria
    return {
      signedUrl,
      fileName: fullFileName,
      mimeType,
      expirationTime: new Date(Date.now() + URL_EXPIRATION_TIME).toISOString()
    };
  } catch (error) {
    console.error('Error al generar la URL firmada:', error);
    throw error;
  }
}

/**
 * Función principal de Google Cloud Functions que maneja las solicitudes HTTP
 * 
 * @param {Object} request - Objeto de solicitud HTTP
 * @param {Object} response - Objeto de respuesta HTTP
 */
exports.generateUploadUrl = async (request, response) => {
  try {
    // Autenticación por API Key
    if (!isAuthorized(request)) {
      response.status(401).json({
        success: false,
        error: 'No autorizado. API key inválida.'
      });
      return;
    }
    // Solo aceptar solicitudes POST
    if (request.method !== 'POST') {
      response.status(405).json({
        success: false,
        error: 'Método no permitido. Use POST.'
      });
      return;
    }
    // Verificar Content-Type
    const contentType = request.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      response.status(400).json({
        success: false,
        error: 'Content-Type debe ser application/json'
      });
      return;
    }
    // Obtener datos del cuerpo de la solicitud
    const { fileName, fileExtension, fileSize } = request.body;
    // Validar que se proporcionaron los datos necesarios
    if (!fileName || !fileExtension) {
      response.status(400).json({
        success: false,
        error: 'Faltan datos requeridos. Se necesita fileName y fileExtension.'
      });
      return;
    }
    // Generar la URL firmada (ahora con validación de tamaño)
    const result = await generateSignedUrl(fileName, fileExtension, fileSize);
    // Enviar respuesta exitosa
    response.status(200).json({
      success: true,
      ...result,
      message: 'URL generada correctamente. Use esta URL para subir su archivo.'
    });
  } catch (error) {
    console.error('Error en la función generateUploadUrl:', error);
    // Determinar el código de estado HTTP basado en el tipo de error
    let statusCode = 500;
    if (error.message.includes('Extensión de archivo no permitida') || 
        error.message.includes('nombre del archivo no puede estar vacío') ||
        error.message.includes('extensión del archivo es requerida')) {
      statusCode = 400;
    }
    // Enviar respuesta de error
    response.status(statusCode).json({
      success: false,
      error: error.message || 'Error interno del servidor al generar la URL firmada.'
    });
  }
};