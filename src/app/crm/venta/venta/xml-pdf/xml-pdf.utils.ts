export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsText(file, 'utf-8');
    });
}


export function getXmlTotal(xmlString: string): number | null {
    const doc = new DOMParser().parseFromString(xmlString, 'application/xml');

    if (doc.getElementsByTagName('parsererror').length) { return null; }

    const comprobantes = doc.getElementsByTagName('cfdi:Comprobante');
    const comprobante = comprobantes.length ? comprobantes[0] : null;

    if (!comprobante) { return null; }

    const totalAttr =
        comprobante.getAttribute('Total') || comprobante.getAttribute('total');

    if (!totalAttr) { return null; }

    const normalized = totalAttr.replace(',', '.').trim();
    const total = Number(normalized);

    return Number.isFinite(total) ? total : null;
}
