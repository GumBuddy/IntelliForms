# Extracción de texto desde archivos en Google Cloud Storage

## Función extractTextFromGCSFile

Esta función Cloud extrae texto de archivos subidos a un bucket de Google Cloud Storage. Soporta .txt, .pdf, .doc, .docx, .png, .jpg.

### Modos de uso

#### 1. Trigger automático (recomendado)
Se activa automáticamente cuando se sube un archivo al bucket configurado. Ideal para procesamiento en background.

**Configuración:**
- Despliega la función con trigger de almacenamiento (Storage Trigger) en el bucket deseado.
- Asegúrate de que la cuenta de servicio tenga permisos de lectura en el bucket y acceso a Cloud Vision API.

#### 2. Endpoint HTTP manual
Puedes invocar la función manualmente enviando una petición POST a `extractTextFromGCSFileHttp`:

**URL:**
```
https://REGION-PROJECT.cloudfunctions.net/extractTextFromGCSFileHttp
```

**Body (JSON):**
```
{
   "bucket": "nombre-del-bucket",
   "fileName": "ruta/del/archivo.ext"
}
```

**Respuesta:**
```
{
   "success": true,
   "text": "Texto extraído..."
}
```

### Dependencias necesarias
- @google-cloud/storage
- @google-cloud/vision
- pdf-parse
- mammoth

Instala con:
```
npm install @google-cloud/storage @google-cloud/vision pdf-parse mammoth
```

### Permisos y APIs
- Habilita Cloud Storage y Cloud Vision API en tu proyecto de Google Cloud.
- La cuenta de servicio debe tener permisos de lectura en el bucket y acceso a Vision API.

### Notas
- Para .doc/.docx se extrae texto plano (sin formato).
- Para imágenes, se realiza OCR con Vision API.
- El trigger automático es ideal para flujos serverless; el endpoint HTTP es útil para pruebas o integración directa con frontend.
# IntelliForms

Sistema para la carga y procesamiento de archivos usando Google Cloud Functions y Google Cloud Storage.

## Estructura
- **backend/**: Funciones serverless (Node.js) para generación de URLs firmadas y notificación post-upload.
- **frontend/**: React app con componente FileUploader y servicios para interactuar con el backend.

## Despliegue Backend
1. Instala dependencias:
   ```sh
   cd backend/funtions
   npm install
   ```
2. Configura variables de entorno (ver `.env.example`).
3. Despliega funciones:
   ```sh
   npm run deploy
   ```

## Despliegue Frontend
1. Instala dependencias:
   ```sh
   cd frontend
   npm install
   ```
2. Configura variables de entorno (ver `.env.example`).
3. Inicia la app:
   ```sh
   npm start
   ```

## Pruebas
- Backend: `npm test` en `backend/funtions`.
- Frontend: `npm test` en `frontend`.

## Variables de entorno
Ver `.env.example` para ambos entornos.
