import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import {
    backend_url,
    backend_url_erp,
    swalErrorHttpResponse,
} from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfiguracionService } from '@services/http/configuracion.service';
import { AuthService } from './../../../services/auth.service';
import * as XLSX from 'xlsx';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-dev',
    templateUrl: './dev.component.html',
    styleUrls: ['./dev.component.scss'],
})
export class DevComponent implements OnInit {
    loadingTitle: any = '';
    modalReference: any;
    modalReferenceToken: any;
    modalReferenceSerie: any;

    admins = [97, 58, 78, 51, 86];

    vista: boolean = false;
    modificador: boolean = false;
    codigo: string;

    series: any[] = [];
    usuarios: any[] = [];
    empresa_almacen: any[] = [];

    dupes_data: any[] = [17, 29];
    dupes_marketplaces: any[] = [];
    dupes_array: any[] = [];
    dupes_view: boolean = false;
    dupes: any;

    data = {
        arr_sku: [],
        arr_doc: [],
        delete_sku: '',
        new_sku: '',
        delete_doc: '',
        costo: '',
    };

    walmartData: any;

    walmart = {
        venta: '',
        precio: '',
        id: '',
        guia: '',
    };

    copySeries = {
        documento_viejo: '',
        documento_nuevo: '',
    };

    dataRecepcion = {
        erp_idDoc: '',
    };

    dataProducto = {
        sku: '',
        costoPromedio: '',
        stockInicial: '',
    };

    dataSeries = {
        pedido: '',
        sku: '',
        serie: '',
        almacen: '',
    };

    dataModelos = {
        productos: [],
    };

    report = {
        excel: '',
    };

    dataExtra = {
        fecha: '',
        fechas: [],
    };

    authy = {
        id: 0,
        nivel: 0,
        subnivel: [],
    };

    ventacomercial: any = '';
    ventascomercial: any[] = [];

    prodcrm: any = '';
    prodscrm: any[] = [];
    productos: any[] = [];
    codigos_sat: any[] = [];
    producto = {
        id: 0,
        sku: '',
        descripcion: '',
        np: '',
        serie: 0,
        refurbished: 0,
        costo: 0,
        extra: 0,
        alto: 0,
        ancho: 0,
        largo: 0,
        peso: 0,
        tipo: 1,
        codigo_text: '',
        clave_sat: '',
        clave_unidad: '',
        cat1: '',
        cat2: '',
        cat3: '',
        cat4: '',
        proveedores: [],
        imagenes: [],
        imagenes_anteriores: [],
        amazon: {
            codigo: '',
            descripcion: '',
        },
        precio: {
            empresa: '',
            precio: 0,
            productos: [],
        },
    };
    empresas: any[] = [];
    almacenes: any[] = [];
    fechas: any[] = [];
    proveedores: any[] = [];
    categorias_uno: any[] = [];
    categorias_dos: any[] = [];
    categorias_tres: any[] = [];
    categorias_cuatro: any[] = [];
    tipos: any[] = [];
    resprodscrm: any[] = [];

    dataProductos = {
        empresa: '7',
        tipo: '',
        criterio: '',
    };

    busqueda = {
        empresa: 0,
        fecha_inicial: '',
        fecha_final: '',
    };

    faltantes: any;
    faltantesData: any;

    offset: any;

    titulo: '';

    getlinio = {
        venta: '',
        marketplace: '',
    };

    errdocs: any[] = [];

    //!
    usuarios_notificacion: any[] = [];
    areas_notificacion: any[] = [];

    notificacion = {
        tipo: 'warning',
        titulo: '',
        mensaje: '',
        usuarios: [],
        alerta: 0,
    };

    notificaciones_grupo = [
        { id: 1, label: 'Todos' },
        { id: 2, label: 'Especifico' },
    ];

    notificaciones_usuario = [
        { id: 1, label: 'Todos' },
        { id: 2, label: 'Especifico' },
    ];

    notificaciones_tipo = [
        { id: 1, label: 'Sencilla' },
        { id: 2, label: 'Modal' },
    ];

    notificaciones_grupo_seleccionado: number = 0;
    notificaciones_usuario_seleccionado: number = 0;

    selected_area: any;
    selected_user: any;
    filtered_users: any[] = [];
    list_users: any[] = [];

    usuario = {
        input: '',
        select: '',
        buscado: false,
        usuarios: [],
    };

    actualizarERP = {
        anio: '',
        mes: '',
    };

    //!

    afectacion = {
        documento: '',
        traspaso: '',
        buscado: false,
    };
    afectacion_docs: any[] = [];

    //!
    ventas: any[] = [];

    anios = [
        { id: '2022', label: '2022' },
        { id: '2023', label: '2023' },
        { id: '2024', label: '2024' },
    ];
    meses = [
        { id: '01', label: 'Enero' },
        { id: '02', label: 'Febrero' },
        { id: '03', label: 'Marzo' },
        { id: '04', label: 'Abril' },
        { id: '05', label: 'Mayo' },
        { id: '06', label: 'Junio' },
        { id: '07', label: 'Julio' },
        { id: '08', label: 'Agosto' },
        { id: '09', label: 'Septiembre' },
        { id: '10', label: 'Octubre' },
        { id: '11', label: 'Noviembre' },
        { id: '12', label: 'Diciembre' },
    ];

    modulo = {
        buscado: false,
        documento: '',
        estatus: 0, //0 por mover- 1 Moviendo- 2 Movido- 3 Error
        respuesta: '',
    };

