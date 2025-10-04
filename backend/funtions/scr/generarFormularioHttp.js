/**
 * @fileoverview
 * Endpoint HTTP para generación de formularios dinámicos a partir de archivos subidos.
 * - Recibe archivos .txt, .pdf, .png, .jpg, .doc, .docx mediante POST multipart/form-data.
 * - Extrae el texto usando lógica local (buffer) y llama a Gemini.
 * - Incluye soporte CORS y manejo robusto de errores.
 *
 * Uso con Google Cloud Functions Framework:
 *   gcloud functions deploy generarFormularioHttp --runtime nodejs16 --trigger-http --allow-unauthenticated
 */

const Busboy = require('busboy');
const { llamarGemini } = require('./geminiService');
const { helpers: textExtractors } = require('./extractTextFromGCSFile');

/**
 * Extrae texto de un archivo buffer según su tipo.
 * @param {Buffer} buffer - Buffer del archivo
 * @param {string} filename - Nombre del archivo
 * @returns {Promise<string>} Texto extraído
 */
async function extractTextFromBuffer(buffer, filename) {
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'txt':
      return textExtractors.extractTextFromTxt(buffer);
    case 'pdf':
      return textExtractors.extractTextFromPdf(buffer);
    case 'doc':
    case 'docx':
      return textExtractors.extractTextFromDocx(buffer);
    case 'png':
    case 'jpg':
    case 'jpeg':
      return textExtractors.extractTextFromImage(buffer);
    default:
      throw new Error('Tipo de archivo no soportado para extracción de texto');
  }
}

/**
 * Cloud Function HTTP para generación de formulario dinámico.
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
exports.generarFormularioHttp = (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Método no permitido. Use POST.' }));
    return;
  }

  const busboy = Busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } });
  let archivoBuffer = Buffer.alloc(0);
  let archivoNombre = '';
  let archivoMime = '';
  let plantilla = '';

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    archivoNombre = filename;
    archivoMime = mimetype;
    file.on('data', (data) => {
      archivoBuffer = Buffer.concat([archivoBuffer, data]);
    });
  });

  busboy.on('field', (fieldname, val) => {
    if (fieldname === 'plantilla') {
      plantilla = val;
    }
  });

  busboy.on('finish', async () => {
    try {
      if (!archivoNombre || !archivoBuffer.length) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'No se recibió ningún archivo.' }));
        return;
      }
      if (!plantilla) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'No se especificó la plantilla.' }));
        return;
      }
      // Extraer texto real del archivo
      const textoExtraido = await extractTextFromBuffer(archivoBuffer, archivoNombre);
      // Limitar el texto a 15,000 caracteres
      const textoLimitado = textoExtraido.substring(0, 15000);
      // Llamar a Gemini para generar el formulario
      let formularioData;
      try {
        formularioData = await llamarGemini(textoLimitado, plantilla);
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message || 'Error al generar el formulario con Gemini.' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, formulario: formularioData }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message || 'Error interno del servidor.' }));
    }
  });

  req.pipe(busboy);
};
