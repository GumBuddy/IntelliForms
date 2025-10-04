/**
 * Servicio base para interactuar con las APIs del backend
 * 
 * Este módulo proporciona funciones genéricas para realizar solicitudes HTTP
 * a las APIs del backend, centralizando la configuración común.
 * 
 * @module api
 */

// Ahora usaremos una ruta relativa que Firebase Hosting redirigirá a nuestra función 'api'.
const API_BASE_URL = '/api';

/**
 * Realiza una solicitud HTTP al backend
 * 
 * @param {string} endpoint - Endpoint del API (ej: '/generateUploadUrl')
 * @param {Object} options - Opciones de la solicitud (método, headers, body, etc.)
 * @returns {Promise<Object>} - Promesa que resuelve con los datos de la respuesta
 * @throws {Error} - Si hay un error en la solicitud o respuesta del servidor
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    // Construir la URL completa del endpoint
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Configurar opciones predeterminadas
    const isFormData = options.body instanceof FormData;
    const defaultOptions = {
      headers: isFormData 
        ? {} // Dejar que el navegador establezca el Content-Type para FormData
        : { 'Content-Type': 'application/json' }
    };
    
    // Combinar opciones predeterminadas con las proporcionadas
    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {})
      }
    };
    
    // Realizar la solicitud
    const response = await fetch(url, config);
    
    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      // Intentar obtener el mensaje de error del cuerpo de la respuesta
      let errorMessage = `Error en la solicitud: ${response.status} ${response.statusText}`;
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
    return await response.json();
  } catch (error) {
    console.error('Error en apiRequest:', error);
    
    // Propagar el error para que el componente lo maneje
    throw error;
  }
};

/**
 * Realiza una solicitud GET al backend
 * 
 * @param {string} endpoint - Endpoint del API
 * @param {Object} params - Parámetros de la consulta (opcional)
 * @returns {Promise<Object>} - Promesa que resuelve con los datos de la respuesta
 */
export const get = (endpoint, params = {}) => {
  // Construir la cadena de consulta si hay parámetros
  const queryString = new URLSearchParams(params).toString();
  const urlWithParams = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  return apiRequest(urlWithParams, { method: 'GET' });
};

/**
 * Realiza una solicitud POST al backend
 * 
 * @param {string} endpoint - Endpoint del API
 * @param {Object} data - Datos a enviar en el cuerpo de la solicitud
 * @returns {Promise<Object>} - Promesa que resuelve con los datos de la respuesta
 */
export const post = (endpoint, data = {}) => {
  return apiRequest(endpoint, {
    method: 'POST',
    // Si es FormData, lo pasamos directamente. Si no, lo convertimos a JSON.
    body: data instanceof FormData ? data : JSON.stringify(data)
  });
};

/**
 * Realiza una solicitud PUT al backend
 * 
 * @param {string} endpoint - Endpoint del API
 * @param {Object} data - Datos a enviar en el cuerpo de la solicitud
 * @returns {Promise<Object>} - Promesa que resuelve con los datos de la respuesta
 */
export const put = (endpoint, data = {}) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

/**
 * Realiza una solicitud DELETE al backend
 * 
 * @param {string} endpoint - Endpoint del API
 * @returns {Promise<Object>} - Promesa que resuelve con los datos de la respuesta
 */
export const del = (endpoint) => {
  return apiRequest(endpoint, { method: 'DELETE' });
};