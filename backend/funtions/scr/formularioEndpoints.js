/**
 * Endpoint para devolver la lista de plantillas HTML disponibles
 * GET /templates
 */

exports.getTemplates = (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Método no permitido. Use GET.' });
    return;
  }

  // Las plantillas se definen aquí para que la función no dependa del sistema de archivos.
  // Esta es la fuente de verdad para las plantillas disponibles en el sistema.
  const availableTemplates = [
    { id: 'moderna', nombre: 'Moderna y Limpia' },
    { id: 'clasica', nombre: 'Clásica Corporativa' },
    { id: 'creativa', nombre: 'Creativa y Colorida' },
    // Puedes agregar más plantillas aquí en el futuro
    // { id: 'minimalista', nombre: 'Minimalista' }
  ];

  res.status(200).json({
    success: true,
    templates: availableTemplates
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
