/**
 * Endpoint para devolver la lista de plantillas HTML disponibles
 * GET /templates
 */

const getTemplatesHandler = (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error al generar la lista de plantillas:', error);
    res.status(500).json({ success: false, error: 'Error interno al obtener las plantillas.' });
  }
};

/**
 * Endpoint de simulación para devolver un formulario de ejemplo.
 * GET /generarFormularioSimulado
 * (Lógica de Gemini simulada, debes agregar tu API real)
 */
const generarFormularioHandler = async (req, res) => {
  // Como esta es una ruta GET para simulación, no hay req.body.
  // Devolvemos directamente un formulario de ejemplo.
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

module.exports = {
  getTemplates: getTemplatesHandler,
  generarFormulario: generarFormularioHandler,
};
