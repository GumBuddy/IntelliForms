# IntelliForms

IntelliForms es un sistema inteligente que genera formularios dinámicos a partir del contenido de documentos subidos. Utiliza Google Cloud Functions para el backend, Google Cloud Storage para el almacenamiento de archivos y la API de Gemini para el análisis de texto y la generación de formularios.

## Estructura
- **backend/funtions**: Contiene todas las Cloud Functions (Node.js) que componen el backend.
- **frontend**: Aplicación creada con React que constituye la interfaz de usuario.

## Arquitectura y Flujos de Trabajo

El sistema soporta dos flujos principales para la generación de formularios:

### 1. Flujo Síncrono (Directo)
Ideal para pruebas rápidas y archivos pequeños.
1.  El frontend (`FileGenerator.jsx`) envía el archivo y la plantilla directamente al endpoint `generarFormularioHttp`.
2.  Esta función extrae el texto del archivo en memoria, llama a la API de Gemini y devuelve la estructura del formulario en la misma respuesta HTTP.

### 2. Flujo Asíncrono (Escalable)
Recomendado para producción y archivos grandes, ya que es más robusto y no bloquea al usuario.
1.  El frontend solicita una **URL firmada** al endpoint `generateUploadUrl`.
2.  Con la URL obtenida, el frontend sube el archivo directamente a **Google Cloud Storage**.
3.  Una vez subido, el frontend notifica al endpoint `notifyFileUploaded`.
4.  `notifyFileUploaded` publica un mensaje en un tema de **Pub/Sub** con los detalles del archivo.
5.  La función `processFile` se activa al recibir el mensaje de Pub/Sub, orquestando la extracción de texto (`extractTextFromGCSFile`) y la llamada a Gemini (`geminiService`).
6.  *(Futuro)* El resultado se guarda en una base de datos (ej. Firestore) para que el frontend pueda consultarlo.

## Endpoints Principales del Backend

- `generarFormularioHttp`: (POST) Procesa un archivo enviado como `multipart/form-data` y devuelve un formulario.
- `generateUploadUrl`: (POST) Genera una URL segura para subir un archivo a GCS.
- `notifyFileUploaded`: (POST) Notifica al sistema que un archivo ha sido subido e inicia el procesamiento asíncrono.
- `processFile`: (Pub/Sub Trigger) Procesa el archivo en segundo plano.

## Despliegue Backend
1. Instala dependencias:
   ```sh
   cd backend/funtions
   npm install
   ```
2. Configura tus variables de entorno en un archivo `.env.yaml` (o similar para Google Cloud).
3. Despliega funciones:
   ```sh
   gcloud functions deploy NOMBREDELAFUNCION --trigger...
   ```

## Despliegue Frontend
1. Instala dependencias:
   ```sh
   cd frontend
   npm install
   ```
2. Configura las variables de entorno en un archivo `.env` (ver `.env.example`).
3. Inicia la app en modo desarrollo:
   ```sh
   npm start
   ```
4. Para producción, genera los archivos estáticos:
   ```sh
   npm run build
   ```

## Pruebas
- Backend: `npm test` en `backend/funtions`.
- Frontend: `npm test` en `frontend`.

## Variables de entorno
Revisa los archivos `.env.example` en las carpetas `backend/funtions` y `frontend` para ver las variables requeridas.
