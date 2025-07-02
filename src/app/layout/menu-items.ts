import {Injectable} from '@angular/core';

export interface BadgeItem {
    type: string;
    value: string;
}

export interface ChildrenItems {
    state: string;
    target?: boolean;
    name: string;
    type?: string;
    children?: ChildrenItems[];
}

export interface MainMenuItems {
    state: string;
    short_label?: string;
    main_state?: string;
    target?: boolean;
    name: string;
    type: string;
    icon: string;
    badge?: BadgeItem[];
    children?: ChildrenItems[];
    level: any[];
    except?: any[];
    system?: any;
}

export interface Menu {
    label: string;
    levels: any;
    main: MainMenuItems[];
}

const MENUITEMS = [
    {
        label: 'Navegación',
        levels: [0],
        except: [0],
        main: [
            {
                main_state: 'dashboard',
                state: 'general',
                short_label: 'DG',
                name: 'Dashboard',
                type: 'link',
                icon: 'icon-layout-cta-right',
                level: [6],
                sublevel: 1,
            },
        ],
    },
    {
        label: 'General',
        levels: [0],
        except: 0,
        main: [
            {
                main_state: 'general',
                state: 'busqueda',
                short_label: 'B',
                name: 'Busquedas',
                type: 'sub',
                icon: 'icon-map',
                level: [0],
                except: [13],
                sublevel: 0,
                children: [
                    {
                        state: 'serie',
                        name: 'Buscar Serie',
                        level: [0],
                        sublevel: 0,
                    },
                    {
                        state: 'producto',
                        name: 'Buscar Producto',
                        level: [0],
                        sublevel: 0,
                    },
                ],
            },
        ],
    },
    {
        label: 'Compras',
        levels: [7, 8, 11, 12],
        main: [
            {
                main_state: 'compra',
                state: 'compra',
                short_label: 'CO',
                name: 'Compra',
                type: 'sub',
                icon: 'fa fa-cube',
                level: [7, 8, 12],
                sublevel: 0,
                children: [
                    {
                        state: 'editar',
                        name: 'Editar Compra',
                        level: [6],
                        sublevel: 0,
                    },
                    {
                        state: 'historial',
                        name: 'Historial de compras',
                        level: [7, 8, 11, 12],
                        sublevel: 0,
                    },
                ],
            },
            {
                main_state: 'compra',
                state: 'orden',
                short_label: 'OC',
                name: 'Orden de compra',
                type: 'sub',
                icon: 'fa fa-cube',
                level: [7, 8, 10, 11, 12],
                sublevel: 0,
                children: [
                    {
                        state: 'requisicion',
                        name: 'Crear requisición',
                        level: [8, 12],
                        sublevel: 0,
                    },
                    {
                        state: 'autorizacion-requisicion',
                        name: 'Autorizar requisición',
                        level: [8, 12],
                        sublevel: 0,
                    },
                    {
                        state: 'orden',
                        name: 'Crear orden de compra',
                        level: [12],
                        sublevel: 0,
                    },
                    {
                        state: 'recepcion',
                        name: 'Recepcionar orden de compra',
                        level: [7, 12],
                        sublevel: 0,
                    },
                    {
                        state: 'historial',
                        name: 'Historial',
                        level: [0],
                        sublevel: 0,
                    },
                ],
            },
            {
                main_state: 'compra',
                state: 'producto',
                short_label: 'PRO',
                name: 'Productos',
                type: 'sub',
                icon: 'fa fa-product-hunt',
                level: [12],
                sublevel: 9,
                children: [
                    {
                        state: 'gestion',
                        name: 'Gestión',
                        level: [12],
                        sublevel: 9,
                    },
                    {
                        state: 'importacion',
                        name: 'Importación',
                        level: [12],
                        sublevel: 9,
                    },
                    {
                        state: 'categoria',
                        name: 'Categorias',
                        level: [12],
                        sublevel: 9,
                    },
                    {
                        state: 'sinonimo',
                        name: 'Sinonimos',
                        level: [12],
                        sublevel: 9,
                    },
                ],
            },
            {
                main_state: 'compra',
                state: 'proveedor',
                short_label: 'PRO',
                name: 'Proveedores',
                type: 'link',
                icon: 'fa fa-people-carry',
                level: [16],
                sublevel: 29,
            },
        ],
    },
    {
        label: 'Ventas',
        levels: [8, 11, 16],
        main: [
            // {
            //     main_state: 'venta',
            //     state: 'pedido',
            //     name: 'Pedidos de venta',
            //     short_label: 'PDV',
            //     type: 'sub',
            //     icon: 'icon-bag',
            //     level: [8],
            //     except: [13],
            //     sublevel: 0,
            //     children: [
            //         {
            //             state: 'crear',
            //             name: 'Crear Pedido',
            //             level: [8],
            //             sublevel: 0,
            //         },
            //         {
            //             state: 'pendiente',
            //             name: 'Pendientes',
            //             level: [8],
            //             sublevel: 0,
            //         },
            //     ],
            // },
            {
                main_state: 'venta',
                state: 'venta',
                short_label: 'VTA',
                name: 'Ventas',
                type: 'sub',
                icon: 'icon-bag',
                level: [8],
                sublevel: 0,
                children: [
                    {
                        state: 'crear',
                        name: 'Crear',
                        level: [8],
                        sublevel: 0,
                    },
                    {
                        state: 'editar',
                        name: 'Editar',
                        level: [8],
                        sublevel: 0,
                    },
                    {
                        state: 'eliminar',
                        name: 'Eliminar',
                        level: [8],
                        sublevel: 0,
                    },
                    {
                        state: 'autorizar',
                        name: 'Autorizar',
                        level: [8],
                        sublevel: 1,
                    },
                    {
                        state: 'problema',
                        name: 'En problemas',
                        level: [8],
                        sublevel: 0,
                    },
                    {
                        state: 'pendiente',
                        name: 'Pendientes',
                        level: [8],
                        sublevel: 0,
                    },
                    {
                        state: 'nota',
                        name: 'Nota de venta',
                        level: [8],
                        sublevel: 0,
                    },
                ],
            },
            {
                main_state: 'venta',
                state: 'cliente',
                short_label: 'CLI',
                name: 'Clientes',
                type: 'link',
                icon: 'fa fa-user-tie',
                level: [16],
                sublevel: 28,
            },
            // {
            //     main_state: 'venta',
            //     state: 'publicaciones-marketplace',
            //     short_label: 'PCRM',
            //     name: 'Publicaciones CRM',
            //     type: 'sub',
            //     icon: 'fa fa-shopping-bag',
            //     level: [8],
            //     sublevel: 0,
            //     children: [
            //         {
            //             state: 'crear-publicaciones-marketplace',
            //             name: 'Crear Publicaciones',
            //             level: [8],
            //             sublevel: 0,
            //         },
            //         {
            //             state: 'ver-publicaciones-marketplace',
            //             name: 'Ver/Editar Publicaciones',
            //             level: [8],
            //             sublevel: 0,
            //         },
            //         {
            //             state: 'gestionar-marketplaces',
            //             name: 'Gestionar Marketplaces',
            //             level: [6],
            //             sublevel: 0,
            //         },
            //     ],
            // },
            {
                main_state: 'venta',
                state: 'mercadolibre',
                name: 'Mercadolibre',
                short_label: 'VML',
                type: 'sub',
                icon: 'fa fa-list-ul',
                level: [8],
                except: [13],
                sublevel: 0,
                children: [
                    {
                        state: 'pregunta-respuesta',
                        name: 'Preguntas',
                        type: 'link',
                        level: [8],
                        sublevel: 16,
                    },
                    {
                        state: 'validar-ventas',
                        name: 'Validar Ventas',
                        type: 'link',
                        level: [8],
                        sublevel: 0,
                    },
                    {
                        state: 'importar',
                        name: 'Importar ventas',
                        level: [14],
                        sublevel: 25,
                    },
                    {
                        state: 'mensaje',
                        name: 'Mensaje masivo',
                        level: [8],
                        sublevel: 0,
                    },
                    {
                        state: 'publicacion',
                        name: 'Publicaciones',
                        type: 'sub',
                        level: [8],
                        sublevel: 17,
                        children: [
                            {
                                state: 'crear-publicacion',
                                name: 'Nueva Publicación',
                                level: [8],
                                sublevel: 17,
                            },
                            {
                                state: 'publicacion',
                                name: 'Publicaciones',
                                level: [8],
                                sublevel: 17,
                            },
                            {
                                state: 'pretransferencia',
                                name: 'Pretransferencias',
                                level: [8],
                                sublevel: 17,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        label: 'Soporte',
        levels: [10, 11, 8],
        main: [
            {
                main_state: 'soporte',
                state: 'garantia-devolucion',
                short_label: 'GD',
                name: 'Garantías y devoluciones',
                type: 'sub',
                icon: 'fa fa-volume-control-phone',
                level: [8, 10, 11],
                sublevel: 0,
                children: [
                    {
                        state: 'garantia-devolucion',
                        name: 'Crear documento',
                        level: [8, 10],
                        sublevel: 0,
                    },
                    {
                        state: 'devolucion',
                        name: 'Devoluciones',
                        type: 'sub',
                        level: [8, 10, 11],
                        sublevel: 0,
                        children: [
                            {
                                state: 'pendiente',
                                name: 'Pendientes',
                                level: [10, 11],
                                sublevel: 0,
                            },
                            {
                                state: 'revision',
                                name: 'Pendientes revisión',
                                level: [10],
                                sublevel: 0,
                            },
                            {
                                state: 'indemnizacion',
                                name: 'Pendientes indemnizacion',
                                level: [8],
                                sublevel: 0,
                            },
                            {
                                state: 'reclamo',
                                name: 'Pendientes reclamo',
                                level: [8],
                                sublevel: 0,
                            },
                            {
                                state: 'historial',
                                name: 'Historial',
                                level: [8, 10, 11],
                                sublevel: 0,
                            },
                        ],
                    },
                    {
                        state: 'garantia',
                        name: 'Garantía',
                        type: 'sub',
                        level: [8, 9, 10],
                        sublevel: 0,
                        children: [
                            {
                                state: 'recibir',
                                name: 'Pendientes recibir',
                                level: [9, 10],
                                sublevel: 0,
                            },
                            {
                                state: 'reparacion',
                                name: 'Pendientes reparacion',
                                level: [10],
                                sublevel: 0,
                            },
                            {
                                state: 'cambio',
                                name: 'Pendientes cambio',
                                level: [10],
                                sublevel: 0,
                            },
                            {
                                state: 'pedido',
                                name: 'Pendientes pedido',
                                level: [10],
                                sublevel: 0,
                            },
                            {
                                state: 'envio',
                                name: 'Pendientes entrega / envio',
                                level: [10],
                                sublevel: 0,
                            },
                            {
                                state: 'historial',
                                name: 'Historial',
                                level: [8, 10, 11],
                                sublevel: 0,
                            },
                        ],
                    },
                    {
                        state: 'servicio',
                        name: 'Servicio',
                        type: 'sub',
                        level: [10],
                        sublevel: 0,
                        children: [
                            {
                                state: 'crear',
                                name: 'Crear servicio',
                                level: [10],
                                sublevel: 0,
                            },
                            {
                                state: 'revision',
                                name: 'Pendientes revisión',
                                level: [10],
                                sublevel: 0,
                            },
                            {
                                state: 'envio',
                                name: 'Pendientes entrega / envio',
                                level: [10],
                                sublevel: 0,
                            },
                            {
                                state: 'cotizacion',
                                name: 'Pendientes cotización',
                                level: [10],
                                sublevel: 0,
                            },
                            {
                                state: 'reparacion',
                                name: 'Pendientes reparacion',
                                level: [10],
                                sublevel: 0,
                            },
                            {
                                state: 'historial',
                                name: 'Historial',
                                level: [10],
                                sublevel: 0,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        label: 'Almacén',
        levels: [7, 8, 9, 10],
        main: [
            {
                main_state: 'almacen',
                state: 'packing-v2',
                short_label: 'PA',
                name: 'Packing V2',
                type: 'link',
                icon: 'fa fa-shopping-basket',
                level: [7],
                sublevel: 0,
            },
            {
                main_state: 'almacen',
                state: 'movimiento',
                short_label: 'PA',
                name: 'Movimientos',
                type: 'sub',
                icon: 'fa fa-exchange',
                level: [7, 10],
                sublevel: 0,
                children: [
                    {
                        state: 'movimiento',
                        name: 'Crear movimiento',
                        level: [7, 10],
                        sublevel: 0,
                    },
                    {
                        state: 'historial',
                        name: 'Historial',
                        level: [7, 10],
                        sublevel: 0,
                    },
                ],
            },
            {
                main_state: 'almacen',
                state: 'etiqueta',
                short_label: 'ET',
                name: 'Etiquetas',
                type: 'sub',
                icon: 'fa fa-barcode',
                level: [7],
                sublevel: 4,
                children: [
                    {
                        state: 'etiqueta',
                        name: 'Generar',
                        level: [7],
                        sublevel: 0,
                    },
                ],
            },
            {
                main_state: 'almacen',
                state: 'pretransferencia',
                short_label: 'PT',
                name: 'Pretransferencias',
                type: 'sub',
                icon: 'fa fa-exchange',
                level: [7, 8, 9],
                sublevel: 0,
                children: [
                    {
                        state: 'solicitud',
                        name: 'Generar solicitud',
                        level: [8],
                        sublevel: 0,
                    },
                    {
                        state: 'pendiente',
                        name: 'Pendientes',
                        level: [8],
                        sublevel: 0,
                    },
                    {
                        state: 'confirmacion',
                        name: 'Verificar solicitudes',
                        level: [7],
                        sublevel: 0,
                    },
                    {
                        state: 'autorizacion',
                        name: 'Autorizar envio',
                        level: [8],
                        sublevel: 0,
                    },
                    {
                        state: 'envio',
                        name: 'Enviar mercancia',
                        level: [7],
                        sublevel: 0,
                    },
                    {
                        state: 'finalizar',
                        name: 'Finalizar pretransferencia',
                        level: [8],
                        sublevel: 1,
                    },
                    {
                        state: 'con-diferencias',
                        name: 'Con diferencias',
                        level: [8],
                        sublevel: 1,
                    },
                    {
                        state: 'historial',
                        name: 'Historial',
                        level: [7, 8, 9],
                        sublevel: 0,
                    },
                ],
            },
        ],
    },
    {
        label: 'Logística',
        levels: [9],
        main: [
            {
                main_state: 'logistica',
                state: 'envio',
                short_label: 'LO',
                name: 'Envíos',
                type: 'sub',
                icon: 'fa fa-map-marker',
                level: [9],
                sublevel: 1,
                children: [
                    {
                        state: 'pendiente',
                        name: 'Por enviar',
                        level: [9],
                        sublevel: 0,
                    },
                    {
                        state: 'firma',
                        name: 'Firma',
                        level: [9],
                        sublevel: 0,
                    },
                ],
            },
            {
                main_state: 'logistica',
                state: 'manifiesto',
                short_label: 'MA',
                name: 'Manifiesto',
                type: 'sub',
                icon: 'fa fa-bus',
                level: [9],
                sublevel: 1,
                children: [
                    {
                        state: 'manifiesto',
                        name: 'Manifiesto',
                        level: [9],
                        sublevel: 0,
                    },
                    {
                        state: 'manifiesto-salida',
                        name: 'Manifiesto salida',
                        level: [9],
                        sublevel: 0,
                    },
                    {
                        state: 'manifiesto-recoleccion',
                        name: 'Manifiesto recoleccion',
                        level: [9],
                        sublevel: 0,
                    },
                ],
            },
            {
                main_state: 'logistica',
                state: 'control',
                short_label: 'CP',
                name: 'Control paquetería',
                type: 'sub',
                icon: 'fa fa-cube',
                level: [9],
                sublevel: 1,
                children: [
                    {
                        state: 'crear',
                        name: 'Crear',
                        level: [9],
                        sublevel: 0,
                    },
                    {
                        state: 'historial',
                        name: 'Historial',
                        level: [9],
                        sublevel: 0,
                    },
                ],
            },
        ],
    },
    {
        label: 'Contabilidad',
        levels: [11, 12],
        main: [
            // {
            //     main_state: 'contabilidad',
            //     state: 'pago',
            //     short_label: 'PA',
            //     name: 'Pagos',
            //     type: 'link',
            //     icon: 'fa fa-credit-card',
            //     level: [11],
            //     sublevel: 0,
            // },
            // {
            //     main_state: 'contabilidad',
            //     state: 'refacturar',
            //     short_label: 'RF',
            //     name: 'Refacturación',
            //     type: 'link',
            //     icon: 'fa fa-address-book',
            //     level: [6],
            //     sublevel: 1,
            // },
            {
                main_state: 'contabilidad',
                state: 'globalizar',
                short_label: 'ZR',
                name: 'Globalizar',
                type: 'link',
                icon: 'fa fa-object-group',
                level: [11],
                sublevel: 0,
            },
            // {
            //     main_state: 'contabilidad',
            //     state: 'proveedor',
            //     short_label: 'PR',
            //     name: 'Proveedores',
            //     type: 'link',
            //     icon: 'fa fa-truck',
            //     level: [11],
            //     sublevel: 0,
            // },
            {
                main_state: 'contabilidad',
                state: 'factura',
                short_label: 'FA',
                name: 'Facturas',
                type: 'sub',
                icon: 'fa fa-file',
                level: [11],
                sublevel: 0,
                children: [
                    {
                        state: 'factura',
                        name: 'Pendientes',
                        level: [11],
                        sublevel: 11,
                    },
                    {
                        state: 'saldar',
                        name: 'Saldar factura',
                        level: [11],
                        sublevel: 11,
                    },
                    {
                        state: 'dessaldar',
                        name: 'Dessaldar factura',
                        level: [11],
                        sublevel: 11,
                    },
                    // {
                    //     state: 'seguimiento',
                    //     name: 'Seguimientos',
                    //     level: [11],
                    //     sublevel: 0,
                    // },
                    // {
                    //     state: 'poliza',
                    //     name: 'Generar polizas',
                    //     level: [11],
                    //     sublevel: 0,
                    // },
                ],
            },
            {
                main_state: 'contabilidad',
                state: 'compra-gasto',
                short_label: 'FA',
                name: 'Compras / Gastos',
                type: 'sub',
                icon: 'fa fa-file',
                level: [11],
                sublevel: 0,
                children: [
                    {
                        state: 'crear-gasto',
                        name: 'Crear gasto',
                        level: [11],
                        sublevel: 8,
                    },
                    {
                        state: 'saldar',
                        name: 'Saldar',
                        level: [11],
                        sublevel: 8,
                    },
                ],
            },
            // {
            //     main_state: 'contabilidad',
            //     state: 'estado',
            //     short_label: 'EC',
            //     name: 'Estados de cuenta',
            //     type: 'sub',
            //     icon: 'fa fa-pie-chart',
            //     level: [11, 12],
            //     sublevel: 0,
            //     children: [
            //         {
            //             state: 'ingreso',
            //             name: 'Ingresos',
            //             level: [11],
            //             sublevel: 0,
            //         },
            //         {
            //             state: 'factura',
            //             name: 'Facturas',
            //             level: [11, 12],
            //             sublevel: 0,
            //         },
            //     ],
            // },
            {
                main_state: 'contabilidad',
                state: 'ingreso',
                short_label: 'IN',
                name: 'Flujo',
                type: 'sub',
                icon: 'fa fa-dollar',
                level: [11],
                sublevel: 0,
                children: [
                    {
                        state: 'generar',
                        name: 'Generar',
                        level: [11],
                        sublevel: 0,
                    },
                    {
                        state: 'editar',
                        name: 'Editar',
                        level: [11],
                        sublevel: 0,
                    },
                    {
                        state: 'eliminar',
                        name: 'Eliminar',
                        level: [11],
                        sublevel: 1,
                    },
                    // {
                    //     state: 'cuenta',
                    //     name: 'Cuentas',
                    //     level: [11],
                    //     sublevel: 0,
                    // },
                    {
                        state: 'historial',
                        name: 'Historial',
                        level: [11],
                        sublevel: 0,
                    },
                    // {
                    //     state: 'configuracion',
                    //     name: 'Configuracion',
                    //     level: [11],
                    //     sublevel: 1,
                    // },
                ],
            },
            {
                main_state: 'contabilidad',
                state: 'tesoreria',
                short_label: 'TS',
                name: 'Tesoreria',
                type: 'sub',
                icon: 'fa fa-dollar',
                level: [11],
                sublevel: 0,
                children: [
                    {
                        state: 'cuentas-bancarias',
                        name: 'Cuentas Bancarias',
                        level: [11],
                        sublevel: 0,
                    },
                    {
                        state: 'caja-chica',
                        name: 'Caja Chica',
                        level: [11],
                        sublevel: 0,
                    },
                    {
                        state: 'acreedor',
                        name: 'Acreedor',
                        level: [11],
                        sublevel: 0,
                    },
                    {
                        state: 'deudor',
                        name: 'Deudor',
                        level: [11],
                        sublevel: 0,
                    },
                    {
                        state: 'bancos',
                        name: 'Bancos',
                        level: [11],
                        sublevel: 0,
                    },


                ],
            },
        ],
    },
    {
        label: 'Configuración',
        levels: [6],
        system: 1,
        main: [
            {
                main_state: 'configuracion',
                state: 'usuario',
                short_label: 'U',
                name: 'Usuarios',
                type: 'sub',
                icon: 'icon-user',
                level: [6],
                sublevel: 1,
                children: [
                    {
                        state: 'gestion',
                        name: 'Gestión',
                        level: [6],
                        sublevel: 1,
                    },
                    {
                        state: 'configuracion',
                        name: 'Configuración',
                        level: [6],
                        sublevel: 1,
                    },
                ],
            },
            {
                main_state: 'configuracion',
                state: 'sistema',
                short_label: 'S',
                name: 'Sistema',
                type: 'sub',
                icon: 'icon-key',
                level: [6],
                sublevel: 1,
                children: [
                    {
                        state: 'marketplace',
                        name: 'Marketplaces',
                        level: [6],
                        sublevel: 1,
                    },
                    {
                        state: 'almacen',
                        name: 'Almacenes',
                        level: [6],
                        sublevel: 1,
                    },
                    {
                        state: 'paqueteria',
                        name: 'Paqueterías',
                        level: [6],
                        sublevel: 1,
                    },
                    {
                        state: 'impresora',
                        name: 'Impresoras',
                        level: [6],
                        sublevel: 1,
                    },
                ],
            },
            {
                main_state: 'configuracion',
                state: 'dev',
                short_label: 'DEV',
                name: 'DEV',
                type: 'link',
                icon: 'fa fa-rebel',
                level: [6],
                sublevel: 1,
            },
            {
                main_state: 'configuracion',
                state: 'logout',
                short_label: 'LO',
                name: 'Cerrar sesiones',
                type: 'link',
                icon: 'fa fa-warning',
                level: [6],
                sublevel: 1,
            },
        ],
    },
];

@Injectable()
export class MenuItems {
    getAll(): Menu[] {
        return MENUITEMS;
    }
}
