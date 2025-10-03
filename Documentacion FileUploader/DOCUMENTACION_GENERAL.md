# Documentación General del Código IntelliForms

## Índice
- [Frontend](#frontend)
  - [FileUploader](#fileuploader)
  - [Plantillas](#plantillas)
  - [Servicios](#servicios)
- [Backend](#backend)
  - [Funciones Cloud](#funciones-cloud)
  - [Extracción de texto](#extraccion-de-texto)
- [Pruebas](#pruebas)
- [Requisitos y dependencias](#requisitos-y-dependencias)

---

## Frontend

### FileUploader
Componente React para subir archivos a Google Cloud Storage usando URLs firmadas. 

**Características:**
- Soporta .txt, .pdf, .jpg, .png, .doc, .docx
- Validación de tipo, extensión y tamaño (10MB)
- Progreso visual de carga
- Manejo robusto de errores
- Notificación al backend tras la subida
- Código documentado con JSDoc y buenas prácticas

**Estructura:**
```
frontend/Components/FileUploader/
├── FileUploader.jsx        # Componente principal
├── FileUploader.test.jsx  # Pruebas unitarias
├── index.jsx              # Exportación
├── README.md              # Documentación
```

**Flujo:**
1. Usuario selecciona archivo
2. Validación local
3. Solicita URL firmada al backend
4. Sube archivo a GCS
5. Notifica al backend para procesamiento

### Plantillas
Las plantillas HTML para formularios se encuentran en:
```
frontend/templates/
├── Plantilla 1.html
├── Plantilla 2.html
├── Plantilla 3.html
```
Estas pueden ser seleccionadas y renderizadas dinámicamente en la UI.

### Servicios
- `frontend/Services/api.js`: Servicio base para llamadas HTTP al backend.
- `frontend/Services/storageService.js`: Lógica para solicitar URLs firmadas, subir archivos y notificar procesamiento.

---

## Backend

### Funciones Cloud
- `generateUploadUrl`: Genera URLs firmadas para subida segura a GCS. Protegida por API key.
- `notifyFileUploaded`: Notifica y dispara procesamiento tras la subida.
- `extractTextFromGCSFile`: Trigger de almacenamiento, extrae texto de archivos subidos (.txt, .pdf, .doc, .docx, .png, .jpg).
- `extractTextFromGCSFileHttp`: Endpoint HTTP para extraer texto manualmente (POST con bucket y fileName).

**Estructura:**
```
backend/funtions/
├── index.js                  # Exporta todas las funciones
├── scr/
│   ├── generateUploadUrl.js
│   ├── notifyFileUploaded.js
│   ├── extractTextFromGCSFile.js
│   └── ...
├── package.json
```

### Extracción de texto
Ver sección detallada en el README principal. Usa pdf-parse, mammoth y Cloud Vision API según el tipo de archivo.

---

## Pruebas
- Frontend: `FileUploader.test.jsx` con React Testing Library
- Backend: Pruebas Jest/Supertest para funciones principales

---

## Requisitos y dependencias
- Node.js >= 16
- React
- @google-cloud/storage, @google-cloud/vision, pdf-parse, mammoth (backend)
- API Key para funciones protegidas
- Permisos adecuados en Google Cloud

---

## Notas de implementación
- El frontend y backend están desacoplados y se comunican por HTTP
- El flujo de subida y procesamiento es seguro y escalable
- Toda la lógica está documentada y estructurada para facilitar el mantenimiento

---

> Para detalles específicos de cada componente, revisa los archivos README.md y los comentarios JSDoc en el código fuente.
