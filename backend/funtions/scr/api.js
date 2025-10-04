/**
 * @fileoverview Función despachadora principal que actúa como un servidor API.
 * Utiliza Express para enrutar las solicitudes a los controladores correspondientes.
 */

const express = require('express');
const cors = require('cors');

// Importar los controladores de cada endpoint
const { generateUploadUrl } = require('./generateUploadUrl');
const { notifyFileUploaded } = require('./notifyFileUploaded');
const { generarFormularioHttp } = require('./generarFormularioHttp');
const { getTemplates, generarFormulario } = require('./formularioEndpoints');

// Crear la aplicación de Express
const app = express();

// --- Middlewares ---

// Habilitar CORS para todos los orígenes. En producción, es recomendable
app.use(cors({ origin: true }));

// Middleware para parsear cuerpos de solicitud JSON (necesario para generateUploadUrl y notifyFileUploaded)
app.use(express.json());

// --- Definición de Rutas ---

// Flujo asíncrono
app.post('/generateUploadUrl', generateUploadUrl);
app.post('/notifyFileUploaded', notifyFileUploaded);

// Flujo síncrono
app.post('/generarFormularioHttp', generarFormularioHttp);

// Endpoints de utilidad
app.get('/getTemplates', getTemplates);
app.get('/generarFormularioSimulado', generarFormulario);

// --- Manejador de Errores Centralizado ---
// Este middleware se ejecutará si cualquier ruta anterior llama a next(error).
app.use((err, req, res, next) => {
  console.error(`[API Error] Ruta: ${req.path}`, err);

  // Evita enviar detalles sensibles del error en producción
  const isProd = process.env.NODE_ENV === 'production';
  const errorMessage = isProd ? 'Ocurrió un error interno en el servidor.' : err.message;

  res.status(err.statusCode || 500).json({ success: false, error: errorMessage });
});

// Exportar la aplicación de Express para que sea usada por Cloud Functions
const { app } = require('./scr/api');
exports.api = app;