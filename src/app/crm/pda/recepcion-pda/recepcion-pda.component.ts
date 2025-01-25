import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, Renderer2 } from '@angular/core';
import { swalErrorHttpResponse } from '@env/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '@services/auth.service';
import { PDAService } from '@services/http/pda.service';
import {
    DocumentoPDA,
    EmpresaPDA,
    InitResponsePDA,
    UsuarioPDA,
    HttpErrorPDA,
} from 'app/Interfaces';

@Component({
    selector: 'app-recepcion-pda',
    templateUrl: './recepcion-pda.component.html',
    styleUrls: ['./recepcion-pda.component.scss'],
})
export class RecepcionPdaComponent implements OnInit {
    documentos: DocumentoPDA[] = [];
    empresas: EmpresaPDA[] = [];
    usuarios: UsuarioPDA[] = [];

    datatable: any;
    datatable_name: string = '#compra_orden_recepcion';

    autorizados: number[] = [3, 25, 29, 31, 47, 51, 58, 78, 97];
    autorizado: boolean = false;

    constructor(
        private pdaService: PDAService,
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private auth: AuthService
    ) {
        const usuario = JSON.parse(this.auth.userData().sub);

        if (this.autorizados.includes(usuario.id)) {
            this.autorizado = true;
        }
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();

        console.log(typeof table);
        console.log(typeof this.datatable);
    }

    ngOnInit(): void {
        this.pdaService.data().subscribe(
            (res: InitResponsePDA) => {
                this.documentos = [...res.documentos];
                this.empresas = [...res.empresas];
                this.usuarios = [...res.usuarios];
                this.rebuildTable();
            },
            (err: HttpErrorPDA) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
