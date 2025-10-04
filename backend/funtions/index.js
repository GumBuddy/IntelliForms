/**
 * Punto de entrada para las funciones de Google Cloud
 *
 * Este archivo exporta todas las funciones de Cloud Functions
 * para que puedan ser desplegadas individualmente.
 *
 * @module index
 */

// Importar las funciones desde sus respectivos módulos
const { generateUploadUrl } = require('./scr/generateUploadUrl');
const { notifyFileUploaded } = require('./scr/notifyFileUploaded');
const { processFile } = require('./scr/processFile');
const { extractTextFromGCSFile } = require('./scr/extractTextFromGCSFile');
const { generarFormularioHttp } = require('./scr/generarFormularioHttp');
const { getTemplates, generarFormulario } = require('./scr/formularioEndpoints');

// --- Endpoints Principales del Flujo de URLs Firmadas ---

/** Endpoint HTTP para generar URLs firmadas para subir archivos a GCS. */
exports.generateUploadUrl = generateUploadUrl;

/** Endpoint HTTP que recibe la notificación de un archivo subido e inicia el procesamiento asíncrono. */
exports.notifyFileUploaded = notifyFileUploaded;

/** Función que se activa por Pub/Sub para procesar el archivo en segundo plano. */
exports.processFile = processFile;

/** Función de utilidad para extraer texto. Puede ser llamada por otras funciones o desplegada por separado. */
exports.extractTextFromGCSFile = extractTextFromGCSFile;

// --- Endpoints Alternativos y de Utilidad ---

/** Endpoint HTTP para el flujo síncrono: subida directa de archivo y generación de formulario. */
exports.generarFormularioHttp = generarFormularioHttp;

/** Endpoint HTTP para obtener la lista de plantillas disponibles. */
exports.getTemplates = getTemplates;

/** Endpoint HTTP de prueba para generar un formulario simulado. */
exports.generarFormularioSimulado = generarFormulario;