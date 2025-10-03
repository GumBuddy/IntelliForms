/**
 * Servicio para interactuar con el backend de almacenamiento
 * 
 * Este módulo proporciona funciones para comunicarse con el backend
 * de Google Cloud Functions, específicamente para operaciones relacionadas
 * con el almacenamiento de archivos.
 * 
 * @module storageService
 */

// URL base del API backend, configurable a través de variables de entorno
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://tu-region-tu-proyecto.cloudfunctions.net';

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
  try {
    // Construir la URL completa del endpoint
    const endpointUrl = `${API_BASE_URL}/generateUploadUrl`;
    // Realizar la solicitud POST al backend
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.REACT_APP_API_KEY || ''
      },
      body: JSON.stringify({
        fileName,
        fileExtension,
        fileSize
      })
    });

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      // Intentar obtener el mensaje de error del cuerpo de la respuesta
      let errorMessage = 'Error al solicitar URL de subida';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // Si no se puede parsear la respuesta, usar el mensaje genérico
        console.error('Error al parsear respuesta de error:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    // Parsear la respuesta JSON
    const result = await response.json();
    
    // Verificar si la operación fue exitosa
    if (!result.success) {
      throw new Error(result.error || 'Error desconocido al generar URL de subida');
    }
    
    // Devolver los datos relevantes de la respuesta
    return {
      signedUrl: result.signedUrl,
      fileName: result.fileName,
      mimeType: result.mimeType,
      expirationTime: result.expirationTime
    };
  } catch (error) {
    console.error('Error en requestUploadUrl:', error);
    
    // Propagar el error para que el componente lo maneje
    throw error;
  }
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
export const notifyFileProcessing = async (fileName, fileUrl, fileType) => {
  try {
    // Construir la URL completa del endpoint
    const endpointUrl = `${API_BASE_URL}/notifyFileUploaded`;
    // Realizar la solicitud POST al backend
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.REACT_APP_API_KEY || ''
      },
      body: JSON.stringify({
        fileName,
        fileUrl,
        fileType
      })
    });

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      // Intentar obtener el mensaje de error del cuerpo de la respuesta
      let errorMessage = 'Error al iniciar el procesamiento del archivo';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // Si no se puede parsear la respuesta, usar el mensaje genérico
        console.error('Error al parsear respuesta de error:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    // Parsear la respuesta JSON
    const result = await response.json();
    
    // Verificar si la operación fue exitosa
    if (!result.success) {
      throw new Error(result.error || 'Error desconocido al iniciar procesamiento');
    }
    
    // Devolver los datos relevantes de la respuesta
    return result;
  } catch (error) {
    console.error('Error en notifyFileProcessing:', error);
    
    // Propagar el error para que el componente lo maneje
    throw error;
  }
};