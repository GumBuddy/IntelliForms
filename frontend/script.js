// --- Exportar formulario generado como HTML autocontenido ---
const exportarBtn = document.getElementById('exportar-html-btn');
const formularioGenerado = document.getElementById('formulario-generado');

function getStyleSheetLinks() {
	// Extrae los <link rel="stylesheet"> del head para incluirlos en el HTML exportado
	const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
	return links.map(link => `<link rel="stylesheet" href="${link.href}">`).join('\n');
}

function getInlineStyles() {
	// Extrae los <style> del head para incluirlos en el HTML exportado
	const styles = Array.from(document.querySelectorAll('style'));
	return styles.map(style => `<style>${style.innerHTML}</style>`).join('\n');
}

function exportarFormularioComoHTML() {
	if (!formularioGenerado || !formularioGenerado.innerHTML.trim()) {
		alert('No hay formulario generado para exportar.');
		return;
	}
	const htmlContent = `<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Formulario Exportado</title>\n${getStyleSheetLinks()}\n${getInlineStyles()}\n</head>\n<body>\n<div id=\"formulario-generado\">\n${formularioGenerado.innerHTML}\n</div>\n</body>\n</html>`;
	const blob = new Blob([htmlContent], { type: 'text/html' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'formulario.html';
	document.body.appendChild(a);
	a.click();
	setTimeout(() => {
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, 100);
}

if (exportarBtn) {
	exportarBtn.addEventListener('click', exportarFormularioComoHTML);
}

// Mostrar/ocultar el botón según si hay formulario generado
function toggleExportarBtn() {
	if (formularioGenerado && formularioGenerado.innerHTML.trim()) {
		exportarBtn.style.display = 'block';
	} else {
		exportarBtn.style.display = 'none';
	}
}

// Llama a toggleExportarBtn() cada vez que se genera un formulario
// (Asegúrate de llamar a esta función después de renderizar el formulario)
// Ejemplo: después de formularioGenerado.innerHTML = ...
// toggleExportarBtn();

// --- Integración automática: observar cambios en el formulario generado ---
if (formularioGenerado) {
	const observer = new MutationObserver(() => {
		toggleExportarBtn();
	});
	observer.observe(formularioGenerado, { childList: true, subtree: true });
}
