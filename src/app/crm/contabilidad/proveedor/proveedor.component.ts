import {backend_url, commaNumber} from '@env/environment';
import {AuthService} from '@services/auth.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-proveedor',
    templateUrl: './proveedor.component.html',
    styleUrls: ['./proveedor.component.scss'],
})
export class ProveedorComponent implements OnInit {
    empresas_usuario: any[] = [];
    empresas: any[] = [];

    entidades: any[] = [];

    commaNumber = commaNumber;
    datatable: any;

    data = {
        empresa: '1',
        entidad: {
            input: '',
            rfc: '',
            razon: '',
            telefono: '',
            email: '',
        },
        archivos: [],
        archivos_anteriores: [],
    };

    constructor(
        private http: HttpClient,
        private router: Router,
        private auth: AuthService
    ) {
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    ngOnInit() {
        if (this.empresas_usuario.length == 0) {
            swal(
                '',
                'No tienes empresas asignadas, favor de contactar a un administrador.',
                'error'
            ).then(() => {
                this.router.navigate(['/dashboard']);
            });

            return;
        }

        this.http
            .get(`${backend_url}contabilidad/facturas/saldo/data`)
            .subscribe(
                (res) => {
                    this.empresas = res['empresas'];

                    this.empresas.forEach((empresa, index) => {
                        if (
                            $.inArray(empresa.id, this.empresas_usuario) == -1
                        ) {
                            this.empresas.splice(index, 1);
                        } else {
                            if (this.empresas_usuario.length == 1) {
                                if (empresa.id == this.empresas_usuario[0]) {
                                    this.data.empresa = empresa.id;
                                }
                            }
                        }
                    });
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    });
                }
            );
    }

    buscarEntidad() {
        if (this.data.empresa == '') {
            swal('', 'Selecciona una empresa.', 'error');

            return;
        }

        if (this.entidades.length > 0) {
            this.entidades = [];

            this.data.entidad = {
                input: '',
                rfc: '',
                razon: '',
                telefono: '',
                email: '',
            };

            return;
        }

        if (this.data.entidad.input == '') {
            return;
        }
    }

    cambiarEntidad() {
        const entidad = this.entidades.find(
            (entidad) => entidad.rfc == this.data.entidad.rfc
        );

        this.data.entidad = {
            input: this.data.entidad.input,
            rfc: entidad.rfc,
            razon: entidad.razon,
            telefono: entidad.telefono,
            email: entidad.email,
        };

        this.http
            .get(
                `${backend_url}contabilidad/proveedor/archivos/${this.data.entidad.rfc}`
            )
            .subscribe(
                (res) => {
                    this.data.archivos_anteriores = res['archivos'];

                    this.iconosArchivos();
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    });
                }
            );
    }

    agregarArchivo() {
        this.data.archivos = [];

        var files = $('#archivos').prop('files');
        var archivos = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    archivos.push({
                        tipo: f.type.split('/')[0],
                        nombre: f.name,
                        data: e.target.result,
                    });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    archivos.push({ tipo: '', nombre: '', data: '' });
                };
            })(file);

            reader.readAsDataURL(file);
        }

        this.data.archivos = archivos;
    }

    guardarArchivos(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        if (this.data.archivos.length == 0) {
            return;
        }

        if (!this.data.entidad.rfc) {
            return;
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}contabilidad/proveedor/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.data.archivos = [];
                        this.data.archivos_anteriores = res['archivos'];

                        this.iconosArchivos();
                    }
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    });
                }
            );
    }

    verArchivo(id_dropbox) {
        this.http
            .post<any>(
                `${backend_url}/dropbox/get-link`,
                { path: id_dropbox }
            )
            .subscribe(
                (res) => {
                    window.open(res.link);
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                    ? response.error.error_summary
                                    : response.error,
                    });
                }
            );
    }


    iconosArchivos() {
        this.data.archivos_anteriores.forEach((archivo) => {
            var re = /(?:\.([^.]+))?$/;
            var ext = re.exec(archivo.nombre)[1];

            if ($.inArray(ext, ['jpg', 'jpeg', 'png']) !== -1) {
                archivo.icon = 'file-image-o';
            } else if (ext == 'xlsx') {
                archivo.icon = 'file-excel-o';
            } else if (ext == 'xml') {
                archivo.icon = 'file-code-o';
            } else if (ext == 'pdf') {
                archivo.icon = 'file-pdf-o';
            } else {
                archivo.icon = 'file';
            }
        });
    }
}
