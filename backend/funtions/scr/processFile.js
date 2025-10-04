/**
 * @fileoverview Cloud Function que se activa por un mensaje de Pub/Sub para procesar un archivo.
 *
 * Esta función orquesta el proceso de generación de formularios:
 * 1. Se activa cuando se publica un mensaje en el tema de generación de formularios.
 * 2. Llama a la función de extracción de texto para obtener el contenido del archivo desde GCS.
 * 3. Llama al servicio de Gemini para generar la estructura del formulario.
 * 4. (Futuro) Guarda el resultado en una base de datos (ej. Firestore).
 *
 * @module processFile
 */

const { PubSub } = require('@google-cloud/pubsub');
const { Storage } = require('@google-cloud/storage');
const { extractTextFromGCSFile } = require('./extractTextFromGCSFile');
const { llamarGemini } = require('./geminiService');

// TODO: Inicializar cliente de Firestore para guardar resultados

/**
 * Función principal que se suscribe al tema de Pub/Sub.
 *
 * @param {object} message - El mensaje de Pub/Sub, que contiene los datos en formato base64.
 * @param {object} context - El contexto del evento.
 */
exports.processFile = async (message, context) => {
  try {
    // 1. Decodificar el mensaje de Pub/Sub
    const messageDataString = Buffer.from(message.data, 'base64').toString();
    const messageData = JSON.parse(messageDataString);

    const { fileName, template, bucket } = messageData;

    if (!fileName || !template || !bucket) {
      console.error('Mensaje de Pub/Sub inválido. Faltan fileName, template o bucket.', messageData);
      return; // Termina la ejecución si el mensaje no es válido
    }

    console.log(`Iniciando procesamiento para el archivo: ${fileName} con la plantilla: ${template}`);

    // 2. Extraer el texto del archivo
    console.log(`Paso 1: Extrayendo texto de gs://${bucket}/${fileName}`);
    let textoExtraido;
    try {
      // La función `extractTextFromGCSFile` espera un objeto de evento con `bucket` y `name`.
      textoExtraido = await extractTextFromGCSFile({ bucket, name: fileName });
    } catch (extractionError) {
      console.error(`Falló la extracción de texto para ${fileName}.`, extractionError);
      // Termina la ejecución para evitar llamar a Gemini con datos vacíos.
      // Podrías agregar una notificación o guardar un estado de error aquí.
      return;
    }

    if (!textoExtraido || textoExtraido.trim() === '') {
        console.warn(`No se extrajo texto del archivo ${fileName}. Proceso terminado.`);
        // Opcional: Guardar un estado de "fallido" en la base de datos.
        return;
    }

    console.log(`Paso 2: Texto extraído (${textoExtraido.length} caracteres). Llamando a Gemini...`);
    // Limitar el texto para no exceder los límites de la API
    const textoLimitado = textoExtraido.substring(0, 15000);

    // 3. Generar el formulario con Gemini
    const formularioGenerado = await llamarGemini(textoLimitado, template);

    console.log(`Paso 3: Formulario generado con éxito para ${fileName}.`);
    console.log(JSON.stringify(formularioGenerado, null, 2));

    // 4. (PASO SIGUIENTE) Guardar el resultado en Firestore
    // await firestore.collection('formularios').doc(fileName).set({
    //   ...formularioGenerado,
    //   status: 'completado',
    //   createdAt: new Date(),
    // });
    console.log(`Proceso completado para ${fileName}.`);

  } catch (error) {
    console.error('Error catastrófico en processFile:', error);
    // Aquí podrías implementar lógica de reintentos o notificar un fallo permanente.
  }
};