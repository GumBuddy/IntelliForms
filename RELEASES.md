# IntelliForms Releases

Este archivo documenta los lanzamientos (releases) principales del proyecto IntelliForms. Úsalo como referencia para el historial de versiones, cambios y mejoras.

---

## [v1.0.0] - 2025-10-03
### MVP Completo
- Subida de archivos (.txt, .pdf, .doc, .docx, .png, .jpg) a Google Cloud Storage mediante URLs firmadas.
- Validación de tipo, extensión y tamaño de archivo (máx. 10MB).
- Notificación al backend tras la subida para procesamiento automático.
- Extracción de texto desde archivos usando pdf-parse, mammoth y Google Cloud Vision.
- Integración real con Gemini API para generación dinámica de formularios.
- Selección de plantillas HTML y renderizado dinámico del formulario.
- Exportación/descarga del formulario generado como HTML autocontenido.
- Mensajes de estado y feedback visual en el frontend.
- Documentación de despliegue y uso.
- Pruebas unitarias backend y frontend.

---

## [v1.0.0-rc] - 2025-09-30
### Release Candidate
- Flujo completo funcional, pendiente de pulido de UI y exportación HTML.

---

## [v0.1.0] - 2025-09-15
### Primer prototipo
- Subida básica de archivos y generación simulada de formularios.
- Estructura inicial de backend y frontend.

---

> Para ver los cambios entre versiones, consulta el historial de commits o los issues/pull requests asociados.
