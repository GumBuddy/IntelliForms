import React, { useState, useEffect, useCallback } from 'react';
import './FileGenerator.css';
import { get, post } from './Services/api'; // Importar los métodos del servicio centralizado

// --- Subcomponente para renderizar el formulario dinámico ---
const DynamicForm = ({ formData }) => {
    const { titulo, campos } = formData;

    return (
        <>
            <h3 className="form-title">{titulo}</h3>
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
                const data = await get('/getTemplates'); // Usar el servicio centralizado
                if (!data.success) {
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
            // Para enviar FormData, no podemos usar nuestro 'post' helper que asume JSON.
            // Hacemos un fetch directo aquí, pero asegurándonos de que la URL es correcta.
            const response = await fetch('/api/generarFormularioHttp', {
                method: 'POST',
                body: formData,
                // No establecemos 'Content-Type', el navegador lo hará por nosotros para FormData.
                headers: { 'x-api-key': process.env.REACT_APP_API_KEY || '' }
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
        <div className="app-container">
            <header className="app-header">
                <div>
                    <h1 className="app-title">IntelliForms</h1>
                    <p className="app-subtitle">Generación Automática de Formularios</p>
                </div>
            </header>

            <div className="main-content">
                <div className="card upload-section">
                    <h2 className="section-title"><span className="step-number">1</span> Sube tu Documento</h2>
                    <div
                        className={`drop-zone ${isDragOver ? 'dragover' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('archivo-input').click()}
                    >
                        <input
                            type="file"
                            id="archivo-input"
                            onChange={(e) => handleFileChange(e.target.files[0])}
                            hidden
                        />
                        <div className="drop-icon">📄</div>
                        <div className="drop-text">Arrastra y suelta un documento aquí</div>
                        <div className="drop-or">o</div>
                        <label htmlFor="archivo-input" className="file-input-label">Selecciona un archivo</label>
                    </div>
                    <div className="file-types-info">Soportado: .pdf, .docx, .txt, .png, .jpg</div>
                </div>

                <div className="card generate-section">
                    <h2 className="section-title"><span className="step-number">2</span> Configura y Genera</h2>
                    <div className="config-item">
                        <label htmlFor="plantilla-select" className="config-label">Selecciona una Plantilla</label>
                        <select
                            id="plantilla-select"
                            className="styled-select"
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                        >
                            <option value="" disabled>-- Elige un diseño --</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                    </div>
                    <button
                        id="generar-btn"
                        className="generate-button"
                        onClick={handleGenerateClick}
                        disabled={isGenerateButtonDisabled}
                    >
                        {getButtonContent()}
                    </button>
                </div>

                <div className="card result-section">
                    <h2 className="section-title"><span className="step-number">3</span> Resultado</h2>
                    {status.message && (
                        <div id="mensaje-estado" className={`mensaje ${status.type}`}>
                            {status.message}
                        </div>
                    )}
                    <div id="formulario-generado">
                        {generatedForm ? <DynamicForm formData={generatedForm} /> : <div className="placeholder-text">El formulario generado aparecerá aquí.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileGenerator;
