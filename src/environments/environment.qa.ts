// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import swal from 'sweetalert2';

export const environment = {
    production: false,
};

export const backend_url = 'http://localhost:8000/';
export const backend_url_password =
    '$2y$10$zUFltp9AVApnk7BN22Nu9ueCvBihctYkDFJLvN0HlVaBr4KYtRnfy';
export const pusher_key = 'd2163e9e88304df4c43e';
export const dropbox_token =
    'AYQm6f0FyfAAAAAAAAAB2PDhM8sEsd6B6wMrny3TVE_P794Z1cfHCv16Qfgt3xpO';
export const raspberry_dyndns =
    'http://wimtech-test.ddns.net:9181/raspberry-print-server/public/';
export const mercadolibre_url = 'https://api.mercadolibre.com/';
export const dropbox_api_url = 'https://api.dropboxapi.com/2/';

export function commaNumber(number) {
    var parts = number.toString().split('.');

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ', ');

    return parts.join('.');
}

export function swalErrorHttpResponse(err) {
    swal({
        title: '',
        type: 'error',
        html:
            err.status == 0
                ? err.message
                : typeof err.error === 'object'
                ? err.error.error_summary
                    ? err.error.error_summary
                    : err.error.message
                : err.error,
    });
}

export function swalSuccessHttpResponse(res) {
    swal({
        title: '',
        type: 'success',
        html: res.message,
    });
}

export function downloadExcelReport(excel_name: string, excel_data: string) {
    const dataURI = 'data:application/vnd.ms-excel;base64, ' + excel_data;

    const a = window.document.createElement('a');

    a.href = dataURI;
    a.download = excel_name;
    a.setAttribute('id', 'etiqueta_descargar');

    a.click();
}

export function downloadPDF(pdf_name: string, pdf_data: string) {
    const dataURI = 'data:application/pdf;base64, ' + pdf_data;

    const a = window.document.createElement('a');

    a.href = dataURI;
    a.download = pdf_name;
    a.setAttribute('id', 'etiqueta_descargar');

    a.click();
}

export const tinymce_init = {
    theme: 'modern',
    height: 300,
    plugins: [
        'advlist autolink lists link image charmap print preview hr anchor pagebreak',
        'searchreplace wordcount visualblocks visualchars code fullscreen',
        'insertdatetime media nonbreaking save table contextmenu directionality',
        'emoticons template paste textcolor colorpicker textpattern imagetools',
    ],
    toolbar1:
        'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
    toolbar2: 'print preview media | forecolor backcolor emoticons',
    automatic_uploads: true,
};
