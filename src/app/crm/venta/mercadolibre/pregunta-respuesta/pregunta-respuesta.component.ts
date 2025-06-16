import {Component, OnInit} from '@angular/core';
import {VentaService} from './../../../../services/http/venta.service';
import {MercadolibreService} from './../../../../services/http/mercadolibre.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-pregunta-respuesta',
    templateUrl: './pregunta-respuesta.component.html',
    styleUrls: ['./pregunta-respuesta.component.scss'],
})
export class PreguntaRespuestaComponent implements OnInit {
    areas: any[] = [];
    marketplaces: any[] = [];
    preguntas: any[] = [];

    data = {
        area: '',
        marketplace: '',
    };

    constructor(
        private ventaService: VentaService,
        private mercadolibreService: MercadolibreService
    ) {}

    ngOnInit() {
        this.initData();
    }

    searchQuestions() {
        if (!this.data.marketplace)
            return swal({
                type: 'error',
                html: `Selecciona un area y marketplace para buscar las preguntas`,
            });

        const marketplace = this.marketplaces.find(
            (marketplace) => marketplace.id == this.data.marketplace
        );

        this.ventaService
            .getMarketplaceQuestions(this.data.marketplace)
            .subscribe(
                (res: any) => {
                    this.preguntas = [];
                    const preguntas = [...res.data.data];

                    preguntas.map((pregunta) => {
                        this.mercadolibreService
                            .getUserDataByID(pregunta.from.id, marketplace.id)
                            .subscribe(
                                (res: any) => {
                                    pregunta.user_data = res;
                                },
                                (err: any) => {
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
                            );

                        const index = this.preguntas.findIndex(
                            (pa) => pa.item == pregunta.item_id
                        );

                        if (index === -1) {
                            this.preguntas.push({
                                item: pregunta.item_id,
                                item_data: {},
                                questions: [pregunta],
                            });
                        } else {
                            this.preguntas[index].questions.push(pregunta);
                        }
                    });

                    this.preguntas.map((pregunta) => {
                        this.mercadolibreService
                            .getItemData(pregunta.item, marketplace.id)
                            .subscribe(
                                (res: any) => {
                                    pregunta.item_data = res;
                                },
                                (err: any) => {
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
                            );
                    });
                },
                (err: any) => {
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
            );
    }

    sendResponse(question) {
        if (!question.answer)
            return swal({
                type: 'error',
                html: `Favor de escribir una respuesta valida para responder la pregunta!`,
            });

        const data = {
            id: question.id,
            marketplace: this.data.marketplace,
            respuesta: question.answer,
        };

        this.ventaService.answerQuestion(data).subscribe(
            (res: any) => {
                swal({
                    type: 'success',
                    html: res.message,
                });

                const publicacion = this.preguntas.find((pregunta) =>
                    pregunta.questions.find((q) => q.id == question.id)
                );

                if (publicacion) {
                    const index = publicacion.questions.findIndex(
                        (q) => q.id == question.id
                    );

                    publicacion.questions.splice(index, 1);
                }
            },
            (err: any) => {
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
        );
    }

    deleteQuestion(question) {
        swal({
            type: 'warning',
            html: `¿Estás seguro de eliminar la pregunta? Esta acción no se puede deshacer`,
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#ff5252',
        }).then((response) => {
            if (response.value) {
                const data = {
                    id: question.id,
                    marketplace: this.data.marketplace,
                };

                this.ventaService.deleteQuestion(data).subscribe(
                    (res: any) => {
                        swal({
                            type: 'success',
                            html: res.message,
                        });

                        const publicacion = this.preguntas.find((pregunta) =>
                            pregunta.questions.find((q) => q.id == question.id)
                        );

                        if (publicacion) {
                            const index = publicacion.questions.findIndex(
                                (q) => q.id == question.id
                            );

                            publicacion.questions.splice(index, 1);
                        }
                    },
                    (err: any) => {
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
                );
            }
        });
    }

    blockUser(question) {
        swal({
            type: 'warning',
            html: `¿Estás seguro de bloquear al usuario que preguntó? Esta acción no se puede deshacer`,
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Sí, bloquear',
            confirmButtonColor: '#ff5252',
        }).then((response) => {
            if (response.value) {
                const data = {
                    id: question.from.id,
                    marketplace: this.data.marketplace,
                };

                this.ventaService.blockUser(data).subscribe(
                    (res: any) => {
                        swal({
                            type: 'success',
                            html: res.message,
                        });

                        const publicacion = this.preguntas.find((pregunta) =>
                            pregunta.questions.find((q) => q.id == question.id)
                        );

                        if (publicacion) {
                            const index = publicacion.questions.findIndex(
                                (q) => q.id == question.id
                            );

                            publicacion.questions.splice(index, 1);
                        }
                    },
                    (err: any) => {
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
                );
            }
        });
    }

    questionWithActiveItem() {
        return this.preguntas.filter(
            (pregunta) => pregunta.item_data.status == 'active'
        );
    }

    collapsePreviousQuestions(question) {
        question.collapsed = question.collapsed ? !question.collapsed : true;
    }

    collapsedUndefined(collapsed) {
        return collapsed ? collapsed : false;
    }

    filterPreviousQuestions(questions, current_question_id) {
        return questions.filter(
            (question) => question.id != current_question_id
        );
    }

    initData() {
        this.ventaService.getMarketplaceData().subscribe(
            (res: any) => {
                this.areas = [...res.data];
            },
            (err: any) => {
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
        );
    }

    onChangeArea() {
        const area = this.areas.find((area) => area.id == this.data.area);

        this.data.marketplace = '';
        this.marketplaces = area.marketplaces;
    }
}
