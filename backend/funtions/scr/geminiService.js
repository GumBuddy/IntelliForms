/**
 * Servicio para llamar a la API de Gemini y generar un formulario dinámico a partir de texto extraído.
 * @module geminiService
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { app } = require('./scr/api');

let genAI; // Declarar pero no inicializar

/**
 * Llama a la API de Gemini y devuelve un JSON con la estructura del formulario generado.
 * @param {string} texto - Texto extraído del documento.
 * @param {string} plantilla - Nombre de la plantilla seleccionada.
 * @returns {Promise<Object>} Objeto con la estructura del formulario generado.
 */
async function llamarGemini(texto, plantilla) {
    try {
        // Inicializar el cliente de Gemini si aún no existe (Lazy Initialization)
        if (!genAI) {
            genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Eres un generador de formularios experto. Analiza el siguiente texto y devuelve un JSON con los campos necesarios para un formulario dinámico.\n\nConsidera la plantilla \"${plantilla}\" para generar el formulario.\n\nEl JSON debe tener la siguiente estructura:\n{\n  \"titulo\": \"Título del formulario\",\n  \"campos\": [\n    {\n      \"id\": \"identificador_unico\",\n      \"etiqueta\": \"Etiqueta visible para el usuario\",\n      \"tipo\": \"texto|email|numero|textarea|select|radio|checkbox\",\n      \"requerido\": true|false,\n      \"placeholder\": \"Texto de ayuda (opcional)\",\n      \"opciones\": [\n        {\"valor\": \"valor1\", \"texto\": \"Texto visible 1\"},\n        {\"valor\": \"valor2\", \"texto\": \"Texto visible 2\"}\n      ] // Solo para select, radio y checkbox\n    }\n  ]\n}\n\nInstrucciones:\n1. Genera un título descriptivo para el formulario basado en el contenido del texto.\n2. Extrae las entidades principales del texto y conviértelas en campos del formulario.\n3. Asigna tipos de campo adecuados según la naturaleza de la información:\n   - \"texto\" para nombres, apellidos, direcciones\n   - \"email\" para correos electrónicos\n   - \"numero\" para edades, cantidades, teléfonos\n   - \"textarea\" para comentarios, descripciones largas\n   - \"select\" para opciones mutuamente excluyentes\n   - \"radio\" para opciones limitadas (3-5)\n   - \"checkbox\" para múltiples selecciones\n4. Marca como requeridos los campos que son esenciales según el contexto.\n5. Para campos de selección, proporciona opciones razonables basadas en el contexto.\n\nTexto a analizar:\n\"\"\"\n ${texto}\n\"\"\"\n\nDevuelve únicamente el JSON sin ningún texto adicional, explicación o formato markdown.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        let jsonStr = responseText.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/```json\n?/, '');
        }
        if (jsonStr.endsWith('```')) {
            jsonStr = jsonStr.replace(/\n?```$/, '');
        }
        try {
            const formulario = JSON.parse(jsonStr);
            if (!formulario.titulo || !formulario.campos || !Array.isArray(formulario.campos)) {
                throw new Error('La estructura del JSON no es válida');
            }
            formulario.campos.forEach((campo, index) => {
                if (!campo.id || !campo.etiqueta || !campo.tipo) {
                    throw new Error(`El campo ${index} no tiene la estructura requerida`);
                }
                const tiposPermitidos = ['texto', 'email', 'numero', 'textarea', 'select', 'radio', 'checkbox'];
                if (!tiposPermitidos.includes(campo.tipo)) {
                    throw new Error(`El campo ${campo.id} tiene un tipo no permitido: ${campo.tipo}`);
                }
                if (['select', 'radio', 'checkbox'].includes(campo.tipo)) {
                    if (!campo.opciones || !Array.isArray(campo.opciones) || campo.opciones.length === 0) {
                        throw new Error(`El campo ${campo.id} necesita opciones válidas`);
                    }
                    campo.opciones.forEach((opcion, opIndex) => {
                        if (!opcion.valor || !opcion.texto) {
                            throw new Error(`La opción ${opIndex} del campo ${campo.id} no es válida`);
                        }
                    });
                }
            });
            return formulario;
        } catch (parseError) {
            console.error('Error al parsear JSON de Gemini:', parseError);
            console.error('Respuesta recibida:', responseText);
            throw new Error('La respuesta de Gemini no es un JSON válido');
        }
    } catch (error) {
        console.error('Error al llamar a Gemini:', error);
        if (error.message.includes('API_KEY_INVALID')) {
            throw new Error('La clave de API de Gemini no es válida');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
            throw new Error('Se ha excedido la cuota de la API de Gemini');
        } else if (error.message.includes('SAFETY')) {
            throw new Error('El contenido ha sido bloqueado por las políticas de seguridad de Gemini');
        } else {
            throw new Error(`Error al generar el formulario: ${error.message}`);
        }
    }
}

exports.api = app;
module.exports = { llamarGemini };
