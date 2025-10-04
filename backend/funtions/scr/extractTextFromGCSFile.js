/**
 * Cloud Function para extraer texto de archivos almacenados en Google Cloud Storage.
 * Soporta múltiples formatos: .txt, .pdf, .doc, .docx, .png, .jpg.
 */

const { Storage } = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Inicializar clientes
const storage = new Storage();
const visionClient = new vision.ImageAnnotatorClient();

const extractTextFromGCSFile = async (event, context) => {
  try {
    // Extraer información del archivo del evento
    const bucketName = event.bucket;
    const fileName = event.name;
    const fileExtension = getFileExtension(fileName);

    console.log(`Procesando archivo: ${fileName} del bucket: ${bucketName}`);

    // Descargar el archivo como buffer
    const fileBuffer = await downloadFileAsBuffer(bucketName, fileName);

    // Extraer texto según el tipo de archivo
    let extractedText;
    switch (fileExtension) {
      case 'txt':
        extractedText = await extractTextFromTxt(fileBuffer);
        break;
      case 'pdf':
        extractedText = await extractTextFromPdf(fileBuffer);
        break;
      case 'doc':
      case 'docx':
        extractedText = await extractTextFromDocx(fileBuffer);
        break;
      case 'png':
      case 'jpg':
        extractedText = await extractTextFromImage(fileBuffer);
        break;
      default:
        throw new Error(`Tipo de archivo no soportado: .${fileExtension}`);
    }

    console.log(`Texto extraído exitosamente de ${fileName}`);
    return extractedText;
  } catch (error) {
    console.error('Error en la extracción de texto:', error);
    throw new Error(`Error al procesar el archivo: ${error.message}`);
  }
};

/**
 * Obtiene la extensión de un archivo
 * @param {string} fileName - Nombre del archivo
 * @returns {string} Extensión del archivo en minúsculas
 */
function getFileExtension(fileName) {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    throw new Error('El archivo no tiene extensión');
  }
  return fileName.slice(lastDotIndex + 1).toLowerCase();
}

/**
 * Descarga un archivo de Cloud Storage como buffer
 * @param {string} bucketName - Nombre del bucket
 * @param {string} fileName - Nombre del archivo
 * @returns {Promise<Buffer>} Buffer del archivo
 */
async function downloadFileAsBuffer(bucketName, fileName) {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);
  
  const [fileBuffer] = await file.download();
  return fileBuffer;
}

/**
 * Extrae texto de un archivo .txt
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @returns {Promise<string>} Texto extraído
 */
async function extractTextFromTxt(fileBuffer) {
  // Convertir buffer a string (asumiendo UTF-8)
  return fileBuffer.toString('utf-8');
}

/**
 * Extrae texto de un archivo .pdf usando pdf-parse
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @returns {Promise<string>} Texto extraído
 */
async function extractTextFromPdf(fileBuffer) {
  const data = await pdfParse(fileBuffer);
  return data.text;
}

/**
 * Extrae texto de un archivo .doc/.docx usando mammoth
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @returns {Promise<string>} Texto extraído
 */
async function extractTextFromDocx(fileBuffer) {
  const options = {
    convertImage: mammoth.images.imgElement(function() {
      return { src: "" }; // Ignorar imágenes en la extracción
    })
  };
  
  const result = await mammoth.extractRawText({ buffer: fileBuffer }, options);
  
  // Si hay mensajes de advertencia, los registramos pero continuamos
  if (result.messages.length > 0) {
    console.warn('Advertencias durante la extracción de DOCX:', result.messages);
  }
  
  return result.value;
}

/**
 * Extrae texto de una imagen usando Google Cloud Vision OCR
 * @param {Buffer} fileBuffer - Buffer de la imagen
 * @returns {Promise<string>} Texto extraído
 */
async function extractTextFromImage(fileBuffer) {
  const request = {
    image: {
      content: fileBuffer
    }
  };
  
  const [result] = await visionClient.textDetection(request);
  const detections = result.textAnnotations;
  
  if (!detections || detections.length === 0) {
    return ''; // No se detectó texto
  }
  
  // El primer elemento contiene el texto completo detectado
  return detections[0].description;
}

// Exportar funciones auxiliares para reutilizarlas
module.exports = {
  extractTextFromGCSFile,
  helpers: {
  extractTextFromTxt,
  extractTextFromPdf,
  extractTextFromDocx,
  extractTextFromImage,
  }
};
