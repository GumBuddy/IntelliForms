/**
 * Servicio para interactuar con el backend de almacenamiento
 * 
 * Este módulo proporciona funciones para comunicarse con el backend
 * de Google Cloud Functions, específicamente para operaciones relacionadas
 * con el almacenamiento de archivos.
 * 
 * @module storageService
 */

import { post } from './api'; // Importar el método POST centralizado

/**
 * Solicita una URL firmada para subir un archivo
 * 
 * Esta función envía una solicitud POST al backend para obtener una URL firmada
 * que permita subir un archivo directamente a Google Cloud Storage.
 * 
 * @param {string} fileName - Nombre del archivo sin extensión
 * @param {string} fileExtension - Extensión del archivo (ej: '.pdf', '.txt')
 * @returns {Promise<Object>} - Promesa que resuelve con un objeto que contiene:
 *   - signedUrl: URL firmada para subir el archivo
 *   - fileName: Nombre completo del archivo
 *   - mimeType: Tipo MIME del archivo
 *   - expirationTime: Fecha de expiración de la URL
 * @throws {Error} - Si hay un error en la solicitud o respuesta del servidor
 */
export const requestUploadUrl = async (fileName, fileExtension, fileSize) => {
  const result = await post('/generateUploadUrl', {
    fileName,
    fileExtension,
    fileSize
  }, {
    headers: {
      'x-api-key': process.env.REACT_APP_API_KEY || ''
    }
  });

  if (result.success) {
    // Devolver los datos relevantes de la respuesta
    return {
      signedUrl: result.signedUrl,
      fileName: result.fileName,
      mimeType: result.mimeType,
      expirationTime: result.expirationTime
    };
  }

  throw new Error(result.error || 'Error desconocido al generar URL de subida');
};

/**
 * Sube un archivo a Google Cloud Storage usando una URL firmada
 * 
 * @param {File} file - Archivo a subir
 * @param {string} signedUrl - URL firmada para la subida
 * @param {Function} onProgress - Callback para reportar progreso (opcional)
 * @returns {Promise<void>} - Promesa que se resuelve cuando la subida se completa
 * @throws {Error} - Si hay un error durante la subida
 */
export const uploadFileToStorage = (file, signedUrl, onProgress = null) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Configurar manejadores de eventos
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Error al subir archivo: ${xhr.statusText}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Error de red al subir archivo'));
    });
    
    xhr.addEventListener('abort', () => {
      reject(new Error('Subida de archivo cancelada'));
    });
    
    // Configurar y enviar la solicitud
    xhr.open('PUT', signedUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};

/**
 * Notifica al backend que el archivo está listo para ser procesado
 * 
 * @param {string} fileName - Nombre del archivo
 * @param {string} fileUrl - URL pública del archivo
 * @param {string} fileType - Tipo MIME del archivo
 * @returns {Promise<Object>} - Promesa que resuelve con la respuesta del servidor
 * @throws {Error} - Si hay un error en la solicitud o respuesta del servidor
 */
export const notifyFileProcessing = async (fileName, template) => {
  const result = await post('/notifyFileUploaded', {
    fileName,
    template
  }, {
    headers: {
      'x-api-key': process.env.REACT_APP_API_KEY || ''
    }
  });

  if (result.success) {
    return result;
  }

  throw new Error(result.error || 'Error desconocido al iniciar procesamiento');
};