# FileUploader

Componente para subir documentos a Google Cloud Storage mediante Signed URLs.

## Características

- Soporte para múltiples formatos de archivo: .txt, .pdf, .jpg, .png, .doc, .docx
- Validación completa de archivos (tipo, extensión y tamaño)
- Interfaz de usuario intuitiva con arrastrar y soltar
- Indicador visual de progreso durante la carga
- Manejo robusto de errores con mensajes claros
- Diseño responsivo para dispositivos móviles y escritorio

## Uso básico

```jsx
import FileUploader from './components/FileUploader';

function MyComponent() {
  return (
    <div>
      <h1>Sube tu documento</h1>
      <FileUploader />
    </div>
  );
}