/**
 * Punto de entrada para las funciones de Google Cloud
 *
 * Este archivo exporta todas las funciones de Cloud Functions
 * para que puedan ser desplegadas individualmente.
 *
 * @module index
 */

// Importar las funciones desde sus respectivos módulos
const { app } = require('./scr/api');
const { processFile } = require('./scr/processFile');

/**
 * API principal que agrupa todos los endpoints HTTP.
 * Se despliega como una única Cloud Function.
 */
exports.api = app;

/** Función que se activa por Pub/Sub para procesar el archivo en segundo plano (se mantiene igual). */
exports.processFile = processFile;