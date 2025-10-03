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

// Aquí se pueden exportar otras funciones cuando se implementen
// Ejemplo:
// exports.processFile = require('./src/processFile');