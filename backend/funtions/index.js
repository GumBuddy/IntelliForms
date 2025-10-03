/**
 * Punto de entrada para las funciones de Google Cloud
 * 
 * Este archivo exporta todas las funciones de Cloud Functions
 * para que puedan ser desplegadas individualmente.
 * 
 * @module index
 */

// Importar las funciones desde sus respectivos módulos
const { generateUploadUrl } = require('./src/generateUploadUrl');
const { notifyFileUploaded } = require('./src/notifyFileUploaded');
const { extractTextFromGCSFile } = require('./src/extractTextFromGCSFile');

// Exportar la función para generar URLs firmadas
/**
 * Función que genera URLs firmadas para subir archivos a Google Cloud Storage
 * @type {Function}
 */
exports.generateUploadUrl = generateUploadUrl;

/**
 * Función que notifica y procesa archivos subidos
 * @type {Function}
 */
exports.notifyFileUploaded = notifyFileUploaded;

/**
 * Función que extrae texto de archivos subidos a GCS (trigger de almacenamiento)
 * @type {Function}
 */
exports.extractTextFromGCSFile = extractTextFromGCSFile;

/**
 * Endpoint HTTP para extraer texto de un archivo en GCS (requiere bucket y fileName por POST)
 * @type {Function}
 */
exports.extractTextFromGCSFileHttp = async (req, res) => {
	try {
		if (req.method !== 'POST') {
			res.status(405).json({ success: false, error: 'Método no permitido. Use POST.' });
			return;
		}
		const { bucket, fileName } = req.body;
		if (!bucket || !fileName) {
			res.status(400).json({ success: false, error: 'Faltan parámetros bucket y fileName.' });
			return;
		}
		// Simular evento de GCS
		const event = { bucket, name: fileName };
		const text = await extractTextFromGCSFile(event, {});
		res.status(200).json({ success: true, text });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};