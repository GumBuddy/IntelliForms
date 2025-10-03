import React, { useState, useRef } from 'react';
import { requestUploadUrl, uploadFileToStorage, notifyFileProcessing } from '../../Services/storageService';

/**
 * Componente para subir documentos a Google Cloud Storage mediante Signed URLs
 * Soporta formatos: .txt, .pdf, .jpg, .png, .doc, .docx
 * 
 * @component
 * @example
 * <FileUploader />
 */
const FileUploader = () => {
  // Estados del componente
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const fileInputRef = useRef(null);

  // Configuración de archivos permitidos
  const ALLOWED_FILE_TYPES = [
    'text/plain', // .txt
    'application/pdf', // .pdf
    'image/jpeg', // .jpg
    'image/png', // .png
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ];
  
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB en bytes
  const ALLOWED_EXTENSIONS = ['.txt', '.pdf', '.jpg', '.png', '.doc', '.docx'];

  /**
   * Maneja la selección de archivos
   * @param {Event} event - Evento de cambio del input de archivo
   */
  const handleFileSelection = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      resetUploader();
      return;
    }

    // Validar extensión de archivo
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setErrorMessage(`Extensión no permitida. Solo se aceptan: ${ALLOWED_EXTENSIONS.join(', ')}`);
      resetUploader();
      return;
    }
    
    // Validar tipo MIME
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrorMessage('Tipo de archivo no permitido. Verifica el formato del archivo.');
      resetUploader();
      return;
    }
    
    // Validar tamaño de archivo
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`El archivo excede el tamaño máximo permitido (${formatFileSize(MAX_FILE_SIZE)})`);
      resetUploader();
      return;
    }
    
    // Si pasa todas las validaciones
    setErrorMessage('');
    setSelectedFile(file);
    setUploadStatus('idle');
  };

  /**
   * Inicia el proceso de carga del archivo
   */
  const initiateFileUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Por favor selecciona un archivo para subir');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Obtener extensión del archivo
      const fileNameParts = selectedFile.name.split('.');
      const extension = fileNameParts.length > 1 
        ? `.${fileNameParts[fileNameParts.length - 1]}` 
        : '';
      
      // Obtener nombre del archivo sin extensión
      const baseName = fileNameParts.slice(0, -1).join('.');
      
  // Paso 1: Obtener la Signed URL desde la Cloud Function
  const { signedUrl, fileName } = await requestUploadUrl(baseName || 'uploaded_file', extension, selectedFile.size);
      
      // Paso 2: Subir el archivo a GCS usando la Signed URL
      await uploadFileToStorage(selectedFile, signedUrl, (progress) => {
        setUploadProgress(progress);
      });
      
      // Construir la URL pública del archivo (esto depende de tu configuración de GCS)
      const fileUrl = `https://storage.googleapis.com/${process.env.REACT_APP_GCS_BUCKET_NAME || 'intelliforms-uploads'}/${fileName}`;
      
      // Paso 3: Notificar al backend que el archivo se ha subido correctamente
      await notifyFileProcessing(fileName, fileUrl, selectedFile.type);
      
      // Marcar como completado exitosamente
      setUploadStatus('success');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error durante la carga del archivo:', error);
      // Manejo de errores global: mostrar notificación y resetear uploader
      setErrorMessage(error.message || 'Ocurrió un error durante la carga del archivo');
      setUploadStatus('error');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Formatea el tamaño de archivo a formato legible
   * @param {number} bytes - Tamaño en bytes
   * @returns {string} Tamaño formateado
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Reinicia el estado del componente
   */
  const resetUploader = () => {
    setSelectedFile(null);
    setErrorMessage('');
    setUploadStatus('idle');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Subir Documento</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecciona un archivo ({ALLOWED_EXTENSIONS.join(', ')})
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
              </p>
              <p className="text-xs text-gray-500">
                {ALLOWED_EXTENSIONS.join(', ')} (máx. {formatFileSize(MAX_FILE_SIZE)})
              </p>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={handleFileSelection}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {selectedFile && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button 
              onClick={resetUploader}
              className="text-gray-400 hover:text-gray-500"
              disabled={isUploading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={initiateFileUpload}
          disabled={isUploading || !selectedFile}
          className={`flex-1 py-3 px-4 rounded-md text-white font-medium ${
            isUploading || !selectedFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200`}
        >
          {isUploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subiendo...
            </span>
          ) : (
            'Subir Archivo'
          )}
        </button>

        <button
          onClick={resetUploader}
          disabled={isUploading}
          className="py-3 px-4 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors duration-200"
        >
          Limpiar
        </button>
      </div>

      {isUploading && (
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1 text-center">{uploadProgress}% completado</p>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            <span>¡Archivo subido exitosamente! Procesando documento...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;