// src/components/FileUploader/FileUploader.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUploader from './FileUploader';

// Mock de fetch global
global.fetch = jest.fn();

describe('FileUploader Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renderiza correctamente el componente', () => {
    render(<FileUploader />);
    
    expect(screen.getByText('Subir Documento')).toBeInTheDocument();
    expect(screen.getByText('Haz clic para subir')).toBeInTheDocument();
    expect(screen.getByText('o arrastra y suelta')).toBeInTheDocument();
  });

  test('muestra los formatos de archivo permitidos', () => {
    render(<FileUploader />);
    
    expect(screen.getByText(/.txt, .pdf, .jpg, .png, .doc, .docx/)).toBeInTheDocument();
  });

  test('muestra error al seleccionar un archivo no permitido', async () => {
    render(<FileUploader />);
    
    const fileInput = screen.getByLabelText(/Selecciona un archivo/);
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/octet-stream' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText(/Extensión no permitida/)).toBeInTheDocument();
    });
  });

  test('muestra error al seleccionar un archivo demasiado grande', async () => {
    render(<FileUploader />);
    
    const fileInput = screen.getByLabelText(/Selecciona un archivo/);
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText(/El archivo excede el tamaño máximo permitido/)).toBeInTheDocument();
    });
  });

  test('muestra información del archivo seleccionado válido', async () => {
    render(<FileUploader />);
    
    const fileInput = screen.getByLabelText(/Selecciona un archivo/);
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByText('12 Bytes')).toBeInTheDocument();
    });
  });

  test('inicia la carga del archivo cuando se hace clic en el botón', async () => {
    // Mock de respuestas de fetch
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          signedUrl: 'https://example.com/signed-url',
          fileUrl: 'https://example.com/file-url'
        }),
      })
    ).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    ).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    );

    render(<FileUploader />);
    
    const fileInput = screen.getByLabelText(/Selecciona un archivo/);
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
    
    const uploadButton = screen.getByText('Subir Archivo');
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText('Subiendo...')).toBeInTheDocument();
    });
  });

  test('muestra mensaje de éxito cuando la carga se completa', async () => {
    // Mock de respuestas de fetch
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          signedUrl: 'https://example.com/signed-url',
          fileUrl: 'https://example.com/file-url'
        }),
      })
    ).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    ).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    );

    render(<FileUploader />);
    
    const fileInput = screen.getByLabelText(/Selecciona un archivo/);
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
    
    const uploadButton = screen.getByText('Subir Archivo');
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText('¡Archivo subido exitosamente!')).toBeInTheDocument();
    });
  });

  test('reinicia el estado al hacer clic en Limpiar', async () => {
    render(<FileUploader />);
    
    const fileInput = screen.getByLabelText(/Selecciona un archivo/);
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
    
    const clearButton = screen.getByText('Limpiar');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });
});