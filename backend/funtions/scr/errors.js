/**
 * @fileoverview Clases de error personalizadas para la aplicación.
 */

/**
 * Error para tipos de archivo no soportados.
 */
class UnsupportedFileTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsupportedFileTypeError';
  }
}

module.exports = {
  UnsupportedFileTypeError,
};