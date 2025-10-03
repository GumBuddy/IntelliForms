/**
 * Endpoint para devolver la lista de plantillas HTML disponibles
 * GET /templates
 */
const fs = require('fs');
const path = require('path');

exports.getTemplates = (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Método no permitido. Use GET.' });
    return;
  }
  const templatesDir = path.join(__dirname, '../../frontend/templates');
  fs.readdir(templatesDir, (err, files) => {
    if (err) {
      res.status(500).json({ success: false, error: 'No se pudieron leer las plantillas.' });
      return;
    }
    // Solo archivos .html
    const templates = files.filter(f => f.endsWith('.html')).map((f, i) => ({ id: f, nombre: f.replace('.html', '') }));
    res.status(200).json(templates);
  });
};

/**
 * Endpoint para recibir archivo y plantilla, extraer texto y generar formulario con Gemini
 * POST /api/generar-formulario
 * (Lógica de Gemini simulada, debes agregar tu API real)
 */
exports.generarFormulario = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Método no permitido. Use POST.' });
    return;
  }
  // Aquí deberías usar un middleware tipo multer para manejar archivos
  // Simulación: extraer campos del body
  const { plantilla } = req.body;
  // Simular extracción de texto y llamada a Gemini
  const textoExtraido = 'Texto extraído del archivo (simulado)';
  // Simular respuesta de Gemini
  const formularioData = {
    titulo: 'Formulario Generado',
    campos: [
      { id: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true },
      { id: 'email', etiqueta: 'Correo Electrónico', tipo: 'email', requerido: true },
      { id: 'comentarios', etiqueta: 'Comentarios', tipo: 'textarea', requerido: false }
    ]
  };
  res.status(200).json(formularioData);
};
