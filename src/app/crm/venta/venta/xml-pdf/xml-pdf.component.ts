import {Component, OnInit} from '@angular/core';
import {VentaService} from '@services/http/venta.service';
import swal from 'sweetalert2';
import {extractUuidFromCfdi, fileToDataURL, swalErrorHttpResponse, swalSuccessHttpResponse} from '@sharedUtils/shared';

interface XmlPdfData {
    documento: string;
    pdf: string;
    uuid: string;
    xml: string;
}

@Component({
    selector: 'app-xml-pdf',
    templateUrl: './xml-pdf.component.html',
    styleUrls: ['./xml-pdf.component.scss'],
})
export class XmlPdfComponent implements OnInit {

    data: XmlPdfData = {
        documento: '',
        pdf: '',
        uuid: '',
        xml: '',
    };

    readonly ALLOWED_PDF_MIMES = ['application/pdf'];
    readonly ALLOWED_XML_MIMES = ['application/xml', 'text/xml'];

    constructor(public readonly ventaService: VentaService) {
    }

    ngOnInit() {
    }

    async archivoPDF(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files[0];
        if (!file) {
            return;
        }

        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const isMimeOk = this.ALLOWED_PDF_MIMES.includes(file.type);
        const isExtOk = ext === 'pdf';

        if (!isMimeOk || !isExtOk) {
            await swal('', 'Debes proporcionar un archivo PDF válido.', 'error');
            input.value = '';
            return;
        }
        try {
            this.data.pdf = await fileToDataURL(file);
        } catch {
            await swal('', 'Error al leer el PDF.', 'error');
            input.value = '';
        }
    }

    async archivoXML(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files[0] as any;
        if (!file) {
            return;
        }

        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const isMimeOk = this.ALLOWED_XML_MIMES.includes(file.type) || !file.type; // algunos navegadores dejan vacío
        const isExtOk = ext === 'xml';

        if (!isMimeOk || !isExtOk) {
            await swal('', 'Debes proporcionar un XML válido.', 'error');
            input.value = '';
            return;
        }

        try {
            this.data.xml = await fileToDataURL(file);

            const xmlText = await file.text();
            const uuid = extractUuidFromCfdi(xmlText);

            if (uuid) {
                this.data.uuid = uuid;
            } else {
                this.data.uuid = '';
                await swal('', 'No se encontró el UUID en el XML.', 'error');
                input.value = '';
            }
        } catch {
            await swal('', 'Error al procesar el XML.', 'error');
            input.value = '';
        }
    }

    relacionar() {
        if (!this.data.documento || !this.data.pdf || !this.data.xml) {
            void swal('', 'Todos los campos (documento, PDF y XML) son obligatorios.', 'warning');
            return;
        }

        this.ventaService.relacionarPDF_XML(this.data).subscribe({
            next: swalSuccessHttpResponse,
            error: swalErrorHttpResponse
        });
    }

}
