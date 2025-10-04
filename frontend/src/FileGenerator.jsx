import React, { useState, useEffect, useCallback } from 'react';
import './FileGenerator.css'; // Asegúrate de tener un archivo CSS con los estilos necesarios

// --- Subcomponente para renderizar el formulario dinámico ---
const DynamicForm = ({ formData }) => {
    const { titulo, campos } = formData;

    return (
        <>
            <h3>{titulo}</h3>
            {campos.map((campo) => {
                const { id, etiqueta, tipo, placeholder, requerido, opciones } = campo;
                const formGroup = (
                    <div className="form-group" key={id}>
                        <label htmlFor={id}>
                            {etiqueta}
                            {requerido && <span className="required">*</span>}
                        </label>
                        {tipo === 'textarea' ? (
                            <textarea id={id} name={id} placeholder={placeholder || ''} required={requerido} />
                        ) : (
                            <input type={tipo} id={id} name={id} placeholder={placeholder || ''} required={requerido} />
                        )}
                    </div>
                );
                return formGroup;
            })}
        </>
    );
};


// --- Componente Principal ---
const FileGenerator = () => {
    // URL del endpoint del backend
    const API_URL = '/api/generarFormularioHttp'; // Usamos el prefijo /api para el proxy
    const TEMPLATES_API_URL = '/api/getTemplates'; // Usamos el prefijo /api para el proxy

    // --- Estados del Componente ---
    const [templates, setTemplates] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [status, setStatus] = useState({ message: 'Cargando plantillas...', type: 'info' });
    const [isLoading, setIsLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [generatedForm, setGeneratedForm] = useState(null);
    const [buttonState, setButtonState] = useState('default'); // 'default', 'loading', 'generated'

    // --- Carga inicial de plantillas ---
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch(TEMPLATES_API_URL);
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'No se pudieron cargar las plantillas.');
                }
                setTemplates(data.templates);
                setStatus({ message: '', type: 'info' }); // Limpiar mensaje de carga
            } catch (error) {
                console.error('Error al cargar plantillas:', error);
                setStatus({ message: `Error al cargar plantillas: ${error.message}`, type: 'error' });
            }
        };

        fetchTemplates();
    }, []); // El array vacío asegura que se ejecute solo una vez

    // --- Manejadores de Eventos ---
    const handleFileChange = (file) => {
        if (file) {
            setSelectedFile(file);
            setStatus({ message: `Archivo "${file.name}" listo para procesar.`, type: 'success' });
            setGeneratedForm(null); // Limpiar formulario anterior al seleccionar nuevo archivo
            setButtonState('default');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };
    
    const handleGenerateClick = async () => {
        if (!selectedFile || !selectedTemplate) {
            setStatus({ message: 'Por favor, selecciona un archivo y una plantilla.', type: 'error' });
            return;
        }

        setIsLoading(true);
        setButtonState('loading');
        setGeneratedForm(null);
        setStatus({ message: 'Analizando el documento y generando preguntas...', type: 'info' });

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('plantilla', selectedTemplate);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Error del servidor: ${response.status}`);
            }
            if (!data.success) {
                throw new Error(data.error || 'El backend indicó un fallo en la operación.');
            }

            setGeneratedForm(data.formulario);
            setStatus({ message: '¡Formulario generado con éxito!', type: 'success' });
            setButtonState('generated');

        } catch (error) {
            console.error('Error al generar el formulario:', error);
            setStatus({ message: error.message, type: 'error' });
            setButtonState('default');
        } finally {
            setIsLoading(false);
        }
    };

    const isGenerateButtonDisabled = !selectedFile || !selectedTemplate || isLoading;

    const getButtonContent = () => {
        switch (buttonState) {
            case 'loading':
                return <><span className="spinner"></span> Procesando...</>;
            case 'generated':
                return <><span className="check">✔</span> Generado</>;
            default:
                return 'Generar Formulario';
        }
    };

    return (
        <div className="container">
            <h1>IntelliForms</h1>
            <p>Sube un documento y selecciona una plantilla para generar un formulario automáticamente.</p>

            {/* --- Zona de Carga de Archivos --- */}
            <div
                id="drop-zone"
                className={isDragOver ? 'dragover' : ''}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="archivo-input"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    hidden
                />
                <label htmlFor="archivo-input">
                    Arrastra y suelta un documento aquí, o <strong>haz clic para seleccionar</strong>.
                </label>
            </div>

            {/* --- Selección de Plantilla y Botón de Generación --- */}
            <div className="controls">
                <select
                    id="plantilla-select"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                    <option value="" disabled>-- Selecciona una plantilla --</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
                <button
                    id="generar-btn"
                    onClick={handleGenerateClick}
                    disabled={isGenerateButtonDisabled}
                >
                    {getButtonContent()}
                </button>
            </div>

            {/* --- Mensajes de Estado --- */}
            {status.message && (
                <div id="mensaje-estado" className={`mensaje ${status.type}`}>
                    {status.message}
                </div>
            )}

            {/* --- Contenedor del Formulario Generado --- */}
            <div id="formulario-generado">
                {generatedForm && <DynamicForm formData={generatedForm} />}
            </div>
        </div>
    );
};

export default FileGenerator;
