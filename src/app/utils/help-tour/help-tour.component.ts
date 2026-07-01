import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Subscription} from 'rxjs';

interface HelpStep {
    title: string;
    text: string;
    selector?: string;
    note?: string;
}

interface HelpContext {
    title: string;
    match: RegExp;
    steps: HelpStep[];
}

@Component({
    selector: 'app-help-tour',
    templateUrl: './help-tour.component.html',
    styleUrls: ['./help-tour.component.scss'],
})
export class HelpTourComponent implements OnInit, OnDestroy {
    hasContext = false;
    active = false;
    targetFound = false;
    currentStepIndex = 0;
    currentContext: HelpContext;
    currentStep: HelpStep;
    highlightStyle: any = {};
    panelStyle: any = {};

    private routeSubscription: Subscription;
    private refreshListener: any;

    private routeContexts: HelpContext[] = [
        {
            title: 'Ayuda: crear garantia/devolucion',
            match: /^\/soporte\/garantia-devolucion\/garantia-devolucion(\/)?$/,
            steps: [
                {
                    title: 'Pantalla activa',
                    text: 'Aqui se crea el documento inicial de soporte desde una venta o una serie. El resultado cae en la rama de devolucion o garantia segun el tipo elegido.',
                    selector: '[data-help-id="support-create-form"]',
                },
                {
                    title: 'Tipo y motivo',
                    text: 'El tipo define el flujo que seguira el documento. El motivo deja clasificado por que se esta generando la devolucion o garantia.',
                    selector: '[data-help-id="support-create-type"]',
                },
                {
                    title: 'Pedido o serie',
                    text: 'Captura el numero de pedido CRM o una serie del producto y presiona Buscar. El sistema trae la venta, marketplace, almacen y productos disponibles.',
                    selector: '[data-help-id="support-create-sale"]',
                },
                {
                    title: 'Productos',
                    text: 'En devolucion total se toman todos los productos. En parcial se activa solo lo que regresa y se ajusta la cantidad a devolver.',
                    selector: '[data-help-id="support-create-products"]',
                },
                {
                    title: 'Seguimiento',
                    text: 'Es la explicacion inicial del caso. Se guarda como evidencia en el historial del documento de soporte.',
                    selector: '[data-help-id="support-create-followup"]',
                },
                {
                    title: 'Archivos',
                    text: 'Adjunta fotos, guia, captura de reclamo u otra evidencia. Esos archivos quedan ligados al caso para las siguientes fases.',
                    selector: '[data-help-id="support-create-files"]',
                },
                {
                    title: 'Guardar',
                    text: 'Crea el documento. Si es devolucion queda en Devoluciones pendientes; si es garantia queda en el flujo de Garantia. Si el backend genera PDF, se descarga.',
                    selector: '[data-help-id="support-create-save"]',
                },
            ],
        },
        {
            title: 'Ayuda: devoluciones pendientes de cancelacion',
            match: /^\/soporte\/garantia-devolucion\/devolucion\/pendiente(\/)?$/,
            steps: [
                {
                    title: 'Tabla visible',
                    text: 'Esta tabla muestra las devoluciones recien creadas que todavia necesitan procesarse: asignar tecnico, capturar guia, paqueteria, series y seguimiento.',
                    selector: '[data-help-id="refund-pending-table-card"]',
                },
                {
                    title: 'Documento',
                    text: 'El boton azul abre el modal del documento. El primer numero es la venta original y el segundo es el folio de garantia/devolucion.',
                    selector: '[data-help-id="refund-pending-open"]',
                    note: 'Si no hay registros, este boton no aparece.',
                },
                {
                    title: 'Busqueda y paginacion',
                    text: 'El buscador filtra los registros visibles de esta tabla. El selector de entradas y la paginacion solo cambian lo que ves en esta bandeja.',
                    selector: '#soporte_garantia_devolucion_devolucion_pendiente_filter input, .dataTables_filter input',
                },
                {
                    title: 'Eliminar',
                    text: 'El boton rojo elimina el documento de soporte. El sistema pide codigo de autorizacion por WhatsApp antes de borrarlo.',
                    selector: '[data-help-id="refund-pending-delete"]',
                    note: 'Es una accion sensible; no se debe usar para avanzar el flujo normal.',
                },
            ],
        },
        {
            title: 'Ayuda: devoluciones pendientes de revision',
            match: /^\/soporte\/garantia-devolucion\/devolucion\/revision(\/)?$/,
            steps: [
                {
                    title: 'Tabla de revision',
                    text: 'Aqui aparecen las devoluciones ya recibidas y asignadas al tecnico. La decision se toma dentro del modal con Terminar y Requiere indemnizacion.',
                    selector: '#soporte_garantia_devolucion_devolucion_revision',
                },
                {
                    title: 'Abrir devolucion',
                    text: 'El boton azul abre el caso para revisar venta, cliente y seguimientos antes de decidir si se cierra o pasa a indemnizacion.',
                    selector: '#soporte_garantia_devolucion_devolucion_revision .btn-info',
                    note: 'Si no hay registros, no aparece boton azul.',
                },
                {
                    title: 'Buscar en tabla',
                    text: 'Filtra las devoluciones cargadas en esta fase.',
                    selector: '#soporte_garantia_devolucion_devolucion_revision_filter input, .dataTables_filter input',
                },
            ],
        },
        {
            title: 'Ayuda: devoluciones pendientes de indemnizacion',
            match: /^\/soporte\/garantia-devolucion\/devolucion\/indemnizacion(\/)?$/,
            steps: [
                {
                    title: 'Tabla de indemnizacion',
                    text: 'Aqui quedan los casos donde se espera resolver si habra reclamo con marketplace por indemnizacion.',
                    selector: '#soporte_garantia_devolucion_devolucion_indemnizacion',
                },
                {
                    title: 'Abrir documento',
                    text: 'El boton azul abre la devolucion para registrar seguimiento y decidir si avanza a reclamo.',
                    selector: '#soporte_garantia_devolucion_devolucion_indemnizacion .btn-info',
                    note: 'Si no hay registros, no aparece boton azul.',
                },
                {
                    title: 'Buscar en tabla',
                    text: 'Filtra los documentos visibles de esta bandeja.',
                    selector: '#soporte_garantia_devolucion_devolucion_indemnizacion_filter input, .dataTables_filter input',
                },
            ],
        },
        {
            title: 'Ayuda: devoluciones pendientes de reclamo',
            match: /^\/soporte\/garantia-devolucion\/devolucion\/reclamo(\/)?$/,
            steps: [
                {
                    title: 'Tabla de reclamo',
                    text: 'Aqui estan las devoluciones que ya esperan cierre del reclamo con marketplace.',
                    selector: '#soporte_garantia_devolucion_devolucion_reclamo',
                },
                {
                    title: 'Abrir reclamo',
                    text: 'El boton azul abre el caso para agregar seguimiento y finalizar la devolucion cuando el reclamo ya este resuelto.',
                    selector: '#soporte_garantia_devolucion_devolucion_reclamo .btn-info',
                    note: 'Si no hay registros, no aparece boton azul.',
                },
                {
                    title: 'Buscar en tabla',
                    text: 'Filtra los casos cargados de esta fase.',
                    selector: '#soporte_garantia_devolucion_devolucion_reclamo_filter input, .dataTables_filter input',
                },
            ],
        },
        {
            title: 'Ayuda: historial de devoluciones',
            match: /^\/soporte\/garantia-devolucion\/devolucion\/historial(\/.*)?$/,
            steps: [
                {
                    title: 'Filtros',
                    text: 'Busca por ID de devolucion o pedido y por rango de fechas. El boton con lupa carga los resultados desde backend.',
                    selector: 'input[name="documento"], input[name="fecha-inicial"], input[name="fecha-final"]',
                },
                {
                    title: 'Tabla de historial',
                    text: 'Muestra devoluciones de cualquier fase dentro del filtro. Desde aqui no se mueve la fase; solo se consulta y se agrega seguimiento.',
                    selector: '#soporte_garantia_devolucion_devolucion_historial',
                },
                {
                    title: 'Abrir historial',
                    text: 'El boton azul abre el detalle historico del documento.',
                    selector: '#soporte_garantia_devolucion_devolucion_historial .btn-info',
                    note: 'Si no hay resultados, no aparece boton azul.',
                },
            ],
        },
        {
            title: 'Ayuda: bandeja de devoluciones',
            match: /^\/soporte\/garantia-devolucion\/devolucion(\/.*)?$/,
            steps: [
                {
                    title: 'Tabla visible',
                    text: 'Esta bandeja lista documentos de devolucion segun la fase donde estes.',
                    selector: 'table[id^="soporte_garantia_devolucion_devolucion"]',
                },
                {
                    title: 'Abrir documento',
                    text: 'El boton azul abre el detalle del documento para revisar cliente, venta, seguimientos y registrar el siguiente movimiento.',
                    selector: 'table[id^="soporte_garantia_devolucion_devolucion"] .btn-info',
                    note: 'Si la tabla esta vacia, no habra documento para abrir.',
                },
                {
                    title: 'Filtro de tabla',
                    text: 'El buscador trabaja sobre la tabla actual. No consulta el backend; solo filtra los registros cargados.',
                    selector: '.dataTables_filter input',
                },
            ],
        },
        {
            title: 'Ayuda: garantias pendientes de recibir',
            match: /^\/soporte\/garantia-devolucion\/garantia\/recibir(\/)?$/,
            steps: [
                {
                    title: 'Tabla de recepcion',
                    text: 'Aqui llegan las garantias creadas que todavia no han sido recibidas fisicamente ni asignadas para revision.',
                    selector: '#soporte_garantia_devolucion_garantia_recibir',
                },
                {
                    title: 'Abrir garantia',
                    text: 'El boton azul abre el modal para capturar tecnico, guia, paqueteria, series y seguimiento.',
                    selector: '#soporte_garantia_devolucion_garantia_recibir .btn-info',
                    note: 'Si no hay registros, no aparece boton azul.',
                },
                {
                    title: 'Eliminar',
                    text: 'El boton rojo elimina el documento de soporte. Es una accion sensible y no avanza el flujo normal.',
                    selector: '#soporte_garantia_devolucion_garantia_recibir .btn-outline-danger',
                    note: 'Si no hay registros, no aparece boton rojo.',
                },
            ],
        },
        {
            title: 'Ayuda: garantias pendientes de reparacion',
            match: /^\/soporte\/garantia-devolucion\/garantia\/reparacion(\/)?$/,
            steps: [
                {
                    title: 'Tabla de reparacion',
                    text: 'Aqui aparecen garantias ya recibidas y asignadas al tecnico. En el modal se decide si se devuelve el producto o si requiere cambio.',
                    selector: '#soporte_garantia_devolucion_garantia_revision',
                },
                {
                    title: 'Abrir garantia',
                    text: 'El boton azul abre el caso para registrar diagnostico, seguimiento y la decision tecnica.',
                    selector: '#soporte_garantia_devolucion_garantia_revision .btn-info',
                    note: 'Si no hay registros, no aparece boton azul.',
                },
                {
                    title: 'Buscar en tabla',
                    text: 'Filtra las garantias cargadas en esta fase.',
                    selector: '#soporte_garantia_devolucion_garantia_revision_filter input, .dataTables_filter input',
                },
            ],
        },
        {
            title: 'Ayuda: garantias pendientes de cambio',
            match: /^\/soporte\/garantia-devolucion\/garantia\/cambio(\/)?$/,
            steps: [
                {
                    title: 'Tabla de cambio',
                    text: 'Aqui quedan las garantias donde el producto no se devolvera igual y se debe crear un pedido de reemplazo.',
                    selector: '#soporte_garantia_devolucion_garantia_cambio',
                },
                {
                    title: 'Abrir cambio',
                    text: 'El boton azul abre el modal para elegir si se cambia por el mismo SKU o por otro producto.',
                    selector: '#soporte_garantia_devolucion_garantia_cambio .btn-info',
                    note: 'Si no hay registros, no aparece boton azul.',
                },
                {
                    title: 'Buscar en tabla',
                    text: 'Filtra las garantias cargadas para cambio.',
                    selector: '#soporte_garantia_devolucion_garantia_cambio_filter input, .dataTables_filter input',
                },
            ],
        },
        {
            title: 'Ayuda: garantias pendientes de pedido',
            match: /^\/soporte\/garantia-devolucion\/garantia\/pedido(\/)?$/,
            steps: [
                {
                    title: 'Tabla de pedidos',
                    text: 'Aqui estan las garantias que requieren crear un nuevo pedido de venta desde el formulario del modal.',
                    selector: '#soporte_garantia_devolucion_garantia_pedido',
                },
                {
                    title: 'Abrir pedido',
                    text: 'El boton azul abre el formulario completo para crear el pedido ligado a la garantia.',
                    selector: '#soporte_garantia_devolucion_garantia_pedido .btn-info',
                    note: 'Si no hay registros, no aparece boton azul.',
                },
                {
                    title: 'Buscar en tabla',
                    text: 'Filtra las garantias pendientes de pedido.',
                    selector: '#soporte_garantia_devolucion_garantia_pedido_filter input, .dataTables_filter input',
                },
            ],
        },
        {
            title: 'Ayuda: garantias pendientes de envio',
            match: /^\/soporte\/garantia-devolucion\/garantia\/envio(\/)?$/,
            steps: [
                {
                    title: 'Tabla de envio',
                    text: 'Aqui se listan garantias listas para entregar o enviar al cliente.',
                    selector: '#soporte_garantia_devolucion_garantia_envio',
                },
                {
                    title: 'Abrir envio',
                    text: 'El boton azul abre el modal para capturar paqueteria, guia, seguimiento y cerrar la garantia.',
                    selector: '#soporte_garantia_devolucion_garantia_envio .btn-info',
                    note: 'Si no hay registros, no aparece boton azul.',
                },
                {
                    title: 'Buscar en tabla',
                    text: 'Filtra las garantias listas para envio o entrega.',
                    selector: '#soporte_garantia_devolucion_garantia_envio_filter input, .dataTables_filter input',
                },
            ],
        },
        {
            title: 'Ayuda: historial de garantias',
            match: /^\/soporte\/garantia-devolucion\/garantia\/historial(\/.*)?$/,
            steps: [
                {
                    title: 'Filtros',
                    text: 'Busca por ID de garantia o pedido y por rango de fechas. El boton con lupa carga los resultados.',
                    selector: 'input[name="documento"], input[name="fecha-inicial"], input[name="fecha-final"]',
                },
                {
                    title: 'Tabla de historial',
                    text: 'Muestra garantias de cualquier fase dentro del filtro. No mueve la fase; solo permite consulta, descarga y seguimiento.',
                    selector: '#soporte_garantia_devolucion_garantia_historial',
                },
                {
                    title: 'Abrir historial',
                    text: 'El boton azul abre el detalle historico del documento.',
                    selector: '#soporte_garantia_devolucion_garantia_historial .btn-info',
                    note: 'Si no hay resultados, no aparece boton azul.',
                },
            ],
        },
        {
            title: 'Ayuda: bandeja de garantias',
            match: /^\/soporte\/garantia-devolucion\/garantia(\/.*)?$/,
            steps: [
                {
                    title: 'Tabla visible',
                    text: 'Esta tabla muestra garantias de la fase actual.',
                    selector: 'table[id^="soporte_garantia_devolucion_garantia"]',
                },
                {
                    title: 'Abrir garantia',
                    text: 'El boton azul abre el modal para registrar el movimiento de esta fase.',
                    selector: 'table[id^="soporte_garantia_devolucion_garantia"] .btn-info',
                    note: 'Si la tabla esta vacia, no habra documento para abrir.',
                },
                {
                    title: 'Filtro de tabla',
                    text: 'El buscador filtra los documentos cargados en esta fase.',
                    selector: '.dataTables_filter input',
                },
            ],
        },
        {
            title: 'Ayuda: crear servicio',
            match: /^\/soporte\/garantia-devolucion\/servicio\/crear(\/)?$/,
            steps: [
                {
                    title: 'Contacto',
                    text: 'Registra el cliente del servicio: nombre, telefono y correo. Este flujo no depende de una venta previa.',
                    selector: 'input[name="nombrecompleto"]',
                },
                {
                    title: 'Productos',
                    text: 'Agrega cada producto manualmente con su cantidad. La tabla inferior muestra lo que se enviara al backend.',
                    selector: 'input[name="productoinput"]',
                },
                {
                    title: 'Tecnico',
                    text: 'Asigna el tecnico responsable del servicio desde la lista de usuarios de soporte.',
                    selector: 'select[name="tecnico"]',
                },
                {
                    title: 'Seguimiento',
                    text: 'Describe el problema o solicitud inicial para que la siguiente fase tenga contexto.',
                    selector: 'app-new-editor[name="seguimiento"]',
                },
                {
                    title: 'Guardar servicio',
                    text: 'Crea el folio de servicio y descarga el PDF que entrega el backend.',
                    selector: 'button.btn-primary.http-disabled',
                },
            ],
        },
        {
            title: 'Ayuda: servicios pendientes de revision',
            match: /^\/soporte\/garantia-devolucion\/servicio\/revision(\/)?$/,
            steps: [
                {
                    title: 'Tabla de revision',
                    text: 'Aqui entran servicios recien creados. En el modal se decide si tienen reparacion, costo o cierre.',
                    selector: '#soporte_garantia_devolucion_servicio_revision',
                },
                {
                    title: 'Abrir servicio',
                    text: 'El boton azul abre el folio para registrar diagnostico y decisiones del servicio.',
                    selector: '#soporte_garantia_devolucion_servicio_revision .btn-info',
                    note: 'Si no hay registros, no aparece boton azul.',
                },
                {
                    title: 'Buscar en tabla',
                    text: 'Filtra los servicios visibles en revision.',
                    selector: '#soporte_garantia_devolucion_servicio_revision_filter input, .dataTables_filter input',
                },
            ],
        },
        {
            title: 'Ayuda: servicios pendientes de cotizacion',
            match: /^\/soporte\/garantia-devolucion\/servicio\/cotizacion(\/)?$/,
            steps: [
                {
                    title: 'Tabla de cotizacion',
                    text: 'Aqui se listan servicios que necesitan cotizar piezas o mano de obra antes de continuar.',
                    selector: '#soporte_garantia_devolucion_servicio_cotizacion',
                },
                {
                    title: 'Abrir cotizacion',
                    text: 'El boton azul abre el modal para generar PDF de cotizacion, marcar si fue aceptada y definir el costo.',
                    selector: '#soporte_garantia_devolucion_servicio_cotizacion .btn-info',
                    note: 'Si no hay registros, no aparece boton azul.',
                },
                {
                    title: 'Buscar en tabla',
                    text: 'Filtra los servicios pendientes de cotizacion.',
                    selector: '#soporte_garantia_devolucion_servicio_cotizacion_filter input, .dataTables_filter input',
                },
            ],
        },
        {
            title: 'Ayuda: servicios pendientes de reparacion',
            match: /^\/soporte\/garantia-devolucion\/servicio\/reparacion(\/)?$/,
            steps: [
                {
                    title: 'Tabla de reparacion',
                    text: 'Aqui estan los servicios aprobados para reparar. El modal registra seguimiento y cierre de reparacion.',
                    selector: '#soporte_garantia_devolucion_servicio_reparacion',
                },
                {
                    title: 'Abrir reparacion',
                    text: 'El boton azul abre el servicio para documentar la reparacion y moverlo a entrega/envio cuando termines.',
                    selector: '#soporte_garantia_devolucion_servicio_reparacion .btn-info',
                    note: 'Si no hay registros, no aparece boton azul.',
                },
                {
                    title: 'Buscar en tabla',
                    text: 'Filtra los servicios cargados para reparacion.',
                    selector: '#soporte_garantia_devolucion_servicio_reparacion_filter input, .dataTables_filter input',
                },
            ],
        },
        {
            title: 'Ayuda: servicios pendientes de envio',
            match: /^\/soporte\/garantia-devolucion\/servicio\/envio(\/)?$/,
            steps: [
                {
                    title: 'Tabla de envio',
                    text: 'Aqui aparecen servicios listos para entregar o enviar al cliente.',
                    selector: '#soporte_garantia_devolucion_servicio_envio',
                },
                {
                    title: 'Abrir envio',
                    text: 'El boton azul abre el modal para paqueteria, guia, seguimiento y cierre del servicio.',
                    selector: '#soporte_garantia_devolucion_servicio_envio .btn-info',
                    note: 'Si no hay registros, no aparece boton azul.',
                },
                {
                    title: 'Buscar en tabla',
                    text: 'Filtra los servicios listos para entrega o envio.',
                    selector: '#soporte_garantia_devolucion_servicio_envio_filter input, .dataTables_filter input',
                },
            ],
        },
        {
            title: 'Ayuda: historial de servicios',
            match: /^\/soporte\/garantia-devolucion\/servicio\/historial(\/)?$/,
            steps: [
                {
                    title: 'Filtros',
                    text: 'Selecciona fecha inicial y final, luego carga documentos para revisar servicios historicos.',
                    selector: 'input[name="fecha_inicial"], input[name="fecha_final"]',
                },
                {
                    title: 'Tabla de historial',
                    text: 'Lista servicios de cualquier fase dentro del rango seleccionado.',
                    selector: '#soporte_garantia_devolucion_servicio_historial',
                },
                {
                    title: 'Abrir historial',
                    text: 'El boton azul abre el folio para descargar documento, consultar datos y agregar seguimiento.',
                    selector: '#soporte_garantia_devolucion_servicio_historial .btn-info',
                    note: 'Si no hay resultados, no aparece boton azul.',
                },
            ],
        },
        {
            title: 'Ayuda: bandeja de servicios',
            match: /^\/soporte\/garantia-devolucion\/servicio(\/.*)?$/,
            steps: [
                {
                    title: 'Tabla visible',
                    text: 'Esta tabla lista servicios de la fase actual.',
                    selector: 'table[id^="soporte_garantia_devolucion_servicio"]',
                },
                {
                    title: 'Abrir servicio',
                    text: 'El boton azul abre el folio para revisar contacto, productos, seguimientos y registrar el siguiente avance.',
                    selector: 'table[id^="soporte_garantia_devolucion_servicio"] .btn-info',
                    note: 'Si no hay registros, no aparece boton azul.',
                },
                {
                    title: 'Filtro de tabla',
                    text: 'El buscador filtra los servicios cargados en esta pantalla.',
                    selector: '.dataTables_filter input',
                },
            ],
        },
    ];

