import swal from 'sweetalert2';

export function swalSuccessError(res): void {
    swal({
        title: '',
        type: res['code'] === 200 ? 'success' : 'error',
        html: res['message'],
    }).then();
}
