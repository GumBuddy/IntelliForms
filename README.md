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