    constructor(private router: Router) {}

    ngOnInit() {
        this.refreshListener = () => this.refreshPosition();
        window.addEventListener('resize', this.refreshListener);
        window.addEventListener('scroll', this.refreshListener, true);

        this.routeSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.resolveContext(event.urlAfterRedirects || event.url);
            }
        });

        this.resolveContext(this.router.url);
    }

    ngOnDestroy() {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }

        window.removeEventListener('resize', this.refreshListener);
        window.removeEventListener('scroll', this.refreshListener, true);
    }

    startTour(event: Event) {
        this.stopEvent(event);

        this.currentContext = this.visibleContext(this.buildContext(this.router.url));

        if (!this.currentContext || this.currentContext.steps.length === 0) {
            return;
        }

        this.active = true;
        this.currentStepIndex = 0;
        this.setCurrentStep();
    }

    closeTour(event?: Event) {
        if (event) {
            this.stopEvent(event);
        }

        this.active = false;
        this.targetFound = false;
    }

    nextStep(event: Event) {
        this.stopEvent(event);

        if (this.isLastStep()) {
            this.closeTour();
            return;
        }

        this.currentStepIndex++;
        this.setCurrentStep();
    }

    previousStep(event: Event) {
        this.stopEvent(event);

        if (this.currentStepIndex === 0) {
            return;
        }

        this.currentStepIndex--;
        this.setCurrentStep();
    }

    isLastStep() {
        return this.currentContext && this.currentStepIndex >= this.currentContext.steps.length - 1;
    }

    stopEvent(event: Event) {
        event.preventDefault();
        event.stopPropagation();
    }

    private resolveContext(url: string) {
        this.hasContext = !!this.findRouteContext(this.cleanUrl(url));
        this.closeTour();
    }

    private buildContext(url: string): HelpContext {
        var cleanUrl = this.cleanUrl(url);

        if (this.isVisible('#serie')) {
            return {
                title: 'Ayuda: captura de series',
                match: /.*/,
                steps: [
                    {
                        title: 'Serie',
                        text: 'Captura una serie y presiona Enter o el boton de agregar. No debe repetirse y debe corresponder al producto cuando el backend pueda validarla.',
                        selector: '#serie',
                    },
                    {
                        title: 'Lista de series',
                        text: 'Aqui se acumulan las series capturadas para este producto. La cantidad debe coincidir con la cantidad marcada en la tabla del documento.',
                        selector: '#ul_series',
                    },
                    {
                        title: 'Guardar series',
                        text: 'Confirma las series para regresarlas al producto del modal principal. Si faltan series, el guardado final de la devolucion no debe continuar.',
                        selector: '#button_confirmar_series',
                    },
                ],
            };
        }

        if (this.isVisible('ngb-modal-window')) {
            return this.buildModalContext(cleanUrl);
        }

        return this.findRouteContext(cleanUrl);
    }

    private buildModalContext(cleanUrl: string): HelpContext {
        if (/^\/soporte\/garantia-devolucion\/devolucion\/pendiente(\/)?$/.test(cleanUrl)) {
            return {
                title: 'Ayuda: procesar devolucion pendiente',
                match: /.*/,
                steps: [
                    {
                        title: 'Modal activo',
                        text: 'Este modal procesa la devolucion seleccionada sin salir de la tabla. Aqui se valida la llegada del producto y se manda a revision.',
                        selector: 'ngb-modal-window .modal-content',
                    },
                    {
                        title: 'Documento',
                        text: 'Identifica la venta original y el folio de garantia/devolucion que se esta procesando.',
                        selector: '[data-help-id="refund-modal-document"]',
                    },
                    {
                        title: 'Asignar tecnico',
                        text: 'Selecciona quien revisara el producto despues de recibirlo. Al continuar, el documento queda asignado a ese tecnico.',
                        selector: 'select[name="tecnico"]',
                    },
                    {
                        title: 'Productos y series',
                        text: 'Cada producto muestra SKU, descripcion y cantidad. Usa Agregar para capturar las series que regresan; deben coincidir con la cantidad.',
                        selector: '[data-help-id="refund-modal-products"], ngb-modal-window table.table-striped',
                    },
                    {
                        title: 'Guia y paqueteria',
                        text: 'Registra la guia y paqueteria con la que llego el producto. Son obligatorias para poder continuar.',
                        selector: 'ngb-modal-window input[name="guia"], ngb-modal-window select[name="paqueteria"]',
                    },
                    {
                        title: 'Seguimiento',
                        text: 'Escribe que se recibio, en que condiciones llego y cualquier observacion. Este seguimiento queda en el historial del documento.',
                        selector: 'ngb-modal-window app-new-editor[name="seguimiento"]',
                    },
                    {
                        title: 'Archivos',
                        text: 'Adjunta evidencia nueva del paquete o producto. Tambien puedes abrir archivos que ya venian ligados al caso.',
                        selector: 'ngb-modal-window #archivos',
                    },
                    {
                        title: 'Continuar',
                        text: 'Guarda tecnico, guia, paqueteria, series, archivos y seguimiento. Si pasa validaciones, el documento sale de esta bandeja y pasa a Devoluciones pendientes de revision.',
                        selector: 'ngb-modal-window button.http-disabled',
                    },
                ],
            };
        }

        if (/^\/soporte\/garantia-devolucion\/devolucion\/revision(\/)?$/.test(cleanUrl)) {
            return {
                title: 'Ayuda: revision de devolucion',
                match: /.*/,
                steps: [
                    {
                        title: 'Revision del caso',
                        text: 'Aqui soporte decide si la devolucion requiere indemnizacion o si se puede cerrar el proceso.',
                        selector: 'ngb-modal-window .modal-content',
                    },
                    {
                        title: 'Seguimiento',
                        text: 'Registra el resultado de la revision. Es obligatorio para guardar.',
                        selector: 'ngb-modal-window app-new-editor[name="seguimiento"]',
                    },
                    {
                        title: 'Terminar',
                        text: 'Si esta apagado, solo guarda seguimiento y el documento permanece en esta fase. Si esta activo, aplica la decision del siguiente switch.',
                        selector: '#terminar',
                    },
                    {
                        title: 'Requiere indemnizacion',
                        text: 'Con Terminar activo: si lo activas, pasa a Pendientes indemnizacion; si no lo activas, finaliza la devolucion generando nota de credito y traspaso.',
                        selector: '#disponible',
                    },
                    {
                        title: 'Guardar',
                        text: 'Guarda el seguimiento y mueve o finaliza el documento segun los switches.',
                        selector: 'ngb-modal-window button.http-disabled',
                    },
                ],
            };
        }

        if (/^\/soporte\/garantia-devolucion\/devolucion\/indemnizacion(\/)?$/.test(cleanUrl)) {
            return {
                title: 'Ayuda: indemnizacion',
                match: /.*/,
                steps: [
                    {
                        title: 'Modal activo',
                        text: 'Aqui se registra si el documento debe avanzar a reclamo con marketplace.',
                        selector: 'ngb-modal-window .modal-content',
                    },
                    {
                        title: 'Seguimiento',
                        text: 'Registra la evidencia o resultado de esta fase.',
                        selector: 'ngb-modal-window app-new-editor[name="seguimiento"]',
                    },
                    {
                        title: 'Terminar',
                        text: 'Si esta apagado, solo se guarda seguimiento y el documento queda en indemnizacion.',
                        selector: '#terminar',
                    },
                    {
                        title: 'Espera reclamo',
                        text: 'Con Terminar activo, si lo activas el caso pasa a reclamo con marketplace. Si no lo activas, no cambia de fase.',
                        selector: '#indemnizacion',
                    },
                    {
                        title: 'Guardar',
                        text: 'Guarda seguimiento y, si corresponde, mueve el caso a reclamo.',
                        selector: 'button-text:Guardar',
                    },
                ],
            };
        }

        if (/^\/soporte\/garantia-devolucion\/devolucion\/reclamo(\/)?$/.test(cleanUrl)) {
            return this.simpleSwitchModal(
                'Ayuda: reclamo marketplace',
                'Aqui se registra el resultado del reclamo con marketplace.',
                'Con Terminar activo, el backend intenta finalizar la devolucion generando nota de credito y traspaso. Si no terminas, solo queda el seguimiento.'
            );
        }

        if (/^\/soporte\/garantia-devolucion\/devolucion\/historial(\/.*)?$/.test(cleanUrl)) {
            return this.historyModal(
                'Ayuda: historial de devolucion',
                'Este modal es de consulta historica. Puedes revisar venta, cliente, fase, archivos y seguimientos sin mover el flujo.',
                'Agrega una nota al historial de la devolucion. No cambia fase ni genera documentos nuevos.',
                false
            );
        }

        if (/^\/soporte\/garantia-devolucion\/garantia\/recibir(\/)?$/.test(cleanUrl)) {
            return {
                title: 'Ayuda: recibir garantia',
                match: /.*/,
                steps: [
                    {
                        title: 'Modal activo',
                        text: 'Este modal registra la llegada fisica de la garantia y la manda a reparacion/revision tecnica.',
                        selector: 'ngb-modal-window .modal-content',
                    },
                    {
                        title: 'Asignar tecnico',
                        text: 'Selecciona quien revisara el producto. Al guardar con Terminar activo, el caso queda asignado a ese tecnico.',
                        selector: 'select[name="tecnico"]',
                    },
                    {
                        title: 'Productos y series',
                        text: 'Cada producto muestra cantidad. Usa Agregar para capturar las series recibidas; el modal de series valida que no excedas la cantidad.',
                        selector: 'ngb-modal-window table.table-striped',
                    },
                    {
                        title: 'Guia y paqueteria',
                        text: 'Captura la guia y paqueteria de llegada. Son parte de la evidencia de recepcion.',
                        selector: 'ngb-modal-window input[name="guia"], ngb-modal-window select[name="paqueteria"]',
                    },
                    {
                        title: 'Notificar usuarios',
                        text: 'Busca usuarios de soporte/sistemas para avisarles que el paquete fue asignado.',
                        selector: '#usuario_input, #usuario_select, #button_buscar',
                    },
                    {
                        title: 'Agregar notificado',
                        text: 'Agrega el usuario seleccionado a la lista de notificados. Al guardar, el backend crea la notificacion para esa lista.',
                        selector: 'ngb-modal-window button.btn-success',
                    },
                    {
                        title: 'Seguimiento',
                        text: 'Describe como llego el producto, evidencia recibida y cualquier observacion relevante.',
                        selector: 'ngb-modal-window app-new-editor[name="seguimiento"]',
                    },
                    {
                        title: 'Terminar',
                        text: 'Si esta activo, guarda recepcion, tecnico, guia, paqueteria, series y notificados; luego manda la garantia a reparacion. Si esta apagado, solo agrega seguimiento.',
                        selector: '#terminar',
                    },
                    {
                        title: 'Guardar',
                        text: 'Guarda el movimiento de recepcion. El boton se deshabilita si falta seguimiento o tecnico.',
                        selector: 'button-text:Guardar',
                    },
                ],
            };
        }

        if (/^\/soporte\/garantia-devolucion\/garantia\/reparacion(\/)?$/.test(cleanUrl)) {
            return {
                title: 'Ayuda: revision de garantia',
                match: /.*/,
                steps: [
                    {
                        title: 'Revision tecnica',
                        text: 'Aqui el tecnico registra que paso con el producto en garantia.',
                        selector: 'ngb-modal-window .modal-content',
                    },
                    {
                        title: 'Seguimiento',
                        text: 'Describe el diagnostico y la decision tecnica.',
                        selector: 'ngb-modal-window app-new-editor[name="seguimiento"]',
                    },
                    {
                        title: 'Terminar',
                        text: 'Si esta apagado, solo guarda seguimiento. Si esta activo, se aplica la decision de devolucion de producto.',
                        selector: '#terminar',
                    },
                    {
                        title: 'Se devuelve producto',
                        text: 'Con Terminar activo: si esta activado, la garantia queda en fase de entrega/envio; si esta apagado, pasa a Pendientes cambio.',
                        selector: '#reparado',
                    },
                    {
                        title: 'Guardar',
                        text: 'Guarda el seguimiento y mueve la garantia segun los switches.',
                        selector: 'ngb-modal-window button.http-disabled',
                    },
                ],
            };
        }

        if (/^\/soporte\/garantia-devolucion\/garantia\/cambio(\/)?$/.test(cleanUrl)) {
            return {
                title: 'Ayuda: cambio de garantia',
                match: /.*/,
                steps: [
                    {
                        title: 'Modal activo',
                        text: 'Aqui se procesa el cambio de producto. Al guardar, el backend crea nota de credito, traspaso y un pedido nuevo de reemplazo.',
                        selector: 'ngb-modal-window .modal-content',
                    },
                    {
                        title: 'Mismo producto',
                        text: 'Activo: se cambia por el mismo SKU de la venta original y solo ajustas cantidades. Si necesitas revisar el flujo de SKU nuevo, apaga este switch, cierra esta ayuda y vuelve a tocar el boton de ayuda.',
                        selector: '#mismo_producto',
                    },
                    {
                        title: 'Productos anteriores',
                        text: 'Si usas el mismo producto, revisa o ajusta cantidades. Estas lineas se usan para el nuevo pedido.',
                        selector: 'input[name^="cantidad_producto"], ngb-modal-window table.table-striped',
                    },
                    {
                        title: 'Nuevo SKU',
                        text: 'Si no es el mismo producto, captura el SKU nuevo y usa Buscar. El backend valida que exista y que haya stock en el almacen seleccionado.',
                        selector: '#nuevo_sku, #btn_buscar_sku',
                    },
                    {
                        title: 'Almacen y cantidad',
                        text: 'El almacen define de donde se surtira el pedido nuevo. La cantidad debe ser mayor a cero y no puede exceder la existencia validada.',
                        selector: '#almacen_salida, #cantidad_nueva',
                    },
                    {
                        title: 'Seguimiento',
                        text: 'Explica por que se cambio el producto y cualquier acuerdo con el cliente.',
                        selector: 'ngb-modal-window app-new-editor[name="seguimiento"]',
                    },
                    {
                        title: 'Guardar',
                        text: 'Ejecuta el cambio: genera NC, traspaso y pedido; despues manda la garantia a entrega/envio.',
                        selector: 'button-text:Guardar',
                    },
                ],
            };
        }

        if (/^\/soporte\/garantia-devolucion\/garantia\/pedido(\/)?$/.test(cleanUrl)) {
            return {
                title: 'Ayuda: pedido de garantia',
                match: /.*/,
                steps: [
                    {
                        title: 'Modal activo',
                        text: 'Este formulario crea un nuevo pedido de venta ligado a la garantia. Al guardar, la garantia se cierra.',
                        selector: 'ngb-modal-window .modal-content',
                    },
                    {
                        title: 'Empresa y documento',
                        text: 'Selecciona empresa y revisa el documento base. Estos datos definen catalogos, almacen y datos fiscales disponibles.',
                        selector: '#empresa, input[name="inputdocumento"]',
                    },
                    {
                        title: 'Cliente',
                        text: 'Revisa o corrige razon social, RFC, telefonos y correo. Si el RFC ya existe, el backend relaciona el pedido al cliente existente.',
                        selector: 'input[name="cliente_razon"], input[name="cliente_rfc"], input[name="cliente_correo"]',
                    },
                    {
                        title: 'Documento de venta',
                        text: 'Almacen, periodo, uso CFDI, moneda, tipo de cambio y paqueteria forman el encabezado del pedido que se va a crear.',
                        selector: '#almacen_documento, #periodo, select[name="uso_venta"], #paqueteria',
                    },
                    {
                        title: 'Generar guia',
                        text: 'Abre la pantalla de logistica para crear una guia relacionada al documento. No guarda el pedido por si sola.',
                        selector: 'button-text:Generar guia',
                    },
                    {
                        title: 'Direccion de envio',
                        text: 'Captura contacto, calle, numero, codigo postal, colonia, ciudad y estado para la direccion del nuevo pedido.',
                        selector: 'input[name="de_contacto"], input[name="de_codigo_postal"], #de_colonia',
                    },
                    {
                        title: 'Precio cambiado',
                        text: 'Si lo activas, el pedido queda como no pagado. Si esta apagado, el backend lo registra como pagado.',
                        selector: '#precio_cambiado',
                    },
                    {
                        title: 'Buscar producto',
                        text: 'Captura texto o selecciona un codigo y presiona Buscar para cargar el SKU en el formulario de producto.',
                        selector: '#pro_codigo_text, #pro_codigo, button-text:Buscar',
                    },
                    {
                        title: 'Datos del producto',
                        text: 'Cantidad, precio, garantia y modificacion se enviaran como movimiento del nuevo pedido.',
                        selector: 'input[name="pro_cantidad"], input[name="pro_precio"], select[name="pro_garantia"], input[name="pro_modificacion"]',
                    },
                    {
                        title: 'Agregar producto',
                        text: 'Agrega la linea capturada a la tabla del pedido. No se guarda en backend hasta presionar Guardar.',
                        selector: 'button-text:Agregar',
                    },
                    {
                        title: 'Borrar producto',
                        text: 'Quita una linea de la tabla antes de crear el pedido.',
                        selector: 'button-text:Borrar',
                        note: 'Si todavia no agregaste productos, este boton no aparece.',
                    },
                    {
                        title: 'Archivos y seguimiento',
                        text: 'Adjunta evidencia y escribe el seguimiento que quedara ligado al pedido nuevo.',
                        selector: '#archivos, ngb-modal-window app-new-editor[name="seguimiento"]',
                    },
                    {
                        title: 'Guardar',
                        text: 'Crea el pedido, movimientos, direccion, archivos y seguimiento; despues actualiza la garantia a fase finalizada.',
                        selector: 'button-text:Guardar',
                    },
                ],
            };
        }

        if (/^\/soporte\/garantia-devolucion\/garantia\/envio(\/)?$/.test(cleanUrl)) {
            return this.shippingModal(
                'Ayuda: envio de garantia',
                'Captura la paqueteria y guia de salida para entregar o enviar el producto al cliente.',
                'Con Terminar activo, guarda guia/paqueteria de envio y cierra la garantia en fase finalizada.'
            );
        }

        if (/^\/soporte\/garantia-devolucion\/garantia\/historial(\/.*)?$/.test(cleanUrl)) {
            return this.historyModal(
                'Ayuda: historial de garantia',
                'Este modal muestra el historial completo de la garantia y los datos de venta, envio y fase.',
                'Agrega seguimiento historico sin mover la garantia de fase.',
                true
            );
        }

        if (/^\/soporte\/garantia-devolucion\/servicio\/revision(\/)?$/.test(cleanUrl)) {
            return {
                title: 'Ayuda: revision de servicio',
                match: /.*/,
                steps: [
                    {
                        title: 'Revision del servicio',
                        text: 'Aqui se decide si el servicio tiene reparacion y si tendra costo.',
                        selector: 'ngb-modal-window .modal-content',
                    },
                    {
                        title: 'Tiene reparacion',
                        text: 'Si esta activo, el servicio pasa hacia reparacion cuando terminas. Si esta apagado, se evalua si debe cobrarse o cerrarse.',
                        selector: '#tiene_reparacion',
                    },
                    {
                        title: 'Tiene costo',
                        text: 'Si no tiene reparacion pero si costo, el sistema crea el flujo de cotizacion/cobro. Si no tiene costo, puede cerrarse.',
                        selector: '#tiene_costo',
                    },
                    {
                        title: 'Seguimiento',
                        text: 'Describe el diagnostico del servicio y la razon de la decision.',
                        selector: 'ngb-modal-window app-new-editor[name="seguimiento"]',
                    },
                    {
                        title: 'Terminar',
                        text: 'Con Terminar activo se mueve el servicio segun las decisiones. Con Terminar apagado solo se agrega seguimiento.',
                        selector: '#terminar',
                    },
                    {
                        title: 'Guardar',
                        text: 'Si tiene reparacion, pasa a reparacion. Si no tiene reparacion y tiene costo, genera pedido de cobro y puede cerrarse. Si no tiene costo, se manda a entrega/envio.',
                        selector: 'button-text:Guardar',
                    },
                ],
            };
        }

        if (/^\/soporte\/garantia-devolucion\/servicio\/cotizacion(\/)?$/.test(cleanUrl)) {
            return {
                title: 'Ayuda: cotizacion de servicio',
                match: /.*/,
                steps: [
                    {
                        title: 'Modal activo',
                        text: 'Aqui se prepara la cotizacion para el cliente y se decide si el servicio continua a reparacion o pasa a entrega/cierre.',
                        selector: 'ngb-modal-window .modal-content',
                    },
                    {
                        title: 'Productos para cotizacion',
                        text: 'Captura producto, cantidad y precio. Agregar producto lo pasa a la tabla de cotizacion; Eliminar quita una linea.',
                        selector: 'input[name="producto"], input[name="cantidad"], input[name="precio"], button-text:Agregar producto',
                    },
                    {
                        title: 'Crear cotizacion',
                        text: 'Genera y descarga el PDF de cotizacion. Este boton no guarda la fase; solo crea el documento de cotizacion.',
                        selector: 'button-text:Crear cotizacion',
                    },
                    {
                        title: 'Eliminar producto',
                        text: 'Quita una linea de la tabla de productos para cotizacion antes de generar el PDF.',
                        selector: 'button-text:Eliminar',
                        note: 'Si no agregaste productos para cotizacion, este boton no aparece.',
                    },
                    {
                        title: 'Cotizacion aceptada',
                        text: 'Con Terminar activo: si esta aceptada, el servicio pasa a reparacion. Si no esta aceptada, pasa a entrega/cierre.',
                        selector: '#cotizacion_aceptada',
                    },
                    {
                        title: 'Costo total',
                        text: 'Si el costo total es mayor a cero, el backend genera un pedido para cobrar el servicio usando el SKU de servicio configurado.',
                        selector: 'input[name="costo_total"]',
                    },
                    {
                        title: 'Seguimiento',
                        text: 'Registra que se cotizo, que acepto o rechazo el cliente y cualquier condicion del servicio.',
                        selector: 'ngb-modal-window app-new-editor[name="seguimiento"]',
                    },
                    {
                        title: 'Terminar',
                        text: 'Apagado: solo guarda seguimiento. Activo: aplica aceptacion, costo y cambio de fase.',
                        selector: '#terminar',
                    },
                    {
                        title: 'Guardar',
                        text: 'Guarda seguimiento y, si Terminar esta activo, actualiza el servicio a reparacion o entrega/cierre.',
                        selector: 'button-text:Guardar',
                    },
                ],
            };
        }

        if (/^\/soporte\/garantia-devolucion\/servicio\/reparacion(\/)?$/.test(cleanUrl)) {
            return this.finishOnlyModal(
                'Ayuda: reparacion de servicio',
                'Aqui se documenta la reparacion realizada al servicio.',
                'Con Terminar activo, el servicio pasa a entrega/envio. Con Terminar apagado, solo guarda seguimiento.'
            );
        }

        if (/^\/soporte\/garantia-devolucion\/servicio\/envio(\/)?$/.test(cleanUrl)) {
            return this.shippingModal(
                'Ayuda: envio de servicio',
                'Captura como se entregara o enviara el equipo al cliente. El enlace Generar guia abre la pantalla de guia en otra pestana.',
                'Con Terminar activo, guarda guia/paqueteria de envio y finaliza el servicio.'
            );
        }

        if (/^\/soporte\/garantia-devolucion\/servicio\/historial(\/)?$/.test(cleanUrl)) {
            return this.historyModal(
                'Ayuda: historial de servicio',
                'Este modal muestra el folio de servicio, contacto, fase, productos y seguimientos.',
                'Agrega seguimiento historico sin mover el servicio de fase.',
                true
            );
        }

        return {
            title: 'Ayuda: modal activo',
            match: /.*/,
            steps: [
                {
                    title: 'Detalle',
                    text: 'Este modal muestra el documento abierto. Revisa la informacion antes de registrar el seguimiento o avanzar la fase.',
                    selector: 'ngb-modal-window .modal-content',
                },
                {
                    title: 'Seguimiento',
                    text: 'El seguimiento registra que se hizo en esta fase. Si el boton guardar esta deshabilitado, normalmente falta este campo.',
                    selector: 'ngb-modal-window app-new-editor[name="seguimiento"]',
                },
                {
                    title: 'Terminar',
                    text: 'Cuando existe, este switch decide si solo guardas seguimiento o si el documento avanza/cierra segun la fase actual.',
                    selector: '#terminar',
                    note: 'Si esta pantalla no tiene switch Terminar, este paso no se resaltara.',
                },
                {
                    title: 'Guardar',
                    text: 'Guarda el movimiento de la fase actual. Si hay switches activos, tambien aplica el cambio de fase correspondiente.',
                    selector: 'ngb-modal-window button.http-disabled',
                },
            ],
        };
    }

    private simpleSwitchModal(title: string, intro: string, terminarText: string): HelpContext {
        return {
            title: title,
            match: /.*/,
            steps: [
                {
                    title: 'Modal activo',
                    text: intro,
                    selector: 'ngb-modal-window .modal-content',
                },
                {
                    title: 'Seguimiento',
                    text: 'Registra la evidencia o resultado de esta fase.',
                    selector: 'ngb-modal-window app-new-editor[name="seguimiento"]',
                },
                {
                    title: 'Terminar',
                    text: terminarText,
                    selector: '#terminar',
                },
                {
                    title: 'Guardar',
                    text: 'Guarda el seguimiento y aplica el cambio de fase si corresponde.',
                    selector: 'button-text:Guardar',
                },
            ],
        };
    }

    private shippingModal(title: string, intro: string, finishText: string): HelpContext {
        return {
            title: title,
            match: /.*/,
            steps: [
                {
                    title: 'Modal activo',
                    text: intro,
                    selector: 'ngb-modal-window .modal-content',
                },
                {
                    title: 'Paqueteria',
                    text: 'Selecciona la paqueteria de salida. Algunas paqueterias internas o de entrega directa no requieren guia.',
                    selector: 'ngb-modal-window select[name="paqueteria"]',
                },
                {
                    title: 'Generar guia',
                    text: 'Cuando aparece, abre la pantalla de logistica para crear la guia del documento en otra pestana.',
                    selector: 'button-text:Generar guia',
                    note: 'En garantia no siempre existe este enlace; en servicio envio si aparece.',
                },
                {
                    title: 'Guia',
                    text: 'Captura el numero de guia cuando la paqueteria lo requiere. Si seleccionas entrega directa o interna, el campo puede ocultarse.',
                    selector: 'ngb-modal-window input[name="guia"]',
                },
                {
                    title: 'Seguimiento',
                    text: 'Registra como se entrega o envia el producto y cualquier observacion para el cliente o soporte.',
                    selector: 'ngb-modal-window app-new-editor[name="seguimiento"]',
                },
                {
                    title: 'Terminar',
                    text: finishText,
                    selector: '#terminar',
                },
                {
                    title: 'Guardar',
                    text: 'Guarda la informacion de envio y aplica el cierre si Terminar esta activo.',
                    selector: 'button-text:Guardar',
                },
            ],
        };
    }

    private finishOnlyModal(title: string, intro: string, finishText: string): HelpContext {
        return {
            title: title,
            match: /.*/,
            steps: [
                {
                    title: 'Modal activo',
                    text: intro,
                    selector: 'ngb-modal-window .modal-content',
                },
                {
                    title: 'Productos',
                    text: 'Revisa los productos ligados al folio para confirmar que el seguimiento corresponde al equipo correcto.',
                    selector: 'ngb-modal-window table.table-striped',
                },
                {
                    title: 'Seguimiento',
                    text: 'Describe lo realizado en esta fase. Si falta seguimiento, el boton Guardar queda deshabilitado.',
                    selector: 'ngb-modal-window app-new-editor[name="seguimiento"]',
                },
                {
                    title: 'Terminar',
                    text: finishText,
                    selector: '#terminar',
                },
                {
                    title: 'Guardar',
                    text: 'Guarda el seguimiento y aplica el cambio de fase si Terminar esta activo.',
                    selector: 'button-text:Guardar',
                },
            ],
        };
    }

    private historyModal(title: string, intro: string, saveText: string, canDownload: boolean): HelpContext {
        var steps: HelpStep[] = [
            {
                title: 'Modal activo',
                text: intro,
                selector: 'ngb-modal-window .modal-content',
            },
        ];

        if (canDownload) {
            steps.push({
                title: 'Descargar documento',
                text: 'Descarga el PDF del documento historico para consulta o evidencia.',
                selector: 'button-text:Documento',
            });
        }

        steps.push(
            {
                title: 'Informacion del caso',
                text: 'Revisa cliente, marketplace o contacto, paqueterias, guias, tecnico y fase actual registrada.',
                selector: 'ngb-modal-window .form-horizontal',
            },
            {
                title: 'Seguimiento',
                text: saveText,
                selector: 'ngb-modal-window app-new-editor[name="seguimiento"]',
            },
            {
                title: 'Archivos',
                text: 'Cuando existen, puedes abrir archivos guardados como evidencia. Si no hay archivos, el modal muestra Sin archivos.',
                selector: 'ngb-modal-window ul, ngb-modal-window table.table-striped',
                note: 'Algunos historiales no tienen seccion de archivos y este paso puede no resaltarse.',
            },
            {
                title: 'Guardar',
                text: 'Guarda solo el seguimiento historico. No cambia de fase.',
                selector: 'button-text:Guardar',
            }
        );

        return {
            title: title,
            match: /.*/,
            steps: steps,
        };
    }

    private setCurrentStep() {
        this.currentStep = this.currentContext.steps[this.currentStepIndex];
        this.focusCurrentTarget();
    }

    private focusCurrentTarget() {
        var target = this.findTarget();

        if (target) {
            (target as any).scrollIntoView({
                block: 'center',
                inline: 'nearest',
            });
        }

        setTimeout(() => this.refreshPosition(), 180);
    }

    private refreshPosition() {
        if (!this.active || !this.currentStep) {
            return;
        }

        var target = this.findTarget();
        this.targetFound = !!target;

        if (!target) {
            this.highlightStyle = {};
            this.panelStyle = this.defaultPanelStyle();
            return;
        }

        var rect = target.getBoundingClientRect();
        var margin = 8;
        var panelWidth = 360;
        var panelHeight = 240;
        var left = rect.right + 18;
        var top = rect.top;

        if (left + panelWidth > window.innerWidth) {
            left = rect.left - panelWidth - 18;
        }

        if (left < 16) {
            left = 16;
        }

        if (top + panelHeight > window.innerHeight) {
            top = window.innerHeight - panelHeight - 16;
        }

        if (top < 16) {
            top = 16;
        }

        this.highlightStyle = {
            top: Math.max(8, rect.top - margin) + 'px',
            left: Math.max(8, rect.left - margin) + 'px',
            width: Math.min(window.innerWidth - 16, rect.width + margin * 2) + 'px',
            height: Math.max(32, rect.height + margin * 2) + 'px',
        };

        this.panelStyle = {
            top: top + 'px',
            left: left + 'px',
        };
    }

    private findTarget(): HTMLElement {
        return this.findTargetForStep(this.currentStep);
    }

    private findTargetForStep(step: HelpStep): HTMLElement {
        if (!step || !step.selector) {
            return null;
        }

        var selectors = step.selector.split(',');

        for (var selectorIndex = 0; selectorIndex < selectors.length; selectorIndex++) {
            var selector = selectors[selectorIndex].trim();

            if (!selector) {
                continue;
            }

            if (selector.indexOf('button-text:') === 0) {
                var buttonTarget = this.findButtonByText(selector.replace('button-text:', ''));

                if (buttonTarget) {
                    return this.expandTarget(buttonTarget);
                }

                continue;
            }

            var nodes: NodeListOf<Element>;

            try {
                nodes = document.querySelectorAll(selector);
            } catch (e) {
                continue;
            }

            for (var i = 0; i < nodes.length; i++) {
                var element = nodes.item(i) as HTMLElement;
                var rect = element.getBoundingClientRect();

                if (rect.width > 0 && rect.height > 0) {
                    return this.expandTarget(element);
                }
            }
        }

        return null;
    }

    private visibleContext(context: HelpContext): HelpContext {
        if (!context) {
            return null;
        }

        var steps: HelpStep[] = [];

        for (var i = 0; i < context.steps.length; i++) {
            var step = context.steps[i];

            if (!step.selector || this.findTargetForStep(step)) {
                steps.push(step);
            }
        }

        return {
            title: context.title,
            match: context.match,
            steps: steps,
        };
    }

    private expandTarget(element: HTMLElement): HTMLElement {
        if (!element) {
            return null;
        }

        if (this.normalizeText(element.tagName) === 'ui-switch') {
            var group = (element as any).closest
                ? (element as any).closest('.form-group.group-div, .form-group')
                : null;

            if (group) {
                return group as HTMLElement;
            }
        }

        return element;
    }

    private findButtonByText(label: string): HTMLElement {
        var expected = this.normalizeText(label);
        var nodes = document.querySelectorAll('ngb-modal-window button, ngb-modal-window a.btn, button, a.btn');

        for (var i = 0; i < nodes.length; i++) {
            var element = nodes.item(i) as HTMLElement;
            var rect = element.getBoundingClientRect();

            if (rect.width <= 0 || rect.height <= 0) {
                continue;
            }

            var text = this.normalizeText(element.innerText || element.textContent || '');

            if (text === expected || text.indexOf(expected) !== -1) {
                return element;
            }
        }

        return null;
    }

    private normalizeText(value: string): string {
        return (value || '').replace(/\s+/g, ' ').toLowerCase().trim();
    }

    private findRouteContext(cleanUrl: string): HelpContext {
        for (var i = 0; i < this.routeContexts.length; i++) {
            if (this.routeContexts[i].match.test(cleanUrl)) {
                return this.routeContexts[i];
            }
        }

        return null;
    }

    private isVisible(selector: string): boolean {
        var nodes = document.querySelectorAll(selector);

        for (var i = 0; i < nodes.length; i++) {
            var rect = (nodes.item(i) as HTMLElement).getBoundingClientRect();

            if (rect.width > 0 && rect.height > 0) {
                return true;
            }
        }

        return false;
    }

    private cleanUrl(url: string) {
        return (url || '').split('?')[0].split('#')[0];
    }

    private defaultPanelStyle() {
        return {
            bottom: '88px',
            right: '24px',
        };
    }
}
