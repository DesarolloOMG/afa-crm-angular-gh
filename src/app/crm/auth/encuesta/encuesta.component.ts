import { backend_url } from './../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-encuesta',
    templateUrl: './encuesta.component.html',
    styleUrls: ['./encuesta.component.scss']
})
export class EncuestaComponent implements OnInit {

    cuestionarios_data = {
        trabajador: {},
        entorno: [],
        liderazgo: {},
        traumatico: []
    }

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.cuestionarios_data = this.data();
    }

    enviarFormulario(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($(".ng-invalid").get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($(".ng-invalid").length > 0) {
            return;
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.cuestionarios_data));

        this.http.post(`${backend_url}auth/encuesta`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        this.cuestionarios_data = this.data();
                    }
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    ocultarPreguntasTraumatico() {
        const preguntas = this.cuestionarios_data.traumatico.slice(0, 5);

        const si = preguntas.find(pregunta => pregunta.respuesta == 'Sí');

        return si;
    }

    data() {
        const data = {
            trabajador: {
                sexo: "",
                edad: "",
                estado: "",
                nivel: "",
                ocupacion: "",
                departamento: "",
                tipo_puesto: "",
                tipo_contratacion: "",
                tipo_personal: "",
                tipo_jornada: "",
                rotacion: "",
                tiempo_puesto: "",
                tiempo_experiencia: ""
            },
            entorno: [
                {
                    pregunta: "El espacio donde trabajo me permite realizar mis actividades de manera segura e higiénica",
                    respuesta: ""
                },
                {
                    pregunta: "Mi trabajo me exige hacer mucho esfuerzo físico",
                    respuesta: ""
                },
                {
                    pregunta: "Me preocupa sufrir un accidente en mi trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Considero que en mi trabajo se aplican las normas de seguridad y salud en el trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Considero que las actividades que realizo son peligrosas",
                    respuesta: ""
                },
                {
                    pregunta: "Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno",
                    respuesta: ""
                },
                {
                    pregunta: "Por la cantidad de trabajo que tengo debo trabajar sin parar",
                    respuesta: ""
                },
                {
                    pregunta: "Considero que es necesario mantener un ritmo de trabajo acelerado",
                    respuesta: ""
                },
                {
                    pregunta: "Mi trabajo exige que esté muy concentrado",
                    respuesta: ""
                },
                {
                    pregunta: "Mi trabajo requiere que memorice mucha información",
                    respuesta: ""
                },
                {
                    pregunta: "En mi trabajo tengo que tomar decisiones difíciles muy rápido",
                    respuesta: ""
                },
                {
                    pregunta: "Mi trabajo exige que atienda varios asuntos al mismo tiempo",
                    respuesta: ""
                },
                {
                    pregunta: "En mi trabajo soy responsable de cosas de mucho valor",
                    respuesta: ""
                },
                {
                    pregunta: "Respondo ante mi jefe por los resultados de toda mi área de trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "En el trabajo me dan órdenes contradictorias",
                    respuesta: ""
                },
                {
                    pregunta: "Considero que en mi trabajo me piden hacer cosas innecesarias",
                    respuesta: ""
                },
                {
                    pregunta: "Trabajo horas extras más de tres veces a la semana",
                    respuesta: ""
                },
                {
                    pregunta: "Mi trabajo me exige laborar en días de descanso, festivos o fines de semana",
                    respuesta: ""
                },
                {
                    pregunta: "Considero que el tiempo en el trabajo es mucho y perjudica mis actividades familiares o personales",
                    respuesta: ""
                },
                {
                    pregunta: "Debo atender asuntos de trabajo cuando estoy en casa",
                    respuesta: ""
                },
                {
                    pregunta: "Pienso en las actividades familiares o personales cuando estoy en mi trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Pienso que mis responsabilidades familiares afectan mi trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Mi trabajo permite que desarrolle nuevas habilidades",
                    respuesta: ""
                },
                {
                    pregunta: "En mi trabajo puedo aspirar a un mejor puesto",
                    respuesta: ""
                },
                {
                    pregunta: "Durante mi jornada de trabajo puedo tomar pausas cuando las necesito",
                    respuesta: ""
                },
                {
                    pregunta: "Puedo decidir cuánto trabajo realizo durante la jornada laboral",
                    respuesta: ""
                },
                {
                    pregunta: "Puedo decidir la velocidad a la que realizo mis actividades en mi trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Puedo cambiar el orden de las actividades que realizo en mi trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Los cambios que se presentan en mi trabajo dificultan mi labor",
                    respuesta: ""
                },
                {
                    pregunta: "Cuando se presentan cambios en mi trabajo se tienen en cuenta mis ideas o aportaciones",
                    respuesta: ""
                },
                {
                    pregunta: "Me informan con claridad cuáles son mis funciones",
                    respuesta: ""
                },
                {
                    pregunta: "Me explican claramente los resultados que debo obtener en mi trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Me explican claramente los objetivos de mi trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Me informan con quién puedo resolver problemas o asuntos de trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Me permiten asistir a capacitaciones relacionadas con mi trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Recibo capacitación útil para hacer mi trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Mi jefe ayuda a organizar mejor el trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Mi jefe tiene en cuenta mis puntos de vista y opiniones",
                    respuesta: ""
                },
                {
                    pregunta: "Mi jefe me comunica a tiempo la información relacionada con el trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "La orientación que me da mi jefe me ayuda a realizar mejor mi trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Mi jefe ayuda a solucionar los problemas que se presentan en el trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Puedo confiar en mis compañeros de trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Entre compañeros solucionamos los problemas de trabajo de forma respetuosa",
                    respuesta: ""
                },
                {
                    pregunta: "En mi trabajo me hacen sentir parte del grupo",
                    respuesta: ""
                },
                {
                    pregunta: "Cuando tenemos que realizar trabajo de equipo los compañeros colaboran",
                    respuesta: ""
                },
                {
                    pregunta: "Mis compañeros de trabajo me ayudan cuando tengo dificultades",
                    respuesta: ""
                },
                {
                    pregunta: "Me informan sobre lo que hago bien en mi trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "La forma como evalúan mi trabajo en mi centro de trabajo me ayuda a mejorar mi desempeño",
                    respuesta: ""
                },
                {
                    pregunta: "En mi centro de trabajo me pagan a tiempo mi salario",
                    respuesta: ""
                },
                {
                    pregunta: "El pago que recibo es el que merezco por el trabajo que realizo",
                    respuesta: ""
                },
                {
                    pregunta: "Si obtengo los resultados esperados en mi trabajo me recompensan o reconocen",
                    respuesta: ""
                },
                {
                    pregunta: "Las personas que hacen bien el trabajo pueden crecer laboralmente",
                    respuesta: ""
                },
                {
                    pregunta: "Considero que mi trabajo es estable",
                    respuesta: ""
                },
                {
                    pregunta: "En mi trabajo existe continua rotación de personal",
                    respuesta: ""
                },
                {
                    pregunta: "Siento orgullo de laborar en este centro de trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Me siento comprometido con mi trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "En mi trabajo puedo expresarme libremente sin interrupciones",
                    respuesta: ""
                },
                {
                    pregunta: "Recibo críticas constantes a mi persona y/o trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Recibo burlas, calumnias, difamaciones, humillaciones o ridiculizaciones",
                    respuesta: ""
                },
                {
                    pregunta: "Se ignora mi presencia o se me excluye de las reuniones de trabajo y en la toma de decisiones",
                    respuesta: ""
                },
                {
                    pregunta: "Se manipulan las situaciones de trabajo para hacerme parecer un mal trabajador",
                    respuesta: ""
                },
                {
                    pregunta: "Se ignoran mis éxitos laborales y se atribuyen a otros trabajadores",
                    respuesta: ""
                },
                {
                    pregunta: "Me bloquean o impiden las oportunidades que tengo para obtener ascenso o mejora en mi trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "He presenciado actos de violencia en mi centro de trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Atiendo clientes o usuarios muy enojados",
                    respuesta: ""
                },
                {
                    pregunta: "Mi trabajo me exige atender personas muy necesitadas de ayuda o enfermas",
                    respuesta: ""
                },
                {
                    pregunta: "Para hacer mi trabajo debo demostrar sentimientos distintos a los míos",
                    respuesta: ""
                },
                {
                    pregunta: "Mi trabajo me exige atender situaciones de violencia",
                    respuesta: ""
                },
                {
                    pregunta: "Comunican tarde los asuntos de trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Dificultan el logro de los resultados del trabajo",
                    respuesta: ""
                },
                {
                    pregunta: "Cooperan poco cuando se necesita",
                    respuesta: ""
                },
                {
                    pregunta: "Ignoran las sugerencias para mejorar su trabajo",
                    respuesta: ""
                }
            ],
            liderazgo: {
                preguntas: [
                    {
                        pregunta: "¿Tu Jefe inmediato te inspira confianza al tener una charla de trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Tienes  claro quién tiene la autoridad formal de tomar decisiones ante cualquier situación?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Te sientes satisfecho con el estilo de liderazgo de tus superiores?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿La forma en que tu jefe se dirige hacia ti para darte ordenes es de forma cortes y respetuosa?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Recibes retroalimentación por parte de los superiores?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Mi jefe me comunica a tiempo la información relacionada con el trabajo? ",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Mi jefe tiene en cuenta mis puntos de vista y opiniones?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Te informan con claridad cuáles son tus funciones?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Me bloquean o impiden las oportunidades que tengo para obtener ascensos o mejora en mi trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Mi jefe me ayuda a organizar mejor mi trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿En mi trabajo me hacen sentir parte del grupo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Cuentas con la colaboración de tus compañeros de trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Consideras que la relación con tus compañeros de trabajo es buena?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿En un conflicto, cuentas con la ayuda de tus compañeros para solucionarlo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Existe confianza entre los miembros del equipo de trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Puedo confiar en mis compañeros de trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Cuenta con la colaboración de personas de otros departamentos?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Cuándo tenemos que realizar trabajo de equipo, los compañeros colaboran?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Consideras que existe un buen ambiente de trabajo en la organización?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Se ignora mi presencia o se me excluye de las reuniones de trabajo y en las tomas de decisiones?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Qué tanto aceptas la filosofía de la empresa?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Siento orgullo de trabajar en este centro de trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Qué tanto influye el orgullo que sientes al trabajar en la empresa para cumplir los objetivos generales?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Tienes iniciativa propia para realizar tu trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Me siento comprometido con mi trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Considero que mi trabajo es estable?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Buscas conocer más acerca de los valores y objetivos que tiene la empresa?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Con que frecuencia buscas cumplir los valores que la organización tiene establecidos?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Eres fiel a nuestra empresa para no aceptar una oferta laboral con la competencia?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Consideras que aportas algo para tener una mejora en la empresa?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Si obtengo los resultados esperados en mi trabajo, me recompensan o reconocen?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿El sueldo que percibes te alcanza para mantener tus necesidades?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿El sueldo que recibes por tus actividades de la jornada laboral es justo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Recibes algún bono extra por exceder tus objetivos?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Las personas que hacen bien el trabajo pueden crecer laboralmente?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Recibes el depósito de tu sueldo en tiempo y forma?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Tus vacaciones y aguinaldo se te otorgan en tiempo y forma?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿El pago que recibo es el que merezco por el trabajo que realizo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Tu nomina es clara y si tienes alguna duda te dan solución?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Recibes motivación económica extra a tus prestaciones?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Existen diferencias en el trato del personal?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Has sentido discriminación por parte de algún miembro de la empresa? (sexo, cultura, religión, etc.)",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Todos participan en la toma de decisiones que afecten por igual en el equipo de trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Existe una igualdad de oportunidades para todos los miembros del equipo de trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Las ideas que expresas son tomadas en cuenta?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Se manipulan las situaciones de trabajo para hacerme parecer mal trabajador?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Existen el respeto entre las diferentes áreas de la empresa?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Existen favoritismos por parte de tu jefe inmediato?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Todos tienen la misma oportunidad de crecimiento en tu área de trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Recibo burlas, difamaciones, humillaciones o ridiculizaciones?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Por la cantidad de trabajo que tengo debo trabajar sin parar?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Considero que es necesario mantener un ritmo de trabajo acelerado?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Mi trabajo exige que esté muy concentrado?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Mi trabajo requiere que memorice mucha información?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿En mi trabajo tengo que tomar decisiones difíciles apresuradamente?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Mi trabajo exige que atienda varios asuntos al mismo tiempo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Respondo ante mi jefe por los resultados de toda mi área de trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿En el trabajo me dan órdenes contradictorias?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Considero que en mi trabajo me piden hacer cosas innecesarias?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿El espacio donde trabajo me permite realizar mis actividades de manera segura e higiénica?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Cuentas con los materiales suficientes para realizar tus labores de trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Las condiciones de espacio, equipo y herramientas de trabajo son las adecuadas?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Cuentas con equipo necesario o ergonómico para desempeñar  tu jornada laboral?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Consideras que el servicio del comedor es bueno?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿La estructura de la empresa está en buenas condiciones  para evitar que ocurra un accidente de trabajo?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿El equipo mobiliario se encuentra en buenas condiciones?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Las herramientas para realizar tu trabajo se encuentran en buen estado?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Recibes el material para realizar tus labores en tiempo y forma?",
                        respuesta: ""
                    },
                    {
                        pregunta: "¿Me preocupa sufrir un accidente en mi trabajo?",
                        respuesta: ""
                    }
                ],
                comentarios: ""
            },
            traumatico: [
                {
                    pregunta: "Accidente que tenga como consecuencia la muerte, la pérdida de un miembro o una lesión grave",
                    respuesta: "",
                },
                {
                    pregunta: "Asaltos",
                    respuesta: "",
                },
                {
                    pregunta: "Actos violentos que derivaron en lesiones graves",
                    respuesta: "",
                },
                {
                    pregunta: "Secuestro",
                    respuesta: "",
                },
                {
                    pregunta: "Amenazas",
                    respuesta: "",
                },
                {
                    pregunta: "Cualquier otro que ponga en riesgo su vida o salud, y/o la de otras personas",
                    respuesta: "",
                },
                {
                    pregunta: "¿Ha tenido recuerdos recurrentes sobre el acontecimiento que le provocan malestares?",
                    respuesta: "",
                },
                {
                    pregunta: "¿Ha tenido sueños de carácter recurrente sobre el acontecimiento, que le producen malestar?",
                    respuesta: "",
                },
                {
                    pregunta: "¿Se ha esforzado por evitar todo tipo de sentimientos, conversaciones o situaciones que le puedan recordar el acontecimiento?",
                    respuesta: "",
                },
                {
                    pregunta: "¿Se ha esforzado por evitar todo tipo de actividades, lugares o personas que motivan recuerdos del acontecimiento?",
                    respuesta: "",
                },
                {
                    pregunta: "¿Ha tenido dificultad para recordar alguna parte importante del evento?",
                    respuesta: "",

                },
                {
                    pregunta: "¿Ha disminuido su interés en sus actividades cotidianas?",
                    respuesta: "",
                },
                {
                    pregunta: "¿Se ha sentido usted alejado o distante de los demás?",
                    respuesta: "",
                },
                {
                    pregunta: "¿Ha notado que tiene dificultad para expresar sus sentimientos?",
                    respuesta: "",
                },
                {
                    pregunta: "¿Ha tenido usted dificultades para dormir?",
                    respuesta: "",
                },
                {
                    pregunta: "¿Ha estado particularmente irritable o le han dado arranques de coraje?",
                    respuesta: "",
                },
                {
                    pregunta: "¿Ha tenido dificultad para concentrarse?",
                    respuesta: "",
                },
                {
                    pregunta: "¿Ha estado nervioso o constantemente en alerta?",
                    respuesta: "",
                },
                {
                    pregunta: "¿Se ha sobresaltado fácilmente por cualquier cosa?",
                    respuesta: "",
                },

            ]
        }

        return data;
    }
}
