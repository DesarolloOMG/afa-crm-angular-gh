import {Component, OnInit} from '@angular/core';
import {VentaService} from '@services/http/venta.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-xml-pdf',
    templateUrl: './xml-pdf.component.html',
    styleUrls: ['./xml-pdf.component.scss']
})
export class XmlPdfComponent implements OnInit {

    data = {
        documento: '',
        pdf: '',
        uuid: '',
        xml: '',
    };

    constructor(public readonly ventaService: VentaService) {
    }

    ngOnInit() {
    }

    archivoPDF(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                this.data.pdf = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    async archivoXML(event: Event) {
        await this.extraerUUIDL();
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                this.data.xml = reader.result as string;
            };
            reader.readAsDataURL(file);
        }

    }

    async extraerUUIDL() {
        const $xmlInput = $('#xml_factura');
        const files = $xmlInput.prop('files');
        const $this = this;

        if (!files || files.length === 0) {
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const extension = file.name.split('.').pop().toLowerCase();

            if (extension !== 'xml') {
                await swal('', 'Debes proporcionar un XML.', 'error');
                $xmlInput.val('');
                continue;
            }

            const reader = new FileReader();

            reader.onload = function (e: any) {
                const xml = $(e.target.result);

                xml.children().each(function () {
                    if ($(this).get(0).tagName === 'CFDI:COMPLEMENTO') {
                        $this.data.xml = $(this).children().attr('uuid');
                    }
                });
            };

            reader.onerror = function () {
                swal('', 'Error al leer el archivo XML.', 'error');
            };

            reader.readAsText(file);
        }
    }

    relacionar() {
        console.log(this.data);
        // if (!this.data.documento || !this.data.pdf || !this.data.xml) {
        //     swal('', 'Todos los campos (documento, PDF y XML) son obligatorios.', 'warning').then();
        //     return;
        // }
        // this.ventaService.relacionarPDF_XML(this.data).subscribe({
        //     next: (res) => {
        //         console.log(res);
        //         swalSuccessHttpResponse(res);
        //     },
        //     error:
        //     swalErrorHttpResponse
        // });

    }

}
