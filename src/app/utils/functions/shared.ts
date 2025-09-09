import swal from 'sweetalert2';

export function swalSuccessError(res): void {
    swal({
        title: '',
        type: res['code'] === 200 ? 'success' : 'error',
        html: res['message'],
    }).then();
}

export function commaNumber(number) {
    const parts = number.toString().split('.');

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ', ');

    return parts.join('.');
}

export function swalErrorHttpResponse(err) {
    console.log(err);
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
    }).then();
}

export function swalSuccessHttpResponse(res) {
    swal({
        title: '',
        type: 'success',
        html: res.message,
    }).then();
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