    constructor(
        private http: HttpClient,
        private modalService: NgbModal,
        private configuracionService: ConfiguracionService,
        private auth: AuthService,
        private spinner: NgxSpinnerService
    ) {
        const usuario = JSON.parse(this.auth.userData().sub);

        this.authy.id = usuario.id;
        if (usuario.niveles.find((element) => element == 6)) {
            this.authy.nivel = 6;
        }

        for (const [key, value] of Object.entries(usuario.subniveles)) {
            if (key == '6') {
                if (value == '1,2') {
                    this.authy.subnivel.push(1);
                    this.authy.subnivel.push(2);
                }
            }
        }
    }

    ngOnInit() {
        this.http.get(`${backend_url}compra/producto/gestion/data`).subscribe(
            (res: any) => {
                this.tipos = res['tipos'];
                this.empresas = res['empresas'];
                this.proveedores = res['proveedores'];
                this.categorias_uno = res['categorias_uno'];
                this.categorias_dos = res['categorias_dos'];
                this.categorias_tres = res['categorias_tres'];
                this.categorias_cuatro = res['categorias_cuatro'];
                if (this.empresas.length) {
                    const [empresa] = this.empresas;
                    this.dataProductos.empresa = empresa.id;
                }
            },
            (response) => {
                this.handleApiError(response);
            }
        );
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.dupes_data));
        this.http
            .post(`${backend_url}developer/getDuplicadosData`, form_data)
            .subscribe(
                (res) => {
                    this.dupes_marketplaces = res['ima'];
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                    });
                }
            );
        this.http
            .get(`${backend_url}developer/getUsuariosNotificaciones`)
            .subscribe(
                (res) => {
                    this.usuarios_notificacion = res['usuarios'];
                    this.areas_notificacion = res['areas'];
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                    });
                }
            );

        this.http.get(`${backend_url}developer/getAlmacenes`).subscribe(
            (res) => {
                this.almacenes = res['almacenes'];
                this.fechas = res['fechas'];
            },
            (response) => {
                swal({
                    title: '',
                    type: 'error',
                });
            }
        );
    }

    codigo_secreto_ref(modal: TemplateRef<any>) {
        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    onChangeArea() {
        let filteredUsers = [];

        for (let i = 0; i < this.usuarios_notificacion.length; i++) {
            if (this.usuarios_notificacion[i].area === this.selected_area) {
                filteredUsers = [
                    ...filteredUsers,
                    this.usuarios_notificacion[i],
                ];
            }
        }
        this.filtered_users = filteredUsers;
    }

    descargarExcelImportacionComercial() {
        var form_data = new FormData();

        form_data.append('fecha', this.dataExtra.fecha);

        this.http
            .post(
                `${backend_url}developer/descargarExcelImportacionComercial`,
                form_data
            )
            .subscribe(
                (res) => {
                    console.log(res['ventas']);
                    this.report.excel = res['excel'];
                    swal({
                        title: '',
                        type: 'success',
                        html: 'Soy una cosa pero barbara',
                    });
                    if (this.report.excel != '') {
                        let dataURI =
                            'data:application/vnd.ms-excel;base64, ' +
                            this.report.excel;

                        let a = window.document.createElement('a');
                        let nombre_archivo = `Importacion_Comercial_${this.dataExtra.fecha}.xlsx`;

                        a.href = dataURI;
                        a.download = nombre_archivo;
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();
                    }
                    this.resetdata();
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }

    asignarSeriePedido() {
        var form_data = new FormData();

        form_data.append('documento', this.dataSeries.pedido);
        form_data.append('sku', this.dataSeries.sku);
        form_data.append('serie', this.dataSeries.serie);
        form_data.append('almacen', this.dataSeries.almacen);

        this.http
            .post(`${backend_url}developer/asignarSeriePedido`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                    this.resetdata();
                    this.modalReference.close();
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }

    transferirSeries() {
        var form_data = new FormData();

        form_data.append('doc_viejo', this.copySeries.documento_viejo);
        form_data.append('doc_nuevo', this.copySeries.documento_nuevo);

        this.http
            .post(`${backend_url}developer/copiarSeries`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                    this.resetdata();
                    this.modalReference.close();
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }

    actSeriePedido() {
        var form_data = new FormData();

        form_data.append('documento', this.dataSeries.pedido);

        this.http
            .post(`${backend_url}developer/actSeriePedido`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                    this.resetdata();
                    this.modalReference.close();
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }

    recostear() {
        this.http.get(`${backend_url}developer/recostear`).subscribe(
            (res) => {
                console.log(res['Movimientos']);
                // swal({
                //     title: '',
                //     type: 'success',
                //     html: res['message'],
                // });
            },
            (response) => {
                swal({
                    title: '',
                    type: 'error',
                });
            }
        );
    }

    importarDocumentosSinComercial() {
        this.http.get(`${backend_url}developer/importarMovComercial`).subscribe(
            (res) => {
                console.log(res);
                swal({
                    title: `Todo salio ${res['code'] == 200 ? 'bien' : 'mal'}`,
                    type: res['code'] == 200 ? 'success' : 'error',
                    html: res['message'],
                });
            },
            (response) => {
                swal({
                    title: '',
                    type: 'error',
                });
            }
        );
    }

    actualizarPedidoShopi() {
        this.http.get(`${backend_url}developer/actualizarPedido`).subscribe(
            (res) => {
                console.log(res);
                // swal({
                //     title: '',
                //     type: 'success',
                //     html: res['message'],
                // });
            },
            (response) => {
                swal({
                    title: '',
                    type: 'error',
                });
            }
        );
    }

    cargarArchivoExcel() {
        this.dataModelos.productos = [];
        var files = $('#cargar_archivo').prop('files');
        var modelos = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e: any) {
                    var extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension != 'xlsx') {
                        swal(
                            '',
                            'El archivo seleccionado no contiene la extension XLXS.',
                            'error'
                        );

                        return;
                    }

                    const bstr: string = e.target.result;

                    const wb: XLSX.WorkBook = XLSX.read(bstr, {
                        type: 'binary',
                    });

                    /* grab first sheet */
                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                    var rows = XLSX.utils.sheet_to_json(ws, {
                        header: 1,
                    });
                    rows.shift();

                    rows.forEach((row) => {
                        // modelos.push({
                        //     sku: $.trim(row[0]),
                        //     descripcion: $.trim(row[1]),
                        //     precio: Number($.trim(row[2])),
                        //     stock: Number($.trim(row[3])),
                        //     almacen: $.trim(row[4]),
                        //     empresa: $.trim(row[5]),
                        // });
                        modelos.push({
                            skuClaro: $.trim(row[0]),
                            sku1: $.trim(row[1]),
                            sku2: $.trim(row[2]),
                            sku3: $.trim(row[3]),
                        });
                    });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal('', 'Ocurrió un error al leer el archivo', 'error');
                };
            })(file);

            reader.readAsBinaryString(file);
        }
        this.dataModelos.productos = modelos;
        console.log(this.dataModelos.productos);
    }

    cargarArchivoExcelVentas() {
        this.ventas = [];
        var files = $('#cargar_archivo').prop('files');
        var ventas = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e: any) {
                    var extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension != 'xlsx') {
                        swal(
                            '',
                            'El archivo seleccionado no contiene la extension XLXS.',
                            'error'
                        );

                        return;
                    }

                    const bstr: string = e.target.result;

                    const wb: XLSX.WorkBook = XLSX.read(bstr, {
                        type: 'binary',
                    });

                    /* grab first sheet */
                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                    var rows = XLSX.utils.sheet_to_json(ws, {
                        header: 1,
                    });
                    rows.shift();

                    rows.forEach((row) => {
                        const array = $.trim(row[25])
                            .split('|')
                            .reduce((acc, curr, index) => {
                                const limite: number = Math.floor(index / 9);

                                // Initialize an object for each chunk
                                if (!acc[limite]) {
                                    acc[limite] = {
                                        cantidad: '',
                                        sku: '',
                                        precio: '',
                                    };
                                }

                                // Assign values to properties based on indices
                                switch (index % 9) {
                                    case 1:
                                        acc[limite].cantidad = curr;
                                        break;
                                    case 3:
                                        acc[limite].sku = curr;
                                        break;
                                    case 5:
                                        acc[limite].precio = curr;
                                        break;
                                }
                                return acc;
                            }, []);

                        ventas.push({
                            id: $.trim(row[0]),
                            almacen: $.trim(row[4]),
                            titulo: $.trim(row[5]),
                            total: $.trim(row[6]),
                            fecha: $.trim(row[7]),
                            factura: $.trim(row[8]).split(' ')[0],
                            pedido: $.trim(row[9]),
                            venta: $.trim(row[10]),
                            venta_shopify: $.trim(row[11]),
                            productos: array,
                            uuid: $.trim(row[27]),
                            uso_cfdi: $.trim(row[28]),
                        });
                    });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal('', 'Ocurrió un error al leer el archivo', 'error');
                };
            })(file);

            reader.readAsBinaryString(file);
        }
        this.ventas = ventas;
        console.log(this.ventas);
    }

    recuperarPedidos() {
        var form_data = new FormData();
        form_data.append('ventas', JSON.stringify(this.ventas));

        this.http
            .post(`${backend_url}developer/recuperarPedidos`, form_data)
            .subscribe(
                (res) => {
                    console.log(res);
                    swal({
                        title: `Todo salio ${
                            res['code'] == 200 ? 'bien' : 'mal'
                        }`,
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                },
                (response) => {
                    swal({
                        type: 'error',
                        html: 'Hubo un error al crear los combos',
                    });
                }
            );
    }

    cargarDatosIniciales() {
        var form_data = new FormData();

        form_data.append(
            'productos',
            JSON.stringify(this.dataModelos.productos)
        );

        this.http.post(`${backend_url}developer/combos`, form_data).subscribe(
            (res) => {
                console.log(res);
                swal({
                    title: 'Todo salio bien',
                    type: 'success',
                    html: res['mensaje'],
                });
            },
            (response) => {
                swal({
                    type: 'error',
                    html: 'Hubo un error al crear los combos',
                });
            }
        );
    }

    testApis() {
        this.http.get(`${backend_url}developer/testApis`).subscribe(
            (res) => {
                console.log(res);
            },
            (response) => {
                swal({
                    title: '',
                    type: 'error',
                    html: 'ALGO SALIO MAL',
                });
            }
        );
    }
    descargarReporteSeriesDuplicadas() {
        this.http.get(`${backend_url}developer/descargarReporteSD`).subscribe(
            (res) => {
                console.log(res);
            },
            (response) => {
                swal({
                    title: '',
                    type: 'error',
                    html: 'ALGO SALIO MAL',
                });
            }
        );
        // this.http.get(`${backend_url}developer/descargarReporteSD`).subscribe(
        //     (res) => {
        //         console.log(res);
        //         this.report.excel = res['excel'];
        //         swal({
        //             title: '',
        //             type: 'success',
        //             html: 'Soy una cosa pero barbara',
        //         });
        //         if (this.report.excel != '') {
        //             let dataURI =
        //                 'data:application/vnd.ms-excel;base64, ' +
        //                 this.report.excel;
        //
        //             let a = window.document.createElement('a');
        //             let nombre_archivo = 'seriesRepetidas.xlsx';
        //
        //             a.href = dataURI;
        //             a.download = nombre_archivo;
        //             a.setAttribute('id', 'etiqueta_descargar');
        //
        //             a.click();
        //         }
        //     },
        //     (response) => {
        //         swal({
        //             title: '',
        //             type: 'error',
        //             html: 'ALGO SALIO MAL',
        //         });
        //     }
        // );
    }
    descargarReporteMercadoLibre() {
        this.http.get(`${backend_url}developer/descargarReporteML`).subscribe(
            (res) => {
                console.log(res['ventas']);
                this.report.excel = res['excel'];
                swal({
                    title: '',
                    type: 'success',
                    html: 'Soy una cosa pero barbara',
                });
                if (this.report.excel != '') {
                    let dataURI =
                        'data:application/vnd.ms-excel;base64, ' +
                        this.report.excel;

                    let a = window.document.createElement('a');
                    let nombre_archivo = 'reportePantallas.xlsx';

                    a.href = dataURI;
                    a.download = nombre_archivo;
                    a.setAttribute('id', 'etiqueta_descargar');

                    a.click();
                }
            },
            (response) => {
                swal({
                    title: '',
                    type: 'error',
                    html: 'ALGO SALIO MAL',
                });
            }
        );
    }

    getAccessToViewModal(modal: TemplateRef<any>, nombre: String) {
        this.loadingTitle = nombre;
        if (this.admins.includes(this.authy.id)) {
            if (!this.vista) {
                return swal({
                    type: 'warning',
                    html: 'Para ver la magia, abre tu aplicación de Authy y escribe el token proporcionado en el recuadro de abajo',
                    input: 'text',
                    inputAttributes: {
                        maxlength: '7',
                    },
                    showCancelButton: true,
                }).then((res) => {
                    if (res.value) {
                        const data = {
                            authy_id: this.authy.id,
                            authy_token: res.value,
                            nombre_modal: nombre,
                        };

                        this.configuracionService
                            .getAccessToViewModal(data)
                            .subscribe(
                                (res: any) => {
                                    this.vista = true;
                                    this.codigo_secreto_ref(modal);
                                },
                                (err: any) => {
                                    swalErrorHttpResponse(err);
                                }
                            );
                    }
                });
            }

            this.vista = !this.vista;
        } else {
            swal({
                type: 'error',
                html: 'No tienes los permisos para ver esta sección, contacta con un administrador',
            });

            return;
        }
    }

    resetdata() {
        $('#cargar_archivo_xml').val('');
        this.ventacomercial = '';
        this.data = {
            arr_sku: [],
            arr_doc: [],
            delete_sku: '',
            new_sku: '',
            delete_doc: '',
            costo: '',
        };

        this.dataExtra = {
            fecha: '',
            fechas: [],
        };

        this.report = {
            excel: '',
        };

        this.dataModelos = {
            productos: [],
        };

        this.dataProducto = {
            sku: '',
            costoPromedio: '',
            stockInicial: '',
        };

        this.dataSeries = {
            pedido: '',
            sku: '',
            serie: '',
            almacen: '',
        };

        this.dataRecepcion = {
            erp_idDoc: '',
        };
    }

    agregarSku() {
        this.data.arr_sku.push(this.data.delete_sku);
        this.data.delete_sku = '';
    }

    eliminarSku(sku) {
        const cancelar = this.data.arr_sku.findIndex((sku_ip) => sku_ip == sku);

        this.data.arr_sku.splice(cancelar, 1);
    }

    agregarDocumento() {
        this.data.arr_doc.push(this.data.delete_doc);
        this.data.delete_doc = '';
    }

    eliminarDocumento(doc) {
        const cancelar = this.data.arr_doc.findIndex((doc_ip) => doc_ip == doc);

        this.data.arr_sku.splice(cancelar, 1);
    }

    recepciones() {
        var form_data = new FormData();

        form_data.append('idErp', this.dataRecepcion.erp_idDoc);

        this.http
            .post(`${backend_url}developer/recepciones`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                    console.log(res['Movimientos']);
                    console.log(res['Recepcioens']);
                    console.log(res['ERP']);
                    this.resetdata();
                    this.modalReference.close();
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }

    conciliar() {
        var form_data = new FormData();

        form_data.append('skus', JSON.stringify(this.data.arr_sku));

        form_data.append('new', this.data.new_sku);
        form_data.append('costo', this.data.costo);

        this.http
            .post(`${backend_url}developer/conciliar`, form_data)
            .subscribe(
                (res) => {
                    this.resetdata();
                    this.modalReference.close();
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }

    excelInventario() {
        var form_data = new FormData();

        form_data.append('sku', this.dataProducto.sku);

        form_data.append('costoP', this.dataProducto.costoPromedio);
        form_data.append('stockI', this.dataProducto.stockInicial);

        this.http
            .post(`${backend_url}developer/reporteinventario`, form_data)
            .subscribe(
                (res) => {
                    console.log(res['ventas']);
                    this.report.excel = res['excel'];
                    swal({
                        title: '',
                        type: 'success',
                        html: res['message'],
                    });
                    if (this.report.excel != '') {
                        let dataURI =
                            'data:application/vnd.ms-excel;base64, ' +
                            this.report.excel;

                        let a = window.document.createElement('a');
                        let nombre_archivo = 'reporte_costos.xlsx';

                        a.href = dataURI;
                        a.download = nombre_archivo;
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();
                    }
                    this.resetdata();
                    this.modalReference.close();
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }

    cargarInventarios() {
        this.http
            .get(`${backend_url}developer/actualizarInventariosAlmacen`)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: 'success',
                        html: res['message'],
                    });
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }

    pretransferencias() {
        var form_data = new FormData();

        form_data.append('documento', this.data.delete_doc);

        this.http
            .post(`${backend_url}developer/pretransferencia`, form_data)
            .subscribe(
                (res) => {
                    this.resetdata();
                    this.modalReference.close();
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }

    ventaAcomercial() {
        let documentos = Array();

        if (this.ventascomercial.length <= 0) {
            swal({
                title: '',
                type: 'error',
                html: 'No se escribió un documento, vuelva a intentar',
            });
            return;
        }
        this.ventascomercial.forEach(async (element) => {
            await new Promise((response) => {
                this.http
                    .get(`${backend_url}developer/ventacomercial/${element}`)
                    .subscribe(
                        (res) => {
                            if (res['code'] == 400) {
                                swal({
                                    title: '',
                                    type:
                                        res['code'] == 200
                                            ? 'success'
                                            : 'error',
                                    html: res['message'],
                                });
                            } else {
                                swal({
                                    title: '',
                                    type:
                                        res['code'] == 200
                                            ? 'success'
                                            : 'error',
                                    html: res['message'],
                                });
                                let resp = { doc: 0, err: 0 };
                                resp.doc = element;
                                resp.err = res['code'] == 200 ? 0 : 1;
                                documentos.push(resp);
                                this.resetdata();
                                // this.modalReference.close();
                                response(1);
                            }
                        },
                        (response) => {
                            let resp = { doc: 0, err: 0 };
                            resp.doc = element;
                            resp.err = 1;
                            documentos.push(resp);
                            response(1);
                        }
                    );
            });
        });

        this.errdocs = documentos;
    }

    // reporte() {
    //     this.http.get(`${backend_url}developer/reporte`).subscribe(
    //         (res) => {
    //             this.report.excel = res['excel'];
    //             swal({
    //                 title: '',
    //                 type: 'success',
    //                 html: res['message'],
    //             });
    //             this.descargarReporte();
    //         },
    //         (response) => {
    //             swal({
    //                 title: '',
    //                 type: 'error',
    //                 html:
    //                     response.status == 0
    //                         ? response.message
    //                         : typeof response.error === 'object'
    //                         ? response.error.error_summary
    //                         : response.error,
    //             });
    //         }
    //     );
    // }

    descargarReporte(nombre) {
        if (this.report.excel != '') {
            let dataURI =
                'data:application/vnd.ms-excel;base64, ' + this.report.excel;

            let a = window.document.createElement('a');
            let nombre_archivo = 'reporte_' + nombre + '.xlsx';

            a.href = dataURI;
            a.download = nombre_archivo;
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();
        }
    }

    getSeries() {
        this.series = [];
        this.report = {
            excel: '',
        };
        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        this.http
            .get(`${backend_url}developer/series/${this.codigo}`)
            .subscribe(
                (res) => {
                    // swal({
                    //     title: '',
                    //     type: res['code'] == 200 ? 'success' : 'error',
                    //     html: res['message'],
                    // });
                    this.report.excel = res['excel'];
                    this.series = res['series'];
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }

    verWalmart(caso) {
        const form_data = new FormData();
        switch (caso) {
            case 1:
                this.http
                    .post(`${backend_url}developer/getWalmartData`, form_data)
                    .subscribe(
                        (res) => {
                            console.log(res);
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

                break;

            case 2:
                this.http
                    .post(`${backend_url}developer/getWalmartData2`, form_data)
                    .subscribe(
                        (res) => {
                            console.log(res);
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
                break;

            default:
                break;
        }
    }

    buscarWalmart(caso) {
        switch (caso) {
            case 1:
                this.http
                    .get(
                        `${backend_url}developer/buscarWalmartVenta/${this.walmart.venta}`
                    )
                    .subscribe(
                        (res) => {
                            this.walmartData = res['ventas'];
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
                break;
            case 2:
                this.http
                    .get(
                        `${backend_url}developer/buscarWalmartPedido/${this.walmart.id}`
                    )
                    .subscribe(
                        (res) => {
                            this.walmartData = res['ventas'];
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

                break;

            default:
                break;
        }
    }

    actualizarWalmart() {
        var form_data = new FormData();
        form_data.append('precio', JSON.stringify(this.walmart.precio));
        form_data.append('venta', JSON.stringify(this.walmartData));

        this.http
            .post(`${backend_url}developer/actualizarWalmart`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                    this.walmartData = '';
                    this.walmart = {
                        venta: '',
                        precio: '',
                        id: '',
                        guia: '',
                    };
                    this.modalReference.close();
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }
    resetTraspaso() {
        this.afectacion = {
            documento: '',
            traspaso: '',
            buscado: false,
        };
        this.afectacion_docs = [];
    }

    buscarTraspaso() {
        var form_data = new FormData();

        form_data.append('data', JSON.stringify(this.afectacion));
        this.http
            .post(`${backend_url}developer/getTraspasoNDC`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal({
                            title: res['code'],
                            type: 'error',
                            html: res['message'],
                        });
                    }
                    if (res['code'] == 200) {
                        this.afectacion_docs = res['documento'];
                        this.afectacion.buscado = true;
                        console.log(res);
                    }
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }

    repararTraspaso() {
        var form_data = new FormData();

        form_data.append('data', JSON.stringify(this.afectacion));
        this.http
            .post(`${backend_url}developer/makeTraspasoNDC`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal({
                            title: res['code'],
                            type: 'error',
                            html: res['message'],
                        });
                    }
                    if (res['code'] == 200) {
                        swal({
                            title: res['code'],
                            type: 'success',
                            html: res['mensaje'],
                        });
                        console.log(res);
                    }
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }
    testsalex() {
        this.http.get(`${backend_url}developer/testsAlexget`).subscribe(
            (res) => {
                console.log(res);
            },
            (response) => {
                this.handleApiError(response);
            }
        );
    }

    testsalex2() {
        var serie = '7379348787872';

        var form_data = new FormData();
        form_data.append('serie', serie);

        this.http
            .post(`${backend_url}developer/testsAlexpost`, form_data)
            .subscribe(
                (res) => {
                    console.log(res);
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }

    testsalex3() {
        this.http.get(`${backend_url}developer/testAlexExtra`).subscribe(
            (res) => {
                console.log(res);
            },
            (response) => {
                this.handleApiError(response);
            }
        );
    }

    testsalexData() {
        this.http.get(`${backend_url}developer/testAlexData`).subscribe(
            (res) => {
                console.log(res);
                swal({
                    html: `Factura: ${res['Factura']}<br/>UUID: ${res['UUID']}<br/>Fase 3: ${res['Fase3']}`,
                });
            },
            (response) => {
                this.handleApiError(response);
            }
        );
    }

    getlinioapi() {
        var form_data = new FormData();

        form_data.append('data', JSON.stringify(this.getlinio));

        this.http
            .post(`${backend_url}developer/conseguirLinio`, form_data)
            .subscribe(
                (res) => {
                    console.log(res);
                },
                (response) => {
                    this.handleApiError(response);
                }
            );

        console.log('XD2');
    }

    imprimirPicking() {
        this.http.get(`${backend_url}developer/imprimirPicking`).subscribe(
            (res) => {
                console.log(res);
            },
            (response) => {
                this.handleApiError(response);
            }
        );
    }

    getDuplicados() {
        this.dupes_view = false;
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.dupes));

        this.http
            .post(`${backend_url}developer/getDuplicados`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.dupes_array = res['ima'];
                        this.dupes_view = true;
                    }

                    console.log(res);
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                    });
                }
            );
    }

    findDupesDoc(venta) {
        for (let i = 0; i < this.ventascomercial.length; i++) {
            if (this.ventascomercial[i] == venta) {
                return true;
            }
        }
        return false;
    }

    findDupesProd(producto) {
        for (let i = 0; i < this.prodscrm.length; i++) {
            if (this.prodscrm[i] == producto) {
                return true;
            }
        }
        return false;
    }

    adddoc() {
        const docs = $.trim(this.ventacomercial).split(' ');
        docs.forEach((element) => {
            if (
                !this.findDupesDoc(element) &&
                this.ventacomercial != '' &&
                this.ventacomercial.match(/^[^a-zA-Z]+$/g)
            ) {
                this.ventascomercial.push(element);
            }
        });

        this.ventacomercial = '';
    }

    deletedoc(id: number) {
        const index = this.ventascomercial.findIndex(
            (documento) => documento.id == id
        );
        this.ventascomercial.splice(index, 1);
    }

    addprod() {
        const docs = $.trim(this.prodcrm).split(' ');
        docs.forEach((element) => {
            if (
                !this.findDupesDoc(element) &&
                this.prodcrm != '' &&
                this.prodcrm.match(/^[^a-zA-Z]+$/g)
            ) {
                this.prodscrm.push(element);
            }
        });

        this.prodcrm = '';
    }

    deleteprod(id: number) {
        const index = this.prodscrm.findIndex((documento) => documento == id);
        this.prodscrm.splice(index, 1);
    }

    //!NOTIFICACIONES
    enviarNotificacion() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.notificacion));

        this.http
            .post(`${backend_url}developer/enviarNotificaciones`, form_data)
            .subscribe(
                (res) => {
                    return true;
                },
                (response) => {
                    this.handleApiError(response);
                    return false;
                }
            );
        return true;
    }

    checkData() {
        if (this.notificacion.titulo == '') {
            swal({
                type: 'error',
                html: 'No puede enviar una notificación con título vacío',
            });
            return false;
        }

        if (this.notificacion.mensaje == '') {
            swal({
                type: 'error',
                html: 'No puede enviar una notificación con mensaje vacío',
            });
            return false;
        }
        if (this.notificacion.alerta == 0) {
            swal({
                type: 'error',
                html: 'No puede enviar una notificación sin tipo',
            });
            return false;
        }
        return true;
    }

    clearNotif() {
        this.notificacion = {
            tipo: 'info',
            titulo: '',
            mensaje: '',
            usuarios: [],
            alerta: 0,
        };
    }

    sendNotif() {
        if (this.checkData() && this.list_users.length > 0) {
            swal({
                title: '',
                type: 'info',
                html: 'Se enviará la Notificacion a los usuarios de la lista<br />Continuar ?',
                showCancelButton: true,
                showConfirmButton: true,
                cancelButtonText: 'No',
                confirmButtonText: 'Sí, enviar',
            }).then((value) => {
                if (value.dismiss) return;
                this.list_users.forEach((element) => {
                    this.notificacion.usuarios.push(element.id);
                });

                if (this.enviarNotificacion()) {
                    this.changeall(1);
                    this.notificaciones_grupo_seleccionado = 1;
                    this.clearNotif();
                }
            });
        }
    }

    addUsers(option: number) {
        switch (option) {
            case 1:
                if (this.checkData()) {
                    swal({
                        title: '',
                        type: 'info',
                        html: 'Se enviará la Notificacion a TODOS los usuarios<br />Continuar ?',
                        showCancelButton: true,
                        showConfirmButton: true,
                        cancelButtonText: 'No',
                        confirmButtonText: 'Sí, enviar',
                    }).then((value) => {
                        if (value.dismiss) return;
                        this.usuarios_notificacion.forEach((element) => {
                            this.notificacion.usuarios.push(element.id);
                        });

                        this.enviarNotificacion();
                        this.clearNotif();
                    });
                }

                break;
            case 2:
                for (var i = 0; i < this.filtered_users.length; i++) {
                    if (!this.findDupesNotif(this.filtered_users[i].id)) {
                        this.list_users.push(this.filtered_users[i]);
                        this.list_users.sort((a, b) =>
                            a.nombre.localeCompare(b.nombre)
                        );
                    }
                }

                break;
            case 3:
                for (var i = 0; i < this.filtered_users.length; i++) {
                    if (this.filtered_users[i].id == this.selected_user) {
                        if (!this.findDupesNotif(this.selected_user)) {
                            this.list_users.push(this.filtered_users[i]);
                            this.list_users.sort((a, b) =>
                                a.nombre.localeCompare(b.nombre)
                            );
                        }
                    }
                }

                break;

            default:
                break;
        }
    }

    findDupesNotif(user) {
        for (let i = 0; i < this.list_users.length; i++) {
            if (this.list_users[i].id == user) {
                return true;
            }
        }
        return false;
    }

    deleteUser(id: number) {
        const index = this.list_users.findIndex(
            (producto) => producto.id == id
        );
        this.list_users.splice(index, 1);
    }

    changeall(notif) {
        if ((notif = 1)) {
            this.list_users = [];
        }
    }

    buscarUsuario() {
        if (!this.usuario.buscado) {
            this.usuario.usuarios = this.usuarios_notificacion.filter(
                (element) =>
                    element.nombre.includes(this.usuario.input.toUpperCase())
            );

            this.usuario.buscado = true;
        } else {
            const selectedUser = this.usuarios_notificacion.find(
                (user) => user.id === +this.usuario.select
            );

            if (selectedUser && !this.findDupesNotif(+this.usuario.select)) {
                this.list_users.push(selectedUser);
                this.list_users.sort((a, b) =>
                    a.nombre.localeCompare(b.nombre)
                );
            }

            this.usuario = {
                input: '',
                select: '',
                buscado: false,
                usuarios: [],
            };
        }
    }

    async buscarProducto() {
        this.spinner.show();
        if (this.prodscrm.length <= 0) return;

        const form_data = new FormData();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization:
                    'Bearer AYQm6f0FyfAAAAAAAAAB2PDhM8sEsd6B6wMrny3TVE_P794Z1cfHCv16Qfgt3xpO',
            }),
        };

        form_data.append('data', JSON.stringify(this.prodscrm));
        this.prodscrm = [];

        try {
            const res = await this.http
                .post(
                    `${backend_url}compra/producto/gestion/productos`,
                    form_data
                )
                .toPromise();
            this.productos = res['productos'];

            for (let element of this.productos) {
                console.log(element.id);

                this.codigos_sat = [];

                if (element.id !== 0) {
                    this.producto = this.productos.find(
                        (producto) => producto.id === element.id
                    );

                    this.producto.precio = {
                        empresa: '',
                        precio: 0,
                        productos: [],
                    };

                    if (
                        this.producto.clave_sat !== '' &&
                        this.producto.clave_sat !== 'N/A'
                    ) {
                        this.producto.codigo_text = this.producto.clave_sat;
                        await this.buscarCodigoSat();
                    }

                    this.producto.imagenes = await Promise.all(
                        this.producto.imagenes_anteriores.map(
                            async (producto) => {
                                try {
                                    const form_data = JSON.stringify({
                                        path: producto.dropbox,
                                    });

                                    const res: any = await this.http.post(
                                        'https://api.dropboxapi.com/2/files/get_temporary_link',
                                        form_data,
                                        httpOptions
                                    );

                                    return { ...producto, url: res.link };
                                } catch (error) {
                                    this.handleApiError(error);
                                }
                            }
                        )
                    );

                    await Promise.all(
                        this.producto.proveedores
                            .filter((proveedor) => proveedor.producto)
                            .map((proveedor) =>
                                this.buscarProductoProveedorB2B(proveedor)
                            )
                    );

                    console.log(this.producto);

                    form_data.append('data', JSON.stringify(this.producto));
                    form_data.append('empresa', this.dataProductos.empresa);

                    const createRes = await this.http
                        .post(
                            `${backend_url}compra/producto/gestion/crear`,
                            form_data
                        )
                        .toPromise();
                    var arrres = {
                        sku: this.producto.sku,
                        message: createRes['message'],
                    };
                    this.resprodscrm.push(arrres);
                } else {
                    this.spinner.hide();
                    this.clearData();
                }
            }
        } catch (error) {
            this.spinner.hide();
            this.handleApiError(error);
        }
        this.spinner.hide();
    }

    clearData() {
        this.producto = {
            id: 0,
            sku: '',
            descripcion: '',
            np: '',
            serie: 0,
            refurbished: 0,
            costo: 0,
            extra: 0,
            alto: 0,
            ancho: 0,
            largo: 0,
            peso: 0,
            tipo: 1,
            codigo_text: '',
            clave_sat: '',
            clave_unidad: '',
            cat1: '',
            cat2: '',
            cat3: '',
            cat4: '',
            proveedores: [],
            imagenes: [],
            imagenes_anteriores: [],
            amazon: {
                codigo: '',
                descripcion: '',
            },
            precio: {
                empresa: '',
                precio: 0,
                productos: [],
            },
        };

        this.codigos_sat = [];
    }

    async buscarCodigoSat() {
        if (!this.dataProductos.empresa) {
            swal('', 'Selecciona una empresa.', 'error');
            return;
        }

        if (this.codigos_sat.length > 0) {
            this.codigos_sat = [];
            this.producto.codigo_text = '';
            return;
        }

        const empresa = this.empresas.find(
            (e) => e.id == this.dataProductos.empresa
        );

        try {
            const res = await this.fetchCodigoSat(
                empresa,
                this.producto.codigo_text
            );

            if (Array.isArray(res) && res.length > 0) {
                this.codigos_sat = res;
            } else {
                const secondRes = await this.fetchCodigoSatByClave(
                    empresa,
                    this.producto.codigo_text
                );

                if (Array.isArray(secondRes) && secondRes.length > 0) {
                    this.codigos_sat = secondRes;
                } else {
                    swal('', 'Codigo no encontrado.', 'error');
                }
            }
        } catch (error) {
            this.handleApiError(error);
        }
    }

    async fetchCodigoSat(empresa, codigo_text) {
        return this.http
            .get(
                `${backend_url_erp}api/adminpro/ClaveProdServ/${empresa.bd}/${codigo_text}`
            )
            .toPromise();
    }

    async fetchCodigoSatByClave(empresa, codigo_text) {
        return this.http
            .get(
                `${backend_url_erp}api/adminpro/${empresa.bd}/ClaveProdServ/Clave/${codigo_text}`
            )
            .toPromise();
    }

    handleApiError(response) {
        swal({
            title: '',
            type: 'error',
            html:
                response.status === 0
                    ? response.message
                    : typeof response.error === 'object'
                    ? response.error.error_summary
                    : response.error,
        });
    }

    buscarProductoProveedorB2B(proveedor) {
        if (proveedor.productos.length) {
            proveedor.productos = [];
            proveedor.producto_text = '';
            proveedor.producto = '';

            return;
        }

        if (!proveedor.producto_text)
            return swal({
                type: 'error',
                html: 'Escribe algo para buscar los productos del proveedor',
            });

        const form_data = new FormData();
        form_data.append(
            'data',
            JSON.stringify({
                proveedor: proveedor.id,
                producto: proveedor.producto_text,
            })
        );

        this.http
            .post(
                `${backend_url}compra/producto/gestion/producto-proveedor`,
                form_data
            )
            .subscribe(
                (res: any) => {
                    proveedor.productos = res.data;
                },
                (response) => {
                    this.handleApiError(response);
                }
            );
    }

    barridoStatus() {
        this.http
            .get(
                `${backend_url}developer/barridoStatus/${this.actualizarERP.anio}/${this.actualizarERP.mes}`
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: 'success',
                    });
                    console.log(res);
                },
                (response) => {
                    console.log(response);
                    swal({
                        title: '',
                        type: 'error',
                    });
                }
            );
    }

    barridoStatusfase(infor) {
        this.http
            .get(`${backend_url}developer/barridoStatusfase/2024/${infor}`)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: 'success',
                    });
                    console.log(res);
                },
                (response) => {
                    console.log(response);
                    swal({
                        title: '',
                        type: 'error',
                    });
                }
            );
    }

    cambiarModulo() {
        if (this.modulo.estatus != 0) {
            return swal({
                title: 'Favor de reiniciar el formulario',
                type: 'error',
                html: 'Puchele al botón',
            });
        }
        //0 por mover- 1 Moviendo- 2 Movido- 3 Error
        this.resetModulo(1);
        this.http
            .get(
                `${backend_url}developer/cambiarModuloComercial/${this.modulo.documento}`
            )
            .subscribe(
                (res) => {
                    console.log(res);
                    res['code'] == 200
                        ? this.resetModulo(2)
                        : this.resetModulo(3);
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                },
                (response) => {
                    console.log(response);
                    this.resetModulo(3);
                    swal({
                        title: '',
                        type: 'error',
                    });
                }
            );
    }

    resetModulo(estatus) {
        switch (estatus) {
            case 0:
                this.modulo.documento = '';
                this.modulo.respuesta = '';
                break;
            case 1:
                this.modulo.respuesta = 'Buscando';
                break;
            case 2:
                this.modulo.respuesta = 'Correcto';
                break;
            case 3:
                this.modulo.respuesta = 'Error';
                break;

            default:
                break;
        }
        this.modulo.estatus = estatus;
    }

    //! ESPACIO PARA RESPUESTAS DE API

    apiClaro(option) {
        //EN ESTE MOMENTO FUNCIONA ESTATICO, CAMBIAR A POST PARA LOS PARAMETROS CORRECTOS
        this.http.get(`${backend_url}developer/apiClaro/${option}`).subscribe(
            (res) => {
                swal({
                    title: '',
                    type: 'success',
                });
                console.log(res);
            },
            (response) => {
                console.log(response);
                swal({
                    title: '',
                    type: 'error',
                });
            }
        );
    }

    apiClaro2(option) {
        //EN ESTE MOMENTO FUNCIONA ESTATICO, CAMBIAR A POST PARA LOS PARAMETROS CORRECTOS
        this.http.get(`${backend_url}developer/apiClaroV2/${option}`).subscribe(
            (res) => {
                swal({
                    title: '',
                    type: 'success',
                });
                console.log(res);
            },
            (response) => {
                console.log(response);
                swal({
                    title: '',
                    type: 'error',
                });
            }
        );
    }

    //! ESPACIO PARA RESPUESTAS DE API ENDS
}
