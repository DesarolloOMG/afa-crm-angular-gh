export interface BillingHelp {
    title: string;
    owner: string;
    steps: string[];
}

/** Guidance only: never changes fiscal data or assumes a failed request was not stamped. */
export function billingHelp(error: any, creditNote: boolean, external: boolean): BillingHelp {
    const value = typeof error === 'string' ? {message: error} : (error || {});
    const text = [value.nexfira_code, value.error_code, value.code, value.path, value.message, value.error_message]
        .filter(Boolean).join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const guide = (title: string, owner: string, steps: string[]): BillingHelp => ({title, owner, steps});
    if (/antecedent_busy|reserva|uncertain|incierto|conciliacion|solicitud.*activa/.test(text)
        && !/nota de conciliacion|concilia.*saldos por concepto/.test(text)) {
        return guide('Consultar el estado antes de volver a enviar', 'Contabilidad / soporte Nexfira', [
            'En la fila del documento, pulsa Consultar si está disponible y revisa el estado y los archivos fiscales.',
            'Si hay una reserva activa o el resultado sigue incierto, solicita a soporte Nexfira conciliar la solicitud existente.',
            'Espera la confirmación del resultado antes de reenviar, registrar otro CFDI o cambiar importes.',
        ]);
    }
    if (/invalid_fiscal_xml/.test(text)) {
        return guide('Revisar el rechazo del XML original', 'Contabilidad / soporte Nexfira', [
            'Vuelve a abrir Preparar factura origen para obtener una vista previa actual del XML registrado.',
            'Si el rechazo continúa, comparte con soporte el documento, el código y la referencia que aparecen en esta ayuda; solicita el campo exacto que falla.',
            'Usa el XML original del emisor. El rechazo genérico no identifica un cambio de cliente ni de monto que debas hacer.',
        ]);
    }
    if (/tiene un cfdi externo|prepara su xml/.test(text) && !external) {
        return guide('Preparar el origen sólo para emitir con Nexfira', 'Contabilidad', [
            'En Individual · Nexfira → Notas de crédito, busca esta NC y pulsa Preparar factura origen en su fila.',
            'Revisa la factura mostrada y verifica su vigencia con tu evidencia fiscal. Captura el neto disponible por concepto, sin impuestos y considerando notas previas.',
            'Completa la nota de conciliación y confirma vigencia y saldos. Confirmar factura origen registra el antecedente en Nexfira; conserva la factura original.',
            'Después pulsa Timbrar NC con Nexfira y revisa la vista previa antes de enviar.',
            'Si ya emitiste la NC en otro sistema, ve a Registrar CFDI externo → Notas de crédito → selecciona la NC → Registrar NC externa. Adjunta su XML y PDF; este recorrido no requiere importar el origen en Nexfira.',
        ]);
    }
    if (/saldo|remaininglines|netamount/.test(text)) {
        return guide('Conciliar el saldo disponible', 'Contabilidad', [
            'Compara el importe de la NC con las notas previas y el saldo real de cada concepto de la factura original.',
            'En Preparar factura origen, el saldo se captura sin impuestos y no puede superar el neto original del concepto. No captures el total de la NC como saldo de toda la factura.',
            'Si el origen ya se confirmó o el saldo de Nexfira no coincide con tu conciliación, solicita revisión a soporte antes de enviar. No reduzcas el monto sólo para evitar el error.',
        ]);
    }
    if (/uuid.*origen|venta origen identificada|facturas origen|uuid relacionados/.test(text)) {
        return guide('Revisar el vínculo con la factura original', 'Contabilidad / soporte AFA', [
            'Abre la venta original y verifica que tenga registrado el UUID de su factura y que corresponda a esta NC.',
            'Para registrar una NC externa, su XML de egreso debe relacionar el UUID de la factura original.',
            'Si la NC no tiene una venta origen identificada, solicita a soporte AFA corregir el vínculo con evidencia de la operación.',
        ]);
    }
    if (/receptor|receiver|rfc|razon social|regimen|codigo postal|postalcode|cfdiuse|uso cfdi/.test(text)) {
        return guide('Verificar los datos fiscales del receptor', 'Contabilidad', creditNote ? [
            'Compara receptor y moneda de la NC con el XML de la factura original. Deben corresponder a la misma operación.',
            'Si el XML externo pertenece a otro cliente, selecciona el archivo correcto. Si el vínculo o los datos de AFA no coinciden, solicita su revisión con soporte AFA.',
            'Para cambiar el receptor de una factura ya emitida, revisa el proceso de refacturación con Contabilidad; no cambies el cliente sólo para forzar esta NC.',
        ] : [
            'Revisa el campo indicado en el error: RFC, razón social, régimen, código postal o uso CFDI, contra los datos fiscales del cliente.',
            'Corrige el dato en la ficha fiscal del cliente o el receptor del pedido, según corresponda. Cambia de cliente sólo si el pedido está asociado al equivocado.',
            'Vuelve a Facturación, pulsa Actualizar y revisa de nuevo el receptor antes de enviar.',
        ]);
    }
    if (/total|importe|precio|descuento|unitprice|expectedtotals/.test(text)) {
        return guide('Comparar los importes con la operación', 'Contabilidad', external ? [
            'Compara el total del XML con la suma de los documentos seleccionados. Verifica cantidades, descuentos e impuestos.',
            'Selecciona únicamente los documentos incluidos en ese CFDI y carga los archivos correctos. Si el CFDI emitido tiene un error, revísalo con el emisor; no edites el XML firmado.',
        ] : creditNote ? [
            'Compara cantidad, precio, descuento e impuestos de la NC con la devolución o bonificación autorizada y la factura original.',
            'Solicita a Contabilidad revisar la NC si no coincide. No cambies el importe de la factura ya emitida ni reduzcas el monto sólo para pasar la validación.',
        ] : [
            'Abre la vista previa de la factura y compara cantidades, precios y descuentos con el pedido.',
            'Si el pedido admite edición, usa Corregir importes del pedido y Guardar importe. Los precios de esa sección incluyen IVA.',
            'Si está bloqueado por pagos, una solicitud activa o un CFDI existente, solicita revisión a Contabilidad. Después actualiza la vista previa.',
        ]);
    }
    if (/xml|pdf|timbre|tipo e|egreso/.test(text)) {
        return guide('Revisar los archivos fiscales', 'Contabilidad', [
            external
                ? 'En Registrar CFDI externo, selecciona los documentos y adjunta el XML y PDF originales del CFDI ya timbrado.'
                : 'Comprueba que la venta original tenga registrado su XML original, legible y correspondiente a esa factura.',
            creditNote && external
                ? 'Carga el XML tipo E (egreso) de la NC, no el XML de ingreso de la venta. Revisa total, receptor, moneda y UUID relacionados.'
                : 'Comprueba el tipo de comprobante, UUID, receptor y moneda indicados en el error.',
            'Si el archivo es incorrecto o ilegible, solicita el original al emisor. No modifiques el XML firmado.',
        ]);
    }
    if (/serie|folio/.test(text)) {
        return guide('Revisar la serie y el folio', 'Contabilidad / administración AFA', [
            'En la vista previa revisa la serie del marketplace y el folio. Para emisión con Nexfira puedes dejar el folio vacío para usar el consecutivo automático.',
            'Si el folio ya está reservado, revisa primero la solicitud existente. Si falta la configuración de la serie, solicita su corrección a administración AFA.',
        ]);
    }
    if (/metodo|forma de pago|paymentmethod|paymentform|parcialidad/.test(text)) {
        return guide('Revisar los datos de pago', 'Contabilidad', [
            'En la preparación de la NC con Nexfira, revisa método PUE y la forma de pago que corresponda a la operación.',
            'Al preparar una factura origen PUE, la siguiente parcialidad debe ser 1. Para otros casos verifica la parcialidad real con Contabilidad.',
        ]);
    }
    if (/ya.*facturad|ya tiene.*(cfdi|uuid)|stamped/.test(text)) {
        return guide('Revisar el CFDI existente', 'Contabilidad', [
            'Consulta el UUID, XML y PDF ya registrados para este documento.',
            'Si necesitas corregir un CFDI emitido, revisa con Contabilidad el proceso correspondiente antes de emitir o registrar otro.',
        ]);
    }
    return guide('Revisar el detalle antes de corregir', 'Soporte AFA / Nexfira', [
        'Lee el mensaje y el campo indicado. Si no identifica una corrección concreta, comparte con soporte el documento, el código y la referencia mostrados aquí.',
        'Si existe una solicitud, consulta primero su estado. Espera el diagnóstico antes de cambiar cliente, monto o volver a enviar.',
    ]);
}
