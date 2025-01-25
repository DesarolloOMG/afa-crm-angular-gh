import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backend_url_erp } from './../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ErpService {
    reusable_path: string = 'api/adminpro/producto/Consulta/Productos/';

    constructor(private http: HttpClient) {}

    getProductBySKUorDescription(
        criteria: string,
        company: string,
        search_type: boolean
    ) {
        const search_type_text = search_type ? 'SKU' : 'Descripcion';

        return this.http.get(
            `${backend_url_erp}${this.reusable_path}${search_type_text}/${company}/${criteria}`
        );
    }

    getCustomerByNameOrRFC(
        company: string,
        customer_name_or_rfc: string,
        type: boolean
    ) {
        const search = type ? 'RFC' : 'Razon';

        return this.http.get(
            `${backend_url_erp}api/adminpro/Consultas/Clientes/${company}/${search}/${encodeURIComponent(
                customer_name_or_rfc.toUpperCase()
            )}`
        );
    }

    getAddressFromPostalCode(postal_code: string) {
        return this.http.get(
            `${backend_url_erp}api/adminpro/Consultas/CP/${postal_code}`
        );
    }

    getNCInformationByID(company: string, document_id: string) {
        return this.http.get(
            `${backend_url_erp}api/adminpro/cliente/notacredito/${company}/ID/${document_id}`
        );
    }

    downloadNCXMLorPDFByID(
        company: string,
        document_id: string,
        type: boolean
    ) {
        const url_type = type
            ? 'DescargarNotaCreaditoXML'
            : 'DescargarNotaCreaditoPDF';

        window.open(
            `${backend_url_erp}api/adminpro/${company}/${url_type}/ID/${document_id}`,
            '_blank'
        );
    }

    getInvoiceDataByFolio(invoice: string, company: string) {
        return this.http.get(
            `${backend_url_erp}api/adminpro/${company}/Factura/Estado/Folio/${invoice}`
        );
    }

    getProductSATCodesByCodeOrName(
        company_id: number,
        criteria: string,
        type: boolean
    ) {
        const search_type = type
            ? `ClaveProdServ/${company_id}/`
            : `${company_id}/ClaveProdServ/Clave/`;

        return this.http.get(
            `${backend_url_erp}api/adminpro/${search_type}${criteria}`
        );
    }
}
