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

module.exports = {
  getTemplates: getTemplatesHandler
};
